import re
import html
import urllib.parse
from typing import List
import httpx
from backend.app.retrieval.base import BaseRetriever, RawSearchResult

class WikipediaRetriever(BaseRetriever):
    """Retrieves high-reliability encyclopedia reference evidence from Wikipedia API."""

    def __init__(self, timeout: int = 8):
        self.timeout = timeout
        self.search_url = "https://en.wikipedia.org/w/api.php"
        self.headers = {
            "User-Agent": "HallucinationDetectorBot/1.0 (contact: admin@hallucinationdetector.local)"
        }

    async def search(self, query: str, max_results: int = 3) -> List[RawSearchResult]:
        results: List[RawSearchResult] = []
        if not query or len(query.strip()) < 2:
            return results

        try:
            params = {
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json",
                "srlimit": max_results,
            }
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.get(self.search_url, params=params, headers=self.headers)
                if resp.status_code != 200:
                    return results

                data = resp.json()
                search_items = data.get("query", {}).get("search", [])

                for item in search_items:
                    title = item.get("title", "")
                    raw_snippet = item.get("snippet", "")
                    clean_snippet = html.unescape(re.sub(r"<[^>]+>", "", raw_snippet)).strip()

                    # Fetch summary extract for page context
                    extract_text = await self._fetch_summary(client, title)

                    # Combine matched snippet and extract
                    if clean_snippet and extract_text:
                        combined_content = f"{clean_snippet}. {extract_text}"
                    else:
                        combined_content = clean_snippet or extract_text

                    url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
                    results.append(
                        RawSearchResult(
                            title=f"Wikipedia: {title}",
                            url=url,
                            snippet=combined_content[:800],
                            source_type="reference",
                            score=0.90,
                            raw_content=combined_content
                        )
                    )
        except Exception:
            pass
        return results

    async def _fetch_summary(self, client: httpx.AsyncClient, title: str) -> str:
        try:
            params = {
                "action": "query",
                "prop": "extracts",
                "exintro": "1",
                "explaintext": "1",
                "titles": title,
                "format": "json"
            }
            resp = await client.get(self.search_url, params=params, headers=self.headers)
            if resp.status_code == 200:
                pages = resp.json().get("query", {}).get("pages", {})
                for pid, pdata in pages.items():
                    ext = pdata.get("extract", "")
                    if ext:
                        return ext
        except Exception:
            pass
        return ""
