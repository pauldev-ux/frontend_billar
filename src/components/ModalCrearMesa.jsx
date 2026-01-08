import { useState } from "react";
import api from "../api/api";

export default function ModalCrearMesa({ onClose, onCreated }) {
  const [nombre, setNombre] = useState("");
  const [tarifa, setTarifa] = useState(20);

  // ✅ NUEVO
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImagen(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const crearMesa = async (e) => {
    e.preventDefault();
    setSubiendo(true);

    try {
      // Si hay imagen -> usamos multipart
      if (imagen) {
        const fd = new FormData();
        fd.append("nombre", nombre);
        fd.append("tarifa_por_hora", String(tarifa));
        fd.append("imagen", imagen);

        await api.post("/mesas/con-imagen", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // sin imagen -> endpoint normal
        await api.post("/mesas/", {
          nombre,
          tarifa_por_hora: tarifa,
          tipo_tiempo: "real",
          tiempo_default_min: 0,
          // imagen: null (opcional)
        });
      }

      onCreated();
      onClose();
    } catch (err) {
      console.error("Error creando mesa:", err);
      alert("Error creando mesa. Revisa consola / backend.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[380px]">
        <h2 className="text-xl font-bold mb-4">Crear nueva mesa</h2>

        <form onSubmit={crearMesa} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tarifa por hora (Bs)</label>
            <input
              type="number"
              value={tarifa}
              onChange={(e) => setTarifa(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
              min="0"
              required
            />
          </div>

          {/* ✅ NUEVO: IMAGEN */}
          <div>
            <label className="text-sm font-medium">Imagen (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="w-full border px-3 py-2 rounded"
            />

            {preview && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-1">Vista previa:</p>
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={subiendo}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={subiendo}
            >
              {subiendo ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
