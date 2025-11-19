// src/store/slices/todayInterviewsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  date: null,
  count: 0,
  interviewer: null,
  interviews: [],
  loading: false,
  error: null,
};

const todayInterviewsSlice = createSlice({
  name: "todayInterviews",
  initialState,
  reducers: {
    fetchTodayInterviewsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTodayInterviewsSuccess(state, action) {
      const payload = action.payload || {};
      state.loading = false;
      state.date = payload.date || null;
      state.count = payload.count || 0;
      state.interviewer = payload.interviewer || null;
      state.interviews = payload.interviews || [];
    },
    fetchTodayInterviewsFailure(state, action) {
      state.loading = false;
      state.error = action.payload || "Failed to load today's interviews";
    },
    resetTodayInterviews() {
      return initialState;
    },
  },
});

export const {
  fetchTodayInterviewsRequest,
  fetchTodayInterviewsSuccess,
  fetchTodayInterviewsFailure,
  resetTodayInterviews,
} = todayInterviewsSlice.actions;

export default todayInterviewsSlice.reducer;
