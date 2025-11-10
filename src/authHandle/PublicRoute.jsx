// import React from "react";
// import { Navigate } from "react-router-dom";

// export default function PublicRoute({ children }) {
//   const token = localStorage.getItem("token");
//   if (token) {
//     return <Navigate to="/dashboard" replace />;
//   }
//   return children;
// }

// // import React from "react";
// // import { Navigate, Outlet } from "react-router-dom";

// // export default function PublicRoute() {
// //   const token = localStorage.getItem("token");
 
// //   return token ? <Navigate to="/dashboard" replace /> : <Outlet/>

// // }

import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ALWAYS_PUBLIC = new Set([
  "/auth/callback",
  "/set-password",
  "/reset",
  "/forgot-password",
  "/auth",
  "/" // landing login page
]);

export default function PublicRoute({ children }) {
  const { pathname } = useLocation();
  const { isAuthenticated, meVerified, meLoading } = useSelector(s => s.auth);

  // Always let these render (Supabase flows)
  if (ALWAYS_PUBLIC.has(pathname)) return children;

  // If already logged in and verified → go to dashboard
  if (isAuthenticated && !meLoading && meVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise show the public page (login/signup)
  return children;
}