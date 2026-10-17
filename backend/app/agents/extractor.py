import re
import json
from typing import List, Optional
from backend.app.models.schemas import Claim, ClaimType
from backend.app.config import settings

class ClaimExtractorAgent:
    """Extracts atomic, verifiable claims from input text and categorizes them."""

    def __init__(self):
        pass

    async def extract_claims(self, text: str, question: Optional[str] = None) -> List[Claim]:
        """Extract atomic claims using LLM if available, otherwise syntactic decomposition."""
        # Try LLM extraction if API key is provided
        gemini_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
        if gemini_key:
            try:
                from google import genai
                client = genai.Client(api_key=gemini_key)
                prompt = self._build_extraction_prompt(text, question)
                resp = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if resp and resp.text:
                    claims = self._parse_llm_json(resp.text)
                    if claims:
                        return claims
            except Exception:
                pass

        # Syntactic and Rule-Based Atomic Decomposition Engine
        return self._extract_claims_syntactic(text)

    def _build_extraction_prompt(self, text: str, question: Optional[str] = None) -> str:
        return f"""You are a specialized Claim Extraction Agent for hallucination detection.
Given the following AI-generated text, break it down into ATOMIC factual claims.
Do not combine multiple facts into one claim.
Identify whether each claim is an opinion or factual statement.

Text to analyze:
\"\"\"{text}\"\"\"

Return a valid JSON array of objects with the exact schema:
[
  {{
    "claim_id": "C001",
    "claim": "Standalone atomic statement",
    "claim_type": "historical|scientific|numerical|geographic|financial|political|technical|biographical|medical|temporal|opinion|definition|mathematical|other",
    "importance": 0.9,
    "requires_verification": true
  }}
]
Only return the JSON array, no commentary."""

    def _parse_llm_json(self, raw_text: str) -> List[Claim]:
        try:
            # Strip markdown code blocks if any
            cleaned = re.sub(r"^```json\s*", "", raw_text.strip(), flags=re.MULTILINE)
            cleaned = re.sub(r"^```\s*$", "", cleaned.strip(), flags=re.MULTILINE)
            data = json.loads(cleaned)
            results = []
            for item in data:
                # Validate claim_type against Enum
                raw_type = item.get("claim_type", "other").lower()
                try:
                    ctype = ClaimType(raw_type)
                except ValueError:
                    ctype = ClaimType.OTHER
                results.append(
                    Claim(
                        claim_id=item.get("claim_id", f"C{len(results)+1:03d}"),
                        claim=item.get("claim", "").strip(),
                        claim_type=ctype,
                        importance=float(item.get("importance", 0.8)),
                        requires_verification=bool(item.get("requires_verification", True))
                    )
                )
            return results
        except Exception:
            return []

    def _extract_claims_syntactic(self, text: str) -> List[Claim]:
        """High-precision syntactic clause splitter to yield atomic factual claims."""
        claims: List[Claim] = []
        if not text:
            return claims

        # Split into sentences
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        claim_counter = 1

        for sentence in sentences:
            s_clean = sentence.strip()
            if not s_clean or len(s_clean) < 10:
                continue

            # Check if entire sentence is an opinion or subjective statement
            is_opinion = self._detect_opinion(s_clean)

            # Check for compound conjunctions to split into atomic units
            # e.g., "Elon Musk founded SpaceX in 2002 and the company launched its first rocket in 2008."
            clauses = self._split_compound_sentence(s_clean)

            for clause in clauses:
                clause_text = clause.strip()
                if len(clause_text) < 10:
                    continue

                # Ensure first character is uppercase and ends with period
                if not clause_text.endswith("."):
                    clause_text += "."
                clause_text = clause_text[0].upper() + clause_text[1:]

                ctype = self._classify_claim_type(clause_text, is_opinion)
                importance = self._calculate_importance(clause_text, ctype)
                req_verif = not (ctype == ClaimType.OPINION or is_opinion)

                claims.append(
                    Claim(
                        claim_id=f"C{claim_counter:03d}",
                        claim=clause_text,
                        claim_type=ctype,
                        importance=importance,
                        requires_verification=req_verif,
                        original_sentence=s_clean
                    )
                )
                claim_counter += 1

        return claims

    def _split_compound_sentence(self, sentence: str) -> List[str]:
        """Splits sentences with coordinating conjunctions into atomic clauses."""
        # Match ", and ", ", but ", " and the company ", etc.
        patterns = [
            r",\s+and\s+(?=[A-Z0-9]|the\s|it\s|he\s|she\s|they\s)",
            r",\s+but\s+(?=[A-Z0-9]|the\s|it\s|he\s|she\s|they\s)",
            r"\s+and\s+(?:the\s+company|the\s+agency|the\s+team|it|he|she|they)\s+",
            r"\s+and\s+(?:subsequently\s+|later\s+)?(?=launched|invented|founded|received|won|died|graduated|became|developed|created|built|released)",
            r"\s+and\s+later\s+",
            r";\s+"
        ]
        
        # Test split pattern
        parts = [sentence]
        for p in patterns:
            new_parts = []
            for part in parts:
                splits = re.split(p, part, flags=re.IGNORECASE)
                if len(splits) > 1:
                    new_parts.extend(splits)
                else:
                    new_parts.append(part)
            parts = new_parts

        # If splitting resulted in clauses lacking subjects, attempt contextual reconstruction
        reconstructed = []
        subject_match = re.match(r"^([A-Z][a-zA-Z0-9\s]+?)\s+(?:was|is|founded|invented|launched|developed|discovered|won|ruled)", sentence)
        leading_subject = subject_match.group(1) if subject_match else ""

        for idx, pt in enumerate(parts):
            pt_clean = pt.strip().rstrip(".").strip()
            if not pt_clean:
                continue
            # If second clause starts with verb without subject, prepend leading subject
            if idx > 0 and leading_subject and re.match(r"^(launched|invented|founded|received|won|died|graduated|became)\b", pt_clean, re.I):
                pt_clean = f"{leading_subject} {pt_clean}"
            elif idx > 0 and leading_subject and re.match(r"^(the company|the project|the author)\b", pt_clean, re.I):
                pt_clean = pt_clean  # already has nominal subject

            reconstructed.append(pt_clean)

        return reconstructed if reconstructed else [sentence]

    def _detect_opinion(self, text: str) -> bool:
        opinion_markers = [
            r"\bi think\b", r"\bi believe\b", r"\bin my opinion\b",
            r"\barguable\b", r"\bperhaps the greatest\b", r"\bprobably the best\b",
            r"\bmany people consider\b", r"\bsubjectively\b", r"\bit seems that\b"
        ]
        low = text.lower()
        return any(re.search(pat, low) for pat in opinion_markers)

    def _classify_claim_type(self, text: str, is_opinion: bool) -> ClaimType:
        if is_opinion:
            return ClaimType.OPINION

        low = text.lower()
        # Numerical / Mathematical
        if re.search(r"\b(\d+(\.\d+)?%|\$\d+|\d+\s*(meters|km|kilometers|kg|miles|mph|sec|seconds|billion|million))\b", low):
            return ClaimType.NUMERICAL
        if re.search(r"\b(equals|calculated as|equation|square root|sum of)\b", low):
            return ClaimType.MATHEMATICAL

        # Temporal / Historical
        if re.search(r"\b(in\s+1\d{3}|in\s+20\d{2}|founded in|established in|invented in|born in|died in|19\d{2}|18\d{2}|17\d{2})\b", low):
            if any(term in low for term in ["born", "died", "graduated", "married", "father", "mother"]):
                return ClaimType.BIOGRAPHICAL
            return ClaimType.HISTORICAL

        # Biographical
        if any(term in low for term in ["born", "died", "attended university", "biography", "early life"]):
            return ClaimType.BIOGRAPHICAL

        # Scientific / Medical
        if any(term in low for term in ["dna", "protein", "cell", "molecule", "physics", "vacuum", "speed of light", "quantum", "chemical"]):
            return ClaimType.SCIENTIFIC
        if any(term in low for term in ["disease", "syndrome", "treatment", "fda approved", "symptom", "vaccine", "clinical"]):
            return ClaimType.MEDICAL

        # Geographic
        if any(term in low for term in ["located in", "capital of", "continent", "mountain", "river", "bordering", "population of"]):
            return ClaimType.GEOGRAPHIC

        # Financial
        if any(term in low for term in ["revenue", "market cap", "stock", "profit", "nasdaq", "valuation", "shares"]):
            return ClaimType.FINANCIAL

        # Technical
        if any(term in low for term in ["software", "programming language", "algorithm", "compiler", "cpu", "operating system"]):
            return ClaimType.TECHNICAL

        # Definition
        if re.search(r"\b(is defined as|refers to the|is a term for)\b", low):
            return ClaimType.DEFINITION

        return ClaimType.OTHER

    def _calculate_importance(self, text: str, ctype: ClaimType) -> float:
        if ctype == ClaimType.OPINION:
            return 0.3
        elif ctype in (ClaimType.HISTORICAL, ClaimType.SCIENTIFIC, ClaimType.NUMERICAL, ClaimType.MEDICAL):
            return 0.95
        elif ctype in (ClaimType.FINANCIAL, ClaimType.TECHNICAL, ClaimType.BIOGRAPHICAL):
            return 0.85
        return 0.75
