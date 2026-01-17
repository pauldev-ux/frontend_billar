// src/pages/Arqueo.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { useArqueoStore } from "../store/arqueoStore";
import { useAuthStore } from "../store/authStore";

function fmtMoney(n) {
  return `${(Number(n) || 0).toFixed(2)} Bs`;
}

function fmtDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}h ${m}m ${ss}s`;
}

const toISODate = (iso) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function Arqueo() {
  const { user } = useAuthStore();

  const {
    activo,
    inicioISO,
    montoInicial,
    movimientos,
    cerradoISO,
    montoDejado,
    montoEntregado,
    iniciar,
    terminar,
    totalVentas,
    totalEsperadoEnCaja,
    registrarTurno, // ✅ IMPORTANTE
  } = useArqueoStore();

  const [cambio, setCambio] = useState("");
  const [showCerrar, setShowCerrar] = useState(false);
  const [dejo, setDejo] = useState("");
  const [entrego, setEntrego] = useState("");

  // ✅ Timer real para que el cronómetro avance
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    if (!activo) return;
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activo]);

  const tiempo = useMemo(() => {
    if (!inicioISO) return "0h 0m 0s";
    const ini = new Date(inicioISO).getTime();
    return fmtDuration(tick - ini);
  }, [inicioISO, tick]);

  const ventas = totalVentas();
  const esperado = totalEsperadoEnCaja();

  const handleIniciar = () => {
    const val = Number(cambio);
    if (Number.isNaN(val)) return;
    iniciar(val);
    setCambio("");
  };

  const handleTerminar = () => {
    terminar({
      montoDejado: dejo,
      montoEntregado: entrego,
    });
    setShowCerrar(false);
  };

  // ✅ Polling: trae turnos cerrados desde /reportes y suma los que cierran dentro del rango
  useEffect(() => {
    if (!activo || !inicioISO) return;

    const poll = async () => {
      try {
        const iniMs = new Date(inicioISO).getTime();
        const finMs = Date.now();

        // Consultamos reportes del día de inicio hasta hoy (por si pasa medianoche)
        const fechaIni = toISODate(inicioISO);
        const fechaFin = toISODate(new Date().toISOString());

        const res = await api.get("/reportes/", {
          params: { fecha_inicio: fechaIni, fecha_fin: fechaFin },
        });

        const turnos = res.data?.turnos || [];

        for (const t of turnos) {
          // Solo si tiene hora_fin
          const hf = t.hora_fin ? new Date(t.hora_fin).getTime() : null;
          if (!hf) continue;

          // Solo turnos cerrados durante el arqueo (por hora_fin)
          if (hf < iniMs || hf > finMs) continue;

          // ✅ Key estable (porque reportes no trae turno_id)
          const key = `${t.mesa}|${t.hora_fin}|${Number(t.total_final ?? 0)}`;

          // Normaliza mesa (si ya viene "billar 3", lo mostramos bonito)
          const mesaLabel = String(t.mesa ?? "Mesa").trim();
          const mesaTxt = mesaLabel.toLowerCase().startsWith("mesa")
            ? mesaLabel
            : `Mesa ${mesaLabel}`;

          registrarTurno({
            key,
            mesa: mesaTxt,
            total: Number(t.total_final ?? 0),
            hora: t.hora_fin,
          });
        }
      } catch (e) {
        console.error("Error cargando turnos para arqueo:", e);
      }
    };

    poll();
    const id = setInterval(poll, 5000); // cada 5s
    return () => clearInterval(id);
  }, [activo, inicioISO, registrarTurno]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Arqueo (control interno)</h1>

        <div className="text-sm text-gray-600">
          Usuario: <strong>{user?.username || "—"}</strong>
        </div>
      </div>

      {/* INICIAR */}
      {!activo && (
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">
            Ingresa el dinero de cambio con el que comienzas.
          </p>

          <div className="flex gap-3 flex-wrap">
            <input
              type="number"
              className="border rounded-lg px-3 py-2 w-56"
              placeholder="Cambio inicial (Bs)"
              value={cambio}
              onChange={(e) => setCambio(e.target.value)}
            />
            <button
              onClick={handleIniciar}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Iniciar
            </button>
          </div>

          {cerradoISO && (
            <div className="mt-4 text-sm text-gray-700">
              <p>
                Último cierre:{" "}
                <strong>{new Date(cerradoISO).toLocaleString("es-BO")}</strong>
              </p>
              <p>
                Dejado en caja: <strong>{fmtMoney(montoDejado)}</strong>
              </p>
              <p>
                Entregado: <strong>{fmtMoney(montoEntregado)}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ACTIVO */}
      {activo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PANEL IZQ */}
          <div className="md:col-span-1 bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold mb-2">Estado</h2>
            <p className="text-sm text-gray-700">
              Inicio:{" "}
              <strong>
                {inicioISO
                  ? new Date(inicioISO).toLocaleString("es-BO")
                  : "—"}
              </strong>
            </p>
            <p className="text-sm text-gray-700">
              Tiempo: <strong>{tiempo}</strong>
            </p>

            <div className="mt-4 border-t pt-4 space-y-1">
              <p className="text-sm">
                Cambio inicial: <strong>{fmtMoney(montoInicial)}</strong>
              </p>
              <p className="text-sm">
                Ventas (turnos cerrados): <strong>{fmtMoney(ventas)}</strong>
              </p>
              <p className="text-lg font-bold">
                Total esperado en caja:{" "}
                <span className="text-blue-600">{fmtMoney(esperado)}</span>
              </p>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowCerrar(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full"
              >
                Terminar
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Se suman turnos cuyo <strong>fin</strong> cae dentro del arqueo
              activo (aunque hayan iniciado antes).
            </p>
          </div>

          {/* LISTA MOVIMIENTOS */}
          <div className="md:col-span-2 bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Turnos cerrados</h2>
              <span className="text-xs text-gray-500">
                {movimientos.length} registro(s)
              </span>
            </div>

            {movimientos.length === 0 ? (
              <div className="text-sm text-gray-600">
                Aún no se han registrado turnos.
                <div className="mt-2 text-xs text-gray-500">
                  Se cargan solos desde Reportes cada pocos segundos.
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {movimientos.map((m) => (
                  <div
                    key={m.key}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{m.mesa}</div>
                      <div className="text-xs text-gray-500">
                        {m.hora
                          ? new Date(m.hora).toLocaleString("es-BO", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>
                    </div>
                    <div className="font-bold text-gray-800">
                      {fmtMoney(m.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CIERRE */}
      {showCerrar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-2">Cerrar arqueo</h2>

            <p className="text-sm text-gray-700 mb-3">
              Total esperado en caja:{" "}
              <strong className="text-blue-600">{fmtMoney(esperado)}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-sm block mb-1">
                  Dinero que dejas en caja (Bs)
                </label>
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={dejo}
                  onChange={(e) => setDejo(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm block mb-1">
                  Dinero que entregas (Bs)
                </label>
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={entrego}
                  onChange={(e) => setEntrego(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowCerrar(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleTerminar}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
