// Frontend Application Logic for AI Hallucination Detector

let currentReport = null;
let activeFilter = 'ALL';

const SAMPLES = {
  telephone: {
    question: "Who invented the telephone and when?",
    answer: "Alexander Graham Bell invented the telephone in 1876 and received the official patent for the acoustic telegraph."
  },
  spacex_wrong: {
    question: "When was SpaceX founded and when did it launch its first rocket?",
    answer: "Elon Musk founded SpaceX in 1999 and the aerospace company successfully launched its first orbital rocket in 2008."
  },
  apollo: {
    question: "When did Apollo 11 land on the moon?",
    answer: "The Apollo 11 lunar module landed on the Moon on July 20, 1969. Commander Neil Armstrong and lunar module pilot Buzz Aldrin were the first humans to step onto the lunar surface."
  },
  fake_citation: {
    question: "What is the quantum harmonic resonance theory?",
    answer: "Dr. Arthur Pendelton proved quantum harmonic resonance in his landmark 2019 Nature paper 'Resonance in Quantum Gravity'. The experiment proved that gravity waves reverse under 4 Kelvin temperatures."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  checkSystemStatus();
  document.getElementById("view-history-btn").addEventListener("click", openHistoryModal);
});

async function checkSystemStatus() {
  try {
    const res = await fetch("/api/health");
    if (res.ok) {
      const data = await res.json();
      document.getElementById("system-status").textContent = "● System Active";
    }
  } catch (e) {
    document.getElementById("system-status").textContent = "○ Offline Mode";
    document.getElementById("system-status").style.color = "#94a3b8";
  }
}

function switchMode(mode) {
  const tabPaste = document.getElementById("tab-paste");
  const tabGen = document.getElementById("tab-generate");
  const btnGen = document.getElementById("btn-generate-inline");

  if (mode === "generate") {
    tabPaste.classList.remove("active");
    tabGen.classList.add("active");
    btnGen.style.display = "inline-flex";
  } else {
    tabGen.classList.remove("active");
    tabPaste.classList.add("active");
    btnGen.style.display = "none";
  }
}

function loadSample(key) {
  const sample = SAMPLES[key];
  if (!sample) return;
  document.getElementById("question-input").value = sample.question;
  document.getElementById("answer-input").value = sample.answer;
}

async function triggerGenerate() {
  const question = document.getElementById("question-input").value.trim();
  const model = document.getElementById("model-select").value;
  if (!question) {
    alert("Please enter a question first.");
    return;
  }

  const btnGen = document.getElementById("btn-generate-inline");
  btnGen.disabled = true;
  btnGen.textContent = "⏳ Generating...";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, model })
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("answer-input").value = data.answer;
    } else {
      alert("Generation error: " + (data.detail || "Unknown error"));
    }
  } catch (err) {
    alert("Generation network error: " + err.message);
  } finally {
    btnGen.disabled = false;
    btnGen.textContent = "⚡ Generate Answer Now";
  }
}

async function startVerification() {
  const question = document.getElementById("question-input").value.trim();
  const answer = document.getElementById("answer-input").value.trim();
  const model = document.getElementById("model-select").value;
  const enableCritic = document.getElementById("critic-toggle").checked;

  if (!question && !answer) {
    alert("Please provide either a question or an AI answer to verify.");
    return;
  }

  // Show progress stepper
  const progressContainer = document.getElementById("progress-container");
  const resultsContainer = document.getElementById("results-container");
  const btnVerify = document.getElementById("btn-verify");

  progressContainer.style.display = "block";
  resultsContainer.style.display = "none";
  btnVerify.disabled = true;

  // Animate progress steps
  animateProgressSteps();

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question || "Verified factual inquiry",
        answer: answer,
        model_name: model,
        enable_critic: enableCritic
      })
    });

    const report = await res.json();
    if (!res.ok) {
      throw new Error(report.detail || "Verification failed");
    }

    currentReport = report;
    completeProgressSteps();
    renderReport(report);
  } catch (err) {
    alert("Verification failed: " + err.message);
  } finally {
    btnVerify.disabled = false;
    setTimeout(() => {
      progressContainer.style.display = "none";
    }, 600);
  }
}

function animateProgressSteps() {
  const steps = [
    { id: "step-extract", line: "line-1", title: "Extracting Atomic Claims", desc: "Decomposing answer into discrete, typed factual propositions..." },
    { id: "step-normalize", line: "line-2", title: "Normalizing Search Queries", desc: "Formulating targeted verification hypotheses and search terms..." },
    { id: "step-retrieve", line: "line-3", title: "Retrieving Independent Evidence", desc: "Querying Wikipedia & Web search, evaluating source quality scores..." },
    { id: "step-verify", line: "line-4", title: "Executing Grounded NLI Verification", desc: "Checking factual alignment against retrieved authoritative excerpts..." },
    { id: "step-critic", line: "line-5", title: "Adversarial Critic Pass", desc: "Auditing verdicts for confirmation bias and temporal/numerical conflicts..." },
    { id: "step-score", line: null, title: "Calculating Reliability Metrics", desc: "Computing weighted reliability and hallucination risk formulas..." }
  ];

  // Reset steps
  document.querySelectorAll(".step-dot").forEach(d => d.className = "step-dot");
  document.querySelectorAll(".step-line").forEach(l => l.className = "step-line");

  let current = 0;
  const interval = setInterval(() => {
    if (current >= steps.length) {
      clearInterval(interval);
      return;
    }
    const s = steps[current];
    document.getElementById("progress-step-title").textContent = s.title;
    document.getElementById("progress-step-desc").textContent = s.desc;

    const dot = document.getElementById(s.id);
    if (dot) dot.classList.add("active");
    if (current > 0) {
      const prev = steps[current - 1];
      const prevDot = document.getElementById(prev.id);
      if (prevDot) {
        prevDot.classList.remove("active");
        prevDot.classList.add("completed");
      }
      if (prev.line) {
        document.getElementById(prev.line).classList.add("completed");
      }
    }
    current++;
  }, 450);
}

function completeProgressSteps() {
  document.querySelectorAll(".step-dot").forEach(d => {
    d.classList.remove("active");
    d.classList.add("completed");
  });
  document.querySelectorAll(".step-line").forEach(l => l.classList.add("completed"));
}

function renderReport(report) {
  const container = document.getElementById("results-container");
  container.style.display = "block";

  // Score Dial
  const relEl = document.getElementById("res-reliability");
  relEl.textContent = report.overall_reliability;
  if (report.overall_reliability >= 80) {
    relEl.style.color = "var(--success)";
  } else if (report.overall_reliability >= 50) {
    relEl.style.color = "var(--warning)";
  } else {
    relEl.style.color = "var(--danger)";
  }

  // Hallucination Risk
  const riskEl = document.getElementById("res-risk");
  riskEl.textContent = `${report.hallucination_risk}%`;
  if (report.hallucination_risk > 30) {
    riskEl.style.color = "var(--danger)";
  } else if (report.hallucination_risk > 15) {
    riskEl.style.color = "var(--warning)";
  } else {
    riskEl.style.color = "var(--success)";
  }

  // Model Tag
  document.getElementById("res-model-info").textContent = `Model: ${report.model_name}`;

  // Summary counts
  const counts = report.summary_counts || {};
  document.getElementById("cnt-supported").textContent = counts.supported || 0;
  document.getElementById("cnt-partial").textContent = counts.partially_supported || 0;
  document.getElementById("cnt-contradicted").textContent = counts.contradicted || 0;
  document.getElementById("cnt-unverified").textContent = counts.unverified || 0;

  // Filter count labels
  document.getElementById("filter-cnt-all").textContent = counts.total || 0;
  document.getElementById("filter-cnt-contra").textContent = counts.contradicted || 0;
  document.getElementById("filter-cnt-supp").textContent = counts.supported || 0;
  document.getElementById("filter-cnt-part").textContent = counts.partially_supported || 0;
  document.getElementById("filter-cnt-unver").textContent = counts.unverified || 0;

  // Explanation
  document.getElementById("res-explanation").textContent = report.explanation;

  // Render Claims Feed
  renderClaimsFeed(report.claims, report.results, report.evidence);

  // Scroll to results
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderClaimsFeed(claims, results, evidences) {
  const feed = document.getElementById("claims-feed");
  feed.innerHTML = "";

  const resultMap = new Map(results.map(r => [r.claim_id, r]));
  const evidenceMap = new Map(evidences.map(e => [e.evidence_id, e]));

  claims.forEach(claim => {
    const res = resultMap.get(claim.claim_id);
    const verdict = res ? res.verdict : 'UNVERIFIED';

    // Apply Filter
    if (activeFilter !== 'ALL' && verdict !== activeFilter) {
      return;
    }

    const card = document.createElement("div");
    card.className = "claim-card";

    // Verdict Badge styling
    let verdictIcon = "✓";
    if (verdict === "CONTRADICTED") verdictIcon = "✗";
    else if (verdict === "PARTIALLY_SUPPORTED") verdictIcon = "◐";
    else if (verdict === "UNVERIFIED") verdictIcon = "?";
    else if (verdict === "NOT_FACTUAL") verdictIcon = "ℹ";

    // Evidence HTML
    let evidenceHtml = "";
    if (res && res.evidence_ids && res.evidence_ids.length > 0) {
      const evList = res.evidence_ids.map(eid => evidenceMap.get(eid)).filter(Boolean);
      if (evList.length > 0) {
        evidenceHtml = `
          <div class="evidence-section">
            <div class="evidence-header">Corroborating Evidence (${evList.length}):</div>
            ${evList.map(e => `
              <div class="evidence-item">
                <div class="evidence-source-row">
                  <a href="${e.source_url}" target="_blank" rel="noopener" class="source-link">
                    🔗 ${escapeHtml(e.source_title)}
                  </a>
                  <span class="source-quality-badge">Quality: ${e.source_quality_score}/100 (${e.source_type})</span>
                </div>
                <p class="evidence-snippet">"${escapeHtml(e.snippet)}"</p>
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    card.innerHTML = `
      <div class="claim-header">
        <div class="claim-title-area">
          <span class="claim-id">${claim.claim_id}</span>
          <span class="claim-type-tag">${claim.claim_type}</span>
          <span class="claim-type-tag">Importance: ${claim.importance}</span>
        </div>
        <div class="verdict-badge verdict-${verdict}">
          ${verdictIcon} ${verdict.replace('_', ' ')}
        </div>
      </div>

      <div class="claim-text">${escapeHtml(claim.claim)}</div>

      <div class="claim-meta-row">
        <span>Confidence: <strong>${Math.round((res?.confidence || 0.5) * 100)}%</strong></span>
        <span>Avg Source Quality: <strong>${Math.round(res?.source_quality_avg || 0)}/100</strong></span>
        ${res?.critic_status ? `<span class="critic-badge">Critic: ${res.critic_status}</span>` : ''}
      </div>

      <div class="reason-box reason-${verdict}">
        <strong>Audit Rationale:</strong> ${escapeHtml(res?.reason || "Pending evaluation")}
        ${res?.critic_notes && res.critic_status === 'REVISED' ? `<br><small><strong>Critic Note:</strong> ${escapeHtml(res.critic_notes)}</small>` : ''}
      </div>

      ${evidenceHtml}
    `;

    feed.appendChild(card);
  });

  if (feed.children.length === 0) {
    feed.innerHTML = `<p class="text-muted" style="text-align:center; padding: 20px;">No claims match the filter '${activeFilter}'.</p>`;
  }
}

function filterClaims(verdict) {
  activeFilter = verdict;
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  if (currentReport) {
    renderClaimsFeed(currentReport.claims, currentReport.results, currentReport.evidence);
  }
}

async function exportTextReport() {
  if (!currentReport) return;
  try {
    const res = await fetch(`/api/reports/${currentReport.report_id}/text`);
    const data = await res.json();
    await navigator.clipboard.writeText(data.text_summary);
    alert("Formatted plain text verification audit copied to clipboard!");
  } catch (err) {
    alert("Export failed: " + err.message);
  }
}

function exportJsonReport() {
  if (!currentReport) return;
  const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `verification-report-${currentReport.report_id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function openHistoryModal() {
  const modal = document.getElementById("history-modal");
  const list = document.getElementById("history-list");
  modal.style.display = "flex";
  list.innerHTML = "<p class='text-muted'>Loading recent audits...</p>";

  try {
    const res = await fetch("/api/reports?limit=15");
    const reports = await res.json();
    if (!reports || reports.length === 0) {
      list.innerHTML = "<p class='text-muted'>No audits recorded yet.</p>";
      return;
    }
    list.innerHTML = reports.map(r => `
      <div class="history-item" onclick="loadHistoryReport('${r.report_id}')">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong style="color:var(--primary); font-family:monospace;">${r.report_id}</strong>
          <span style="font-size:0.8rem; color:var(--text-muted);">${new Date(r.created_at).toLocaleTimeString()}</span>
        </div>
        <div style="font-size:0.9rem; margin-bottom:6px;">${escapeHtml(r.question)}</div>
        <div style="font-size:0.75rem; color:var(--text-muted); display:flex; gap:12px;">
          <span>Reliability: <strong>${r.overall_reliability}/100</strong></span>
          <span>Risk: <strong>${r.hallucination_risk}%</strong></span>
          <span>Claims: <strong>${r.summary_counts?.total || 0}</strong></span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="text-danger">Failed to load history: ${err.message}</p>`;
  }
}

async function loadHistoryReport(reportId) {
  closeHistoryModal();
  try {
    const res = await fetch(`/api/reports/${reportId}`);
    if (res.ok) {
      const report = await res.json();
      currentReport = report;
      renderReport(report);
    }
  } catch (err) {
    alert("Failed to load report: " + err.message);
  }
}

function closeHistoryModal() {
  document.getElementById("history-modal").style.display = "none";
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
