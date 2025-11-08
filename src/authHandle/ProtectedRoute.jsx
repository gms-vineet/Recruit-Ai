// ProtectedRoute.jsx
// ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}




// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";


// export default function ProtectedRoute() {
//   const token = localStorage.getItem("token");

//   return token ? <Outlet/> : <Navigate to="/auth" state={{login: true}} replace />;

// }
