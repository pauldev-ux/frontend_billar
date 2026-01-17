import { create } from "zustand";

const KEY = "arqueo_local_v1";

const defaults = {
  activo: false,
  inicioISO: null,
  montoInicial: 0,
  movimientos: [], // { key, mesa, total, hora }
  cerradoISO: null,
  montoDejado: null,
  montoEntregado: null,
};

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const save = (state) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
};

const initial = { ...defaults, ...(load() || {}) };

export const useArqueoStore = create((set, get) => ({
  ...initial,

  iniciar: (montoInicial) => {
    const next = {
      activo: true,
      inicioISO: new Date().toISOString(),
      montoInicial: Number(montoInicial) || 0,
      movimientos: [],
      cerradoISO: null,
      montoDejado: null,
      montoEntregado: null,
    };
    set(next);
    save(next);
  },

  // ✅ ya no necesita turno_id (usa key)
  registrarTurno: ({ key, mesa, total, hora }) => {
    const st = get();
    if (!st.activo) return;

    if (!key) return;

    // evita duplicados
    if (st.movimientos.some((m) => m.key === key)) return;

    const nuevo = {
      key,
      mesa: mesa || "Mesa",
      total: Number(total) || 0,
      hora: hora || new Date().toISOString(),
    };

    const next = { ...st, movimientos: [nuevo, ...st.movimientos] };
    set(next);
    save(next);
  },

  terminar: ({ montoDejado, montoEntregado }) => {
    const st = get();
    if (!st.activo) return;

    const next = {
      ...st,
      activo: false,
      cerradoISO: new Date().toISOString(),
      montoDejado: Number(montoDejado) || 0,
      montoEntregado: Number(montoEntregado) || 0,
    };
    set(next);
    save(next);
  },

  // ✅ tú dijiste eliminar "limpiar", así que puedes borrar este método
  limpiar: () => {
    set(defaults);
    save(defaults);
  },

  totalVentas: () => {
    const st = get();
    return st.movimientos.reduce((acc, m) => acc + (Number(m.total) || 0), 0);
  },

  totalEsperadoEnCaja: () => {
    const st = get();
    return (Number(st.montoInicial) || 0) + get().totalVentas();
  },
}));
