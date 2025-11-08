import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uploadResumeLoading: false,
  uploadResumeData: null,
  uploadResumeError: null,

  parseResumeLoading: false,
  parseResumeData: null,
  parseResumeError: null,

  getParsedResListLoading: false,
  getParsedResListData: null,
  getParsedResListError: null,

  getRankedResLoading: false,
  getRankedResData: null,
  getRankedResError: null,

  re_rankResLoading: false,
  re_rankResData: null,
  re_rankResError: null,

};

const uploadResumeSlice = createSlice({
  name: "uploadResume",
  initialState,
  reducers: {
    // 👉 payload = File[]
    uploadResumeRequest: (state) => {
      state.uploadResumeLoading = true;
      state.uploadResumeError = null;
    },
    uploadResumeSuccess: (state, action) => {
      state.uploadResumeLoading = false;
      state.uploadResumeData = action.payload;
      state.uploadResumeError = null;
    },
    uploadResumeFailure: (state, action) => {
      state.uploadResumeLoading = false;
      state.uploadResumeError = action.payload || "Upload failed";
    },

    // parse Resume Here

    parseResumeRequest: (state, action) => {
      state.parseResumeLoading = true;
      state.parseResumeError = null;
    },
    parseResumeSuccess: (state, action) => {
      state.parseResumeLoading = false;
      state.parseResumeData = action.payload;
      state.parseResumeError = null;
    },
    parseResumeFailure: (state, action) => {
      state.parseResumeLoading = false;
      state.parseResumeError = action.payload;
    },

    // get parsed Resume List

    getParseResListRequest: (state, action) => {
      state.getParsedResListLoading = true;
    },
    getParseResListSuccess: (state, action) => {
      state.getParsedResListLoading = false;
      state.getRankedResData = null;
      state.getParsedResListData = action.payload;
    },
    getParseResListFailure: (state, action) => {
      state.getParsedResListLoading = false;
      state.getParsedResListError = action.payload;
    },

    // get Ranked Resume List 

    getRankedResRequest: (state,action) =>{
      state.getRankedResLoading = true;
    },
    getRankedResSuccess: (state,action) =>{
      state.getRankedResLoading = false;
      state.getRankedResData = action.payload;
      state.getParsedResListData = null;

    },
    getRankedResFailure: (state,action) =>{
      state.getRankedResLoading = false;
      state.getRankedResError = action.payload;
    },

    // RE-Rank Resume Here

    reRankResRequest:(state,action) =>{
      state.re_rankResLoading = true;
    },
    reRankResSuccess:(state,action) =>{
      state.re_rankResLoading = false;
      state.re_rankResData = action.payload;
      state.getParsedResListData = null;
      state.getRankedResData = null;
    },
    reRankResFailure:(state,action) =>{
      state.re_rankResLoading = false;
      state.re_rankResError = action.payload;
    },


    resetUploadResumeState: () => initialState,
  },
});

export const {
  uploadResumeRequest,
  uploadResumeSuccess,
  uploadResumeFailure,

  parseResumeRequest,
  parseResumeFailure,
  parseResumeSuccess,

  getParseResListFailure,
  getParseResListRequest,
  getParseResListSuccess,


  getRankedResFailure, 
  getRankedResRequest,
  getRankedResSuccess,

  reRankResFailure,
  reRankResRequest,
  reRankResSuccess,

  resetUploadResumeState,
} = uploadResumeSlice.actions;

export default uploadResumeSlice.reducer;
