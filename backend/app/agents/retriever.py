import re
from typing import List
from backend.app.models.schemas import Claim, NormalizedClaim, EvidenceItem
from backend.app.retrieval.wikipedia import WikipediaRetriever
from backend.app.retrieval.duckduckgo import DuckDuckGoRetriever
from backend.app.retrieval.scraper import PageScraper
from backend.app.agents.evaluator import SourceQualityEvaluator
from backend.app.config import settings

class EvidenceRetrievalAgent:
    """Orchestrates retrieval across Wikipedia, web search, page scraping, and evidence extraction."""

    def __init__(self):
        self.wiki = WikipediaRetriever(timeout=settings.REQUEST_TIMEOUT_SECONDS)
        self.ddg = DuckDuckGoRetriever(max_results=settings.MAX_SEARCH_RESULTS)
        self.scraper = PageScraper(timeout=6)
        self.evaluator = SourceQualityEvaluator()

    async def retrieve_for_claim(self, claim: Claim, normalized: NormalizedClaim, evidence_counter_start: int = 1) -> List[EvidenceItem]:
        evidence_items: List[EvidenceItem] = []
        if not claim.requires_verification:
            return evidence_items

        raw_candidates = []

        # 1. Query Wikipedia with targeted search query (finds exact matching clauses)
        wiki_results = await self.wiki.search(normalized.search_query, max_results=3)
        raw_candidates.extend(wiki_results)

        # Also query Wikipedia with primary entity directly (guarantees core Wikipedia article is retrieved)
        if normalized.entities:
            entity_results = await self.wiki.search(normalized.entities[0], max_results=2)
            raw_candidates.extend(entity_results)

        # Also query Wikipedia with alternative queries (contains relational or temporal context)
        for alt_q in (normalized.alternative_queries or [])[:2]:
            alt_res = await self.wiki.search(alt_q, max_results=2)
            raw_candidates.extend(alt_res)

        # 2. Query DuckDuckGo Web Search
        ddg_results = await self.ddg.search(normalized.search_query, max_results=3)
        raw_candidates.extend(ddg_results)

        # 3. Deduplicate by URL
        seen_urls = set()
        unique_candidates = []
        for c in raw_candidates:
            if c.url not in seen_urls:
                seen_urls.add(c.url)
                unique_candidates.append(c)

        # 4. Extract and refine evidence
        counter = evidence_counter_start
        for cand in unique_candidates:
            # If candidate raw_content is short snippet, try scraping full text if not Wikipedia
            # Extract the most relevant section/window from raw_content
            if cand.raw_content and len(cand.raw_content) > 200:
                extracted = self.scraper.extract_relevant_snippet(claim.claim, cand.raw_content)
                if extracted and len(extracted.strip()) > 40:
                    evidence_text = extracted
                else:
                    evidence_text = cand.snippet
            else:
                evidence_text = cand.snippet

            if "wikipedia.org" not in cand.url and len(evidence_text) < 150:
                full_text = await self.scraper.fetch_page_text(cand.url)
                if full_text:
                    extracted = self.scraper.extract_relevant_snippet(claim.claim, full_text)
                    if len(extracted) > len(evidence_text):
                        evidence_text = extracted

            relevance = self._compute_relevance(claim.claim, evidence_text)
            # Only keep candidate if relevance meets baseline
            if relevance < 0.25 and len(evidence_items) >= 2:
                continue

            quality_score, source_type, quality_exp = self.evaluator.evaluate(
                cand.url, cand.title, relevance
            )

            evidence_items.append(
                EvidenceItem(
                    evidence_id=f"E{counter:03d}",
                    claim_id=claim.claim_id,
                    source_title=cand.title,
                    source_url=cand.url,
                    source_domain=self.evaluator._extract_domain(cand.url),
                    source_type=source_type,
                    snippet=evidence_text.strip(),
                    relevance=relevance,
                    source_quality_score=quality_score,
                    quality_explanation=quality_exp
                )
            )
            counter += 1

        # Sort evidence items by source quality descending
        evidence_items.sort(key=lambda e: (e.source_quality_score * e.relevance), reverse=True)
        return evidence_items

    def _compute_relevance(self, claim: str, text: str) -> float:
        if not text:
            return 0.0

        claim_tokens = set(re.findall(r"\w+", claim.lower()))
        stops = {"the", "a", "an", "is", "was", "are", "in", "on", "at", "to", "for", "with", "and", "by", "of"}
        target_tokens = {t for t in claim_tokens if t not in stops and len(t) > 2}

        if not target_tokens:
            return 0.5

        text_tokens = set(re.findall(r"\w+", text.lower()))
        matched = target_tokens.intersection(text_tokens)
        ratio = len(matched) / len(target_tokens)

        # Boost if numbers/dates match
        claim_nums = set(re.findall(r"\b\d+\b", claim))
        if claim_nums:
            num_matched = claim_nums.intersection(text_tokens)
            num_ratio = len(num_matched) / len(claim_nums)
            ratio = 0.6 * ratio + 0.4 * num_ratio

        return min(0.99, max(0.1, round(ratio, 2)))
