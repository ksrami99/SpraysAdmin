import api from "../api/api";
import { useAuthStore } from "../Store/auth.store";

export const loginService = async (email, password) => {
  const { login } = useAuthStore.getState();

  const res = await api.post("/auth/login", { email, password });

  if (res.data.success) {
    login(res.data.data); // data = { token, user }
  }

  return res.data;
};
