// src/store/saga/handler/interviewDetailSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../axiosInstance/axiosInstance";
import {
  fetchInterviewDetailRequest,
  fetchInterviewDetailSuccess,
  fetchInterviewDetailFailure,
  updateInterviewStatusFailure,
  updateInterviewStatusSuccess,
  updateInterviewStatusRequest,
} from "../../slices/interviewDetailSlice";

function* fetchInterviewDetailWorker(action) {
  const interviewId = action.payload;
  try {
    const res = yield call(api.get, `/interviewer/interviews/${interviewId}`);
    yield put(fetchInterviewDetailSuccess(res.data));
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to fetch interview details";
    yield put(fetchInterviewDetailFailure(msg));
  }
}

// 🔴 IMPORTANT: use the path exactly as in Swagger:
// POST /interviews/{interview_id}/status
function* updateInterviewStatusWorker(action) {
  const { interviewId, status } = action.payload || {};
  if (!interviewId || !status) {
    yield put(updateInterviewStatusFailure("Missing interviewId or status"));
    return;
  }

  try {
    yield call(api.post, `/interviews/${interviewId}/status`, { status });
    yield put(updateInterviewStatusSuccess({ status }));
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to update interview status";
    yield put(updateInterviewStatusFailure(msg));
  }
}

export default function* interviewDetailSaga() {
  yield all([
    takeLatest(fetchInterviewDetailRequest.type, fetchInterviewDetailWorker),
    takeLatest(updateInterviewStatusRequest.type, updateInterviewStatusWorker),
  ]);
}
