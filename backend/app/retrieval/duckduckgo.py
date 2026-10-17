from typing import List
from backend.app.retrieval.base import BaseRetriever, RawSearchResult
import asyncio

class DuckDuckGoRetriever(BaseRetriever):
    """Retrieves web search results using DuckDuckGo."""

    def __init__(self, max_results: int = 5):
        self.max_results = max_results

    async def search(self, query: str, max_results: int = 5) -> List[RawSearchResult]:
        results: List[RawSearchResult] = []
        limit = max_results or self.max_results

        # Run DDGS in executor since DDGS.text can be blocking or async depending on version
        def _fetch_sync():
            items = []
            try:
                try:
                    from ddgs import DDGS
                except ImportError:
                    from duckduckgo_search import DDGS
                with DDGS() as ddgs:
                    ddg_results = ddgs.text(query, max_results=limit)
                    for r in ddg_results:
                        items.append(r)
            except Exception:
                pass
            return items

        try:
            loop = asyncio.get_event_loop()
            raw_items = await loop.run_in_executor(None, _fetch_sync)

            for item in raw_items:
                title = item.get("title", "")
                url = item.get("href", "") or item.get("link", "")
                body = item.get("body", "") or item.get("snippet", "")

                if not url or not body:
                    continue

                source_type = self._infer_source_type(url)
                results.append(
                    RawSearchResult(
                        title=title,
                        url=url,
                        snippet=body[:600],
                        source_type=source_type,
                        score=0.75,
                        raw_content=body
                    )
                )
        except Exception:
            pass

        return results

    def _infer_source_type(self, url: str) -> str:
        low = url.lower()
        if ".gov" in low or ".mil" in low:
            return "government"
        elif ".edu" in low or "arxiv.org" in low or "nature.com" in low or "science.org" in low:
            return "academic"
        elif any(news in low for news in ["reuters.com", "apnews.com", "bbc.com", "nytimes.com", "wsj.com"]):
            return "news"
        elif "wikipedia.org" in low or "britannica.com" in low:
            return "reference"
        return "general"
