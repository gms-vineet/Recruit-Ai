// src/store/slices/createJobSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  job: null,
  loading: false,
  error: null,
  isJobCreated: false,

  // extra flags for new actions
  saving: false,
  saveError: null,

  updating: false,
  updateError: null,

  regenerating: false,
  regenerateError: null,
};

const createJobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    // CREATE
    createJobRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createJobSuccess: (state, action) => {
      state.loading = false;
      state.job = action.payload;
      state.isJobCreated = true;
    },
    createJobFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isJobCreated = false;
    },

    // SAVE (persist full JD content)
    saveJDRequest: (state) => {
      state.saving = true;
      state.saveError = null;
    },
    saveJDSuccess: (state, action) => {
      state.saving = false;
      if (action.payload) state.job = action.payload;
    },
    saveJDFailure: (state, action) => {
      state.saving = false;
      state.saveError = action.payload;
    },

    // UPDATE/PATCH (edit parts)
    updateJDRequest: (state) => {
      state.updating = true;
      state.updateError = null;
    },
    updateJDSuccess: (state, action) => {
      state.updating = false;
      state.job = { ...(state.job || {}), ...(action.payload || {}) };
    },
    updateJDFailure: (state, action) => {
      state.updating = false;
      state.updateError = action.payload;
    },

    // REGENERATE (AI)
    regenerateJDRequest: (state) => {
      state.regenerating = true;
      state.regenerateError = null;
    },
    regenerateJDSuccess: (state, action) => {
      state.regenerating = false;
      state.job = { ...(state.job || {}), ...(action.payload || {}) };
    },
    regenerateJDFailure: (state, action) => {
      state.regenerating = false;
      state.regenerateError = action.payload;
    },

    // RESET
    resetJobState: (state) => {
      state.job = null;
      state.loading = false;
      state.error = null;
      state.isJobCreated = false;

      state.saving = false;
      state.saveError = null;

      state.updating = false;
      state.updateError = null;

      state.regenerating = false;
      state.regenerateError = null;
    },
  },
});

export const {
  createJobRequest,
  createJobSuccess,
  createJobFailure,

  saveJDRequest,
  saveJDSuccess,
  saveJDFailure,

  updateJDRequest,
  updateJDSuccess,
  updateJDFailure,

  regenerateJDRequest,
  regenerateJDSuccess,
  regenerateJDFailure,

  resetJobState,
} = createJobSlice.actions;

export default createJobSlice.reducer;
