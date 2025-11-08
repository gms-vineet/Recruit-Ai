import React, { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { Provider } from "react-redux";
import store from "./store/index";
import {Toaster} from 'react-hot-toast'
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);
