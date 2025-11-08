// saga
import { call, put, takeLatest } from "redux-saga/effects";
import axiosInstance from "./../axiosInstance/axiosInstance";
import {
  uploadResumeRequest,
  uploadResumeSuccess,
  uploadResumeFailure,
  parseResumeFailure,
  parseResumeRequest,
  parseResumeSuccess,
  getParseResListFailure,
  getParseResListRequest,
  getParseResListSuccess,
  getRankedResFailure,
  getRankedResRequest,
  getRankedResSuccess,
  reRankResFailure,
  reRankResRequest,
  reRankResSuccess
} from "./../../slices/parseResumeSlice";
import { setActiveKey } from "./../../slices/UI Slice/panelSlice";
import { toast } from "react-hot-toast";


function buildFormData(files) {
  const fd = new FormData();
  (files || []).forEach((f) => {
    // ✅ name must be a string, value must be a File/Blob
    if (
      f instanceof File ||
      (typeof Blob !== "undefined" && f instanceof Blob)
    ) {
      fd.append("files", f, f.name || "resume.pdf"); // or "files[]" if your API wants that
    }
  });
  return fd;
}

// function postUpload({ job_id, formData }) {
//   // ❗️No manual Content-Type — Axios will add multipart/form-data with boundary
// }

// resume array Upload api call

const postUploadApi = async ({ job_id, formData }) => {
  const response = await axiosInstance.post(
    `/jobs/${job_id}/upload_resumes`,
    formData
  );
  return response.data;
};

// resume parse api call

const parseResumeApi = async (job_id) => {
  const res = await axiosInstance.post(
    `/jobs/${job_id}/parse_pending`,
    job_id, // plain JSON
    { headers: { "Content-Type": "application/json" } } // force JSON for this call
  );
  return res.data;
};

// get paresed resume list

const getParsedResListApi = async (job_id, limit, status) => {
  const res = await axiosInstance.get(
    `/jobs/${job_id}/resumes`,
       { params: { job_id:job_id,status: status,limit: limit }},

    { headers: { "Content-Type": "application/json" } } // force JSON for this call
  );
  return res.data;
};

// get Ranked Resumes List based on limit and Job ID

const getRankedResumeApi = async (job_id, limit) => {
  const res = await axiosInstance.get(
    `/jobs/${job_id}/ranked`,
    { params: { limit: limit }},
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};

// Re-Rank Resume List 

const reRankResumApi = async (job_id) =>{
  const res = await axiosInstance.post(`/jobs/${job_id}/rescore_existing`,job_id,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data
};

function* handleUploadResume(action) {
  try {
    const { job_id, files } = action.payload || {};
    if (!job_id) throw new Error("job_id is required");
    if (!Array.isArray(files) || files.length === 0)
      throw new Error("No files");

    // quick guard: ensure they’re Files
    files.forEach((f, i) => {
      if (!(f instanceof File)) {
        console.warn("Non-File at index", i, f);
      }
    });

    const formData = buildFormData(files);
    const res = yield call(postUploadApi, { job_id, formData });
    yield put(uploadResumeSuccess(res?.data ?? res));
    toast.success("Resume Uploaded Successfully!");
    yield put(parseResumeRequest({ job_id: job_id }));
  } catch (e) {
    yield put(
      uploadResumeFailure(
        e?.response?.data?.message || e.message || "Upload Resumes failed"
      )
    );
  }
}

function* handleResumeParse(action) {
  try {
    const { job_id } = action.payload;
    const res = yield call(parseResumeApi, job_id);
    yield put(parseResumeSuccess(res));
    toast.success("Resume Parsing Done!");

    yield put(setActiveKey("rank"));
  } catch (error) {
    yield put(
      parseResumeFailure(
        error?.response?.data?.message ||
          error.message ||
          "Parse Resumes failed"
      )
    );
  }
}

function* handleGetParsedResList(action) {
  try {
    const {job_id, limit, status} = action.payload;
    const res = yield call(getParsedResListApi, job_id, limit, status);
    yield put(getParseResListSuccess(res));
    toast.success("Parsed Resume List !");
  } catch (error) {
    toast.error("Failed to Parsed Resume List !");

    yield put(
      getParseResListFailure(
        error?.response?.data?.message ||
          error.message ||
          "failed to parsed resume list"
      )
    );
  }
};


function* handleGetRankedResList(action){
  try {
    const {job_id, limit} = action.payload;
    const res = yield call(getRankedResumeApi, job_id, limit);
    yield put(getRankedResSuccess(res));
    toast.success("Ranked Resume List !");


  } catch (error) {
    toast.success("Failed to get ranked resume list");

    yield put(getRankedResFailure( error?.response?.data?.message ||
          error.message ||
          "failed to get ranked resume list"))
  }
};


function* handleReRankRes(action){
  try {
    const job_id = action.payload;
    const res = yield call(reRankResumApi,job_id);
    yield put(getParseResListRequest({job_id: job_id}));
    yield put(reRankResSuccess(res));
    toast.success("Resumes Re-Ranked !");
  } catch (error) {
    toast.error("Failed to Re-Rank resume");
    yield put(reRankResFailure(error?.response?.data?.message ||
          error.message ||
          "Failed to Re-Rank resume"))
  }
}

export default function* watchResumeParseSaga() {
  yield takeLatest(uploadResumeRequest.type, handleUploadResume);
  yield takeLatest(parseResumeRequest.type, handleResumeParse);
  yield takeLatest(getParseResListRequest.type, handleGetParsedResList);
  yield takeLatest(getRankedResRequest.type, handleGetRankedResList);
  yield takeLatest(reRankResRequest.type, handleReRankRes);

}
