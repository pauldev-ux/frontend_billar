import { useEffect, useState } from "react";
import api from "../api/api";

export default function ModalEditarCategoria({ categoria, onClose, onUpdated }) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNombre(categoria?.nombre || "");
    setError("");
  }, [categoria]);

  const guardar = async (e) => {
    e.preventDefault();
    setError("");

    const n = nombre.trim();
    if (!n) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (n === categoria.nombre) {
      setError("No hay cambios para guardar.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/categorias/${categoria.id}`, { nombre: n });
      onUpdated?.();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar categoría";
      setError(typeof msg === "string" ? msg : "Error al actualizar categoría");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-2">Editar categoría</h2>
        <p className="text-sm text-gray-600 mb-4">
          ID: <strong>{categoria.id}</strong>
        </p>

        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Nombre de la categoría"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
