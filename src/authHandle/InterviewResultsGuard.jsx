import { useSelector } from "react-redux";
import {Navigate, useLocation } from "react-router-dom";

export default function InterviewResultsGuard({
  children,
  requireSummary = false,
  requireInterviewId = false,
}) {
  const location = useLocation();
  const interviewSession = useSelector((s) => s.interviewSession || {});
  const feedbackState = useSelector((s) => s.interviewFeedback || {});


  const routeState = location.state || {};

  const sessionIdFromState = routeState.sessionId;
  const interviewIdFromState = routeState.interviewId;

  const summary =
    interviewSession.summary || routeState.summary || null;

  const sessionId =
    sessionIdFromState ||
    interviewSession.sessionId ||
    interviewSession.summary?.session_id ||
    null;

  const interviewId =
    interviewIdFromState ||
    interviewSession.interviewId ||
    interviewSession.summary?.interview_id ||
    sessionId ||
    null;

  // ✅ NEW: summary may still be loading
  const isSummaryLoading =
    interviewSession.summaryStatus === "loading" ||
    interviewSession.loadingSummary === true;

  const hasStateSession = Boolean(sessionIdFromState);

  let allowed = Boolean(sessionId) && hasStateSession;

  if (allowed && requireSummary) {
    // ✅ allow if we EITHER already have summary OR it is loading
    allowed = Boolean(summary) || isSummaryLoading;
  }

  if (allowed && requireInterviewId) {
    allowed = Boolean(interviewId);
  }

  const lastFeedbackInterviewId = feedbackState.lastFeedback?.interview_id;
  if (
    allowed &&
    requireInterviewId &&
    lastFeedbackInterviewId &&
    lastFeedbackInterviewId === interviewId
  ) {
    allowed = false;
  }

  if (!allowed) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ from: location.pathname, reason: "no_interview_context" }}
      />
    );
  }

  return children;
}
