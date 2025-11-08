import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  data: null,
  loading: false,
  quesLoading: false,
  questions: null,
  error: null,
  quesError: null,
};

const uploadJDSlice = createSlice({
  name: "uploadJd",
  initialState: initialState,
  reducers: {
    uploadJdRequest: (state, action) => {
      state.loading = true;
    },
    uploadJdSuccsess: (state, action) => {
      (state.loading = false), (state.data = action.payload);
    },
    uploadJdFailure: (state, action) => {
      (state.loading = false), (state.error = action.payload);
    },

    ansJdQuesRequest: (state, action) => {
      state.quesLoading = true;
    },
    ansJdQuesSuccsess: (state, action) => {
      (state.quesLoading = false), (state.questions = action.payload);
    },
    ansJdQuesFailure: (state, action) => {
      (state.quesLoading = false), (state.quesLoading = action.payload);
    },

    resetUploadJD: (state) => {
  state.loading = false;
  state.data = null;
  state.quesLoading = false;
  state.questions = [];
},


  },
});

export const {
  uploadJdRequest,
  uploadJdSuccsess,
  uploadJdFailure,
  ansJdQuesRequest,
  ansJdQuesFailure,
  ansJdQuesSuccsess,
  resetUploadJD
} = uploadJDSlice.actions;

export default uploadJDSlice.reducer;
