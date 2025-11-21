// src/authHandle/InterviewRoomGuard.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function InterviewRoomGuard({ children }) {
  const { status, interviewId } = useSelector(
    (s) => s.interviewSession || {}
  );
  const location = useLocation();
  const state = location.state || {};
  const hasContext = !!(state.interviewId || interviewId);

  // Finished interview → never allow room again
  if (status === "ended") {
    return <Navigate to="/interview/report" replace />;
  }

  // Direct URL without context → block
  if (!hasContext) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
