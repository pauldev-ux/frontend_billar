// src/store/authStore.js
import { create } from "zustand";
import api from "../api/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: true,

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return set({ loading: false });

    try {
      const res = await api.get("/users/me");
      set({ user: res.data, loading: false });
    } catch (err) {
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },

login: async (username, password) => {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const res = await api.post("/auth/login", form);

  localStorage.setItem("token", res.data.access_token);
  set({ token: res.data.access_token });

  const userRes = await api.get("/users/me");
  set({ user: userRes.data });

  return true;
},


  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
