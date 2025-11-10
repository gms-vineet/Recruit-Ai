import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: false,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
 
  me: null,
  meLoading: false,
  meError: null,
  meVerified: false,
};

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     loginRequest: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     loginSuccess: (state, action) => {
//       state.status = true;
//       state.token = action.payload.token;
//       state.user = action.payload.user;
//       localStorage.setItem("token", action.payload.access_token);
//       state.isAuthenticated = true;
//       state.loading = false;
//     },
//     loginFailure: (state, action) => {
//       state.loading = false;
//       state.status = false;
//       state.error = action.payload;
//     },

//     signupRequest: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     signupSuccess: (state, action) => {
//       state.loading = false;
//       state.status = true;
//       // state.token = action.payload.token;
//       state.user = action.payload.user;
//       state.isAuthenticated = true;
//       // localStorage.setItem("token", action.payload.token);
//     },
//     signupFailure: (state, action) => {
//       state.loading = false;
//       state.status = false;
//       state.error = action.payload;
//     },

//      checkMeRequest: (state) => {
//       state.meLoading = true;
//       state.meError = null;
//       state.meVerified = false;
//     },
//     checkMeSuccess: (state, action) => {
//       state.meLoading = false;
//       state.me = action.payload;
//       state.meVerified = true;
//     },
//     checkMeFailure: (state, action) => {
//       state.meLoading = false;
//       state.meError = action.payload || "Verification failed";
//       state.meVerified = false;
//     },

//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem("token");
//     },
//   },
// });


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.status = true;
      // ✅ store access_token (your API returns `access_token`)
      state.token = action.payload.access_token || action.payload.token || null;
      state.user = action.payload.user || null;
      if (action.payload.access_token) {
        localStorage.setItem("token", action.payload.access_token);
      }
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.status = false;
      state.error = action.payload;
    },

    signupRequest: (state) => { state.loading = true; state.error = null; },
    signupSuccess: (state, action) => {
      state.loading = false; state.status = true; state.user = action.payload.user; state.isAuthenticated = true;
    },
    signupFailure: (state, action) => { state.loading = false; state.status = false; state.error = action.payload; },

    // ✅ /interviewer/me
    checkMeRequest: (state) => { state.meLoading = true; state.meError = null; state.meVerified = false; },
    checkMeSuccess: (state, action) => { state.meLoading = false; state.me = action.payload; state.meVerified = true; },
    checkMeFailure: (state, action) => { state.meLoading = false; state.meError = action.payload || "Verification failed"; state.meVerified = false; },

    logout: (state) => {
      state.user = null; state.token = null; state.isAuthenticated = false;
      state.me = null; state.meVerified = false; state.meLoading = false;
      localStorage.removeItem("token");
    },
  },
});
export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
   checkMeRequest,
  checkMeSuccess,
  checkMeFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
