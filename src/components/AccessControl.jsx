import { useAuthStore } from "../Store/auth.store";

export default function AccessControl({ requiredPerms, children }) {
  const { hasPermission } = useAuthStore();
  return hasPermission(requiredPerms) ? children : null;
}
