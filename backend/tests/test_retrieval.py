import pytest
from backend.app.retrieval.scraper import PageScraper
from backend.app.retrieval.wikipedia import WikipediaRetriever

def test_page_scraper_extract_relevant_snippet():
    claim = "SpaceX was founded in 2002."
    body_text = (
        "Tesla designs electric cars and battery systems. "
        "Space Exploration Technologies Corp., commonly known as SpaceX, was founded in 2002 by Elon Musk to reduce space transportation costs. "
        "The company later developed Starlink for global internet coverage."
    )
    snippet = PageScraper.extract_relevant_snippet(claim, body_text)
    assert "SpaceX" in snippet
    assert "2002" in snippet

@pytest.mark.asyncio
async def test_wikipedia_retriever_lookup():
    wiki = WikipediaRetriever(timeout=5)
    results = await wiki.search("Alexander Graham Bell", max_results=2)
    # Network or offline fallback test
    assert isinstance(results, list)
    if len(results) > 0:
        first = results[0]
        assert "wikipedia.org" in first.url
        assert len(first.snippet) > 20
