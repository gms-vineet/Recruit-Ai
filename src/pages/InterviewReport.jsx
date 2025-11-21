// src/pages/InterviewReport.jsx
import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


function formatDurationMMSS(totalSeconds) {
  if (typeof totalSeconds !== "number" || !Number.isFinite(totalSeconds)) {
    return "—";
  }
  const sec = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}
const styles = `
.report-wrap {
  min-height: 100vh;
  /* Let parent gradient/theme show */
  background: transparent;
  color: var(--color-text-base, #e5e7eb);
  font: 15px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 24px 24px 40px;
}

/* ---------- LIGHT MODE OVERRIDES ---------- */
:root:not(.dark) .report-wrap {
  color: #0f172a;
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
  background: #020617;
  color: #f9fafb;
}

/* hero card (overview + analytics) */
.report-hero {
  background: rgba(15, 23, 42, 0.96);
  border-radius: 18px;
  border: 1px solid #1f2937;
  padding: 18px 18px 20px;
  margin-bottom: 16px;
  color: #e5e7eb;
}

/* LIGHT: hero becomes light card */
:root:not(.dark) .report-hero {
  background: #ffffff;
  border-color: #e5e7eb;
  color: #0f172a;
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
:root:not(.dark) .report-hero-section-title {
  color: #6b7280;
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
:root:not(.dark) .report-overview-label {
  color: #6b7280;
}

/* analytics gauges */
.report-analytics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: flex-start; /* align all dials nicely */
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
:root:not(.dark) .gauge-track {
  stroke: #e5e7eb;
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
.gauge-label {
  margin-top: 4px;
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
  line-height: 1.25;
  min-height: 26px; /* keep labels same height so arcs line up */
}
:root:not(.dark) .gauge-label {
  color: #6b7280;
}

/* generic card */
.report-card {
  background: rgba(15, 23, 42, 0.96);
  border-radius: 16px;
  border: 1px solid #1f2937;
  padding: 14px 18px 16px;
  color: #e5e7eb;
}

/* LIGHT: summary card becomes light */
:root:not(.dark) .report-card {
  background: #ffffff;
  border-color: #e5e7eb;
  color: #0f172a;
}

.report-card-header {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
}

/* feedback sections */
.feedback-section {
  background: #020617;
  border-radius: 14px;
  border: 1px solid #111827;
  margin-top: 10px;
}
:root:not(.dark) .feedback-section {
  background: #f9fafb;
  border-color: #e5e7eb;
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
:root:not(.dark) .feedback-header {
  background: #f9fafb;
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
:root:not(.dark) .feedback-icon {
  background: #e5e7eb;
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
:root:not(.dark) .feedback-chevron {
  color: #6b7280;
}
.feedback-chevron.open {
  transform: rotate(180deg);
}
.feedback-body {
  padding: 0 18px 12px 44px;
  font-size: 14px;
}

/* nicer bullets */
.feedback-body ul {
  margin: 6px 0 0;
  padding-left: 18px;
  list-style: disc;
}
.feedback-body li {
  margin-bottom: 6px;
  line-height: 1.5;
}

/* tiny footer text */
.report-submeta {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}
/* analytics gauges */
.report-analytics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: stretch;     /* all gauges same height */
  width: 100%;
}

.gauge {
  position: relative;
  flex: 1 1 0;              /* ✅ each gauge takes equal space */
  min-width: 140px;         /* wrap nicely on smaller screens */
  max-width: 220px;         /* optional cap so they don’t get huge */
  height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge svg {
  width: 100%;              /* fill flex width */
  height: 80px;
}
/* empty text */
.report-empty {
  font-size: 14px;
  color: #6b7280;
}
`;

/* ---------- helpers ---------- */

// Turn AI text into clean bullets (no double “-”)
function toBullets(text) {
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  let items;
  if (lines.length > 1) {
    items = lines;
  } else {
    items = text
      .split(/[.]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return items.map((line) => line.replace(/^[-•]\s*/, ""));
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

/* ---------- Skeleton while API is loading ---------- */

function ReportSkeleton() {
  return (
    <>
      {/* HERO SKELETON */}
      <section className="report-hero">
        <div className="report-hero-grid">
          {/* Overview skeleton */}
          <div>
            <div className="report-hero-section-title">
              <Skeleton width={80} />
            </div>
            <div className="report-overview-list">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="report-overview-row">
                  <Skeleton width={80} />
                  <Skeleton width={140} />
                </div>
              ))}
            </div>
          </div>

          {/* Analytics skeleton */}
          <div>
            <div className="report-hero-section-title">
              <Skeleton width={80} />
            </div>
            <div className="report-analytics-row">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="gauge">
                  <Skeleton
                    style={{ borderRadius: 9999 }}
                    height={80}
                    width={140}
                  />
                  <div className="gauge-label">
                    <Skeleton width={90} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUMMARY SKELETON */}
      <section className="report-card " >
        <div className="report-card-header">
          <Skeleton width={120} />
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="feedback-section">
            <div className="feedback-header">
              <div className="feedback-header-left">
                <div className="feedback-icon">
                  <Skeleton circle height={24} width={24} />
                </div>
                <div className="feedback-title">
                  <Skeleton width={130} />
                </div>
              </div>
              <Skeleton width={20} />
            </div>
            <div className="feedback-body">
              <ul>
                {[1, 2, 3].map((j) => (
                  <li key={j}>
                    <Skeleton width="90%" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

export default function InterviewReport() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
    const location = useLocation();
  const routeDurationSeconds = location.state?.durationSeconds;

  // if later you also get duration from backend summary, you can OR it here
  const durationLabel = formatDurationMMSS(routeDurationSeconds);
  const interviewSession = useSelector((s) => s.interviewSession);

  const summary = interviewSession.summary || state?.summary || null;
  const sessionId =
    state?.sessionId || summary?.session_id || interviewSession.sessionId;

  const candidateName = interviewSession.candidateName || "Candidate";
  const interviewerName = interviewSession.interviewerName || "Interviewer";
  const jobTitle =
    interviewSession.jobTitle || state?.jobTitle || "AI Interview Report";

  // Use sessionId as interviewId (as per your earlier change)
  const interviewId = sessionId;

  const analytics = summary?.analytics || {};
  const strengthsText = summary?.strengths || "";
  const weaknessesText = summary?.weaknesses || "";
  const interviewSummaryText = summary?.interview_summary || "";

  const strengthsBullets = toBullets(strengthsText);
  const weaknessesBullets = toBullets(weaknessesText);
  const interviewBullets = toBullets(interviewSummaryText);

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

  // const hasAnyContent =
  //   summary &&
  //   (strengthsText ||
  //     weaknessesText ||
  //     interviewSummaryText ||
  //     Object.keys(analytics || {}).length > 0);
  const hasScores = Object.values(analytics || {}).some(
    (v) => typeof v === "number" && v > 0
  );

  const hasAnyText = Boolean(
    strengthsText.trim() ||
      weaknessesText.trim() ||
      interviewSummaryText.trim()
  );

  const hasAnyContent = Boolean(summary && (hasScores || hasAnyText));

  const overview = {
    date:
      summary?.date ||
      new Date().toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    duration: summary?.duration || "—",
  };

  const [openSections, setOpenSections] = React.useState({
    strengths: true,
    weaknesses: true,
    interview_summary: true,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const goToFeedback = () => {
    if (!sessionId) return;

    navigate("/interview/feedback", {
      state: {
        sessionId,
        interviewId: sessionId,
        candidateName,
        interviewerName,
        jobTitle,
        duration: overview.duration,
      },
    });
  };

  // 🔥 Detect loading state for skeleton
  // Adjust this to match your slice:
  // e.g. summaryStatus === "loading" OR summaryLoading boolean
 const isSummaryLoading =
    interviewSession.summaryStatus === "loading" ||
    interviewSession.loadingSummary === true;

  return (
    <div className="report-wrap">
      <style>{styles}</style>
  <SkeletonTheme
        baseColor="#020617"      // near your card background
        highlightColor="#111827" // subtle highlight
        borderRadius={6}
      >
      {/* HEADER */}
      <header className="report-header">
        <div className="report-title-group">
          <div className="report-title">{jobTitle}</div>
          <div className="report-subtitle" />
        </div>

        <div className="report-actions">
          <button
            type="button"
            className="report-btn primary"
            onClick={goToFeedback}
            disabled={!interviewId}
            title={!interviewId ? "Missing interview id" : ""}
          >
            Interviewer feedback 
          </button>
        </div>
      </header>

      {/* ⏳ When API is loading – show skeleton */}
      {isSummaryLoading && <ReportSkeleton />}

      {/* When not loading, show real content */}
      {!isSummaryLoading && !hasAnyContent && (
        <div className="report-card">
          <div className="report-card-header">Summary</div>
          <div className="report-empty">
            No AI summary available for this session yet. Please run the
            interview and click “Exit” again to generate a report.
          </div>
        </div>
      )}

      {!isSummaryLoading && hasAnyContent && (
        <>
          {/* TOP HERO: OVERVIEW + ANALYTICS */}
          <section className="report-hero">
            <div className="report-hero-grid">
              {/* Overview column */}
              <div>
                <div className="report-hero-section-title">Overview</div>
                <div className="report-overview-list">
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
                      {durationLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Analytics column */}
              <div>
                <div className="report-hero-section-title">Analytics</div>
                <div className="report-analytics-row">
  <Gauge label="Skills Match" value={analytics.skills_match ?? 0} color="#f97316" />
  <Gauge label="Communication & Experience" value={analytics.communication_experience ?? 0} color="#22c55e" />
  <Gauge label="JD Alignment" value={analytics.jd_alignment ?? 0} color="#38bdf8" />
  <Gauge label="Overall Score" value={analytics.overall_score ?? 0} color="#a855f7" />
</div>
              </div>
            </div>
          </section>

          {/* SUMMARY / SECTIONS */}
          <section className="report-card">
            <div className="report-card-header">Overview</div>

            {/* Strengths */}
            <div className="feedback-section">
              <button
                type="button"
                className="feedback-header"
                onClick={() => toggleSection("strengths")}
              >
                <div className="feedback-header-left">
                  <div className="feedback-icon">👍</div>
                  <div className="feedback-title">Strengths </div>
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

            {/* Weaknesses */}
            <div className="feedback-section">
              <button
                type="button"
                className="feedback-header"
                onClick={() => toggleSection("weaknesses")}
              >
                <div className="feedback-header-left">
                  <div className="feedback-icon">👎</div>
                  <div className="feedback-title">Weaknesses</div>
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

            {/* Interview Summary */}
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
                    <p className="report-empty">
                      No interview summary captured.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}
      </SkeletonTheme>
    </div>
  );
}
