// src/store/sagas/jobSagas.js
import { call, put, takeLatest, all } from "redux-saga/effects";
import axiosInstance from "./../axiosInstance/axiosInstance";
import {
  createJobRequest, createJobSuccess, createJobFailure,
  saveJDRequest, saveJDSuccess, saveJDFailure,
  updateJDRequest, updateJDSuccess, updateJDFailure,
  regenerateJDRequest, regenerateJDSuccess, regenerateJDFailure,
} from "../../slices/createJobSlice";

import {setModalOpen} from './../../slices/UI Slice/CreateJDSlice'

import {
  getJobListRequest
} from "../../slices/jobDataSlice";
import {toast} from 'react-hot-toast'

// CREATE
function* handleCreateJob(action) {
  try {
    const res = yield call(axiosInstance.post, "/jd/create", action.payload);
    const job = res?.data?.job || res?.data;
    yield put(createJobSuccess(job));
    yield put(getJobListRequest());
    yield put(setModalOpen(false));

    localStorage.setItem("isCreateJob", "true");
  } catch (error) {
    yield put(createJobFailure(error?.response?.data?.message || "Failed to create job"));
  }
}

// SAVE (persist full JD content: html/markdown/sections)
function* handleSaveJD(action) {
  try {
    const id = action.payload; // e.g., { id, html } or { id, text }
    const res = yield call(axiosInstance.post, `/jd/finalize/${id}`);
    const job = res?.data?.job || res?.data;
    yield put(saveJDSuccess(job));
    toast.success('Job Successfully Saved!');

  } catch (error) {
    yield put(saveJDFailure(error?.response?.data?.message || "Failed to save JD"));
  }
}

// UPDATE/PATCH (edit parts of JD)
function* handleUpdateJD(action) {
  try {
    const { id, patch } = action.payload;

    const res = yield call(
      axiosInstance.put,
      `/jd/edit/${id}`,
      null, // no body
      {
        params: { jd_text: patch }, // 👈 send it as query param
      }
    );

    const job = res?.data?.job || res?.data;
    yield put(updateJDSuccess(job));
    toast.success('Job Updated Successfully!');

  } catch (error) {
    yield put(
      updateJDFailure(error?.response?.data?.message || "Failed to update JD")
    );
    toast.success('Job Update Failed!');

  }

}

// REGENERATE (AI)
function* handleRegenerateJD(action) {
  try {
    const id = action.payload; // e.g., { prompt, constraints }
    const res = yield call(axiosInstance.post, `/jd/regenerate/${id}`);
    const job = res?.data?.job || res?.data;
    yield put(regenerateJDSuccess(job));
    toast.success('Regenrated Successfully!');

  } catch (error) {
    yield put(regenerateJDFailure(error?.response?.data?.message || "Failed to regenerate JD"));
    toast.success('Job Regenrate Failed!');

  }
}

export default function* jobRootSaga() {
  yield all([
    takeLatest(createJobRequest.type, handleCreateJob),
    takeLatest(saveJDRequest.type, handleSaveJD),
    takeLatest(updateJDRequest.type, handleUpdateJD),
    takeLatest(regenerateJDRequest.type, handleRegenerateJD),
  ]);
}
