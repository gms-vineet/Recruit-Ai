import React from "react";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// export default function PublicRoute() {
//   const token = localStorage.getItem("token");
 
//   return token ? <Navigate to="/dashboard" replace /> : <Outlet/>

// }
