// src/store/saga/handler/interviewerInterviewsSaga.js
import { call, put, takeLatest } from "redux-saga/effects";
import api from "../axiosInstance/axiosInstance";
import {
  fetchInterviewerInterviewsRequest,
  fetchInterviewerInterviewsSuccess,
  fetchInterviewerInterviewsFailure,
} from "../../slices/interviewerInterviewsSlice";

// worker
function* fetchInterviewerInterviewsWorker(action) {
  try {
    // optional: filter by status
    const status = action.payload?.status;
    const config = status ? { params: { status } } : undefined;

    const res = yield call(api.get, "/interviewer/interviews", config);
    // Swagger response is a list of objects (job_role, candidate_name, interview, etc.)
    yield put(fetchInterviewerInterviewsSuccess(res.data));
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load interviewer interviews";
    yield put(fetchInterviewerInterviewsFailure(msg));
  }
}

// watcher
export default function* interviewerInterviewsSaga() {
  yield takeLatest(
    fetchInterviewerInterviewsRequest.type,
    fetchInterviewerInterviewsWorker
  );
}
