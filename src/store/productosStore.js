import { create } from "zustand";
import api from "../api/api";

export const useProductosStore = create((set, get) => ({
  productos: [],
  cargando: false,

  cargarProductos: async () => {
    set({ cargando: true });
    try {
      const res = await api.get("/productos/");
      set({ productos: res.data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ cargando: false });
    }
  },

crearProducto: async (data) => {
  try {
    // ✅ Si hay archivo, usamos FormData y endpoint con-imagen
    if (data.imagenFile) {
      const formData = new FormData();
      formData.append("nombre", data.nombre);
      formData.append("precio_compra", String(data.precio_compra));
      formData.append("precio_venta", String(data.precio_venta));
      formData.append("cantidad", String(data.cantidad));
      formData.append("imagen", data.imagenFile);

      await api.post("/productos/con-imagen", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      // ✅ Sin imagen: JSON normal
      const payload = {
        nombre: data.nombre,
        precio_compra: data.precio_compra,
        precio_venta: data.precio_venta,
        cantidad: data.cantidad,
        imagen: data.imagen ?? null, // por si pegas URL
      };
      await api.post("/productos/", payload);
    }

    await get().cargarProductos();
  } catch (err) {
    console.error("Error al crear producto:", err);
  }
},


editarProducto: async (id, data) => {
  try {
    // ✅ Primero actualiza campos en JSON (sin imagenFile)
    const payload = {
      nombre: data.nombre,
      precio_compra: data.precio_compra,
      precio_venta: data.precio_venta,
      cantidad: data.cantidad,
      imagen: data.imagen ?? null, // si usan URL directa
    };

    await api.put(`/productos/${id}`, payload);

    // ✅ Si viene archivo, subir imagen por endpoint separado
    if (data.imagenFile) {
      const formData = new FormData();
      formData.append("imagen", data.imagenFile);

      await api.post(`/productos/${id}/imagen`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    await get().cargarProductos();
  } catch (err) {
    console.error("Error al editar producto:", err);
  }
},



  eliminarProducto: async (id) => {
  try {
    await api.delete(`/productos/${id}`);
    await get().cargarProductos();
  } catch (err) {
    console.error("Error al eliminar producto:", err);
  }
},

}));
