import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  jobListData: null,
  jobListError: null,
};

const jobListSlice = createSlice({
  name: "jobList",
  initialState,
  reducers: {
    getJobListRequest: (state) => {
      state.loading = true;
      state.jobListError = null;
    },
    getJobListSuccess: (state, action) => {
      state.loading = false;
      state.jobListData = action.payload;
      state.jobListError = null;
    },
    getJobListFailure: (state, action) => {
      state.loading = false;
      state.jobListError = action.payload;
    },
  },
});

export const {
  getJobListRequest,
  getJobListSuccess,
  getJobListFailure,
} = jobListSlice.actions;

export default jobListSlice.reducer;
