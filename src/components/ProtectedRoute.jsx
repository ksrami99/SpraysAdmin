import { Navigate } from "react-router-dom";
import { useAuthStore } from "../Store/auth.store";

export default function ProtectedRoute({ requiredPerms, children }) {
  const { hasPermission } = useAuthStore();

  if (!hasPermission(requiredPerms)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
