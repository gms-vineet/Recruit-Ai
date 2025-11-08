import { call, put, takeLatest } from "redux-saga/effects";
import axiosInstance from "./../axiosInstance/axiosInstance";

import {
  createCompanyRequest,
  createCompanySuccess,
  createCompanyFailure,
} from "../../slices/createCompanySlice";
import {toast} from 'react-hot-toast'

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

export default function* WatchCreateCompanySaga() {
  yield takeLatest(createCompanyRequest.type, handleCreateCompany);
}
