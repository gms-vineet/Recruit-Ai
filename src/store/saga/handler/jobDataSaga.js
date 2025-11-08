import { call, put, takeLatest } from "redux-saga/effects";
import axiosInstance from './../axiosInstance/axiosInstance';


import {
  getJobListRequest,
  getJobListSuccess,
  getJobListFailure,
} from "../../slices/jobDataSlice";

function fetchJobListAPI() {
  // Adjust endpoint to your backend API route
  return axiosInstance.get("/jobs/my-jobs");
}

function* handleGetJobList() {
  try {
    const res = yield call(fetchJobListAPI);
    const data = res?.data?.data || res?.data || [];
    yield put(getJobListSuccess(data));
  } catch (error) {
    const message =
      error?.response?.data?.message || "Failed to fetch Job List";
    yield put(getJobListFailure(message));
  }
}

export default function* watchJobList() {
  yield takeLatest(getJobListRequest.type, handleGetJobList);
}
