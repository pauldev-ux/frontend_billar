import { create } from "zustand";
import api from "../api/api";

export const useGastosStore = create((set) => ({
  gastos: [],
  cargando: false,

  cargarGastos: async () => {
    set({ cargando: true });
    try {
      const res = await api.get("/gastos/");
      set({ gastos: res.data || [] });
    } catch (e) {
      console.error("Error cargando gastos:", e);
      set({ gastos: [] });
    } finally {
      set({ cargando: false });
    }
  },

  crearGasto: async (data) => {
    try {
      const payload = {
        nombre: data.nombre,
        precio: Number(data.precio) || 0,
        cantidad: Number(data.cantidad) || 1,
      };
      await api.post("/gastos/", payload);
      // recarga lista
      const res = await api.get("/gastos/");
      set({ gastos: res.data || [] });
    } catch (e) {
      console.error("Error creando gasto:", e);
      throw e;
    }
  },
}));
