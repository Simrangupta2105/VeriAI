import re
from typing import List
from backend.app.models.schemas import Claim, NormalizedClaim

class ClaimNormalizerAgent:
    """Normalizes claims into search-optimized forms and generates targeted verification queries."""

    def normalize(self, claim: Claim) -> NormalizedClaim:
        text = claim.claim.strip().rstrip(".")

        # Extract entities, numbers, and years
        entities = self._extract_entities(text)
        numbers = re.findall(r"\b\d+(?:[\.,]\d+)*(?:\s*(?:%|million|billion|trillion|meters|km|miles))?\b", text)
        years = re.findall(r"\b(?:16|17|18|19|20)\d{2}\b", text)
        temporal_anchor = years[0] if years else None

        # Build clean search queries: neutral query without hallucinated year + targeted query
        primary_query = self._build_primary_query(text, entities)
        alt_queries = self._build_alternative_queries(text, entities, temporal_anchor)

        return NormalizedClaim(
            claim_id=claim.claim_id,
            original_claim=claim.claim,
            search_query=primary_query,
            alternative_queries=alt_queries,
            entities=entities,
            temporal_anchor=temporal_anchor,
            numerical_values=numbers
        )

    def _extract_entities(self, text: str) -> List[str]:
        words = text.split()
        entities = []
        current_entity = []

        for i, w in enumerate(words):
            clean_w = re.sub(r"[^\w]", "", w)
            if not clean_w:
                continue
            # If capitalized and not common grammatical starter
            if clean_w[0].isupper() and (i > 0 or clean_w.lower() not in {"the", "a", "an", "in", "on", "at", "during", "after", "before"}):
                current_entity.append(clean_w)
            else:
                if current_entity:
                    entities.append(" ".join(current_entity))
                    current_entity = []

        if current_entity:
            entities.append(" ".join(current_entity))

        # Deduplicate while preserving order
        seen = set()
        deduped = []
        for e in entities:
            if e.lower() not in seen and len(e) > 1:
                seen.add(e.lower())
                deduped.append(e)

        return deduped

    def _build_primary_query(self, text: str, entities: List[str]) -> str:
        # Strip years and common stops to form neutral factual verification query
        stops = {"the", "was", "were", "is", "are", "and", "or", "to", "in", "on", "at", "by", "for", "with", "from", "according"}
        words = [re.sub(r"[^\w]", "", w.lower()) for w in text.split()]
        
        # Don't bias search with potentially hallucinated 4-digit years in neutral query
        substantive_words = [
            w for w in words
            if w and w not in stops and not re.match(r"^(?:16|17|18|19|20)\d{2}$", w)
        ]

        if entities:
            primary_entity = entities[0]
            # Key verbs / nouns not part of entity
            extra_keywords = [w for w in substantive_words if w not in primary_entity.lower()]
            return f"{primary_entity} {' '.join(extra_keywords[:3])}".strip()

        return " ".join(substantive_words[:5])

    def _build_alternative_queries(self, text: str, entities: List[str], temporal: str = None) -> List[str]:
        alts = []
        low = text.lower()

        # If claim asserts a relation like "capital of X", generate the neutral relation query
        if "capital" in low and entities:
            # Find the country/state entity
            other_entities = [e for e in entities if e.lower() not in {"sydney", "paris", "london", "tokyo", "beijing", "berlin", "rome", "madrid"}]
            if other_entities:
                alts.append(f"capital of {other_entities[-1]}")
            else:
                alts.append(f"capital of {entities[-1]}")

        if entities:
            primary_entity = entities[0]
            if temporal:
                alts.append(f"{primary_entity} {temporal}")
            alts.append(f"{primary_entity} history")
            alts.append(primary_entity)

        # Full substantive text query as fallback
        clean_text = " ".join([w for w in text.split() if w.lower() not in {"the", "a", "an", "was", "is"}])
        alts.append(clean_text[:60])
        return [a for a in alts if a]
