import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

export default function InventarioPOS() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mesas, setMesas] = useState([]);

  const [catId, setCatId] = useState("all");
  const [q, setQ] = useState("");

  // carrito: { [productoId]: { id, nombre, precio_venta, imagen, cantidad } }
  const [cart, setCart] = useState({});
  const [mesaId, setMesaId] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [errorSend, setErrorSend] = useState("");

  // ✅ NUEVO: ver consumo actual del turno seleccionado
  const [turnoPreview, setTurnoPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [errorPreview, setErrorPreview] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    await Promise.all([cargarCategorias(), cargarProductos(), cargarMesas()]);
  };

  const cargarCategorias = async () => {
    try {
      const res = await api.get("/categorias/");
      setCategorias(res.data || []);
    } catch (e) {
      console.error("Error cargando categorias", e);
      setCategorias([]);
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await api.get("/productos/");
      setProductos(res.data || []);
    } catch (e) {
      console.error("Error cargando productos", e);
      setProductos([]);
    }
  };

  const cargarMesas = async () => {
    try {
      const res = await api.get("/mesas/");
      setMesas(res.data || []);
    } catch (e) {
      console.error("Error cargando mesas", e);
      setMesas([]);
    }
  };

  const productosFiltrados = useMemo(() => {
    const term = q.trim().toLowerCase();

    return productos.filter((p) => {
      const okCat =
        catId === "all" ? true : Number(p.categoria_id) === Number(catId);

      const okSearch = !term
        ? true
        : (p.nombre || "").toLowerCase().includes(term);

      return okCat && okSearch;
    });
  }, [productos, catId, q]);

  // Mesas con turno activo
  const mesasDisponibles = useMemo(() => {
    return (mesas || []).filter((m) => m.estado === "ocupada" && m.turno_activo);
  }, [mesas]);

  const mesaSeleccionada = useMemo(() => {
    const id = Number(mesaId);
    return mesasDisponibles.find((m) => m.id === id) || null;
  }, [mesaId, mesasDisponibles]);

  // =========================
  // Carrito helpers
  // =========================
  const addToCart = (p) => {
    setCart((prev) => {
      const current = prev[p.id];
      const nextQty = (current?.cantidad || 0) + 1;

      return {
        ...prev,
        [p.id]: {
          id: p.id,
          nombre: p.nombre,
          precio_venta: Number(p.precio_venta) || 0,
          imagen: p.imagen || null,
          cantidad: nextQty,
        },
      };
    });
  };

  const setQty = (productoId, qty) => {
    const n = Number(qty) || 0;
    setCart((prev) => {
      if (n <= 0) {
        const copy = { ...prev };
        delete copy[productoId];
        return copy;
      }
      return {
        ...prev,
        [productoId]: { ...prev[productoId], cantidad: n },
      };
    });
  };

  const removeItem = (productoId) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productoId];
      return copy;
    });
  };

  const clearCart = () => setCart({});

  const items = useMemo(() => Object.values(cart), [cart]);

  const subtotalNuevo = useMemo(() => {
    return items.reduce((acc, it) => acc + it.precio_venta * it.cantidad, 0);
  }, [items]);


  const totalItemsCarrito = useMemo(() => {
  return items.reduce((acc, it) => acc + Number(it.cantidad || 0), 0);
}, [items]);


  // =========================
  // Preview del turno al seleccionar mesa
  // =========================
  useEffect(() => {
    if (!mesaSeleccionada?.turno_activo) {
      setTurnoPreview(null);
      setErrorPreview("");
      return;
    }
    cargarPreviewTurno(mesaSeleccionada.turno_activo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesaSeleccionada?.id]);

  const cargarPreviewTurno = async (turnoId) => {
    try {
      setLoadingPreview(true);
      setErrorPreview("");
      const res = await api.get(`/turnos/${turnoId}/preview`);
      setTurnoPreview(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error cargando consumo del turno";
      setErrorPreview(typeof msg === "string" ? msg : "Error cargando consumo");
      setTurnoPreview(null);
      console.error(err);
    } finally {
      setLoadingPreview(false);
    }
  };

  // =========================
  // Enviar consumo al turno
  // =========================
  const enviarAturno = async () => {
    setErrorSend("");

    if (!mesaSeleccionada) {
      setErrorSend("Selecciona una mesa con turno abierto.");
      return;
    }

    if (items.length === 0) {
      setErrorSend("Agrega al menos un producto al carrito.");
      return;
    }

    const turnoId = mesaSeleccionada.turno_activo;

    try {
      setLoadingSend(true);

      for (const it of items) {
        await api.post(`/turnos/${turnoId}/agregar-producto`, {
          producto_id: it.id,
          cantidad: it.cantidad,
        });
      }

      await cargarMesas();
      await cargarPreviewTurno(turnoId); // ✅ refresca consumo actual

      clearCart();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error enviando consumo";
      setErrorSend(typeof msg === "string" ? msg : "Error enviando consumo");
      console.error(err);
    } finally {
      setLoadingSend(false);
    }
  };

  // helper imagen
  const baseURL = api.defaults.baseURL || "http://localhost:8000";
  const imgUrl = (path) =>
    !path ? "" : path.startsWith("http") ? path : `${baseURL}${path}`;

  const totalTurnoActual = useMemo(() => {
    // preview ya trae total_final
    return turnoPreview?.total_final ?? null;
  }, [turnoPreview]);

  const itemsConsumidosTurno = useMemo(() => {
  return (turnoPreview?.consumos || []).length;
}, [turnoPreview]);

const cantidadConsumidaTurno = useMemo(() => {
  return (turnoPreview?.consumos || []).reduce(
    (acc, c) => acc + Number(c.cantidad || 0),
    0
  );
}, [turnoPreview]);


  return (
    <div className="p-4">
      {/* CATEGORÍAS */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-xl font-bold text-gray-800">Inventario</h1>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="ml-auto w-full max-w-sm border rounded-lg px-3 py-2"
            placeholder="Buscar producto..."
          />

          <button
            onClick={cargarTodo}
            className="px-3 py-2 border rounded-lg hover:bg-white"
          >
            Refrescar
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-2 w-max pb-2">
            <Chip
              active={catId === "all"}
              onClick={() => setCatId("all")}
              label="Todas"
            />

            {categorias.map((c) => (
              <Chip
                key={c.id}
                active={Number(catId) === Number(c.id)}
                onClick={() => setCatId(String(c.id))}
                label={c.nombre}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CUERPO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Productos */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {productosFiltrados.map((p) => (
              <div
                key={p.id}
                className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* ✅ Imagen completa (sin recorte) */}
                <div className="h-32 bg-gray-100 flex items-center justify-center p-2">
                  {p.imagen ? (
                    <img
                      src={imgUrl(p.imagen)}
                      alt={p.nombre}
                      className="w-full h-full object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="text-xs text-gray-500">Sin imagen</div>
                  )}
                </div>

                <div className="p-3">
                  <div className="font-semibold text-sm line-clamp-2">
                    {p.nombre}
                  </div>

                  <div className="text-sm text-gray-700 mt-1">
                    Bs <span className="font-bold">{p.precio_venta}</span>
                  </div>

                  <p className="text-xs text-gray-600 mt-1">
                    Stock: <strong>{Number(p.cantidad ?? 0)}</strong>
                  </p>


                  <button
                    onClick={() => addToCart(p)}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-gray-600 mt-6">
              No hay productos para ese filtro.
            </div>
          )}
        </div>

        {/* Carrito */}
        <div className="lg:col-span-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm sticky top-20">
            <h2 className="text-lg font-bold mb-3">Carrito</h2>

            {/* Mesa selector */}
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Mesa (turno activo)
            </label>
            <select
              value={mesaId}
              onChange={(e) => setMesaId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-2"
            >
              <option value="">Seleccionar mesa...</option>
              {mesasDisponibles.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} {/* ✅ sin mostrar #turno */}
                </option>
              ))}
            </select>

            {mesasDisponibles.length === 0 && (
              <div className="text-xs text-gray-500 mb-3">
                No hay mesas ocupadas con turno abierto.
              </div>
            )}

            {/* ✅ Preview del turno */}
            <div className="border rounded-lg p-3 bg-gray-50 mb-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  Consumo actual
                </p>
                {mesaSeleccionada?.turno_activo && (
                  <button
                    onClick={() => cargarPreviewTurno(mesaSeleccionada.turno_activo)}
                    className="text-xs px-2 py-1 border rounded hover:bg-white"
                  >
                    Actualizar
                  </button>
                )}
              </div>

              {!mesaSeleccionada ? (
                <p className="text-xs text-gray-600 mt-1">
                  Selecciona una mesa para ver su consumo.
                </p>
              ) : loadingPreview ? (
                <p className="text-xs text-gray-600 mt-1">Cargando…</p>
              ) : errorPreview ? (
                <p className="text-xs text-red-600 mt-1">{errorPreview}</p>
              ) : !turnoPreview ? (
                <p className="text-xs text-gray-600 mt-1">Sin datos.</p>
              ) : (
                <>

                  <p className="text-xs text-gray-600 mt-1">
                    Productos:{" "}
                    <strong>Bs {Number(turnoPreview.subtotal_productos || 0).toFixed(2)}</strong>
                  </p>

                  {/* ✅ NUEVO */}
                  <p className="text-xs text-gray-600">
                    Ítems consumidos: <strong>{itemsConsumidosTurno}</strong>
                  </p>

                  {/* ✅ NUEVO */}
                  <p className="text-xs text-gray-600">
                    Cantidad total: <strong>{cantidadConsumidaTurno}</strong>
                  </p>

                  <p className="text-xs text-gray-600">
                    Total actual:{" "}
                    <strong className="text-blue-700">
                      Bs {Number(turnoPreview.total_final || 0).toFixed(2)}
                    </strong>
                  </p>

                  {turnoPreview.consumos?.length > 0 && (
                    <ul className="text-xs text-gray-700 mt-2 max-h-28 overflow-y-auto pr-1">
                      {turnoPreview.consumos.map((c) => (
                        <li key={c.id}>
                          • {c.cantidad} × {c.producto_nombre} — Bs {c.subtotal}
                        </li>
                      ))}
                    </ul>
                  )}


                  {turnoPreview.consumos?.length === 0 && (
                    <p className="text-xs text-gray-600 mt-2">Sin consumos aún.</p>
                  )}
                </>
              )}
            </div>

            {/* Items carrito */}
            <div className="max-h-[38vh] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="text-sm text-gray-600">
                  No hay productos en el carrito.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((it) => {
                    const itemSubtotal = it.precio_venta * it.cantidad;
                    return (
                      <div
                        key={it.id}
                        className="border rounded-lg p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          {/* ✅ mini imagen */}
                          <div className="flex gap-3">
                            <div className="w-12 h-12 border rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                              {it.imagen ? (
                                <img
                                  src={imgUrl(it.imagen)}
                                  alt={it.nombre}
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                              ) : (
                                <span className="text-[10px] text-gray-500">N/A</span>
                              )}
                            </div>

                            <div>
                              <div className="font-semibold text-sm">
                                {it.nombre}
                              </div>
                              <div className="text-xs text-gray-600">
                                Bs {it.precio_venta} c/u
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(it.id)}
                            className="text-red-600 text-sm px-2"
                            title="Quitar"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Cant.</span>
                            <input
                              type="number"
                              min="1"
                              value={it.cantidad}
                              onChange={(e) => setQty(it.id, e.target.value)}
                              className="w-20 border rounded-lg px-2 py-1"
                            />
                          </div>

                          <div className="text-sm">
                            Subtotal:{" "}
                            <span className="font-bold">
                              Bs {itemSubtotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="border-t mt-4 pt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Cantidad carrito</span>
                <span className="font-bold">{totalItemsCarrito}</span>
              </div>

              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total carrito</span>
                <span className="font-bold">Bs {subtotalNuevo.toFixed(2)}</span>
              </div>


              {/* ✅ extra: total final estimado (turno actual + carrito) */}
              {totalTurnoActual !== null && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total estimado mesa</span>
                  <span className="font-bold text-blue-700">
                    Bs {(Number(totalTurnoActual) + Number(subtotalNuevo)).toFixed(2)}
                  </span>
                </div>
              )}

              {errorSend && (
                <p className="text-red-600 text-sm mt-2">{errorSend}</p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={clearCart}
                  disabled={items.length === 0}
                  className="w-1/2 border rounded-lg py-2 hover:bg-gray-50 disabled:opacity-60"
                >
                  Vaciar
                </button>

                <button
                  onClick={enviarAturno}
                  disabled={loadingSend}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 disabled:opacity-60"
                >
                  {loadingSend ? "Enviando..." : "Enviar"}
                </button>
              </div>

              <button
                onClick={cargarMesas}
                className="w-full mt-2 text-sm py-2 border rounded-lg hover:bg-gray-50"
              >
                Actualizar mesas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white hover:bg-gray-50 text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}
