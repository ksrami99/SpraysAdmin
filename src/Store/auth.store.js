import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  permissions: [],
  isAuthenticated: false,

  login: (data) => {
    const { token, user } = data;
    set({
      token,
      user,
      permissions: user.permissions || [],
      isAuthenticated: true,
    });
    localStorage.setItem("token", token);
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, permissions: [], isAuthenticated: false });
  },

  hasPermission: (requiredPerms) => {
    const { permissions, isAuthenticated } = get();
    if (!isAuthenticated) return false;
    return requiredPerms.every((p) => permissions.includes(p));
  },
}));
