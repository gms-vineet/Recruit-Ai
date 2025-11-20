// src/pages/InterviewerFeedback.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submitFeedbackRequest } from "@/store/slices/interviewFeedbackSlice";
import { updateInterviewStatusRequest } from "../store/slices/interviewDetailSlice";

const styles = `
  /* --- Layout wrapper --- */
  .fb-wrapper {
    width: 100%;
    max-width: 840px;
    padding: 24px 16px 32px;
    margin: 0 auto;
    min-height: calc(100vh - 4rem);
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  /* --- Card / panel --- */
  .fb-card {
    width: 100%;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.45);
    background:
      radial-gradient(140% 200% at 0% 0%,
        rgba(56, 189, 248, 0.14),
        transparent 55%)
      ,
      radial-gradient(140% 220% at 100% 0%,
        rgba(129, 140, 248, 0.16),
        transparent 60%)
      ,
      linear-gradient(135deg,
        rgba(15, 23, 42, 0.98),
        rgba(15, 23, 42, 0.96)
      );
    box-shadow: 0 26px 70px rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(18px);
    color: var(--color-text-base, #e5e7eb);
    padding: 20px 22px 18px;
  }

  .fb-card .header {
    margin-bottom: 18px;
  }

  .fb-card .title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 4px;
    letter-spacing: 0.01em;
  }

  .fb-card .subtitle {
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
  }

  .fb-card .meta-row {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 11px;
    color: #9ca3af;
  }

  .fb-card .meta-pill {
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    padding: 3px 9px;
    background: radial-gradient(circle at top,
      rgba(15, 23, 42, 0.4),
      rgba(15, 23, 42, 0.95)
    );
  }

  /* --- Grid layout for sections (2 columns on desktop) --- */
  .fb-card .fb-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 18px;
  }

  .fb-card .section {
    padding: 10px 0;
    border-top: 1px solid rgba(30, 41, 59, 0.9);
  }

  .fb-card .section:first-of-type {
    border-top: none;
  }

  .fb-card .section-full {
    grid-column: 1 / -1;
  }

  .fb-card .section-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .fb-card .section-hint {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 8px;
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
    gap: 6px;
  }

  .fb-card .tick-option {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 11px;
    border-radius: 999px;
    border: 1px solid rgba(51, 65, 85, 0.9);
    background: radial-gradient(circle at top,
      rgba(15, 23, 42, 0.8),
      rgba(15, 23, 42, 1)
    );
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    color: #e5e7eb;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      transform 0.1s ease;
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
    background: rgba(37, 99, 235, 0.18);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.35);
    transform: translateY(-0.5px);
  }

  .fb-card .scale-label {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
  }

  .fb-card .score-label {
    font-size: 11px;
    font-weight: 500;
    color: #e5e7eb;
    margin-top: 2px;
  }

  /* --- Textarea --- */
  .fb-card textarea {
    width: 100%;
    min-height: 90px;
    border-radius: 10px;
    border: 1px solid rgba(51, 65, 85, 1);
    padding: 8px 11px;
    font-size: 13px;
    resize: vertical;
    outline: none;
    background: rgba(15, 23, 42, 0.98);
    color: #e5e7eb;
  }

  .fb-card textarea::placeholder {
    color: #64748b;
  }

  .fb-card textarea:focus {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4);
    background: #020617;
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
    font-size: 11px;
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
    .fb-card {
      padding: 16px 14px 12px;
    }
    .fb-card .options-row {
      gap: 4px;
    }
    .fb-card .tick-option {
      width: calc(50% - 4px);
      justify-content: flex-start;
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

  const sessionId =
    state?.sessionId || interviewSession.sessionId || "—";
  const candidateName =
    state?.candidateName || interviewSession.candidateName || "Candidate";
  const interviewerName =
    state?.interviewerName || interviewSession.interviewerName || "Interviewer";
  const jobTitle =
    state?.jobTitle || interviewSession.jobTitle || "Interview Feedback";

  // 🔹 interviewId + duration coming from Report page or Redux
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

  // form state
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

  // scores (for UI info only)
  const skillsMatchScore =
    skillsMatch === "low"
      ? 2
      : skillsMatch === "medium"
      ? 5
      : skillsMatch === "high"
      ? 8
      : 0;

  const communicationScore =
    communication === "needs_work"
      ? 2
      : communication === "okay"
      ? 5
      : communication === "strong"
      ? 8
      : 0;

  const jdAlignmentScore =
    jdAlignment === "uncertain"
      ? 2
      : jdAlignment === "good_fit"
      ? 5
      : jdAlignment === "perfect_fit"
      ? 8
      : 0;

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

    // ---- build body exactly like Swagger example ----
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
        payload, // 👈 saga will send this as request body
      })
    );
      dispatch(
    updateInterviewStatusRequest({
      interviewId,
      status: "INTERVIEW_DONE",
    })
  );
  };
  // Navigate on success
  useEffect(() => {
    if (!submitting && lastFeedback) {
      navigate("/dashboard");
    }
  }, [submitting, lastFeedback, navigate]);

  // Show error (you can replace with toast)
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
          <h1 className="title">Interview Feedback</h1>
          <p className="subtitle">
            Quick check-boxes + one comment. This helps with fair, consistent analysis.
          </p>
          {/* <div className="meta-row">
            <span className="meta-pill">
              <strong>Candidate:</strong> {candidateName}
            </span>
            <span className="meta-pill">
              <strong>Interviewer:</strong> {interviewerName}
            </span>
            <span className="meta-pill">
              <strong>Session:</strong> {sessionId}
            </span>
            {interviewId && (
              <span className="meta-pill">
                <strong>Interview ID:</strong> {interviewId}
              </span>
            )}
            {duration && (
              <span className="meta-pill">
                <strong>Duration:</strong> {duration}
              </span>
            )}
          </div> */}
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
            <div className="scale-label">
              Score mapping: Low = 2, Medium = 5, High = 8
            </div>
            <div className="score-label">Marks: {skillsMatchScore}/10</div>
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
            <div className="scale-label">
              Score mapping: Needs work = 2, Okay = 5, Strong = 8
            </div>
            <div className="score-label">Marks: {communicationScore}/10</div>
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
            <div className="scale-label">
              Score mapping: Uncertain = 2, Good = 5, Perfect = 8
            </div>
            <div className="score-label">Marks: {jdAlignmentScore}/10</div>
          </div>

          {/* Flags */}
          {/* <div className="section section-full">
            <div className="section-title">Anything you noticed?</div>
            <p className="section-hint">
              Tick anything that applies (optional).
            </p>
            <div className="options-row">
              <label className="tick-option">
                <input
                  type="checkbox"
                  name="flags"
                  value="strong_technical"
                  checked={flags.includes("strong_technical")}
                  onChange={() => toggleFlag("strong_technical")}
                />
                <span>Strong technical depth</span>
              </label>
              <label className="tick-option">
                <input
                  type="checkbox"
                  name="flags"
                  value="great_collaboration"
                  checked={flags.includes("great_collaboration")}
                  onChange={() => toggleFlag("great_collaboration")}
                />
                <span>Great collaboration mindset</span>
              </label>
              <label className="tick-option">
                <input
                  type="checkbox"
                  name="flags"
                  value="needs_clarity"
                  checked={flags.includes("needs_clarity")}
                  onChange={() => toggleFlag("needs_clarity")}
                />
                <span>Needs more clarity in answers</span>
              </label>
              <label className="tick-option">
                <input
                  type="checkbox"
                  name="flags"
                  value="limited_data"
                  checked={flags.includes("limited_data")}
                  onChange={() => toggleFlag("limited_data")}
                />
                <span>Limited data (short interview / few answers)</span>
              </label>
            </div>
          </div> */}

          {/* Comments */}
          <div className="section section-full">
            <div className="section-title">Final comments (optional)</div>
            <p className="section-hint">
              Any short notes that will help reviewers or future rounds
              (e.g. key strengths, concerns, or suggestions).
            </p>
            <textarea
              name="comments"
              placeholder="Type a brief, neutral comment here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <div className="footer">
          <span className="hint-small">Takes ~30 seconds to complete.</span>
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
