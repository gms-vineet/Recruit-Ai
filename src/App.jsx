// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import MainContent from "./components/MainContent";
import StartingForm from "./pages/StartingForm";
import AuthForm from "./pages/AuthForm";
import ProtectedRoute from "./authHandle/ProtectedRoute";
import PublicRoute from "./authHandle/PublicRoute";
import InviteReset from "./pages/InviteReset"; // ✅ new

export default function App() {
  return (
    <Routes>
      {/* Landing = Login page */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <AuthForm />
          </PublicRoute>
        }
      />

      {/* (Optional) /auth → redirect to / */}
      <Route path="/auth" element={<Navigate to="/" replace />} />

      {/* Invite/Reset page — allow even if already logged in */}
      <Route path="/invite/:token" element={<InviteReset />} />

      {/* Protected (requires token) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<MainContent />} />
      </Route>

      <Route
        path="/get-started"
        element={
          <ProtectedRoute>
            <StartingForm />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}


// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Layout from "./pages/Layout";
// import Home from "./pages/Home";
// import MainContent from "./components/MainContent";
// import StartingForm from "./pages/StartingForm";
// import AuthForm from "./pages/AuthForm";
// import ProtectedRoute from "./authHandle/ProtectedRoute";
// import PublicRoute from "./authHandle/PublicRoute";

// export default function App() {
//   return (
//     <Routes>
//       {/* Public pages */}
//       <Route element={<PublicRoute />}>
//         <Route path="/" element={<Home />} />
//         <Route path="/auth" element={<AuthForm />} />
//       </Route>
//       <Route element={<ProtectedRoute />}>
//         <Route path="/get-started" element={<StartingForm />} />
//         <Route element={<Layout />}>
//           <Route path="/dashboard" element={<MainContent />} />
//         </Route>
//       </Route>

//       {/* Optional catch-all */}
//       {/* <Route path="*" element={<NotFound />} /> */}
//     </Routes>
//   );
// }
