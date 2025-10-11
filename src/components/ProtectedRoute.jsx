import { Navigate } from "react-router-dom";
import { useAuthStore } from "../Store/auth.store";

export default function ProtectedRoute({ requiredPerms, children }) {
  const { hasPermission, permissions } = useAuthStore();
  console.log(!hasPermission(requiredPerms));
  console.log(requiredPerms);
  console.log(permissions);
  
  
  if (!hasPermission(requiredPerms)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
