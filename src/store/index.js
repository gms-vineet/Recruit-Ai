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

// Create Saga Middleware
const sagaMiddleware = createSagaMiddleware();


const STORAGE_KEY = "rightPanelState";

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
        resumeParse:resumeParseReducer
    },
     middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({  serializableCheck: false,thunk: false }).concat(sagaMiddleware),

    
});

sagaMiddleware.run(rootSaga);

// persist on change (throttled enough for this use-case)
let prev;
store.subscribe(() => {
  const state = store.getState();
  const slice = state.panel;
  if (prev === slice) return;
  prev = slice;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ open: slice.open, activeKey: slice.activeKey })
    );
  } catch {}
});

export default store;
