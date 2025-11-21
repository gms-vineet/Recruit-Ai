// src/store/slices/interviewSessionSlice.js
import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "interviewSession";

const baseDefaults = {
  // IDs / meta
  interviewId: null,
  sessionId: null,
  meetingId: null,

  interviewerName: null,
  candidateName: null,
  jd: "",
  resume: "",
  meetUrl: "",
  status: "idle", // "idle" | "active" | "ended" | "error"
  error: null,

  // transcript history (GET /session/{id}/turns)
  turns: [],

  // validation & AI helper state
  // { question, expectedAnswer, verdict, score, explanation, candidateAnswer }
  validation: null,
  aiSuggestions: [], // string[]

  // summary from /ai/summary
  summary: null,
  loadingSummary: false,
  summaryStatus: "idle",   // "idle" | "loading" | "succeeded" | "failed"
  summaryError: null,

  // loading flags for saga-driven APIs
  loadingBootstrap: false,
  loadingTurns: false,
  loadingQuestions: false,
  loadingExpected: false,
  loadingValidate: false,
};

const loadInitial = () => {
  if (typeof window === "undefined") return baseDefaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return baseDefaults;
    const stored = JSON.parse(raw);
    // stored values override, but new keys from baseDefaults stay
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
    // called from Preflight before navigation
    prepareInterview(state, action) {
      const {
        interviewerName,
        candidateName,
        jd,
        resume,
        meetUrl,
        interviewId,
      } = action.payload || {};

      state.interviewerName = interviewerName || "Interviewer";
      state.candidateName = candidateName || "Candidate";
      state.jd = jd || "";
      state.resume = resume || "";
      state.meetUrl = meetUrl || "";
      state.interviewId = interviewId || state.interviewId || null;
      state.error = null;

      // fresh interview – clear per-interview state
      state.validation = null;
      state.aiSuggestions = [];
      state.summary = null;
      state.loadingSummary = false;
      state.summaryStatus = "idle";
      state.summaryError = null;

      state.turns = [];
      state.status = "idle";
      // sessionId & meetingId will be created in InterviewRoom/bootstrap
    },

    setInterviewSessionId(state, action) {
      state.sessionId = action.payload || null;
      if (action.payload) state.status = "active";
    },

    setInterviewStatus(state, action) {
      state.status = action.payload || "idle";
    },

    setInterviewError(state, action) {
      state.error = action.payload || null;
      if (state.error) state.status = "error";
    },

    endInterviewSession(state) {
      state.status = "ended";
         state.sessionId = null;
    },

    resetInterviewSession() {
      // full reset (also resets summary + flags)
      return { ...baseDefaults };
    },

    // hydrate meta coming back from /meet/session/bootstrap
    hydrateBootstrapMeta(state, action) {
      const {
        interviewId,
        sessionId,
        meetingId,
        interviewerName,
        candidateName,
        jd,
        resume,
        meetUrl,
      } = action.payload || {};

      if (interviewId) state.interviewId = interviewId;
      if (sessionId) state.sessionId = sessionId;
      if (meetingId) state.meetingId = meetingId;
      if (interviewerName) state.interviewerName = interviewerName;
      if (candidateName) state.candidateName = candidateName;
      if (typeof jd === "string") state.jd = jd;
      if (typeof resume === "string") state.resume = resume;
      if (typeof meetUrl === "string") state.meetUrl = meetUrl;
    },

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

    setTurns(state, action) {
      state.turns = Array.isArray(action.payload) ? action.payload : [];
    },

    // ---------------- SAGA TRIGGERS ----------------

    // 1) /meet/session/bootstrap
    bootstrapSessionRequest(state) {
      state.loadingBootstrap = true;
      state.error = null;
    },
    bootstrapSessionSuccess(state, action) {
      state.loadingBootstrap = false;
      const {
        interview_id,
        session_id,
        meeting_id,
        interviewer_name,
        candidate_name,
        jd,
        resume,
        meet_url,
      } = action.payload || {};

      state.interviewId = interview_id ?? state.interviewId;
      state.sessionId = session_id ?? state.sessionId;
      state.meetingId = meeting_id ?? state.meetingId;
      state.interviewerName =
        interviewer_name || state.interviewerName || "Interviewer";
      state.candidateName =
        candidate_name || state.candidateName || "Candidate";
      if (typeof jd === "string") state.jd = jd;
      if (typeof resume === "string") state.resume = resume;
      if (typeof meet_url === "string") state.meetUrl = meet_url;
      state.status = "active";
    },
    bootstrapSessionFailure(state, action) {
      state.loadingBootstrap = false;
      state.error = action.payload || "Unable to bootstrap MeetAI session";
      state.status = "error";
    },

    // 2) GET /session/{id}/turns
    fetchTurnsRequest(state) {
      state.loadingTurns = true;
    },
    fetchTurnsSuccess(state, action) {
      state.loadingTurns = false;
      state.turns = Array.isArray(action.payload) ? action.payload : [];
    },
    fetchTurnsFailure(state, action) {
      state.loadingTurns = false;
      state.error = action.payload || "Unable to load transcript";
    },

    // 3) POST /ai/questions
    fetchQuestionsRequest(state) {
      state.loadingQuestions = true;
    },
    fetchQuestionsSuccess(state, action) {
      state.loadingQuestions = false;
      state.aiSuggestions = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
    fetchQuestionsFailure(state, action) {
      state.loadingQuestions = false;
      state.error = action.payload || "Unable to load AI questions";
    },

    // 4) POST /ai/expected
    fetchExpectedRequest(state) {
      state.loadingExpected = true;
    },
    fetchExpectedSuccess(state, action) {
      state.loadingExpected = false;
      const { question, expectedAnswer } = action.payload || {};
      state.validation = {
        ...(state.validation || {}),
        question: question ?? state.validation?.question ?? "",
        expectedAnswer: expectedAnswer ?? "",
      };
    },
    fetchExpectedFailure(state, action) {
      state.loadingExpected = false;
      state.error = action.payload || "Unable to fetch expected answer";
    },

    // 5) POST /ai/validate
    fetchValidateRequest(state) {
      state.loadingValidate = true;
    },
    fetchValidateSuccess(state, action) {
      state.loadingValidate = false;
      const { verdict, score, explanation, candidateAnswer } =
        action.payload || {};
      state.validation = {
        ...(state.validation || {}),
        verdict: verdict ?? null,
        score: typeof score === "number" ? score : null,
        explanation: explanation ?? "",
        candidateAnswer: candidateAnswer ?? "",
      };
    },
    fetchValidateFailure(state, action) {
      state.loadingValidate = false;
      state.error = action.payload || "Unable to validate answer";
    },

    // 6) POST /ai/summary
    fetchSummaryRequest(state) {
      state.loadingSummary = true;
      state.summaryStatus = "loading";
      state.summaryError = null;
      state.summary = null; // 🔥 clear old data so UI shows skeleton
    },
    fetchSummarySuccess(state, action) {
      state.loadingSummary = false;
      state.summaryStatus = "succeeded";
      state.summary = action.payload || null;
    },
    fetchSummaryFailure(state, action) {
      state.loadingSummary = false;
      state.summaryStatus = "failed";
      state.summaryError = action.payload || "Unable to generate summary";
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
  setTurns,
  hydrateBootstrapMeta,

  bootstrapSessionRequest,
  bootstrapSessionSuccess,
  bootstrapSessionFailure,

  fetchTurnsRequest,
  fetchTurnsSuccess,
  fetchTurnsFailure,

  fetchQuestionsRequest,
  fetchQuestionsSuccess,
  fetchQuestionsFailure,

  fetchExpectedRequest,
  fetchExpectedSuccess,
  fetchExpectedFailure,

  fetchValidateRequest,
  fetchValidateSuccess,
  fetchValidateFailure,

  fetchSummaryRequest,
  fetchSummarySuccess,
  fetchSummaryFailure,
} = interviewSessionSlice.actions;

export default interviewSessionSlice.reducer;

// persist slice to localStorage
export const saveInterviewSessionToStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    const slice = state.interviewSession;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
  } catch {
    // ignore
  }
};
