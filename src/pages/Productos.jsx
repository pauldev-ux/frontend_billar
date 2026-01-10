import { useEffect, useState } from "react";
import ProductoForm from "../components/ProductoForm";
import ProductosTable from "../components/ProductosTable";
import { useProductosStore } from "../store/productosStore";
import { useAuthStore } from "../store/authStore";
import api from "../api/api";

export default function Productos() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === "admin";

  const {
    productos,
    cargarProductos,
    crearProducto,
    editarProducto,
    eliminarProducto,
  } = useProductosStore();

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  // ✅ NUEVO: categorias para el select
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const res = await api.get("/categorias/");
      setCategorias(res.data || []);
    } catch (e) {
      console.error("Error cargando categorias", e);
      setCategorias([]);
    }
  };

  const abrirCrear = () => {
    if (!isAdmin) return;
    setEditando(null);
    setModal(true);
  };

  const abrirEditar = (producto) => {
    if (!isAdmin) return;
    setEditando(producto);
    setModal(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Inventario</h1>

        {isAdmin && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={abrirCrear}
          >
            Nuevo Producto
          </button>
        )}
      </div>

      <ProductosTable
        productos={productos}
        onEditar={abrirEditar}
        onEliminar={eliminarProducto}
        isAdmin={isAdmin}
      />

      {modal && isAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              {editando ? "Editar Producto" : "Nuevo Producto"}
            </h2>

            <ProductoForm
              producto={editando}
              categorias={categorias} // ✅ NUEVO
              onSubmit={async (data) => {
                try {
                  if (editando) await editarProducto(editando.id, data);
                  else await crearProducto(data);
                } catch (error) {
                  console.error("Error guardando producto:", error);
                } finally {
                  setModal(false);
                }
              }}
            />

            <button
              className="w-full bg-red-600 text-white py-2 rounded-md mt-4 hover:bg-red-700 transition"
              onClick={() => setModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
