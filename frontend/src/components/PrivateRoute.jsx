import React from "react";
import { Navigate } from "react-router-dom";

// This component checks if user is logged in
export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("access");

  if (!token) {
    console("cant get token to enter createjoin room")
    return <Navigate to="/login" replace />;  // Redirect to login if not logged in
  }

  return children;  // Show the page if logged in
}
