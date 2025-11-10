// ProtectedRoute.jsx
// ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkMeRequest } from "../store/slices/authslice";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const { meVerified, meLoading, isAuthenticated } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const location = useLocation();
 if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  useEffect(() => {
    if (token && isAuthenticated && !meVerified && !meLoading) {
      dispatch(checkMeRequest());
    }
  }, [token, isAuthenticated, meVerified, meLoading, dispatch]);

  if (meLoading || !meVerified) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-300">
        Verifying access…
      </div>
    );
  }

  return children;
}




// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";


// export default function ProtectedRoute() {
//   const token = localStorage.getItem("token");

//   return token ? <Outlet/> : <Navigate to="/auth" state={{login: true}} replace />;

// }
