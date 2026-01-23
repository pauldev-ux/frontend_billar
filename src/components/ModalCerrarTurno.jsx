import { useEffect, useState } from "react";
import { useMesaStore } from "../store/mesaStore";
import FacturaModal from "./FacturaModal";

export default function ModalCerrarTurno({ turnoId, mesaNombre, onClose }) {
  const { previewTurno, terminarTurno, setBloquearActualizacion } = useMesaStore();

  const [preview, setPreview] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [extras, setExtras] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [facturaData, setFacturaData] = useState(null);

  // ==========================
  //       CARGAR PREVIEW
  // ==========================
  useEffect(() => {
  if (!turnoId) return;

  setBloquearActualizacion(true);   // ✅ bloquear apenas abre
  cargarPreview();

  return () => {
    setBloquearActualizacion(false); // ✅ si se cierra/desmonta, desbloquea
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [turnoId]);


  const cargarPreview = async () => {
    try {
      const data = await previewTurno(turnoId);
      setPreview(data);
    } catch (error) {
      console.error("Error cargando preview:", error);
    }
  };

  // ==========================
  //     CALCULAR TIEMPO
  // ==========================
const calcularSegundosEfectivos = () => {
  if (!preview?.hora_inicio) return 0;

  const inicio = new Date(preview.hora_inicio);
  const ahora = new Date();

  // total desde inicio (seg)
  const total = Math.floor((ahora - inicio) / 1000);

  // pausas ya acumuladas
  let pausaTotal = Number(preview.pausa_acumulada_seg || 0);

  // si sigue pausado AHORA, sumar lo que va de esta pausa
  // (preview.estado == "pausado" y preview.pausa_inicio existe)
  if (preview.estado === "pausado" && preview.pausa_inicio) {
    const pausaInicio = new Date(preview.pausa_inicio);
    pausaTotal += Math.floor((ahora - pausaInicio) / 1000);
  }

  const efectivos = total - pausaTotal;
  return efectivos > 0 ? efectivos : 0;
};

const calcularMinutosJugados = () => {
  const seg = calcularSegundosEfectivos();
  return Math.floor(seg / 60);
};


  const calcularSubtotalTiempo = () => {
    if (!preview) return 0;

    const tarifa = preview.tarifa_hora;
    const minutos = calcularMinutosJugados();

    const horasCompletas = Math.floor(minutos / 60);
    const restantes = minutos % 60;

    let subtotal = horasCompletas * tarifa;

    if (restantes > 0 && restantes <= 30) {
      subtotal += tarifa * 0.5;
    } else if (restantes > 30) {
      subtotal += tarifa;
    }

    return subtotal;
  };

  // ==========================
  //       FINALIZAR TURNO
  // ==========================
const finalizarTurno = async () => {
  try {
    const segundosEfectivos = calcularSegundosEfectivos(); // ✅ AQUÍ
    const minutosJugados = Math.floor(segundosEfectivos / 60);

    // 👇 cobramos con BACKEND (pero ojo punto #2)
    const subtotalTiempo = Number(preview.subtotal_tiempo || 0);

    const res = await terminarTurno(turnoId, descuento, extras); // ✅ guarda respuesta

    // ✅ usar lo que devuelve el backend al cerrar (más confiable)
    const subtotalTiempoFinal = Number(res.subtotal_tiempo || subtotalTiempo);
    const subtotalProductosFinal = Number(res.subtotal_productos || preview.subtotal_productos);

    const factura = {
      mesa: mesaNombre,
      minutosJugados,
      tiempoTexto: `${Math.floor(minutosJugados / 60)}h ${minutosJugados % 60}m`,
      subtotalTiempo: subtotalTiempoFinal,
      subtotalProductos: subtotalProductosFinal,
      productos: res.consumos ?? preview.consumos,
      descuento: Number(descuento),
      extras: Number(extras),
      observaciones,
      total: subtotalTiempoFinal + subtotalProductosFinal - Number(descuento) + Number(extras),
    };

    setFacturaData(factura);
  } catch (error) {
    console.error("Error al cerrar turno:", error);
  }
};


  if (!preview) return null;

  const minutosJugados = calcularMinutosJugados();
  const subtotalTiempoFront = Number(preview.subtotal_tiempo || 0);
  const totalFront =
    subtotalTiempoFront +
    preview.subtotal_productos -
    Number(descuento) +
    Number(extras);

  return (
    <>
      {!facturaData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[450px] max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-3">
              Cerrar turno — Mesa {mesaNombre}
            </h2>

            {/* ======================== */}
            {/*      TIEMPO JUGADO       */}
            {/* ======================== */}
            <div className="border p-3 rounded mb-4">
              <h3 className="font-semibold mb-2">Tiempo de juego</h3>

              <p>
                Hora de inicio:{" "}
                <strong>
                  {new Date(preview.hora_inicio).toLocaleTimeString("es-BO", {
                    hour12: true,
                  })}
                </strong>
              </p>

              <p className="mt-1">
                Tiempo jugado:{" "}
                <strong>
                  {Math.floor(minutosJugados / 60)}h {minutosJugados % 60}m
                </strong>
              </p>

              <p className="mt-1">
                Subtotal tiempo:{" "}
                <strong>{subtotalTiempoFront.toFixed(2)} Bs</strong>
              </p>
            </div>

            {/* ======================== */}
            {/*     PRODUCTOS            */}
            {/* ======================== */}
            <div className="border p-3 rounded mb-4">
              <h3 className="font-semibold mb-2">Productos consumidos</h3>

              {preview.consumos.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  Ningún producto consumido
                </p>
              ) : (
                <ul className="text-sm">
                  {preview.consumos.map((c) => (
                    <li key={c.id}>
                      • {c.cantidad} × {c.producto_nombre} — {c.subtotal} Bs
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-1">
                Subtotal productos:{" "}
                <strong>{preview.subtotal_productos.toFixed(2)} Bs</strong>
              </p>
            </div>

            {/* ======================== */}
            {/*      DESCUENTO           */}
            {/* ======================== */}
            <div className="border p-3 rounded mb-4">
              <h3 className="font-semibold mb-2">Descuento</h3>
              <input
                type="number"
                className="border px-3 py-2 rounded w-full"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
            </div>

            {/* ======================== */}
            {/*       EXTRAS             */}
            {/* ======================== */}
            <div className="border p-3 rounded mb-4">
              <h3 className="font-semibold mb-2">Servicios extras</h3>
              <input
                type="number"
                className="border px-3 py-2 rounded w-full"
                value={extras}
                onChange={(e) => setExtras(e.target.value)}
              />
            </div>

            {/* ======================== */}
            {/*    OBSERVACIONES         */}
            {/* ======================== */}
            <div className="border p-3 rounded mb-4">
              <h3 className="font-semibold mb-2">Observaciones</h3>
              <textarea
                rows={3}
                className="border px-3 py-2 rounded w-full"
                placeholder="Escribe una nota opcional..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>

            {/* ======================== */}
            {/*         TOTAL            */}
            {/* ======================== */}
            <p className="text-xl font-bold mb-4">
              TOTAL: {totalFront.toFixed(2)} Bs
            </p>

            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancelar
              </button>

              <button
                onClick={finalizarTurno}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================== */}
      {/*    FACTURA FINAL         */}
      {/* ======================== */}
      {facturaData && (
        <FacturaModal
          data={facturaData}
          onClose={() => {
            setBloquearActualizacion(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
