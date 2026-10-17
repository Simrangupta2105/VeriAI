from fastapi import APIRouter
from backend.app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-hallucination-detector",
        "version": "1.0.0",
        "default_model": settings.DEFAULT_MODEL,
        "database": str(settings.DATABASE_PATH),
        "critic_enabled": settings.ENABLE_CRITIC_PASS,
        "llm_configured": bool(settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY or settings.OPENAI_API_KEY)
    }
