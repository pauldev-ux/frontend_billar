import { useEffect, useState } from "react";
import { useMesaStore } from "../store/mesaStore";
import MesaCard from "../components/MesaCard";
import ModalCrearMesa from "../components/ModalCrearMesa";

export default function Dashboard() {
  const {
    mesas,
    cargarMesas,
    iniciarTurno,
    terminarTurno,
    bloquearActualizacion,
  } = useMesaStore();

  const [showCrear, setShowCrear] = useState(false);

  useEffect(() => {
    cargarMesas();

    const interval = setInterval(() => {
      if (!bloquearActualizacion) {
        cargarMesas();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [bloquearActualizacion, cargarMesas]);

  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mesas</h1>

        <button
          onClick={() => setShowCrear(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          + Crear mesa
        </button>
      </div>

      {/* GRID DE MESAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {mesas.map((mesa) => (
          <MesaCard
            key={mesa.id}
            mesa={mesa}
            mesas={mesas}                // ✅ PASAMOS TODAS LAS MESAS (para elegir destino)
            onIniciarTurno={iniciarTurno}
            onTerminarTurno={terminarTurno}
            onRefresh={cargarMesas}      // ✅ REFRESH REAL al transferir
          />
        ))}
      </div>

      {showCrear && (
        <ModalCrearMesa
          onClose={() => setShowCrear(false)}
          onCreated={cargarMesas}
        />
      )}
    </>
  );
}
