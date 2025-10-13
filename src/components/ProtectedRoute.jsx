import { Navigate } from "react-router-dom";
import { useAuthStore } from "../Store/auth.store";

export default function ProtectedRoute({ requiredPerms, children }) {
  const { hasPermission, permissions } = useAuthStore();  
  
  if (!hasPermission(requiredPerms)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
