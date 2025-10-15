import { create } from "zustand";

// Helper to get initial state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  const isAuthenticated = !!token;
  return { token, user, permissions, isAuthenticated };
};

export const useAuthStore = create((set, get) => ({
  ...getInitialState(),

  login: (data) => {
    const { token, user } = data;
    const permissions = user?.permissions || [];

    set({
      token,
      user,
      permissions,
      isAuthenticated: true,
    });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("permissions", JSON.stringify(permissions));
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    set({ token: null, user: null, permissions: [], isAuthenticated: false });
  },

  hasPermission: (requiredPerms) => {
    const { permissions, isAuthenticated } = get();
    if (!isAuthenticated) return false;
    if (!requiredPerms || requiredPerms.length === 0) return true;
    return requiredPerms.some((p) => permissions.includes(p));
  },
}));
