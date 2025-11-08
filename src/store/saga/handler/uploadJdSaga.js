import { call, put, select, takeLatest } from "redux-saga/effects";
import axiosInstance from "./../axiosInstance/axiosInstance";

import {
  uploadJdFailure,
  uploadJdRequest,
  uploadJdSuccsess,
  ansJdQuesFailure,
  ansJdQuesRequest,
  ansJdQuesSuccsess,
} from "./../../slices/uploadJdSlice";
import { saveJDRequest } from "./../../slices/createJobSlice";
import {
  setModalOpen,
  setShowTypeWriter,
} from "./../../slices/UI Slice/CreateJDSlice";
import {getJobListRequest} from './../../slices/jobDataSlice'
import {toast} from 'react-hot-toast'

/* APIs */
const uploadJdApi = async (payload) => {
  const { data } = await axiosInstance.post("/jd/ingest-text", payload);
  return data;
};

const answerJDquesApi = async (payload) => {
  const { data } = await axiosInstance.post("/jd/ingest-answer", payload);
  return data;
};

/* Helpers */
const hasQuestions = (res) =>
  Array.isArray(res?.questions) && res.questions.length > 0;

function* resolveJobIdFromStore() {
  // NOTE: matches your component selectors that use state.uploadJD
  const state = yield select((s) => s.uploadJD);
  return (
    state?.data?.job?.job_id ||
    state?.data?.job_id ||
    state?.questions?.job_id ||
    null
  );
}

/* Sagas */
function* handleUploadJd(action) {
  try {
    const res = yield call(uploadJdApi, action.payload);
    // Keep entire payload in data so jd_text is visible to UI
    yield put(uploadJdSuccsess(res));

    // If you want auto-save when there are no questions, you can re-enable this:
    if (!hasQuestions(res)) {
      const jobId =
        res?.job?.job_id || res?.job_id || (yield resolveJobIdFromStore());
      if (jobId) {
        yield put(saveJDRequest(jobId));
        yield put(setModalOpen(false));
        yield put(setShowTypeWriter(true));
        yield put(getJobListRequest());
        toast.success('Job Description Uploaded Successfully!');

      }
    }
  } catch (error) {
    yield put(
      uploadJdFailure(
        error?.response?.data?.message || "Failed to create JD From Upload"
      )
    );
        toast.error('Job Description Upload Failed!');

  }
}

function* handleAnsJdQues(action) {
  try {
    const res = yield call(answerJDquesApi, action.payload);

    // Store full response in `data` (so jd_text updates) AND mirror questions
    yield put(ansJdQuesSuccsess(res));

    yield put(setModalOpen(false));
    yield put(setShowTypeWriter(true));


    yield put(getJobListRequest());


    // If there are still questions, stop here (UI should prompt the next set)
    if (hasQuestions(res)) return;

    // Otherwise, finalize/save
    const jobId =
      res?.job?.job_id || res?.job_id || (yield resolveJobIdFromStore());

    if (jobId) {
      yield put(saveJDRequest(jobId));
      toast.success('Job Description Uploaded Successfully!');

    }
  } catch (error) {
    yield put(
      ansJdQuesFailure(
        error?.response?.data?.message || "Failed to answer JD questions"
      )
    );
        toast.error('Job Description Upload Failed!');

  }
}

export default function* watchUploadJD() {
  yield takeLatest(uploadJdRequest.type, handleUploadJd);
  yield takeLatest(ansJdQuesRequest.type, handleAnsJdQues);
}
