import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useGastosStore } from "../store/gastosStore";

function money(n) {
  return `${(Number(n) || 0).toFixed(2)} Bs`;
}

// ✅ convierte a Date seguro (acepta ISO "2026-01-16T21:15:40", "2026-01-16 21:15:40", etc.)
function toDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const s = String(value);

  // si viene "YYYY-MM-DD HH:mm:ss" lo pasamos a ISO "YYYY-MM-DDTHH:mm:ss"
  const normalized = s.includes(" ") && !s.includes("T") ? s.replace(" ", "T") : s;

  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ✅ arma rango (inicio 00:00:00 / fin 23:59:59) usando inputs type="date"
function rangoFromInputs(fechaInicio, fechaFin) {
  const start = fechaInicio ? new Date(`${fechaInicio}T00:00:00`) : null;
  const end = fechaFin ? new Date(`${fechaFin}T23:59:59`) : null;
  return { start, end };
}

export default function Gastos() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === "admin";

  const { gastos, cargando, cargarGastos, crearGasto } = useGastosStore();

  // Form
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [error, setError] = useState("");

  // ✅ NUEVO: filtros por fecha (solo frontend)
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    if (isAdmin) cargarGastos();
  }, [isAdmin]);

  // ✅ IMPORTANTÍSIMO: aquí defines de qué campo sale la fecha
  const getFechaGasto = (g) => {
    // intenta varios nombres comunes
    return (
      g?.created_at ||
      g?.fecha ||
      g?.createdAt ||
      g?.created ||
      null
    );
  };

  // ✅ filtro en cliente
  const gastosFiltrados = useMemo(() => {
    const { start, end } = rangoFromInputs(fechaInicio, fechaFin);
    if (!start && !end) return gastos || [];

    return (gastos || []).filter((g) => {
      const d = toDateSafe(getFechaGasto(g));
      if (!d) return false;

      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [gastos, fechaInicio, fechaFin]);

  const totalFiltrado = useMemo(() => {
    return gastosFiltrados.reduce((acc, g) => acc + Number(g?.total ?? g?.subtotal ?? 0), 0);
  }, [gastosFiltrados]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const p = Number(precio);
    const c = Number(cantidad);

    if (!nombre.trim()) return setError("Nombre requerido");
    if (Number.isNaN(p) || p <= 0) return setError("Precio inválido");
    if (Number.isNaN(c) || c <= 0) return setError("Cantidad inválida");

    try {
      await crearGasto({
        nombre: nombre.trim(),
        precio: p,
        cantidad: c,
      });

      // recargar lista (backend igual que antes)
      await cargarGastos();

      setNombre("");
      setPrecio("");
      setCantidad("1");
    } catch (err) {
      console.error(err);
      setError("No se pudo registrar el gasto");
    }
  };

  const limpiarFiltro = () => {
    setFechaInicio("");
    setFechaFin("");
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          Solo admin puede ver Gastos.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <div className="text-sm text-gray-600">
          Usuario: <strong>{user?.username || "—"}</strong>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white border rounded-xl p-5 shadow-sm mb-4">
        <h2 className="font-semibold mb-3">Registrar gasto</h2>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="border rounded-lg px-3 py-2 md:col-span-2"
            placeholder="Nombre del gasto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Precio (Bs)"
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Cantidad"
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />

          <div className="md:col-span-4 flex items-center justify-between mt-2">
            {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              type="submit"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>

      {/* LISTADO + FILTRO */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Historial</h2>
          <button
            onClick={cargarGastos}
            className="text-sm border px-3 py-1 rounded-lg"
            disabled={cargando}
          >
            {cargando ? "Cargando..." : "Refrescar"}
          </button>
        </div>

        {/* ✅ FILTRO SOLO FRONT */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Desde</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600">Hasta</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={limpiarFiltro}
              className="border px-4 py-2 rounded-lg"
              type="button"
            >
              Limpiar
            </button>
          </div>

          <div className="md:ml-auto text-sm text-gray-700 flex items-center">
            Total filtrado: <strong className="ml-2">{money(totalFiltrado)}</strong>
          </div>
        </div>

        {/* TABLA */}
        {gastosFiltrados.length === 0 ? (
          <div className="text-sm text-gray-600">No hay gastos en ese rango.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-right">Precio</th>
                  <th className="p-3 text-right">Cantidad</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {gastosFiltrados.map((g) => {
                  const d = toDateSafe(getFechaGasto(g));
                  const fechaTxt = d ? d.toLocaleString("es-BO") : "—";

                  const precioN = Number(g?.precio ?? 0);
                  const cantN = Number(g?.cantidad ?? 0);
                  const totalN =
                    g?.total != null
                      ? Number(g.total)
                      : g?.subtotal != null
                      ? Number(g.subtotal)
                      : precioN * cantN;

                  return (
                    <tr key={g.id} className="border-t">
                      <td className="p-3 text-sm text-gray-600">{fechaTxt}</td>
                      <td className="p-3">{g.nombre}</td>
                      <td className="p-3 text-right">{money(precioN)}</td>
                      <td className="p-3 text-right">{cantN}</td>
                      <td className="p-3 text-right font-bold">{money(totalN)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
