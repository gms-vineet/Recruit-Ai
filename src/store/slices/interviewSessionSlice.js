// src/store/slices/interviewSessionSlice.js
import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "interviewSession";

const baseDefaults = {
  sessionId: null,
  interviewerName: null,
  candidateName: null,
  jd: "",
  resume: "",
  meetUrl: "",
  status: "idle", // "idle" | "active" | "ended" | "error"
  error: null,

  // UI / report state to persist
  // { question, expectedAnswer, verdict, score, explanation, candidateAnswer }
  validation: null,
  aiSuggestions: [], // string[]
  summary: null, // summary object from /ai/summary
};

const loadInitial = () => {
  if (typeof window === "undefined") return baseDefaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return baseDefaults;
    const stored = JSON.parse(raw);
    // merge so new fields always exist
    return { ...baseDefaults, ...stored };
  } catch {
    return baseDefaults;
  }
};

const initialState = loadInitial();

const interviewSessionSlice = createSlice({
  name: "interviewSession",
  initialState,
  reducers: {
    /** Called in Preflight before navigation */
    prepareInterview(state, action) {
      const { interviewerName, candidateName, jd, resume, meetUrl } =
        action.payload || {};
      state.interviewerName = interviewerName || "Interviewer";
      state.candidateName = candidateName || "Candidate";
      state.jd = jd || "";
      state.resume = resume || "";
      state.meetUrl = meetUrl || "";
      state.error = null;

      // Starting a fresh interview → clear old per-interview state
      state.validation = null;
      state.aiSuggestions = [];
      state.summary = null;
      state.status = "idle";
      // NOTE: we do NOT touch sessionId here; it will be created in InterviewRoom
    },

    /** Set / lock the meeting_id for the active interview. */
    setInterviewSessionId(state, action) {
      state.sessionId = action.payload;
      if (action.payload) state.status = "active";
    },

    setInterviewStatus(state, action) {
      state.status = action.payload || "idle";
    },

    setInterviewError(state, action) {
      state.error = action.payload || null;
    },

    /** Called when user presses Exit */
    endInterviewSession(state) {
      // We KEEP sessionId + summary so the Report page can read them.
      state.status = "ended";
      // Don't clear validation/aiSuggestions either – they might be useful later.
    },

    /** Full reset – rarely used, but handy */
    resetInterviewSession() {
      return { ...baseDefaults };
    },

    // 🔹 Persist Validation / Suggestions / Summary
    setValidationData(state, action) {
      state.validation = action.payload || null;
    },

    setAISuggestions(state, action) {
      state.aiSuggestions = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    setSummary(state, action) {
      state.summary = action.payload || null;
    },
  },
});

export const {
  prepareInterview,
  setInterviewSessionId,
  setInterviewStatus,
  setInterviewError,
  endInterviewSession,
  resetInterviewSession,
  setValidationData,
  setAISuggestions,
  setSummary,
} = interviewSessionSlice.actions;

export default interviewSessionSlice.reducer;

// helper used in store.subscribe()
export const saveInterviewSessionToStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    const slice = state.interviewSession;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
  } catch {
    // ignore storage errors
  }
};
