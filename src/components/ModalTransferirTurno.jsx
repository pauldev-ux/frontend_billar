import { useMemo, useState } from "react";
import api from "../api/api";

export default function ModalTransferirTurno({
  mesaOrigen,
  mesas,
  onClose,
  onTransferred,
}) {
  const [mesaDestinoId, setMesaDestinoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mesasDestino = useMemo(() => {
    return (mesas || []).filter(
      (m) => m.estado === "libre" && m.id !== mesaOrigen.id
    );
  }, [mesas, mesaOrigen.id]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");

    const destino = Number(mesaDestinoId);
    if (!destino) {
      setError("Selecciona una mesa destino.");
      return;
    }

    try {
      setLoading(true);

      await api.patch(`/turnos/transferir/${mesaOrigen.id}`, {
        mesa_destino_id: destino,
      });

      onTransferred?.();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al transferir el turno";
      setError(typeof msg === "string" ? msg : "Error al transferir el turno");
      console.error("TRANSFER ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-2">Transferir turno</h2>

        <div className="text-sm mb-4">
          <div>
            Mesa origen:{" "}
            <strong>
              {mesaOrigen.nombre ? mesaOrigen.nombre : `Mesa #${mesaOrigen.id}`}
            </strong>
          </div>
          <div className="text-gray-500">
            Se moverán el tiempo y consumos del turno abierto.
          </div>
        </div>

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Mesa destino (debe estar libre)
            </label>

            <select
              value={mesaDestinoId}
              onChange={(e) => setMesaDestinoId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Seleccionar mesa...</option>
              {mesasDestino.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre ? m.nombre : `Mesa #${m.id}`}
                </option>
              ))}
            </select>

            {mesasDestino.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                No hay mesas libres disponibles para transferir.
              </p>
            )}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || mesasDestino.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {loading ? "Transfiriendo..." : "Transferir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
