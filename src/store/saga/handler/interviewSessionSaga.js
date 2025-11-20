// src/store/sagas/interviewSessionSaga.js
import { call, put, select, takeLatest } from "redux-saga/effects";
import axiosInstance from "../../saga/axiosInstance/axiosInstance"; // ✅ use shared axios instance

import {
  bootstrapSessionRequest,
  bootstrapSessionSuccess,
  bootstrapSessionFailure,
  fetchTurnsRequest,
  fetchTurnsSuccess,
  fetchTurnsFailure,
  fetchQuestionsRequest,
  fetchQuestionsSuccess,
  fetchQuestionsFailure,
  fetchExpectedRequest,
  fetchExpectedSuccess,
  fetchExpectedFailure,
  fetchValidateRequest,
  fetchValidateSuccess,
  fetchValidateFailure,
  fetchSummaryRequest,
  fetchSummarySuccess,
  fetchSummaryFailure,
} from "../../slices/interviewSessionSlice";

/** ---------- helpers ---------- */

const getErrorMessage = (err) => {
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === "string") return data;
    return data.detail || data.message || JSON.stringify(data);
  }
  return err?.message || "Something went wrong";
};

function* getSessionIdOrThrow(explicitId) {
  if (explicitId) return explicitId;
  const sid = yield select((s) => s.interviewSession.sessionId);
  if (!sid) throw new Error("No sessionId in Redux");
  return sid;
}

/** ---------- workers ---------- */

// 1) POST /meet/session/bootstrap
function* bootstrapSessionWorker(action) {
  try {
    const { interviewId } = action.payload || {};

    const res = yield call(
      [axiosInstance, axiosInstance.post],
      "/meet/session/bootstrap",
      { interview_id: interviewId }
    );

    // expected: { session_id, mic_ws_url, tab_ws_url, ... }
    yield put(bootstrapSessionSuccess(res.data));
  } catch (err) {
    yield put(bootstrapSessionFailure(getErrorMessage(err)));
  }
}

// 2) GET /session/{id}/turns
function* fetchTurnsWorker(action) {
  try {
    const sid = yield* getSessionIdOrThrow(action.payload?.sessionId);

    const res = yield call(
      [axiosInstance, axiosInstance.get],
      `/session/${encodeURIComponent(sid)}/turns`
    );
    const data = res.data;

    const turns = Array.isArray(data?.turns)
      ? data.turns
      : Array.isArray(data)
      ? data
      : [];

    yield put(fetchTurnsSuccess(turns));
  } catch (err) {
    yield put(fetchTurnsFailure(getErrorMessage(err)));
  }
}

// 3) POST /ai/questions
function* fetchQuestionsWorker(action) {
  try {
    const sid = yield* getSessionIdOrThrow(action.payload?.sessionId);
    const count = action.payload?.count ?? 5;

    const res = yield call(
      [axiosInstance, axiosInstance.post],
      "/ai/questions",
      { session_id: sid, count }
    );
    const data = res.data;

    const list = Array.isArray(data?.questions)
      ? data.questions
      : Array.isArray(data)
      ? data
      : [];

    yield put(fetchQuestionsSuccess(list));
  } catch (err) {
    yield put(fetchQuestionsFailure(getErrorMessage(err)));
  }
}

// 4) POST /ai/expected
function* fetchExpectedWorker(action) {
  try {
    const { question } = action.payload || {};
    const sid = yield* getSessionIdOrThrow(action.payload?.sessionId);

    const res = yield call(
      [axiosInstance, axiosInstance.post],
      "/ai/expected",
      { session_id: sid, question }
    );
    const data = res.data;

    yield put(
      fetchExpectedSuccess({
        question,
        expectedAnswer: data.expected_answer || "",
      })
    );
  } catch (err) {
    yield put(fetchExpectedFailure(getErrorMessage(err)));
  }
}

// 5) POST /ai/validate
function* fetchValidateWorker(action) {
  try {
    const { question } = action.payload || {};
    const sid = yield* getSessionIdOrThrow(action.payload?.sessionId);

    const res = yield call(
      [axiosInstance, axiosInstance.post],
      "/ai/validate",
      { session_id: sid, question }
    );
    const data = res.data;

    yield put(
      fetchValidateSuccess({
        verdict: data.verdict || "",
        score: data.score,
        explanation: data.explanation || "",
        candidateAnswer: data.candidate_answer || "",
      })
    );
  } catch (err) {
    yield put(fetchValidateFailure(getErrorMessage(err)));
  }
}

// 6) POST /ai/summary
function* fetchSummaryWorker(action) {
  try {
    const sid = yield* getSessionIdOrThrow(action.payload?.sessionId);

    const res = yield call(
      [axiosInstance, axiosInstance.post],
      "/ai/summary",
      { session_id: sid }
    );
    const data = res.data;

    yield put(fetchSummarySuccess(data));
  } catch (err) {
    yield put(fetchSummaryFailure(getErrorMessage(err)));
  }
}

/** ---------- root saga ---------- */

export default function* interviewSessionSaga() {
  yield takeLatest(bootstrapSessionRequest.type, bootstrapSessionWorker);
  yield takeLatest(fetchTurnsRequest.type, fetchTurnsWorker);
  yield takeLatest(fetchQuestionsRequest.type, fetchQuestionsWorker);
  yield takeLatest(fetchExpectedRequest.type, fetchExpectedWorker);
  yield takeLatest(fetchValidateRequest.type, fetchValidateWorker);
  yield takeLatest(fetchSummaryRequest.type, fetchSummaryWorker);
}
