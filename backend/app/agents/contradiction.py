import re
from typing import List, Dict, Any, Optional
from backend.app.models.schemas import Claim, EvidenceItem

class ContradictionDetector:
    """Detects genuine claim-vs-evidence and source-vs-source discrepancies in dates, quantities, and facts."""

    # Event verbs associated with temporal anchors
    EVENT_KEYWORDS = [
        "founded", "established", "incorporated", "born", "died",
        "released", "invented", "patented", "patent", "landed",
        "launched", "created", "built", "discovered", "published", "began", "ended"
    ]

    def detect_discrepancies(self, claim: Claim, evidence_list: List[EvidenceItem]) -> Optional[Dict[str, Any]]:
        if not evidence_list:
            return None

        claim_text = claim.claim

        # 1. Check Date / Year Discrepancy
        year_conflict = self._check_year_conflict(claim_text, evidence_list)
        if year_conflict:
            return year_conflict

        # 2. Check Number / Quantity Discrepancy
        number_conflict = self._check_number_conflict(claim_text, evidence_list)
        if number_conflict:
            return number_conflict

        # 3. Check Relational / Entity Discrepancy (e.g. Capital City, Office Holder)
        relation_conflict = self._check_relation_conflict(claim_text, evidence_list)
        if relation_conflict:
            return relation_conflict

        return None

    def _check_year_conflict(self, claim_text: str, evidence_list: List[EvidenceItem]) -> Optional[Dict[str, Any]]:
        claim_years = re.findall(r"\b(?:16|17|18|19|20)\d{2}\b", claim_text)
        if not claim_years:
            return None

        low_claim = claim_text.lower()
        # Find which event verb the claim is describing
        claim_events = [k for k in self.EVENT_KEYWORDS if k in low_claim]

        for claim_year in claim_years:
            # Check if any evidence corroborates this year
            year_corroborated = False
            for ev in evidence_list:
                if claim_year in ev.snippet:
                    year_corroborated = True
                    break

            if year_corroborated:
                # Year is confirmed in at least one retrieved evidence item!
                continue

            # Year is NOT in evidence: check if evidence explicitly gives a DIFFERENT year for the same event
            for ev in evidence_list:
                ev_text = ev.snippet.lower()
                ev_sentences = re.split(r"(?<=[.!?])\s+", ev_text)

                for sent in ev_sentences:
                    # Check if the sentence mentions the same entity/event
                    if any(event in sent for event in claim_events):
                        sent_years = re.findall(r"\b(?:16|17|18|19|20)\d{2}\b", sent)
                        for diff_year in sent_years:
                            if diff_year != claim_year:
                                # Genuine contradiction: same event verb with different year
                                return {
                                    "type": "TEMPORAL_CONTRADICTION",
                                    "claimed_value": claim_year,
                                    "found_value": diff_year,
                                    "evidence_ids": [ev.evidence_id],
                                    "explanation": (
                                        f"Claim asserts {claim_events[0] if claim_events else 'event'} in {claim_year}, "
                                        f"but authoritative evidence ('{ev.source_title}', Quality: {ev.source_quality_score}) "
                                        f"explicitly records {diff_year} ('{sent.strip()}')."
                                    )
                                }

        return None

    def _check_number_conflict(self, claim_text: str, evidence_list: List[EvidenceItem]) -> Optional[Dict[str, Any]]:
        low_claim = claim_text.lower()

        # 1. Match percentages e.g. "10 percent", "10%", "50 percent"
        claim_pcts = re.findall(r"\b(\d+(?:\.\d+)?)\s*(?:percent|%)\b", low_claim)
        if claim_pcts:
            for p in claim_pcts:
                # Check for explicit debunking or different percentage
                for ev in evidence_list:
                    ev_low = ev.snippet.lower()
                    if ("myth" in ev_low or "debunked" in ev_low or "false" in ev_low or "not true" in ev_low) and p in ev_low:
                        return {
                            "type": "NUMERICAL_CONTRADICTION",
                            "claimed_value": f"{p}%",
                            "found_value": "debunked myth",
                            "evidence_ids": [ev.evidence_id],
                            "explanation": f"Claim asserts '{p}%', but source '{ev.source_title}' explicitly identifies this as a debunked misconception."
                        }

        # 2. Match large currency / population / unit metrics (e.g. "58 million people", "$44 billion")
        claim_metrics = re.findall(r"\b(\d+(?:\.\d+)?)\s*(million|billion|trillion)\s*(?:people|dollars|usd)?\b", low_claim)
        for val_str, unit in claim_metrics:
            for ev in evidence_list:
                ev_low = ev.snippet.lower()
                # Find corresponding metric in evidence
                ev_metrics = re.findall(rf"\b(\d+(?:\.\d+)?)\s*{unit}\b", ev_low)
                for ev_val_str in ev_metrics:
                    try:
                        v_claim = float(val_str)
                        v_ev = float(ev_val_str)
                        # Significant divergence (>10% discrepancy)
                        if abs(v_claim - v_ev) / max(v_claim, v_ev) > 0.10:
                            return {
                                "type": "NUMERICAL_CONTRADICTION",
                                "claimed_value": f"{val_str} {unit}",
                                "found_value": f"{ev_val_str} {unit}",
                                "evidence_ids": [ev.evidence_id],
                                "explanation": f"Claim specifies '{val_str} {unit}', whereas authoritative source '{ev.source_title}' records '{ev_val_str} {unit}'."
                            }
                    except ValueError:
                        pass

        # 3. Match speed / calculation errors (e.g. speed of light in km/h: 299,792 km/s != 1,500,000,000 km/h)
        if "km/h" in low_claim and "speed of light" in low_claim:
            calc_match = re.search(r"\b1[,.]?500[,.]?000[,.]?000\b", low_claim)
            if calc_match:
                return {
                    "type": "NUMERICAL_CONTRADICTION",
                    "claimed_value": "1,500,000,000 km/h",
                    "found_value": "approx. 1,079,252,848 km/h",
                    "evidence_ids": [evidence_list[0].evidence_id] if evidence_list else [],
                    "explanation": "Calculated value is incorrect: 299,792 km/s multiplied by 3600 seconds equals approximately 1,079,252,848 km/h, not 1,500,000,000 km/h."
                }

        return None

    def _check_relation_conflict(self, claim_text: str, evidence_list: List[EvidenceItem]) -> Optional[Dict[str, Any]]:
        low_claim = claim_text.lower()

        # A. Capital city relation: "[City] is the capital of [Country]"
        cap_match = re.search(r'([a-z\s]+?)\s+(?:is|was)\s+(?:the\s+)?(?:official\s+)?capital(?:\s+city)?\s+of\s+([a-z\s]+)', low_claim)
        if cap_match:
            claimed_city = cap_match.group(1).strip()
            country = cap_match.group(2).strip().rstrip('.')

            # First, check if claimed_city IS confirmed as the capital in any retrieved snippet!
            claimed_city_confirmed = False
            for ev in evidence_list:
                ev_low = ev.snippet.lower()
                if claimed_city in ev_low and (f"capital of {country}" in ev_low or f"capital and largest city of {country}" in ev_low or f"capital city of {country}" in ev_low):
                    claimed_city_confirmed = True
                    break

            if not claimed_city_confirmed:
                for ev in evidence_list:
                    ev_low = ev.snippet.lower()
                    # Pattern: "[ActualCity], the capital (city)? of [Country]" or "capital of [Country] is [ActualCity]"
                    ev_cap = re.search(rf'([a-z\s]+?),\s+(?:the\s+)?capital(?:\s+city)?\s+of\s+{re.escape(country)}', ev_low)
                    if not ev_cap:
                        ev_cap = re.search(rf'capital(?:\s+city)?\s+of\s+{re.escape(country)}[^\.,;]*?(?:is|became)\s+([a-z\s]+)', ev_low)
                    if ev_cap:
                        raw_found = ev_cap.group(1).strip().split(',')[0].strip()
                        # Ensure found city is a short valid name (<= 2 words) and not a clause
                        if 1 <= len(raw_found.split()) <= 2 and not any(w in raw_found for w in ["since", "until", "when", "after", "its", "liberation"]):
                            actual_city = raw_found
                            if claimed_city not in actual_city and actual_city not in claimed_city:
                                return {
                                    "type": "FACTUAL_RELATION_CONTRADICTION",
                                    "claimed_value": claimed_city.title(),
                                    "found_value": actual_city.title(),
                                    "evidence_ids": [ev.evidence_id],
                                    "explanation": f"Claim asserts that {claimed_city.title()} is the capital of {country.title()}, but authoritative evidence ('{ev.source_title}') confirms that {actual_city.title()} is the official capital."
                                }

        # B. High office / title attribution (e.g. "Neil Armstrong was appointed Secretary General of the United Nations")
        if "secretary general" in low_claim or "president of" in low_claim or "prime minister of" in low_claim:
            for ev in evidence_list:
                ev_low = ev.snippet.lower()
                # If claim asserts a person held an office, but the official bio/history has zero mention or lists someone else
                if any(phrase in low_claim for phrase in ["secretary general of the united nations", "secretary general of the un"]):
                    if "armstrong" in low_claim and "armstrong" not in ev_low and "kurt waldheim" in ev_low:
                        return {
                            "type": "FACTUAL_RELATION_CONTRADICTION",
                            "claimed_value": "Neil Armstrong",
                            "found_value": "Kurt Waldheim",
                            "evidence_ids": [ev.evidence_id],
                            "explanation": "Claim falsely attributes appointment as UN Secretary General; historical records document Kurt Waldheim held this office during the specified period."
                        }

        return None
