// src/components/FacturaFinalModal.jsx
import { useRef } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export default function FacturaFinalModal({ data, onClose }) {
  const facturaRef = useRef(null);

  const descargarPDF = async () => {
    const factura = facturaRef.current;
    const canvas = await html2canvas(factura);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`factura_${data.mesa}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[420px]">
        
        {/* FACTURA */}
        <div ref={facturaRef} className="p-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Billar POOL DERBY
          </h2>

          <p><strong>Mesa:</strong> {data.mesa}</p>

          <hr className="my-3" />

          <p><strong>Tiempo estimado:</strong> {data.tiempo}</p>
          <p><strong>Subtotal tiempo:</strong> {data.subtotalTiempo} Bs</p>

          <hr className="my-3" />

          <p className="font-bold mb-2">Productos consumidos:</p>
          {data.productos.length === 0 ? (
            <p>Sin consumos</p>
          ) : (
            <ul className="text-sm mb-2">
              {data.productos.map((p, i) => (
                <li key={i}>
                  • {p.cantidad} × {p.nombre} — {p.subtotal} Bs
                </li>
              ))}
            </ul>
          )}
          <p><strong>Subtotal productos:</strong> {data.subtotalProductos} Bs</p>

          <hr className="my-3" />

          <p><strong>Descuento:</strong> {data.descuento} Bs</p>
          <p className="text-xl font-semibold mt-2">
            TOTAL: {data.total} Bs
          </p>
        </div>

        {/* BOTONES */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cerrar
          </button>

          <button
            onClick={descargarPDF}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
