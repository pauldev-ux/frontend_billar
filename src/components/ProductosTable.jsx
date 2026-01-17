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
            <th className="p-3 text-left">Categoría</th> 
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

            // ✅ Puede venir como:
            // p.categoria = {id, nombre} (mejor)
            // o p.categoria_id sin objeto (si backend no joinedload)
            const catNombre = p?.categoria?.nombre || (p?.categoria_id ? `#${p.categoria_id}` : "Sin categoría");

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

                <td className="p-3">
                  <span className="text-xs px-2 py-1 rounded-full border bg-gray-50 text-gray-700">
                    {catNombre}
                  </span>
                </td>

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
