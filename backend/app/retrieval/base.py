from abc import ABC, abstractmethod
from typing import List, Dict, Any
from pydantic import BaseModel

class RawSearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    source_type: str = "general"
    score: float = 0.5
    raw_content: str = ""

class BaseRetriever(ABC):
    @abstractmethod
    async def search(self, query: str, max_results: int = 5) -> List[RawSearchResult]:
        """Perform search and return raw candidate results."""
        pass
