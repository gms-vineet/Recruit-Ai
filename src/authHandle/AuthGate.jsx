import React from "react";
import { Navigate } from "react-router-dom";
import AuthForm from './../pages/AuthForm';

export default function AuthGate() {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : <AuthForm />;
}