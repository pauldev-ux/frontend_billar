import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../api/api";
import html2pdf from "html2pdf.js";
import "../pdf.css"; // evita error oklch

export default function Reportes() {
  const [mesas, setMesas] = useState([]);
  const [mesaId, setMesaId] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    try {
      const res = await api.get("/mesas/");
      const opciones = [
        { value: "", label: "Todas" },
        ...res.data.map((m) => ({
          value: m.id,
          label: m.nombre,
        })),
      ];
      setMesas(opciones);
    } catch (e) {
      console.error(e);
    }
  };

  const convertirFechaISO = (f) => {
    if (!f) return "";
    if (f.includes("-")) return f;
    const [dia, mes, año] = f.split("/");
    return `${año}-${mes}-${dia}`;
  };

  const buscar = async () => {
    setError("");
    setCargando(true);
    try {
      const inicioISO = convertirFechaISO(fechaInicio);
      const finISO = convertirFechaISO(fechaFin);

      if (!inicioISO || !finISO) {
        setError("Selecciona fecha inicio y fecha fin.");
        setReporte(null);
        return;
      }

      const res = await api.get("/reportes/", {
        params: {
          fecha_inicio: inicioISO,
          fecha_fin: finISO,
          mesa_id: mesaId?.value || undefined,
        },
      });

      setReporte(res.data);
    } catch (e) {
      console.error(e);
      setError("No se pudo generar el reporte. Revisa el backend.");
      setReporte(null);
    } finally {
      setCargando(false);
    }
  };

// Convierte "2026-01-16 21:15:00" -> Date válido
const parseDT = (s) => {
  if (!s) return null;
  if (s.includes("T")) return new Date(s);
  return new Date(s.replace(" ", "T"));
};

const formatearFecha = (fecha) => {
  const d = parseDT(fecha);
  if (!d || isNaN(d.getTime())) return "N/D";
  return d.toLocaleDateString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatearHora = (fecha) => {
  const d = parseDT(fecha);
  if (!d || isNaN(d.getTime())) return "N/D";
  return d.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

  const money = (n) => Number(n ?? 0).toFixed(2);

  // EXPORTAR PDF
  const exportarPDF = () => {
    const elemento = document.getElementById("reportePDF");
    if (!elemento) return;

    const opciones = {
      margin: 5,
      filename: `reporte_${fechaInicio}_a_${fechaFin}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opciones).from(elemento).save();
  };

  const limpiarNombreMesa = (mesa) => {
    if (!mesa) return "";
    // Si viene "mesa 1" o "Mesa 1", evitamos repetir "Mesa Mesa 1"
    return mesa.toString().replace(/^mesa\s*/i, "").trim();
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Informe de arqueo (Reportes)</h1>

      {/* FILTROS */}
      <div className="flex flex-col gap-4 mb-6">
        <input
          type="date"
          className="border p-2 rounded"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />

        <Select
          value={mesaId}
          onChange={setMesaId}
          options={mesas}
          placeholder="Mesa"
          className="text-left"
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            menu: (base) => ({ ...base, maxWidth: "90vw" }),
          }}
        />

        <button
          onClick={buscar}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={cargando}
        >
          {cargando ? "Buscando..." : "Buscar"}
        </button>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* SI HAY REPORTE */}
      {reporte && (
        <>
          {/* BOTÓN EXPORTAR */}
          <button
            onClick={exportarPDF}
            className="bg-red-600 text-white px-4 py-2 rounded mb-4"
          >
            Exportar PDF
          </button>

          {/* CONTENIDO DEL PDF */}
          <div id="reportePDF" className="pdf-safe">
            {/* TÍTULO DEL PDF */}
            <h1 className="pdf-title" style={{ textAlign: "center" }}>
              REPORTE DE TURNOS
            </h1>

            {/* RANGO DE FECHAS */}
            <p
              style={{
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              <strong>Rango consultado:</strong> {fechaInicio} — {fechaFin}
            </p>

            {reporte.turnos.length === 0 ? (
              <p>No hay resultados en este rango.</p>
            ) : (
              reporte.turnos.map((t, i) => {
                const totalProductosTurno = (t.consumos || []).reduce(
                  (acc, c) => acc + Number(c.subtotal ?? 0),
                  0
                );

                return (
                  <div key={i} className="pdf-card">
                    <h2 className="pdf-subtitle">
                      Mesa {limpiarNombreMesa(t.mesa)}
                    </h2>

                    <p>
                      <strong>Atendido por:</strong>{" "}
                      {t.atendido_por ?? "N/D"}
                    </p>

                    <p>
                      <strong>Facturado por:</strong>{" "} 
                      {t.facturado_por ?? "N/D"}
                    </p>


                    <p>
                      <strong>Inicio:</strong> {formatearFecha(t.hora_inicio)} — {formatearHora(t.hora_inicio)}
                    </p>
                    <p>
                      <strong>Fin:</strong> {formatearFecha(t.hora_fin)} — {formatearHora(t.hora_fin)}
                    </p>

                    <p>
                      <strong>Tiempo jugado:</strong> {t.tiempo_total_min}{" "}
                      minutos
                    </p>

                    <p>
                      <strong>Tiempo Bs:</strong> {money(t.subtotal_tiempo)} Bs
                    </p>

                    <p>
                      <strong>Consumo:</strong> {money(t.subtotal_productos)} Bs
                    </p>

                    <p>
                      <strong>Descuentos:</strong> {money(t.descuento)} Bs
                    </p>

                    <p>
                      <strong>Servicios extra:</strong>{" "}
                      {money(t.servicios_extras)} Bs
                    </p>

                    <p className="pdf-total">
                      TOTAL: {money(t.total_final)} Bs
                    </p>

                    <hr />

                    <h3 className="pdf-subtitle">Productos</h3>

                    {(!t.consumos || t.consumos.length === 0) ? (
                      <p>Sin consumos</p>
                    ) : (
                      <>
                        <ul>
                          {t.consumos.map((c, j) => (
                            <li key={j}>
                              • {c.cantidad} × {c.producto_nombre} —{" "}
                              {money(c.subtotal)} Bs
                            </li>
                          ))}
                        </ul>

                        <p style={{ marginTop: "10px" }}>
                          <strong>Total productos del turno:</strong>{" "}
                          {money(totalProductosTurno)} Bs
                        </p>
                      </>
                    )}
                  </div>
                );
              })
            )}

            {/* TOTAL GENERAL */}
            <div className="pdf-card">
              <h3 className="pdf-title">TOTAL GENERAL</h3>

              <p>
                <strong>Total tiempo:</strong> {money(reporte.total_tiempo)} Bs
              </p>

              <p>
                <strong>Total productos:</strong>{" "}
                {money(reporte.total_productos)} Bs
              </p>

              <p>
                <strong>Total descuentos:</strong>{" "}
                {money(reporte.total_descuentos)} Bs
              </p>

              <p>
                <strong>Total servicios extra:</strong>{" "}
                {money(reporte.total_servicios_extras)} Bs
              </p>

              <p className="pdf-total">
                TOTAL: {money(reporte.total_general)} Bs
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
