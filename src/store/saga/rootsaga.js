import { all } from "redux-saga/effects";

import watchAuthSaga from './../saga/handler/authsaga'
import WatchCreateCompanySaga from './../saga/handler/companyCreateSaga'
import watchCreateJobSaga from './../saga/handler/createJobSaga'
import watchJobList from './../saga/handler/jobDataSaga'
import watchGetUserData from './../saga/handler/userInfoSaga'
import watchUploadJD from './../saga/handler/uploadJdSaga'
import watchResumeParseSaga from './../saga/handler/parseResumeSaga'
import watchtodayInterviewsSaga from "./handler/todayInterviewsSaga";
import interviewDetailSaga from "./handler/interviewDetailSaga";
import interviewerInterviewsSaga from "./handler/interviewerInterviewsSaga";
import interviewSessionSaga from "./handler/interviewSessionSaga";
import interviewFeedbackSaga from "./handler/interviewFeedbackSaga";
export default function* rootSaga() {
    yield all([
        watchAuthSaga(),
        WatchCreateCompanySaga(),
        watchCreateJobSaga(),
        watchJobList(),
        watchGetUserData(),
        watchUploadJD(),
        watchResumeParseSaga(),
        watchtodayInterviewsSaga(),
           interviewDetailSaga(), 
               interviewerInterviewsSaga(),
                interviewSessionSaga(),
                  interviewFeedbackSaga(), 
    ]);
}