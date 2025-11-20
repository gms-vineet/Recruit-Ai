import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import rootSaga from './saga/rootsaga';

import authReducer from './slices/authslice';
import createCompanyReducer from './slices/createCompanySlice';
import createJobReducer from './slices/createJobSlice';
import JobListReducer from './slices/jobDataSlice';
import userDataReducer from './slices/userInfoSlice';
import rightSidePanelReducer from './slices/UI Slice/panelSlice';
import createJDReducer from './slices/UI Slice/CreateJDSlice';
import uploadJDReducer from './slices/uploadJdSlice';
import resumeParseReducer from './slices/parseResumeSlice';
import todayInterviewsReducer from "./slices/todayInterviewsSlice"; 
import interviewDetailReducer from "./slices/interviewDetailSlice";
import interviewerInterviewsReducer from "./slices/interviewerInterviewsSlice";
import interviewFeedbackReducer from "./slices/interviewFeedbackSlice";
import interviewSessionReducer, {
  saveInterviewSessionToStorage,
} from "./slices/interviewSessionSlice";
// Create Saga Middleware
const sagaMiddleware = createSagaMiddleware();


// const STORAGE_KEY = "rightPanelState";

const store = configureStore({
    reducer: {
        auth:authReducer,
        companyCreate: createCompanyReducer,
        createJob: createJobReducer,
        jobList: JobListReducer,
        userData: userDataReducer,
        rightPanel: rightSidePanelReducer,
        uploadJD: uploadJDReducer,
        createJD:createJDReducer,
        resumeParse:resumeParseReducer,
          interviewSession: interviewSessionReducer, 
          todayInterviews: todayInterviewsReducer, // 👈 NEW
            interviewDetail: interviewDetailReducer,
              interviewerInterviews: interviewerInterviewsReducer,
               interviewFeedback: interviewFeedbackReducer,
               
    },
     middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({  serializableCheck: false,thunk: false }).concat(sagaMiddleware),

    
});

sagaMiddleware.run(rootSaga);

// persist on change (throttled enough for this use-case)
const RIGHT_PANEL_STORAGE_KEY = "rightPanelState";

let prevRightPanel;

store.subscribe(() => {
  const state = store.getState();

  // ---- Persist right panel UI state ----
  const panelSlice = state.rightPanel; // ✅ correct key
  if (panelSlice && panelSlice !== prevRightPanel) {
    prevRightPanel = panelSlice;
    try {
      localStorage.setItem(
        RIGHT_PANEL_STORAGE_KEY,
        JSON.stringify({
          open: panelSlice.open,
          activeKey: panelSlice.activeKey,
        })
      );
    } catch (e) {
      // ignore storage errors
    }
  }

  // ---- ALWAYS persist interview session slice ----
  saveInterviewSessionToStorage(state);
})

export default store;
