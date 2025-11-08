
import { call, put, takeLatest } from "redux-saga/effects";
import axiosInstance from './../axiosInstance/axiosInstance';

import {
  getUserDataRequest,
  getUserDataSuccess,
  getUserDataFailure,
} from "../../slices/userInfoSlice";

function fetchUserDataAPI() {
  // change "/user/me" to your actual endpoint
  return axiosInstance.get("/me");
}

function* handleGetUserData() {
  try {
    const res = yield call(fetchUserDataAPI);
    const data = res?.data?.data || res?.data || null;
    yield put(getUserDataSuccess(data));
    localStorage.setItem("userInfo", JSON.stringify(data));

  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || "Failed to fetch user data";
    yield put(getUserDataFailure(message));
  }
}

export default function* watchGetUserData() {
  yield takeLatest(getUserDataRequest.type, handleGetUserData);
}
