import { useEffect, useState } from "react";
import Select from "react-select";
import { useMesaStore } from "../store/mesaStore";
import api from "../api/api";

export default function ModalAgregar({ turnoId, mesaNombre, onClose }) {
  const { agregarProducto, previewTurno } = useMesaStore();

  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [preview, setPreview] = useState(null);

  // =========================
  // CARGAR PRODUCTOS
  // =========================
  useEffect(() => {
    api.get("/productos/").then((res) => {
      const opciones = res.data.map((p) => ({
        value: p.id,
        label: `${p.nombre} — ${p.precio_venta} Bs`,
        precio_venta: p.precio_venta,
        stock: p.cantidad,
      }));
      setProductos(opciones);
    });
  }, []);

  // =========================
  // PREVIEW DEL TURNO
  // =========================
  useEffect(() => {
    cargarPreview();
  }, []);

  const cargarPreview = async () => {
    const info = await previewTurno(turnoId);
    setPreview(info);
  };

  // =========================
  // AGREGAR PRODUCTO
  // =========================
  const handleAgregarProducto = async () => {
    if (!productoSeleccionado || cantidad <= 0) return;

    await agregarProducto(
      turnoId,
      productoSeleccionado.value,
      Number(cantidad)
    );

    await cargarPreview();
    setCantidad(1);
    setProductoSeleccionado(null);
  };

  if (!preview) return null;

  const stockInsuficiente =
    productoSeleccionado &&
    Number(cantidad) > productoSeleccionado.stock;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">

        <h2 className="text-2xl font-bold mb-4 text-center">
          Agregar — Mesa {mesaNombre}
        </h2>

        {/* =========================
            AGREGAR PRODUCTOS
        ========================= */}
        <div className="border p-4 rounded-lg mb-5 bg-gray-50">
          <h3 className="font-semibold mb-3">Agregar productos</h3>

          <div className="flex flex-col gap-3">

            <Select
              value={productoSeleccionado}
              onChange={setProductoSeleccionado}
              options={productos}
              placeholder="Seleccionar producto"
              className="text-left"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
            />

            {productoSeleccionado && (
              <div className="text-sm text-gray-600">
                <p>
                  Precio:{" "}
                  <strong>{productoSeleccionado.precio_venta} Bs</strong>
                </p>
                <p>
                  Stock disponible:{" "}
                  <strong
                    className={
                      productoSeleccionado.stock <= 5
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {productoSeleccionado.stock}
                  </strong>
                </p>
              </div>
            )}

            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Cantidad"
            />

            {productoSeleccionado &&
              cantidad > 0 &&
              !stockInsuficiente && (
                <p className="text-sm text-right text-gray-700">
                  Subtotal estimado:{" "}
                  <strong>
                    {(
                      productoSeleccionado.precio_venta *
                      Number(cantidad)
                    ).toFixed(2)}{" "}
                    Bs
                  </strong>
                </p>
              )}

            <button
              onClick={handleAgregarProducto}
              disabled={
                !productoSeleccionado ||
                cantidad <= 0 ||
                stockInsuficiente
              }
              className={`w-full py-2 rounded-lg font-medium transition
                ${
                  stockInsuficiente
                    ? "bg-red-500 cursor-not-allowed text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
            >
              {stockInsuficiente
                ? "Stock insuficiente"
                : "Agregar producto"}
            </button>
          </div>
        </div>

        {/* =========================
            RESUMEN
        ========================= */}
        <div className="border p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Resumen</h3>

          <p>
            Subtotal tiempo:{" "}
            <strong>{preview.subtotal_tiempo.toFixed(2)} Bs</strong>
          </p>

          <p>
            Subtotal productos:{" "}
            <strong>{preview.subtotal_productos.toFixed(2)} Bs</strong>
          </p>

          <p className="mt-3 text-lg">
            Total:{" "}
            <strong className="text-blue-600">
              {preview.total_final.toFixed(2)} Bs
            </strong>
          </p>

          <h4 className="font-semibold mt-4 mb-1">
            Productos consumidos:
          </h4>

          {preview.consumos.length === 0 ? (
            <p className="text-gray-600 text-sm">
              Sin consumos aún
            </p>
          ) : (
            <ul className="text-sm mt-1">
              {preview.consumos.map((c) => (
                <li key={c.id}>
                  • {c.cantidad} × {c.producto_nombre} —{" "}
                  {c.subtotal} Bs
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* =========================
            CERRAR
        ========================= */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
