import urllib.parse
from typing import Tuple

class SourceQualityEvaluator:
    """Evaluates the credibility, authority, and reliability of retrieved sources (0-100)."""

    # Domain reputation weights
    GOVERNMENT_TLDS = {".gov", ".mil", ".gov.uk", ".europa.eu", ".who.int", ".nasa.gov"}
    ACADEMIC_DOMAINS = {"arxiv.org", "nature.com", "science.org", "sciencedirect.com", "ncbi.nlm.nih.gov", "ieee.org", "nih.gov"}
    REPUTABLE_NEWS = {"reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "nytimes.com", "wsj.com", "washingtonpost.com", "theguardian.com"}
    REFERENCE_SITES = {"wikipedia.org", "britannica.com", "plato.stanford.edu", "worldcat.org"}
    LOW_QUALITY_INDICATORS = {"reddit.com", "quora.com", "twitter.com", "x.com", "medium.com", "blogspot.com", "wordpress.com"}

    def evaluate(self, url: str, title: str, relevance: float) -> Tuple[float, str, str]:
        """Returns (score_0_100, source_type, explanation)."""
        domain = self._extract_domain(url).lower()
        score = 50.0
        explanations = []
        source_type = "general"

        # Check Government & Official Primary Sources
        if any(domain.endswith(tld) or tld in domain for tld in self.GOVERNMENT_TLDS):
            score = 92.0
            source_type = "government"
            explanations.append("Official government or multilateral institutional domain (+92)")
        # Check Academic & Peer-Reviewed Sources
        elif any(acad in domain for acad in self.ACADEMIC_DOMAINS) or domain.endswith(".edu"):
            score = 88.0
            source_type = "academic"
            explanations.append("Academic peer-reviewed research repository or accredited university (+88)")
        # Check Reputable Global Journalism
        elif any(news in domain for news in self.REPUTABLE_NEWS):
            score = 80.0
            source_type = "news"
            explanations.append("Established tier-one global investigative news organization (+80)")
        # Check Standard Curated Reference Encyclopedias
        elif any(ref in domain for ref in self.REFERENCE_SITES):
            score = 75.0
            source_type = "reference"
            explanations.append("Curated community-reviewed encyclopedia or reference repository (+75)")
        # Check Low-Trust / UGC Sources
        elif any(low in domain for low in self.LOW_QUALITY_INDICATORS):
            score = 25.0
            source_type = "forum_or_ugc"
            explanations.append("Unvetted user-generated forum or personal publishing platform (-25)")
        else:
            score = 55.0
            source_type = "general"
            explanations.append("General public web resource (+55)")

        # Factor in Semantic Relevance bonus (relevance is 0.0 to 1.0)
        relevance_adj = (relevance - 0.5) * 15.0  # -7.5 to +7.5
        score += relevance_adj
        if relevance > 0.8:
            explanations.append(f"High direct factual relevance to claim (+{relevance_adj:.1f})")
        elif relevance < 0.4:
            explanations.append(f"Low semantic alignment with claim target (-{abs(relevance_adj):.1f})")

        # Clamp between 0 and 100
        final_score = max(5.0, min(99.0, round(score, 1)))
        explanation_str = "; ".join(explanations)
        return final_score, source_type, explanation_str

    def _extract_domain(self, url: str) -> str:
        try:
            parsed = urllib.parse.urlparse(url)
            netloc = parsed.netloc.split(":")[0]
            # Strip leading www.
            if netloc.startswith("www."):
                netloc = netloc[4:]
            return netloc
        except Exception:
            return "unknown-domain"
