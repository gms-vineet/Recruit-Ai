import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  userData: null,
  getUserDataError: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    getUserDataRequest: (state) => {
      state.loading = true;
      state.getUserDataError = null;
    },
    getUserDataSuccess: (state, action) => {
      state.loading = false;
      state.userData = action.payload;
      state.getUserDataError = null;
    },
    getUserDataFailure: (state, action) => {
      state.loading = false;
      state.getUserDataError = action.payload || "Failed to fetch user data";
    },
  },
});

export const {
  getUserDataRequest,
  getUserDataSuccess,
  getUserDataFailure,
} = userSlice.actions;

export default userSlice.reducer;