// src/components/MesaCard.jsx
import { useMemo, useState} from "react";
import MesaTimer from "./MesaTimer";
import ModalIniciarTurno from "./ModalIniciarTurno";
import ModalAgregar from "./ModalAgregar";
import ModalCerrarTurno from "./ModalCerrarTurno";
import ModalTransferirTurno from "./ModalTransferirTurno";
import { useMesaStore } from "../store/mesaStore";

import { FaShoppingCart, FaPause, FaPlay } from "react-icons/fa";
import { MdSwapHoriz } from "react-icons/md";

export default function MesaCard({ mesa, mesas, onIniciarTurno, onRefresh }) {
  const ocupada = mesa.estado === "ocupada";

  const [showIniciar, setShowIniciar] = useState(false);
  const [showAgregar, setShowAgregar] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [showTransferir, setShowTransferir] = useState(false);

  const { pausarTurno, reanudarTurno } = useMesaStore();

  // turno_estado: "abierto" | "pausado" | null
  const turnoPausado = mesa.turno_estado === "pausado";

  // ✅ construir URL de imagen
  const base = import.meta.env.VITE_API;
  const bg = mesa.imagen ? `${base}${mesa.imagen}` : null;

  const horaInicioTxt = useMemo(() => {
    if (!mesa.hora_inicio) return "-";
    try {
      return new Date(mesa.hora_inicio).toLocaleTimeString("es-BO", { hour12: true });
    } catch {
      return "-";
    }
  }, [mesa.hora_inicio]);

  const actionGuard = () => {
    if (!mesa.turno_activo) {
      alert("No hay turno activo.");
      return false;
    }
    return true;
  };


  return (
    <div
      className="relative border rounded-xl shadow-md overflow-hidden"
      style={{
        backgroundImage: bg ? `url("${bg}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {bg && <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px]" />}

      <div
        className="relative p-3 text-sm text-gray-900 font-medium"
        style={{ textShadow: "0 1px 2px rgba(255,255,255,0.9)" }}
      >
        <h2 className="text-lg font-extrabold mb-1 tracking-tight">{mesa.nombre}</h2>

        <p className="text-sm text-gray-700 font-bold">🕒 Tiempo real</p>

        {ocupada ? (
          <>
            <div className="flex items-center justify-between mt-2">
              <p className="text-red-700 font-semibold">
                Ocupada {turnoPausado ? "(Pausada)" : ""}
              </p>

              {/* Barra de iconos (arriba del botón terminar) */}
              <div className="flex items-center gap-2">
                {/* Agregar (carrito) */}
                <button
                  title="Agregar"
                  onClick={() => {
                    if (!actionGuard()) return;
                    setShowAgregar(true);
                  }}
                  className="w-10 h-10 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white flex items-center justify-center shadow"
                >
                  <FaShoppingCart size={18} />
                </button>

                {/* Transferir (flechas) */}
                <button
                  title="Transferir"
                  onClick={() => {
                    if (!actionGuard()) return;
                    setShowTransferir(true);
                  }}
                  className="w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow"
                >
                  <MdSwapHoriz size={22} />
                </button>

                {/* Pausar / Reanudar */}
                {!turnoPausado ? (
                  <button
                    title="Pausar"
                    onClick={async () => {
                      if (!actionGuard()) return;
                      await pausarTurno(mesa.turno_activo);
                      onRefresh?.();
                    }}
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center shadow"
                  >
                    <FaPause size={18} />
                  </button>
                ) : (
                  <button
                    title="Reanudar"
                    onClick={async () => {
                      if (!actionGuard()) return;
                      await reanudarTurno(mesa.turno_activo);
                      onRefresh?.();
                    }}
                    className="w-10 h-10 rounded-lg bg-green-700 hover:bg-green-800 text-white flex items-center justify-center shadow"
                  >
                    <FaPlay size={18} />
                  </button>
                )}
              </div>
            </div>

            <p className="font-semibold mt-3">Hora inicio:</p>
            <p>{horaInicioTxt}</p>

            <p className="font-semibold mt-2">Tiempo jugado:</p>
            <MesaTimer
              inicio={mesa.hora_inicio}
              pausado={turnoPausado}
              // como no estás mandando pausa_inicio en /mesas, aquí no podemos congelar exacto con pausaInicio real
              // (igual congela si pausado cambia, y mantiene la hora inicio)
              pausaInicio={null}
            />

            <div className="mt-3">
              <button
                onClick={() => {
                  if (!actionGuard()) return;
                  setShowCerrar(true);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold shadow"
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
                mesas={mesas}
                onClose={() => setShowTransferir(false)}
                onTransferred={() => onRefresh?.()}
              />
            )}
          </>
        ) : (
          <>
            <p className="text-green-700 font-semibold mt-2">Libre</p>
            <button
              onClick={() => setShowIniciar(true)}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow font-semibold"
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
