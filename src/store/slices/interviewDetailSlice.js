// src/store/slices/interviewDetailSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  interview: null,
  job: null,
  resume: null,
  candidate: null,
  aiSummary: null, // alias for ai_summary from API
  loading: false,
  error: null,

   updatingStatus: false,
  updateStatusError: null,
};

const interviewDetailSlice = createSlice({
  name: "interviewDetail",
  initialState,
  reducers: {
    // payload: interview_id
    fetchInterviewDetailRequest(state) {
      state.loading = true;
      state.error = null;
    },

    // payload: { interview, job, resume, candidate, ai_summary }
    fetchInterviewDetailSuccess(state, action) {
      state.loading = false;
      const payload = action.payload || {};

      state.interview = payload.interview || null;
      state.job = payload.job || null;
      state.resume = payload.resume || null;
      state.candidate = payload.candidate || null;
      state.aiSummary = payload.ai_summary || payload.aiSummary || null;
    },

    fetchInterviewDetailFailure(state, action) {
      state.loading = false;
      state.error =
        action.payload || "Failed to load interview details";
    },
    // NEW: POST /interviewer/interviews/{id}/status
    // payload: { interviewId, status }
updateInterviewStatusRequest(state) {
  state.updatingStatus = true;
  state.updateStatusError = null;
},
updateInterviewStatusSuccess(state, action) {
  state.updatingStatus = false;
  const newStatus = action.payload?.status;
  if (state.interview && newStatus) {
    state.interview = { ...state.interview, status: newStatus };
  }
},
updateInterviewStatusFailure(state, action) {
  state.updatingStatus = false;
  state.updateStatusError =
    action.payload || "Failed to update interview status";
},

    resetInterviewDetail() {
      return initialState;
    },
  },
});

export const {
  fetchInterviewDetailRequest,
  fetchInterviewDetailSuccess,
  fetchInterviewDetailFailure,
    updateInterviewStatusRequest,
  updateInterviewStatusSuccess,
  updateInterviewStatusFailure,
  resetInterviewDetail,
} = interviewDetailSlice.actions;

export default interviewDetailSlice.reducer;
