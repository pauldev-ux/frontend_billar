import { useEffect, useState } from "react";
import api from "../api/api";

export default function ModalEditarUsuario({ user, onClose, onUpdated }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername(user?.username || "");
    setError("");
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const nuevoUsername = username.trim();

    if (!nuevoUsername || nuevoUsername === user.username) {
      setError("Debes cambiar el nombre de usuario para guardar.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/users/${user.id}`, {
        username: nuevoUsername,
      });

      onUpdated?.();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error actualizando usuario";
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-2">Editar usuario</h2>

        <p className="text-sm mb-3">
          Usuario actual: <strong>{user.username}</strong>
        </p>

        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-lg p-3 mb-4">
          Cambiar el nombre de usuario <strong>quita el acceso</strong> al usuario.<br />
          Para devolver el acceso, vuelve a colocar su nombre original.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nuevo nombre de usuario
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: bloqueado_juan"
            />
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
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
