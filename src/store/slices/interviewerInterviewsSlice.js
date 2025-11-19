// src/store/slices/interviewerInterviewsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  interviews: [],   // array from /interviewer/interviews
  loading: false,
  error: null,
};

const interviewerInterviewsSlice = createSlice({
  name: "interviewerInterviews",
  initialState,
  reducers: {
    // payload (optional): { status: "INTERVIEW_SCHEDULED" }
    fetchInterviewerInterviewsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    // payload can be either an array or { interviews: [...] }
    fetchInterviewerInterviewsSuccess(state, action) {
      state.loading = false;
      const payload = action.payload;

      if (Array.isArray(payload)) {
        state.interviews = payload;
      } else if (payload && Array.isArray(payload.interviews)) {
        state.interviews = payload.interviews;
      } else {
        state.interviews = [];
      }
    },
    fetchInterviewerInterviewsFailure(state, action) {
      state.loading = false;
      state.error =
        action.payload || "Failed to load interviewer interviews";
    },
    resetInterviewerInterviews() {
      return initialState;
    },
  },
});

export const {
  fetchInterviewerInterviewsRequest,
  fetchInterviewerInterviewsSuccess,
  fetchInterviewerInterviewsFailure,
  resetInterviewerInterviews,
} = interviewerInterviewsSlice.actions;

export default interviewerInterviewsSlice.reducer;
