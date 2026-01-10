import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import ModalCrearCategoria from "../components/ModalCrearCategoria";
import ModalEditarCategoria from "../components/ModalEditarCategoria";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showCrear, setShowCrear] = useState(false);
  const [editCat, setEditCat] = useState(null);

  const [q, setQ] = useState("");

  const cargar = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/categorias/");
      setCategorias(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error cargando categorías";
      setError(typeof msg === "string" ? msg : "Error cargando categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return categorias;
    return categorias.filter((c) =>
      (c.nombre || "").toLowerCase().includes(term)
    );
  }, [categorias, q]);

  const eliminar = async (cat) => {
    const ok = confirm(`¿Eliminar la categoría "${cat.nombre}"?`);
    if (!ok) return;

    try {
      await api.delete(`/categorias/${cat.id}`);
      await cargar();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error eliminando categoría";
      alert(typeof msg === "string" ? msg : "Error eliminando categoría");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="text-sm text-gray-600">
            Crea y edita categorías para organizar tus productos.
          </p>
        </div>

        <button
          onClick={() => setShowCrear(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          + Nueva categoría
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:max-w-md border rounded-lg px-3 py-2"
          placeholder="Buscar categoría..."
        />
      </div>

      {/* ESTADOS */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* LISTA */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {loading ? "Cargando..." : `${filtradas.length} categorías`}
          </span>

          <button
            onClick={cargar}
            className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50"
          >
            Refrescar
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-gray-600">Cargando categorías…</div>
        ) : filtradas.length === 0 ? (
          <div className="p-6 text-gray-600">No hay categorías.</div>
        ) : (
          <div className="divide-y">
            {filtradas.map((cat) => (
              <div
                key={cat.id}
                className="px-4 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">{cat.nombre}</p>
                  <p className="text-xs text-gray-500">ID: {cat.id}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditCat(cat)}
                    className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminar(cat)}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALES */}
      {showCrear && (
        <ModalCrearCategoria
          onClose={() => setShowCrear(false)}
          onCreated={cargar}
        />
      )}

      {editCat && (
        <ModalEditarCategoria
          categoria={editCat}
          onClose={() => setEditCat(null)}
          onUpdated={cargar}
        />
      )}
    </div>
  );
}
