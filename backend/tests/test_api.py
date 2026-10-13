import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ai-hallucination-detector"

def test_generate_endpoint():
    response = client.post("/api/generate", json={"question": "Who invented the telephone?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 10

def test_claims_extraction_endpoint():
    response = client.post(
        "/api/claims",
        json={"answer": "Elon Musk founded SpaceX in 2002 and launched Falcon 1 in 2008."}
    )
    assert response.status_code == 200
    data = response.json()
    assert "claims" in data
    assert len(data["claims"]) >= 2

def test_full_analyze_pipeline_endpoint():
    response = client.post(
        "/api/analyze",
        json={
            "question": "Who invented the telephone?",
            "answer": "Alexander Graham Bell invented the telephone in 1876 and received the official patent.",
            "enable_critic": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "report_id" in data
    assert "overall_reliability" in data
    assert "hallucination_risk" in data
    assert len(data["claims"]) > 0
    assert len(data["results"]) > 0

def test_list_and_get_reports_endpoint():
    # Fetch list
    resp_list = client.get("/api/reports?limit=5")
    assert resp_list.status_code == 200
    reports = resp_list.json()
    assert isinstance(reports, list)
    if len(reports) > 0:
        first_id = reports[0]["report_id"]
        # Fetch by ID
        resp_single = client.get(f"/api/reports/{first_id}")
        assert resp_single.status_code == 200
        assert resp_single.json()["report_id"] == first_id

        # Fetch text summary
        resp_text = client.get(f"/api/reports/{first_id}/text")
        assert resp_text.status_code == 200
        assert "text_summary" in resp_text.json()
