import { call, put, select, takeLatest } from "redux-saga/effects";
import axiosInstance from "./../axiosInstance/axiosInstance";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
  checkMeRequest, checkMeSuccess, checkMeFailure,
} from "../../slices/authslice";
import {toast} from 'react-hot-toast'

const getToken = (state) => state.auth.token; // ✅
// --- LOGIN ---
function* handleLogin(action) {
  try {
    const response = yield call(
      axiosInstance.post,
      "/auth/signin",
      action.payload
    );
    yield put(loginSuccess(response.data));

    toast.success('Your loged In!');


    localStorage.setItem('token', response.data.access_token);
  } catch (error) {
    toast.error('log In failed!');

    yield put(loginFailure(error.response?.data?.message || error.message));
  }
}

// --- SIGNUP ---
function* handleSignup(action) {
  try {
    const response = yield call(
      axiosInstance.post,
      "/auth/signup",
      action.payload
    );
    yield put(signupSuccess(response.data));
    toast.success('Your Sign up Successfully!');

  } catch (error) {
    toast.error('Sign up log In failed!');

    yield put(signupFailure(error.response?.data?.message || error.message));
  }
}

function* handleCheckMe() {
  try {
    const token = yield select(getToken) || localStorage.getItem("token");
    const resp = yield call(axiosInstance.get, "/interviewer/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    yield put(checkMeSuccess(resp.data));
    // optionally toast: toast.success("Verified interviewer");
  } catch (error) {
    yield put(checkMeFailure(error?.response?.data?.message || error.message));
    toast.error("Not authorized for interviewer dashboard");

    // Optional hard block: auto-logout on failed verification
    // yield put(logout());
  }
}

export default function* watchAuthSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(signupRequest.type, handleSignup);
   yield takeLatest(checkMeRequest.type, handleCheckMe);
}
