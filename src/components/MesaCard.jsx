import { useState } from "react";
import MesaTimer from "./MesaTimer";
import ModalIniciarTurno from "./ModalIniciarTurno";
import ModalAgregar from "./ModalAgregar";
import ModalCerrarTurno from "./ModalCerrarTurno";
import ModalTransferirTurno from "./ModalTransferirTurno";

export default function MesaCard({ mesa, mesas, onIniciarTurno, onRefresh }) {
  const ocupada = mesa.estado === "ocupada";

  const [showIniciar, setShowIniciar] = useState(false);
  const [showAgregar, setShowAgregar] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [showTransferir, setShowTransferir] = useState(false);

  // ✅ construir URL de imagen
  const base = import.meta.env.VITE_API;
  const bg = mesa.imagen ? `${base}${mesa.imagen}` : null;

  return (
    <div
      className="relative border rounded-xl shadow-md overflow-hidden"
      style={{
        backgroundImage: bg ? `url("${bg}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay para que se lea bien */}
      {bg && <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px]" />}

      {/* CONTENIDO */}
      <div
        className="relative p-3 text-sm text-gray-900 font-medium"
        style={{
          textShadow: "0 1px 2px rgba(255,255,255,0.9)",
        }}
      >
        <h2 className="text-lg font-extrabold mb-1 tracking-tight">
          Mesa {mesa.nombre}
        </h2>

        <p className="text-sm text-gray-600 font-bold">🕒 Tiempo real</p>

        {ocupada ? (
          <>
            <p className="text-red-700 font-semibold mt-2">Ocupada</p>

            <p className="font-semibold mt-2">Hora inicio:</p>
            <p>
              {mesa.hora_inicio
                ? new Date(mesa.hora_inicio).toLocaleTimeString("es-BO", {
                    hour12: true,
                  })
                : "-"}
            </p>

            <p className="font-semibold mt-2">Tiempo en curso:</p>
            <MesaTimer inicio={mesa.hora_inicio} />

            <div className="mt-2 space-y-2">
              <button
                onClick={() => {
                  if (!mesa.turno_activo) {
                    alert("No hay turno activo.");
                    return;
                  }
                  setShowAgregar(true);
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg"
              >
                Agregar
              </button>

              <button
                onClick={() => {
                  if (!mesa.turno_activo) {
                    alert("No hay turno activo.");
                    return;
                  }
                  setShowTransferir(true);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
              >
                Transferir turno
              </button>

              <button
                onClick={() => {
                  if (!mesa.turno_activo) {
                    alert("No hay turno activo.");
                    return;
                  }
                  setShowCerrar(true);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
              >
                Terminar turno
              </button>
            </div>

            {showCerrar && (
              <ModalCerrarTurno
                turnoId={mesa.turno_activo}
                mesaNombre={mesa.nombre}
                onClose={() => setShowCerrar(false)}
              />
            )}

            {showAgregar && (
              <ModalAgregar
                turnoId={mesa.turno_activo}
                mesaNombre={mesa.nombre}
                onClose={() => setShowAgregar(false)}
              />
            )}

            {showTransferir && (
              <ModalTransferirTurno
                mesaOrigen={mesa}
                mesas={mesas} // ✅ NECESARIO PARA LISTAR DESTINOS
                onClose={() => setShowTransferir(false)}
                onTransferred={() => {
                  onRefresh?.(); // ✅ REFRESH REAL (mueve turno_activo a otra mesa)
                }}
              />
            )}
          </>
        ) : (
          <>
            <p className="text-green-700 font-semibold">Libre</p>
            <button
              onClick={() => setShowIniciar(true)}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Iniciar turno
            </button>
          </>
        )}

        {showIniciar && (
          <ModalIniciarTurno
            mesa={mesa}
            onClose={() => setShowIniciar(false)}
            onIniciar={onIniciarTurno}
          />
        )}
      </div>
    </div>
  );
}
