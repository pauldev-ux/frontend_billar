import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuthStore } from "../store/authStore";

export default function Facturacion() {
  const { user } = useAuthStore();
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [consumos, setConsumos] = useState([]);
  const [factura, setFactura] = useState(null);

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    const res = await api.get("/mesas/");
    setMesas(res.data.filter((m) => m.estado === "ocupada"));
  };

  const seleccionarMesa = async (id) => {
    setMesaSeleccionada(id);
    const res = await api.get(`/consumos/mesa/${id}`);
    setConsumos(res.data);
    setFactura(null);
  };

  const generarFactura = async () => {
    try {
      const res = await api.post("/facturas/", {
        mesa_id: mesaSeleccionada,
        usuario_id: user.id
      });
      setFactura(res.data);

      // recargar mesas
      cargarMesas();
    } catch (e) {
      alert("Error generando factura");
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Facturación</h1>

      {/* Mesas ocupadas */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Mesas Ocupadas</h2>
        <div className="flex gap-4">
          {mesas.length === 0 && <p>No hay mesas ocupadas</p>}

          {mesas.map((m) => (
            <button
              key={m.id}
              className={`px-4 py-2 rounded shadow ${
                mesaSeleccionada === m.id ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => seleccionarMesa(m.id)}
            >
              {m.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Consumos */}
      {mesaSeleccionada && (
        <div>
          <h2 className="text-xl font-bold mb-3">Consumos de la mesa</h2>

          <table className="w-full mb-6">
            <thead>
              <tr className="bg-gray-300">
                <th className="p-2">Producto</th>
                <th className="p-2">Cantidad</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {consumos.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">{c.producto_id}</td>
                  <td className="p-2">{c.cantidad}</td>
                  <td className="p-2">{c.precio_unitario} Bs</td>
                  <td className="p-2">{c.subtotal} Bs</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botón generar factura */}
          <button
            onClick={generarFactura}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Generar Factura
          </button>
        </div>
      )}

      {/* Mostrar factura generada */}
      {factura && (
        <div className="mt-8 p-4 bg-gray-100 rounded shadow">
          <h2 className="text-xl font-bold mb-3">Factura Generada</h2>

          <p><strong>Total Mesa:</strong> {factura.total_mesa.toFixed(2)} Bs</p>
          <p><strong>Total Consumos:</strong> {factura.total_consumos.toFixed(2)} Bs</p>
          <p><strong>Total Final:</strong> {factura.total_final.toFixed(2)} Bs</p>

          <p className="mt-4 text-green-700 font-bold">
            ¡Factura generada correctamente!
          </p>
        </div>
      )}

    </div>
  );
}
