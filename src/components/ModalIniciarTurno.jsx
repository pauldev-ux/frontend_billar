import { useState } from "react";

export default function ModalIniciarTurno({ mesa, onClose, onIniciar }) {
  const [tarifaHora, setTarifaHora] = useState(mesa.tarifa_por_hora || 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    onIniciar({
      mesa_id: mesa.id,
      tarifa_hora: tarifaHora,
      tiempo_estimado_min: 0, // tiempo real SIEMPRE
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">
          Iniciar turno — {mesa.nombre}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* TARIFA */}
          <div>
            <label className="block text-sm font-medium">Tarifa por hora (Bs)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border rounded"
              value={tarifaHora}
              onChange={(e) => setTarifaHora(parseFloat(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-400 text-white rounded"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Iniciar turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
