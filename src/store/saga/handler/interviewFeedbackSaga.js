// src/store/sagas/interviewFeedbackSaga.js
import { takeLatest, call, put } from "redux-saga/effects";
import axiosInstance from "../../saga/axiosInstance/axiosInstance";
import {
  submitFeedbackRequest,
  submitFeedbackSuccess,
  submitFeedbackFailure,
} from "../../slices/interviewFeedbackSlice";

// worker
function* submitFeedbackWorker(action) {
  try {
    const { interviewId, payload } = action.payload || {};
    if (!interviewId) {
      throw new Error("Missing interviewId");
    }

    const response = yield call(
      [axiosInstance, axiosInstance.post],
      `/interviews/${encodeURIComponent(interviewId)}/feedback`,
      payload
    );

    yield put(submitFeedbackSuccess(response.data));
  } catch (err) {
    console.error("submitFeedback error:", err);
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to submit feedback";
    yield put(submitFeedbackFailure(msg));
  }
}

// watcher
export default function* interviewFeedbackSaga() {
  yield takeLatest(submitFeedbackRequest.type, submitFeedbackWorker);
}
