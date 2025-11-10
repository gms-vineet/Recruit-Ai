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
import { Navigate, useLocation } from "react-router-dom";

const ALWAYS_PUBLIC = new Set([
  "/",                // landing (login)
  "/auth",            // optional alias
  "/auth/callback",   // Supabase redirects here
  "/set-password",    // password screen
  "/reset",           // optional
  "/forgot-password", // optional
]);

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const { pathname } = useLocation();
  if (ALWAYS_PUBLIC.has(pathname)) return children;
  return token ? <Navigate to="/dashboard" replace /> : children;
}
