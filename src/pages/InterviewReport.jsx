// src/pages/InterviewReport.jsx
import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const styles = `
.report-wrap {
  min-height: 100vh;
  background: #020617;
  color: #e5e7eb;
  font: 15px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 24px 24px 40px;
}

/* header */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}
.report-title-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.report-title {
  font-size: 22px;
  font-weight: 600;
}
.report-subtitle {
  font-size: 13px;
  color: #9ca3af;
}
.report-meta-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
  font-size: 13px;
  color: #9ca3af;
}
.report-meta-pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: #020617;
  border: 1px solid #1f2937;
}
.report-actions {
  display: flex;
  gap: 10px;
}
.report-btn {
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.report-btn.primary {
  background: #2563eb;
  color: #f9fafb;
}
.report-btn.ghost {
  background: #020617;
  color: #e5e7eb;
  border-color: #374151;
}

/* hero card (overview + analytics) */
.report-hero {
  background: #020617;
  border-radius: 18px;
  border: 1px solid #1f2937;
  padding: 18px 18px 20px;
  margin-bottom: 16px;
}
.report-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 2fr);
  gap: 20px;
}
@media (max-width: 1024px) {
  .report-hero-grid {
    grid-template-columns: 1fr;
  }
}
.report-hero-section-title {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  margin-bottom: 10px;
}
.report-overview-list {
  font-size: 14px;
}
.report-overview-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
}
.report-overview-label {
  color: #9ca3af;
}
.report-overview-value {
  font-weight: 500;
}

/* analytics gauges */
.report-analytics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: flex-end;
}
.gauge {
  position: relative;
  width: 150px;
  height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gauge svg {
  width: 100%;
  height: 80px;
}
.gauge-track {
  fill: none;
  stroke: #111827;
  stroke-width: 9;
  stroke-linecap: round;
}
.gauge-fill {
  fill: none;
  stroke-width: 9;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}
.gauge-center {
  position: absolute;
  bottom: 24px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.gauge-value {
  font-size: 20px;
  font-weight: 600;
}
.gauge-max {
  font-size: 12px;
  color: #9ca3af;
}
.gauge-label {
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
}

/* generic card */
.report-card {
  background: #020617;
  border-radius: 16px;
  border: 1px solid #1f2937;
  padding: 14px 18px 16px;
}
.report-card-header {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  margin-bottom: 10px;
}
.report-empty {
  font-size: 14px;
  color: #6b7280;
}

/* summary blocks (now vertical rows) */
.report-summary-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.report-summary-row {
  padding: 10px 0;
  border-top: 1px solid #111827;
}
.report-summary-row:first-child {
  border-top: none;
}
.report-summary-block-title {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 4px;
}
.report-summary-block-body {
  font-size: 14px;
  color: #e5e7eb;
}

/* feedback sections */
.feedback-section {
  background: #020617;
  border-radius: 14px;
  border: 1px solid #111827;
  margin-top: 10px;
}
.feedback-header {
  width: 100%;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #020617;
  cursor: pointer;
}
.feedback-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.feedback-icon {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111827;
  font-size: 14px;
}
.feedback-title {
  font-size: 15px;
  font-weight: 500;
}
.feedback-chevron {
  font-size: 14px;
  color: #9ca3af;
  transition: transform 0.2s ease;
}
.feedback-chevron.open {
  transform: rotate(180deg);
}
.feedback-body {
  padding: 0 18px 12px 44px;
  font-size: 14px;
}
.feedback-body ul {
  margin: 6px 0 0;
  padding-left: 18px;
}
.feedback-body li {
  margin-bottom: 6px;
}

/* tiny footer text */
.report-submeta {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}
`;

/* ---------- helpers ---------- */

// Split a long sentence into bullets (fallback to single bullet)
function toBullets(text) {
  if (!text) return [];
  const parts = text
    .split(/[\.\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [text.trim()];
}

// Simple semi-circle gauge using SVG
function Gauge({ label, value, max = 3, color = "#22c55e" }) {
  const safeMax = max || 1;
  const clamped = Math.max(0, Math.min(value ?? 0, safeMax));
  const pct = clamped / safeMax;

  const radius = 40;
  const circumference = Math.PI * radius;
  const dasharray = `${circumference} ${circumference}`;
  const dashoffset = circumference * (1 - pct);

  return (
    <div className="gauge">
      <svg viewBox="0 0 100 60">
        <path d="M10 50 A40 40 0 0 1 90 50" className="gauge-track" />
        <path
          d="M10 50 A40 40 0 0 1 90 50"
          className="gauge-fill"
          style={{
            stroke: color,
            strokeDasharray: dasharray,
            strokeDashoffset: dashoffset,
          }}
        />
      </svg>
      <div className="gauge-center">
        <span className="gauge-value">{clamped}</span>
      </div>
      <div className="gauge-label">{label}</div>
    </div>
  );
}

export default function InterviewReport() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const interviewSession = useSelector((s) => s.interviewSession);

  // Summary object from Redux or navigation state
  const summary = interviewSession.summary || state?.summary || null;
  const sessionId =
    state?.sessionId || summary?.session_id || interviewSession.sessionId;

  const candidateName = interviewSession.candidateName || "Candidate";
  const interviewerName = interviewSession.interviewerName || "Interviewer";
  const jobTitle =
    interviewSession.jobTitle || state?.jobTitle || "Interview Report";

  // 🔹 Prefer explicit interviewId from state, then summary, then redux
  // const interviewId =
  //   state?.interviewId ||
  //   summary?.interview_id ||
  //   interviewSession.interviewId ||
  //   null;

    const interviewId = sessionId;

  const jdSnippet = interviewSession.jd
    ? interviewSession.jd.slice(0, 220) +
      (interviewSession.jd.length > 220 ? "…" : "")
    : null;

  // pull fields from summary (with fallbacks)
  const analytics = summary?.analytics || {};
  const strengthsText = summary?.strengths || "";
  const weaknessesText = summary?.weaknesses || "";
  const interviewSummaryText = summary?.interview_summary || "";

  const strengthsBullets = toBullets(strengthsText);
  const weaknessesBullets = toBullets(weaknessesText);
  const interviewBullets = toBullets(interviewSummaryText);

  // Action items (kept here in case you need later)
  let actionBullets = Array.isArray(summary?.action_items)
    ? summary.action_items
    : [];

  if (!actionBullets.length) {
    if (weaknessesText) {
      actionBullets.push(
        "Turn each weak area into a clear story: prepare 2–3 detailed examples where you solved challenges."
      );
    }
    if (
      typeof analytics.communication_experience === "number" &&
      analytics.communication_experience <= 1
    ) {
      actionBullets.push(
        "Practice mock interviews focusing on communication—speak out loud, record yourself, and refine your answers."
      );
    }
    if (
      interviewSummaryText &&
      interviewSummaryText
        .toLowerCase()
        .includes("no substantive candidate responses")
    ) {
      actionBullets.push(
        "Give longer answers in the next interview so the interviewer and AI can properly assess your skills."
      );
    }
    if (!actionBullets.length) {
      actionBullets.push(
        "Prepare 3–4 STAR stories (Situation–Task–Action–Result) around your key projects and rehearse them."
      );
    }
  }

  const hasAnyContent =
    summary &&
    (strengthsText ||
      weaknessesText ||
      interviewSummaryText ||
      Object.keys(analytics || {}).length > 0);

  // Overview
  const overview = {
    type: summary?.interview_type || "Interview",
    date:
      summary?.date ||
      new Date().toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    experience: summary?.experience || "Not specified",
    roleFit: summary?.role_fit || "Not evaluated",
    duration: summary?.duration || "—", // 🔹 pass this to Feedback page
  };

  const [openSections, setOpenSections] = React.useState({
    strengths: true,
    weaknesses: true,
    interview_summary: true,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // 🔹 Go to feedback page, passing interviewId + duration + context
   const goToFeedback = () => {
    if (!sessionId) return;

    navigate("/interview/feedback", {
      state: {
        sessionId,
        interviewId: sessionId, // ✅ this is your {interview_id} for API
        candidateName,
        interviewerName,
        jobTitle,
        duration: overview.duration,
      },
    });
  };


  return (
    <div className="report-wrap">
      <style>{styles}</style>

      {/* HEADER */}
      <header className="report-header">
        <div className="report-title-group">
          <div className="report-title">{jobTitle}</div>
          <div className="report-subtitle">
            Candidate report generated by AI assistant
          </div>
        </div>

        <div className="report-actions">
          <button
            type="button"
            className="report-btn ghost"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <button
            type="button"
            className="report-btn ghost"
            onClick={() => window.print()}
          >
            Print / Save PDF
          </button>
          <button
            type="button"
            className="report-btn primary"
            onClick={goToFeedback}
            disabled={!interviewId}
            title={!interviewId ? "Missing interview id" : ""}
          >
            Next: Interviewer feedback →
          </button>
        </div>
      </header>

      {/* NO SUMMARY STATE */}
      {!hasAnyContent && (
        <div className="report-card">
          <div className="report-card-header">Summary</div>
          <div className="report-empty">
            No AI summary available for this session yet. Please run the
            interview and click “Exit” again to generate a report.
          </div>
        </div>
      )}

      {hasAnyContent && (
        <>
          {/* TOP HERO: OVERVIEW + ANALYTICS */}
          <section className="report-hero">
            <div className="report-hero-grid">
              {/* Overview column */}
              <div>
                <div className="report-hero-section-title">Overview</div>
                <div className="report-overview-list">
                  <div className="report-overview-row" />
                  <div className="report-overview-row">
                    <span className="report-overview-label">Candidate</span>
                    <span className="report-overview-value">
                      {candidateName}
                    </span>
                  </div>
                  <div className="report-overview-row">
                    <span className="report-overview-label">Interviewer</span>
                    <span className="report-overview-value">
                      {interviewerName}
                    </span>
                  </div>
                  <div className="report-overview-row">
                    <span className="report-overview-label">Date</span>
                    <span className="report-overview-value">
                      {overview.date}
                    </span>
                  </div>
                  <div className="report-overview-row">
                    <span className="report-overview-label">Duration</span>
                    <span className="report-overview-value">
                      {overview.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Analytics column */}
              <div>
                <div className="report-hero-section-title">Analytics</div>
                <div className="report-analytics-row">
                  <Gauge
                    label="Skills Match"
                    value={analytics.skills_match ?? 0}
                    color="#f97316"
                  />
                  <Gauge
                    label="Communication & Experience"
                    value={analytics.communication_experience ?? 0}
                    color="#22c55e"
                  />
                  <Gauge
                    label="JD Alignment"
                    value={analytics.jd_alignment ?? 0}
                    color="#38bdf8"
                  />
                  <Gauge
                    label="Overall Score"
                    value={analytics.overall_score ?? 0}
                    color="#a855f7"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* INTERVIEW FEEDBACK – ACCORDION SECTIONS */}
          <section className="report-card">
            <div className="report-card-header">Summary (AI Overview)</div>

            {/* Strengths */}
            <div className="feedback-section">
              <button
                type="button"
                className="feedback-header"
                onClick={() => toggleSection("strengths")}
              >
                <div className="feedback-header-left">
                  <div className="feedback-icon">👍</div>
                  <div className="feedback-title">Strengths (AI view)</div>
                </div>
                <span
                  className={
                    "feedback-chevron" +
                    (openSections.strengths ? " open" : "")
                  }
                >
                  ▾
                </span>
              </button>
              {openSections.strengths && (
                <div className="feedback-body">
                  {strengthsBullets.length ? (
                    <ul>
                      {strengthsBullets.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="report-empty">No strengths captured.</p>
                  )}
                </div>
              )}
            </div>

            {/* Weaknesses / improvements */}
            <div className="feedback-section">
              <button
                type="button"
                className="feedback-header"
                onClick={() => toggleSection("weaknesses")}
              >
                <div className="feedback-header-left">
                  <div className="feedback-icon">👎</div>
                  <div className="feedback-title">Weaknesses (AI view)</div>
                </div>
                <span
                  className={
                    "feedback-chevron" +
                    (openSections.weaknesses ? " open" : "")
                  }
                >
                  ▾
                </span>
              </button>
              {openSections.weaknesses && (
                <div className="feedback-body">
                  {weaknessesBullets.length ? (
                    <ul>
                      {weaknessesBullets.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="report-empty">
                      No improvement areas identified.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Interview summary */}
            <div className="feedback-section">
              <button
                type="button"
                className="feedback-header"
                onClick={() => toggleSection("interview_summary")}
              >
                <div className="feedback-header-left">
                  <div className="feedback-icon">📝</div>
                  <div className="feedback-title">Interview Summary</div>
                </div>
                <span
                  className={
                    "feedback-chevron" +
                    (openSections.interview_summary ? " open" : "")
                  }
                >
                  ▾
                </span>
              </button>
              {openSections.interview_summary && (
                <div className="feedback-body">
                  {interviewBullets.length ? (
                    <ul>
                      {interviewBullets.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="report-empty">No strengths captured.</p>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
