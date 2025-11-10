import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  company: null,
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    createCompanyRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCompanySuccess: (state, action) => {
      state.loading = false;
      state.company = action.payload;
    },
    createCompanyFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
      fetchCompanyRequest: (s) => { s.loading = true; s.error = null; },
    fetchCompanySuccess: (s, { payload }) => { s.loading = false; s.company = payload; },
    fetchCompanyFailure: (s, { payload }) => { s.loading = false; s.error = payload; },

    resetCompanyState: (state) => {
      state.company = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  createCompanyRequest,
  createCompanySuccess,
  createCompanyFailure,
    fetchCompanyRequest,     // <- export
  fetchCompanySuccess,     // <- export
  fetchCompanyFailure,     // <- export
  resetCompanyState,
} = companySlice.actions;

export default companySlice.reducer;