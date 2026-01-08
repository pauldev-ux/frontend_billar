import { useEffect, useMemo, useState } from "react";

export default function ProductoForm({ onSubmit, producto }) {
  const [nombre, setNombre] = useState(producto?.nombre || "");
  const [precioCompra, setPrecioCompra] = useState(producto?.precio_compra ?? "");
  const [precioVenta, setPrecioVenta] = useState(producto?.precio_venta ?? "");
  const [cantidad, setCantidad] = useState(producto?.cantidad ?? "");

  // imagen: puede venir como URL (string) desde BD
  const [imagenUrl, setImagenUrl] = useState(producto?.imagen ?? "");
  // imagenFile: archivo seleccionado para subir
  const [imagenFile, setImagenFile] = useState(null);

  const preview = useMemo(() => {
    if (imagenFile) return URL.createObjectURL(imagenFile);
    if (imagenUrl) return imagenUrl;
    return "";
  }, [imagenFile, imagenUrl]);

  useEffect(() => {
    return () => {
      if (imagenFile) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagenFile]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Por ahora: mandamos imagen como URL si no hay upload aún.
    // Si seleccionas archivo, enviamos imagenFile también (para que luego lo maneje el store).
    onSubmit({
      nombre,
      precio_compra: Number(precioCompra) || 0,
      precio_venta: Number(precioVenta) || 0,
      cantidad: Number(cantidad) || 0,
      imagen: (imagenUrl && imagenUrl.trim() !== "") ? imagenUrl.trim() : null,
      imagenFile, // ✅ NUEVO (opcional)
    });
  };

  const handleVer = () => {
    if (!preview) return;
    window.open(preview, "_blank", "noopener,noreferrer");
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

      {/* Imagen: subir archivo */}
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

      <button className="btn btn-primary bg-green-600  w-full text-white py-2 rounded-md mt-4 hover:bg-green-700 transition">Guardar</button>
    </form>
  );
}
