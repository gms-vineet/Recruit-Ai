// src/store/slices/panelSlice.js
import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "rightPanelState";

// safe read
const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persisted = loadState();

const initialState = {
  open: true,
  activeKey: "jd", // default step
  ...persisted,    // { open, activeKey } if present
};

const panelSlice = createSlice({
  name: "panel",
  initialState,
  reducers: {
    setActiveKey(state, action) {
      state.activeKey = action.payload;
    },
    setOpen(state, action) {
      state.open = action.payload;
    },
    toggleOpen(state) {
      state.open = !state.open;
    },
  },
});

export const { setActiveKey, setOpen, toggleOpen } = panelSlice.actions;
export default panelSlice.reducer;
