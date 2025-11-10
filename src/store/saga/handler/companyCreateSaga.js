import { call, put, select, takeLatest } from "redux-saga/effects";
import axiosInstance from "./../axiosInstance/axiosInstance";

import {
  createCompanyRequest,
  createCompanySuccess,
  createCompanyFailure,
  fetchCompanyRequest,
  fetchCompanySuccess,
  fetchCompanyFailure,
} from "../../slices/createCompanySlice";
import {toast} from 'react-hot-toast'


const getToken = (s) => s.auth.token;
function* handleCreateCompany(action) {
  try {
    const response = yield call(
      axiosInstance.post,
      "/company/create", // ✅ Your API endpoint
      action.payload
    );

    // API should return something like { company: {...} }
    yield put(createCompanySuccess(response.data.company || response.data));
    toast.success('Company Created Successfully!');

    // localStorage.setItem('companyDetails', JSON.stringify(response.data));
    
  } catch (error) {
    toast.error('Company Creation Failed!');

    yield put(
      createCompanyFailure(
        error.response?.data?.message || error.message || "Something went wrong"
      )
      
    );
  }
}

function* handleFetchCompany({ payload: companyId }) {
  try {
    const token = (yield select(getToken)) || localStorage.getItem("token");
    const { data } = yield call(
      axiosInstance.get,
      `/company/${companyId}`,                     // adjust if your API is `/companies/:id`
      { headers: { Authorization: `Bearer ${token}` } }
    );
    yield put(fetchCompanySuccess(data.company || data));
  } catch (error) {
    yield put(fetchCompanyFailure(error.response?.data?.message || error.message));
  }
}

export default function* WatchCreateCompanySaga() {
  yield takeLatest(createCompanyRequest.type, handleCreateCompany);
    yield takeLatest(fetchCompanyRequest.type,  handleFetchCompany);   // <- new
}
