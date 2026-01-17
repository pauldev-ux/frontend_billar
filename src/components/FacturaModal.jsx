import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useRef } from "react";
import { useMesaStore } from "../store/mesaStore";

export default function FacturaModal({ data, onClose }) {
  const facturaRef = useRef();
  const { setBloquearActualizacion } = useMesaStore();

  const descargarPDF = async () => {
  const canvas = await html2canvas(facturaRef.current, { scale: 3 });
  const imgData = canvas.toDataURL("image/png");

  // ➜ Ticket de 80mm de ancho
  const pdfWidth = 80; 
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [pdfWidth, pdfHeight]
  });

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`factura_${data.mesa}.pdf`);
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-h-[90vh] overflow-y-auto">

        <div ref={facturaRef} className="p-4 border rounded mb-4 bg-white max-w-full">
          <h1 className="text-center text-2xl font-bold mb-2">Billar POOL DERBY</h1>
          <p className="text-center text-sm mb-4">Comprobante de consumo</p>

          <hr className="my-2" />

          {/* Mesa */}
          <p><strong>Mesa:</strong> {data.mesa}</p>

          {/* Tiempo jugado */}
          <p><strong>Tiempo jugado:</strong> {data.tiempoTexto}</p>

          {/* Subtotal tiempo */}
          <p className="mt-2 mb-1 font-semibold">Subtotal tiempo:</p>
          <p>{data.subtotalTiempo.toFixed(2)} Bs</p>

          {/* Productos */}
          <p className="mt-3 mb-1 font-semibold">Productos consumidos:</p>
          {data.productos.length === 0 ? (
            <p className="text-sm text-gray-600">Sin productos</p>
          ) : (
            <ul className="text-sm">
              {data.productos.map((p, i) => (
                <li key={i}>
                  • {p.cantidad} × {p.nombre || p.producto_nombre} — {p.subtotal} Bs
                </li>
              ))}
            </ul>
          )}

          <p className="mt-2 mb-1 font-semibold">Subtotal productos:</p>
          <p>{data.subtotalProductos.toFixed(2)} Bs</p>

          {/* Descuento */}
          <p className="mt-3"><strong>Descuento:</strong> {data.descuento} Bs</p>

          {/* Servicios extras */}
          <p className="mt-1"><strong>Servicios extras:</strong> {data.extras} Bs</p>

          <hr className="my-2" />

          {/* Observaciones */}
          {data.observaciones && (
            <>
              <p className="mt-3 mb-1 font-semibold">Observaciones:</p>
              <p className="text-sm">{data.observaciones}</p>
            </>
          )}


          {/* Total */}
          <p className="text-xl font-bold">TOTAL: {data.total.toFixed(2)} Bs</p>

          <p className="text-xs text-center mt-4">Gracias por su visita</p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => {
              setBloquearActualizacion(false);
              onClose();
            }}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cerrar
          </button>

          <button
            onClick={descargarPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
