import api from "../api/api";

export default function ProductosTable({ productos, onEditar, onEliminar, isAdmin }) {
  const baseURL = api.defaults.baseURL || "http://localhost:8000";

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full bg-white shadow rounded-lg overflow-hidden border">
        <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Imagen</th>
            <th className="p-3 text-left">Nombre</th>
            {isAdmin && <th className="p-3 text-left">Compra</th>}
            <th className="p-3 text-left">Venta</th>
            <th className="p-3 text-left">Cantidad</th>
            {isAdmin && <th className="p-3 text-center">Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {productos.map((p) => {
            const alertaStock = (p.cantidad ?? 0) < 20;

            const imgSrc = p.imagen
              ? (p.imagen.startsWith("http") ? p.imagen : `${baseURL}${p.imagen}`)
              : null;

            return (
              <tr
                key={p.id}
                className={`border-b transition ${alertaStock ? "bg-red-50" : "hover:bg-gray-50"}`}
              >
                <td className="p-3 text-sm text-gray-600">{p.id}</td>

                <td className="p-3">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={p.nombre}
                      className="h-10 w-10 rounded object-cover border"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/no-image.png";
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      N/A
                    </div>
                  )}
                </td>

                <td className="p-3">{p.nombre}</td>

                {isAdmin && <td className="p-3">Bs {p.precio_compra}</td>}

                <td className="p-3">Bs {p.precio_venta}</td>

                <td className={`p-3 font-bold ${alertaStock ? "text-red-600" : "text-green-600"}`}>
                  {p.cantidad}
                </td>

                {isAdmin && (
                  <td className="p-3 text-center space-x-2">
                    <button
                      className="px-4 py-1 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition"
                      onClick={() => onEditar(p)}
                    >
                      Editar
                    </button>

                    <button
                      className="px-4 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                      onClick={() => onEliminar(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
