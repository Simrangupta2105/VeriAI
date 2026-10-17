import re
from typing import List, Optional
import httpx
from bs4 import BeautifulSoup

class PageScraper:
    """Fetches full page content and extracts high-relevance evidence chunks."""

    def __init__(self, timeout: int = 6):
        self.timeout = timeout
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        }

    async def fetch_page_text(self, url: str) -> Optional[str]:
        if not url.startswith("http"):
            return None
        # Avoid scraping massive binary or media files
        if any(url.lower().endswith(ext) for ext in [".pdf", ".zip", ".png", ".jpg", ".mp4"]):
            return None

        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.get(url, headers=self.headers)
                if resp.status_code != 200:
                    return None

                soup = BeautifulSoup(resp.text, "html.parser")
                for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
                    tag.decompose()

                paragraphs = [p.get_text(separator=" ", strip=True) for p in soup.find_all(["p", "article", "li"])]
                clean_text = " ".join([p for p in paragraphs if len(p) > 30])
                return clean_text[:12000] if clean_text else None
        except Exception:
            return None

    @staticmethod
    def extract_relevant_snippet(claim: str, text: str, max_length: int = 400) -> str:
        """Finds the most relevant paragraph or sentence chunk for the claim in full text."""
        if not text:
            return ""

        claim_words = set(re.findall(r"\w+", claim.lower()))
        # Remove common stop words
        stops = {"the", "a", "an", "is", "was", "in", "on", "at", "by", "for", "with", "and", "or", "to", "of", "it"}
        keywords = {w for w in claim_words if len(w) > 2 and w not in stops}

        # Split text into sentence-like chunks
        sentences = re.split(r"(?<=[.!?])\s+", text)
        if not sentences:
            return text[:max_length]

        scored_chunks = []
        for i, s in enumerate(sentences):
            s_clean = s.strip()
            if len(s_clean) < 15:
                continue
            words_in_s = set(re.findall(r"\w+", s_clean.lower()))
            overlap = len(keywords.intersection(words_in_s))
            # Boost if contains numbers/years found in claim
            claim_nums = re.findall(r"\b\d+\b", claim)
            num_boost = 2 * sum(1 for n in claim_nums if n in s_clean)
            scored_chunks.append((overlap + num_boost, i, s_clean))

        if not scored_chunks:
            return text[:max_length]

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        best_score, best_idx, best_sentence = scored_chunks[0]

        if best_score == 0:
            return text[:max_length]

        # Combine with adjacent sentence for context if available
        context_sentences = []
        if best_idx > 0 and len(sentences[best_idx - 1]) > 10:
            context_sentences.append(sentences[best_idx - 1].strip())
        context_sentences.append(best_sentence)
        if best_idx < len(sentences) - 1 and len(sentences[best_idx + 1]) > 10:
            context_sentences.append(sentences[best_idx + 1].strip())

        combined = " ".join(context_sentences)
        return combined[:max_length]
