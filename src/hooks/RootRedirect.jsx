import { Navigate } from "react-router-dom";
import { isLoggedIn } from "./useAuth";

export default function RootRedirect() {
  if (isLoggedIn()) {
    return <Navigate to="/afterlogin" replace />;
  }
  return <Navigate to="/login" replace />;
}
