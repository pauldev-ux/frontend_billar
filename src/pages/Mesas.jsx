import { useEffect, useState } from "react";
import api from "../api/api";
import ModalCrearMesa from "../components/ModalCrearMesa";
import { useAuthStore } from "../store/authStore"; // si no lo tienes, quita esto

export default function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [showCrear, setShowCrear] = useState(false);

  // ✅ si tienes rol (admin/empleado)
  const { user } = useAuthStore();
  const isAdmin = user?.rol === "admin";

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const res = await api.get("/mesas/");
    setMesas(res.data);
  };

  // helper para armar URL completa de la imagen (porque llega "/static/...")
  const getMesaImageUrl = (imgPath) => {
    if (!imgPath) return null;
    const base = import.meta.env.VITE_API; // http://127.0.0.1:8000
    return `${base}${imgPath}`;
  };

  const limpiarNombreMesa = (nombre) =>
    (nombre || "").toString().replace(/^mesa\s*/i, "").trim();

  const iniciarMesa = async (id) => {
    await api.put(`/mesas/${id}`, {
      estado: "ocupada",
      hora_inicio: new Date().toISOString(),
    });
    cargar();
  };

  const cerrarMesa = async () => {
    alert("La factura se genera desde la vista de Facturación.");
  };

  const mesasOrdenadas = [...mesas].sort((a, b) =>
  (a.nombre || "").localeCompare(b.nombre || "", "es", { numeric: true, sensitivity: "base" })
);


  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Mesas</h1>

        {isAdmin && (
          <button
            onClick={() => setShowCrear(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
          >
            + Crear mesa
          </button>
        )}
      </div>

      {/* GRID DE MESAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {mesasOrdenadas.map((m) => {
          const bg = getMesaImageUrl(m.imagen);

          return (
            <div
              key={m.id}
              className="relative overflow-hidden rounded-xl shadow border"
              style={{
                backgroundImage: bg ? `url("${bg}")` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* overlay para legibilidad */}
              {bg && <div className="absolute inset-0 bg-white/65" />}

              {/* contenido */}
              <div className="relative p-4">
                <h2 className="font-bold text-lg">
                  Mesa {limpiarNombreMesa(m.nombre)}
                </h2>
                <p className="text-sm">Estado: {m.estado}</p>

                {m.estado === "libre" ? (
                  <button
                    onClick={() => iniciarMesa(m.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 mt-3 rounded w-full"
                  >
                    Iniciar
                  </button>
                ) : (
                  <button
                    onClick={() => cerrarMesa()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 mt-3 rounded w-full"
                  >
                    Cerrar
                  </button>
                )}

                {/* ✅ mini etiqueta si no hay imagen */}
                {!bg && (
                  <p className="text-xs text-gray-500 mt-2">
                    Sin imagen asignada
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CREAR MESA */}
      {showCrear && (
        <ModalCrearMesa onClose={() => setShowCrear(false)} onCreated={cargar} />
      )}
    </div>
  );
}
