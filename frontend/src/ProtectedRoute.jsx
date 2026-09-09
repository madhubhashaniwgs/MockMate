import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getProfile } from "./services/authService";

function ProtectedRoute() {
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState(() => (
    localStorage.getItem("token") ? "checking" : "unauthenticated"
  ));

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");

    if (!token) {
      return () => {
        isMounted = false;
      };
    }

    getProfile(token)
      .then((data) => {
        if (!isMounted) return;

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setAuthStatus("authenticated");
          return;
        }

        throw new Error("Invalid session");
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (isMounted) {
          setAuthStatus("unauthenticated");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (authStatus === "checking") {
    return null;
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;