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
import AuthCallback from "./pages/AuthCallback";
import SbSetPassword from "./pages/SbSetPassword";
import CandidateDetail from "./pages/CandidateDetail";

export default function App() {
  return (
      <Routes>
      <Route path="/" element={<PublicRoute><AuthForm /></PublicRoute>} />
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/set-password" element={<SbSetPassword />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<MainContent />} />
        <Route path="/candidate/:id" element={<CandidateDetail />} /> 
      </Route>

      {/* OPTIONAL: hard-block any accidental redirects to /get-started */}
      <Route path="/get-started" element={<Navigate to="/dashboard" replace />} />

      {/* If you still need /get-started for onboarding later, remove the line above
          and keep it protected like this:
          <Route path="/get-started" element={<ProtectedRoute><StartingForm /></ProtectedRoute>} />
      */}
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
