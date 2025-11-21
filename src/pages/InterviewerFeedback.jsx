// src/pages/InterviewerFeedback.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submitFeedbackRequest } from "@/store/slices/interviewFeedbackSlice";
import { updateInterviewStatusRequest } from "../store/slices/interviewDetailSlice";
import { fetchInterviewerInterviewsRequest } from "../store/slices/interviewerInterviewsSlice";

const styles = `
  /* --- Layout wrapper: full-width, centered form --- */
.fb-wrapper {
    width: 100%;
    max-width: 1120px;
    padding: 40px 24px 48px;
    margin: 0 auto;
    min-height: calc(100vh - 4rem);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-base, #0f172a);
  }

  /* --- Form container (card UI removed) --- */
.fb-card {
    width: 100%;
    padding: 22px 24px 20px;
    border-radius: 18px;

    /* ⬅️ transparent so page gradient shows through */
    background: transparent;

    /* purple border + soft glow */
    border: 1px solid rgba(167, 139, 250, 0.9);
    box-shadow:
      0 0 0 1px rgba(129, 140, 248, 0.55),
      0 18px 45px rgba(15, 23, 42, 0.75);

    backdrop-filter: blur(16px) saturate(140%);
    color: var(--color-text-base, #0f172a);
  }

 .dark .fb-card {
    background: transparent;              /* ⬅️ keep it transparent in dark too */
    border-color: rgba(167, 139, 250, 0.95);
    box-shadow:
      0 0 0 1px rgba(139, 92, 246, 0.7),
      0 22px 55px rgba(15, 23, 42, 0.95);
    color: #e5e7eb;
  }
    border-color: rgba(167, 139, 250, 0.95);
    box-shadow:
      0 0 0 1px rgba(139, 92, 246, 0.6),
      0 22px 55px rgba(15, 23, 42, 0.98);
    color: #e5e7eb;
  }

  .fb-card .header {
    margin-bottom: 18px;
  }

 .fb-card .title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 4px;
    letter-spacing: 0.01em;
  }

   .fb-card .subtitle {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
  }
  .dark .fb-card .subtitle {
    color: #9ca3af;
  }

  /* --- Grid layout for sections (2 columns on desktop) --- */
.fb-card .fb-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 12px;
  margin-top: 12px;  /* ⬅️ pushes all sections a bit away from the top border */
}

  .fb-card .section {
    padding: 10px 0;
    border-top: 1px solid rgba(203, 213, 225, 0.9);
  }
  .dark .fb-card .section {
    border-top-color: rgba(30, 41, 59, 0.9);
  }

  .fb-card .section:first-of-type {
    border-top: none;
  }

  .fb-card .section-full {
    grid-column: 1 / -1;
  }

  .fb-card .section-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .fb-card .section-hint {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 8px;
  }
  .dark .fb-card .section-hint {
    color: #94a3b8;
  }

  @media (max-width: 900px) {
    .fb-card .fb-grid {
      grid-template-columns: 1fr;
    }
  }

  /* --- Options row + pills --- */
  .fb-card .options-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .fb-card .tick-option {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    background-color: rgba(148, 163, 184, 0.14);
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    color: var(--color-text-base, #0f172a);
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      transform 0.1s ease;
    white-space: nowrap;            /* ⬅️ keep each option on one line */
  }
  .dark .fb-card .tick-option {
    border-color: rgba(51, 65, 85, 0.9);
    background:
      radial-gradient(circle at top,
        rgba(15, 23, 42, 0.8),
        rgba(15, 23, 42, 1)
      );
    color: #e5e7eb;
  }

  .fb-card .tick-option input {
    width: 14px;
    height: 14px;
    margin: 0;
    accent-color: var(--color-primary, #3b82f6);
  }

  .fb-card .tick-option span {
    line-height: 1.2;
  }

  .fb-card .tick-option:hover {
    border-color: var(--color-primary, #3b82f6);
    background-color: rgba(59, 130, 246, 0.08);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
    transform: translateY(-0.5px);
  }
  .dark .fb-card .tick-option:hover {
    background: rgba(37, 99, 235, 0.18);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.35);
  }

  .fb-card .scale-label {
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
  }
  .dark .fb-card .scale-label {
    color: #64748b;
  }

  .fb-card .score-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-base, #0f172a);
    margin-top: 2px;
  }
  .dark .fb-card .score-label {
    color: #e5e7eb;
  }

  /* --- Textarea --- */
  .fb-card textarea {
    width: 100%;
    min-height: 90px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    padding: 8px 11px;
    font-size: 14px;
    resize: vertical;
    outline: none;
    background-color: var(--color-bg-base, #f9fafb);
    color: var(--color-text-base, #0f172a);
  }

  .fb-card textarea::placeholder {
    color: #94a3b8;
  }

  .fb-card textarea:focus {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.35);
    background-color: var(--color-bg-surface, #ffffff);
  }

  .dark .fb-card textarea {
    background-color: rgba(15, 23, 42, 0.98);
    color: #e5e7eb;
    border-color: rgba(51, 65, 85, 1);
  }
  .dark .fb-card textarea::placeholder {
    color: #64748b;
  }
  .dark .fb-card textarea:focus {
    background-color: #020617;
  }

  /* --- Footer / button --- */
  .fb-card .footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 14px;
    gap: 10px;
  }

  .fb-card .hint-small {
    font-size: 12px;
    color: #6b7280;
  }
  .dark .fb-card .hint-small {
    color: #64748b;
  }

  .fb-card .btn {
    border-radius: 999px;
    border: none;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .fb-card .btn-primary {
    background: linear-gradient(
      135deg,
      var(--color-primary, #3b82f6),
      var(--color-secondary, #8b5cf6)
    );
    color: #ffffff;
    box-shadow: 0 8px 22px rgba(37, 99, 235, 0.5);
  }

  .fb-card .btn-primary:active {
    transform: translateY(1px);
    box-shadow: 0 3px 10px rgba(37, 99, 235, 0.5);
  }

  @media (max-width: 600px) {
    .fb-wrapper {
      padding: 24px 12px 32px;
      min-height: auto;
      align-items: flex-start;
    }
    .fb-card {
      padding: 16px 12px 12px;
    }
    .fb-card .options-row {
      gap: 4px;
    }
    .fb-card .tick-option {
      width: calc(50% - 4px);
      justify-content: flex-start;
      white-space: normal; /* allow wrapping on small screens */
    }
  }
`;

const RECOMMENDATION_MAP = {
  strong_hire: "STRONG_HIRE",
  hire: "HIRE",
  not_sure: "NOT_SURE",
  no_hire: "DO_NOT_HIRE",
};

const SKILLS_MAP = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

const COMM_MAP = {
  needs_work: "NEEDS_WORK",
  okay: "OKAY",
  strong: "STRONG",
};

const JD_MAP = {
  perfect_fit: "PERFECT",
  good_fit: "GOOD",
  uncertain: "UNCERTAIN",
};

export default function InterviewerFeedback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const interviewSession = useSelector((s) => s.interviewSession);
  const feedbackState = useSelector((s) => s.interviewFeedback);

  const { submitting, error, lastFeedback } = feedbackState;

  const sessionId = state?.sessionId || interviewSession.sessionId || "—";
  const candidateName =
    state?.candidateName || interviewSession.candidateName || "Candidate";
  const interviewerName =
    state?.interviewerName || interviewSession.interviewerName || "Interviewer";
  const jobTitle =
    state?.jobTitle || interviewSession.jobTitle || "Interview Feedback";

  const interviewId =
    state?.interviewId ||
    interviewSession.interviewId ||
    interviewSession.summary?.interview_id ||
    null;

  const duration =
    state?.duration ||
    interviewSession.duration ||
    interviewSession.summary?.duration ||
    "—";

  const [recommendation, setRecommendation] = useState("");
  const [skillsMatch, setSkillsMatch] = useState("");
  const [communication, setCommunication] = useState("");
  const [jdAlignment, setJdAlignment] = useState("");
  const [flags, setFlags] = useState([]);
  const [comments, setComments] = useState("");

  const toggleFlag = (val) => {
    setFlags((prev) =>
      prev.includes(val) ? prev.filter((f) => f !== val) : [...prev, val]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!interviewId) {
      alert("Missing interview id. Please go back to the report and try again.");
      return;
    }

    if (!recommendation || !skillsMatch || !communication || !jdAlignment) {
      alert("Please fill all rating fields before submitting.");
      return;
    }

    const flagsObject = flags.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    const payload = {
      overall_recommendation: RECOMMENDATION_MAP[recommendation],
      skills_level: SKILLS_MAP[skillsMatch],
      communication_level: COMM_MAP[communication],
      jd_fit_level: JD_MAP[jdAlignment],
      flags: flagsObject,
      comment: comments || "",
    };

    dispatch(
      submitFeedbackRequest({
        interviewId,
        payload,
      })
    );
    dispatch(
      updateInterviewStatusRequest({
        interviewId,
        status: "INTERVIEW_DONE",
      })
    );
  };

useEffect(() => {
  if (!submitting && lastFeedback) {
    // 🔄 refresh the sidebar list so status badge changes
    dispatch(fetchInterviewerInterviewsRequest({ status: "" }));

    // 🧭 go back to dashboard and drop feedback page from history
    navigate("/dashboard", { replace: true });
  }
}, [submitting, lastFeedback, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      console.error("Feedback error:", error);
      alert(error);
    }
  }, [error]);

  return (
    <div className="fb-wrapper">
      <style>{styles}</style>

      <form className="fb-card" onSubmit={handleSubmit}>
        <div className="header">
          <h1 className="title">Interviewer's Feedback</h1>
        </div>

        <div className="fb-grid">
          {/* Overall recommendation */}
          <div className="section">
            <div className="section-title">Overall recommendation</div>
            <p className="section-hint">
              Choose one that best reflects your decision.
            </p>
            <div className="options-row">
              <label className="tick-option">
                <input
                  type="radio"
                  name="recommendation"
                  value="strong_hire"
                  checked={recommendation === "strong_hire"}
                  onChange={(e) => setRecommendation(e.target.value)}
                />
                <span>Strong hire</span>
              </label>
              <label className="tick-option">
                <input
                  type="radio"
                  name="recommendation"
                  value="hire"
                  checked={recommendation === "hire"}
                  onChange={(e) => setRecommendation(e.target.value)}
                />
                <span>Hire</span>
              </label>
              <label className="tick-option">
                <input
                  type="radio"
                  name="recommendation"
                  value="not_sure"
                  checked={recommendation === "not_sure"}
                  onChange={(e) => setRecommendation(e.target.value)}
                />
                <span>Need another round / Assignment</span>
              </label>
              <label className="tick-option">
                <input
                  type="radio"
                  name="recommendation"
                  value="no_hire"
                  checked={recommendation === "no_hire"}
                  onChange={(e) => setRecommendation(e.target.value)}
                />
                <span>Do not hire</span>
              </label>
            </div>
          </div>

          {/* Skills match */}
          <div className="section">
            <div className="section-title">Skills match to JD</div>
            <p className="section-hint">
              How well do their skills match the role requirements?
            </p>
            <div className="options-row">
              <label className="tick-option">
                <input
                  type="radio"
                  name="skills_match"
                  value="low"
                  checked={skillsMatch === "low"}
                  onChange={(e) => setSkillsMatch(e.target.value)}
                />
                <span>Low</span>
              </label>
              <label className="tick-option">
                <input
                  type="radio"
                  name="skills_match"
                  value="medium"
                  checked={skillsMatch === "medium"}
                  onChange={(e) => setSkillsMatch(e.target.value)}
                />
                <span>Medium</span>
              </label>
              <label className="tick-option">
                <input
                  type="radio"
                  name="skills_match"
                  value="high"
                  checked={skillsMatch === "high"}
                  onChange={(e) => setSkillsMatch(e.target.value)}
                />
                <span>High</span>
              </label>
            </div>
          </div>

          {/* Communication */}
          <div className="section">
            <div className="section-title">
              Communication & experience in interview
            </div>
            <p className="section-hint">
              How clearly did they explain their work and examples?
            </p>
            <div className="options-row">
              <label className="tick-option">
                <input
                  type="radio"
                  name="communication"
                  value="needs_work"
                  checked={communication === "needs_work"}
                  onChange={(e) => setCommunication(e.target.value)}
                />
                <span>Needs work</span>
              </label>
              <label className="tick-option">
                <input
                  type="radio"
                  name="communication"
                  value="okay"
                  checked={communication === "okay"}
                  onChange={(e) => setCommunication(e.target.value)}
                />
                <span>Okay</span>
              </label>
              <label className="tick-option">
                <input
                  type="radio"
                  name="communication"
                  value="strong"
                  checked={communication === "strong"}
                  onChange={(e) => setCommunication(e.target.value)}
                />
                <span>Strong</span>
              </label>
            </div>
          </div>

          {/* JD alignment */}
          <div className="section">
            <div className="section-title">JD alignment & role fit</div>
            <p className="section-hint">
              How well do they fit this specific role and team?
            </p>
            <div className="options-row">
              <label className="tick-option">
                <input
                  type="radio"
                  name="jd_alignment"
                  value="perfect_fit"
                  checked={jdAlignment === "perfect_fit"}
                  onChange={(e) => setJdAlignment(e.target.value)}
                />
                <span>Perfect fit</span>
              </label>
              <label className="tick-option">
                <input
                  type="radio"
                  name="jd_alignment"
                  value="good_fit"
                  checked={jdAlignment === "good_fit"}
                  onChange={(e) => setJdAlignment(e.target.value)}
                />
                <span>Good fit</span>
              </label>
              <label className="tick-option">
                <input
                  type="radio"
                  name="jd_alignment"
                  value="uncertain"
                  checked={jdAlignment === "uncertain"}
                  onChange={(e) => setJdAlignment(e.target.value)}
                />
                <span>Uncertain / not enough data</span>
              </label>
            </div>
          </div>

          {/* Comments */}
          <div className="section section-full">
            <div className="section-title">Final comments (optional)</div>
            <textarea
              name="comments"
              placeholder="Type a brief, neutral comment here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <div className="footer">
          {/* <span className="hint-small">Takes ~30 seconds to complete.</span> */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}
