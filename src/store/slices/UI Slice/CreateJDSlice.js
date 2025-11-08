import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isModalOpen: false,
  // reference createNewJD as New Job
  createNewJD: false,
  uploadJD: false,

  // ✅ make first-visit buttons show by default (or use the relaxed condition in Job_Description)
  createNewJob: true,
  showTypeWriter: false,
};

const jobDescriptionSlice = createSlice({
  name: "jobDescriptionSlice",
  initialState,
  reducers: {
    setModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    setCreateNewJD: (state, action) => {
      state.createNewJD = action.payload;
    },
    setUploadJD: (state, action) => {
      state.uploadJD = action.payload;
    },
    setCreateNewJob: (state, action) => {
      state.createNewJob = action.payload;
    },
    setShowTypeWriter: (state, action) => {
      state.showTypeWriter = action.payload;
    },
  },
});

export const { setModalOpen, setCreateNewJD, setUploadJD, setCreateNewJob, setShowTypeWriter } =
  jobDescriptionSlice.actions;
export default jobDescriptionSlice.reducer;
