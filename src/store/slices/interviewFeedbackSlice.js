// src/store/slices/interviewFeedbackSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  submitting: false,
  error: null,
  lastFeedback: null,
};

const interviewFeedbackSlice = createSlice({
  name: "interviewFeedback",
  initialState,
  reducers: {
    submitFeedbackRequest(state, action) {
      state.submitting = true;
      state.error = null;
    },
    submitFeedbackSuccess(state, action) {
      state.submitting = false;
      state.lastFeedback = action.payload || null;
    },
    submitFeedbackFailure(state, action) {
      state.submitting = false;
      state.error = action.payload || "Something went wrong";
    },
    resetFeedbackState() {
      return initialState;
    },
  },
});

export const {
  submitFeedbackRequest,
  submitFeedbackSuccess,
  submitFeedbackFailure,
  resetFeedbackState,
} = interviewFeedbackSlice.actions;

export default interviewFeedbackSlice.reducer;
