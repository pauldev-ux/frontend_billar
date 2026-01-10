import { useEffect, useMemo, useState } from "react";

export default function ProductoForm({ onSubmit, producto, categorias = [] }) {
  const [nombre, setNombre] = useState(producto?.nombre || "");
  const [precioCompra, setPrecioCompra] = useState(producto?.precio_compra ?? "");
  const [precioVenta, setPrecioVenta] = useState(producto?.precio_venta ?? "");
  const [cantidad, setCantidad] = useState(producto?.cantidad ?? "");

  // ✅ NUEVO: categoria_id
  const [categoriaId, setCategoriaId] = useState(
  producto?.categoria_id != null
    ? String(producto.categoria_id)
    : (producto?.categoria?.id != null ? String(producto.categoria.id) : "")
  );


  // imagen URL / archivo
  const [imagenUrl, setImagenUrl] = useState(producto?.imagen ?? "");
  const [imagenFile, setImagenFile] = useState(null);

  const preview = useMemo(() => {
    if (imagenFile) return URL.createObjectURL(imagenFile);
    if (imagenUrl) return imagenUrl;
    return "";
  }, [imagenFile, imagenUrl]);

  useEffect(() => {
    // si cambias de producto (editar otro), sincroniza
    setNombre(producto?.nombre || "");
    setPrecioCompra(producto?.precio_compra ?? "");
    setPrecioVenta(producto?.precio_venta ?? "");
    setCantidad(producto?.cantidad ?? "");
    setImagenUrl(producto?.imagen ?? "");
    setImagenFile(null);
    setCategoriaId(
      producto?.categoria_id != null
        ? String(producto.categoria_id)
        : (producto?.categoria?.id != null ? String(producto.categoria.id) : "")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto?.id]);

  useEffect(() => {
    return () => {
      if (imagenFile) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagenFile]);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      nombre,
      precio_compra: Number(precioCompra) || 0,
      precio_venta: Number(precioVenta) || 0,
      cantidad: Number(cantidad) || 0,

      // ✅ NUEVO: manda categoria_id o null
      categoria_id: categoriaId === "" ? null : Number(categoriaId),

      // imagen
      imagen: (imagenUrl && imagenUrl.trim() !== "") ? imagenUrl.trim() : null,
      imagenFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        className="input"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      {/* ✅ NUEVO: CATEGORIA */}
      <div>
        <label className="text-sm text-gray-600 block mb-1">Categoría</label>
        <select
          className="input"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
        >
          <option value="">Sin categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.nombre}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Si no eliges, el producto quedará sin categoría.
        </p>
      </div>

      <input
        className="input"
        placeholder="Precio de compra"
        type="number"
        value={precioCompra}
        onChange={(e) => setPrecioCompra(e.target.value)}
        required
      />

      <input
        className="input"
        placeholder="Precio de venta"
        type="number"
        value={precioVenta}
        onChange={(e) => setPrecioVenta(e.target.value)}
        required
      />

      <input
        className="input"
        placeholder="Cantidad (stock)"
        type="number"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        required
      />

      {/* Imagen */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Imagen</label>

        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
        />

        {preview && (
          <div className="border rounded-md p-2 flex items-center justify-center">
            <img src={preview} alt="preview" className="max-h-32 object-contain" />
          </div>
        )}
      </div>

      <button className="btn btn-primary bg-green-600 w-full text-white py-2 rounded-md mt-4 hover:bg-green-700 transition">
        Guardar
      </button>
    </form>
  );
}
