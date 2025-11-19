// src/store/saga/handler/todayInterviewsSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import api from "../axiosInstance/axiosInstance";
import {
  fetchTodayInterviewsRequest,
  fetchTodayInterviewsSuccess,
  fetchTodayInterviewsFailure,
} from "../../slices/todayInterviewsSlice";

function* fetchTodayInterviewsWorker() {
  try {
    // GET /interviewer/interviews/today
    const response = yield call(api.get, "/interviewer/interviews/today");
    // response.data is the object from Swagger
    yield put(fetchTodayInterviewsSuccess(response.data));
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to fetch today's interviews";
    yield put(fetchTodayInterviewsFailure(message));
  }
}

export default function* watchtodayInterviewsSaga() {
  yield takeLatest(fetchTodayInterviewsRequest.type, fetchTodayInterviewsWorker);
}
