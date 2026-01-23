// src/store/mesaStore.js
import { create } from "zustand";
import api from "../api/api";

export const useMesaStore = create((set, get) => ({
  mesas: [],

  bloquearActualizacion: false,
  setBloquearActualizacion: (v) => set({ bloquearActualizacion: v }),

  cargarMesas: async () => {
    if (get().bloquearActualizacion) return;
    const res = await api.get("/mesas/");
    set({ mesas: res.data });
  },

  iniciarTurno: async (data) => {
    await api.post("/turnos/iniciar", data);
    await get().cargarMesas();
  },

  terminarTurno: async (turno_id, descuento, servicios_extras) => {
    const res = await api.patch(`/turnos/${turno_id}/cerrar`, {
      descuento: Number(descuento),
      servicios_extras: Number(servicios_extras),
    });
    await get().cargarMesas();
    return res.data;
  },

  agregarProducto: async (turno_id, producto_id, cantidad) => {
    await api.post(`/turnos/${turno_id}/agregar-producto`, {
      producto_id,
      cantidad,
    });
    await get().cargarMesas();
  },

  previewTurno: async (turno_id) => {
    const res = await api.get(`/turnos/${turno_id}/preview`);
    return res.data;
  },

  // ✅ NUEVO: pausar turno
  pausarTurno: async (turno_id) => {
    await api.patch(`/turnos/${turno_id}/pausar`);
    await get().cargarMesas();
  },

  // ✅ NUEVO: reanudar turno
  reanudarTurno: async (turno_id) => {
    await api.patch(`/turnos/${turno_id}/reanudar`);
    await get().cargarMesas();
  },

  // ✅ Transferir turno (abierto o pausado)
  transferirTurno: async (mesa_origen_id, mesa_destino_id) => {
    await api.patch(`/turnos/transferir/${mesa_origen_id}`, {
      mesa_destino_id,
    });
    await get().cargarMesas();
  },
}));
