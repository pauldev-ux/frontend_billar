import { useState } from "react";
import api from "../api/api";

export default function ModalCrearUsuario({ onClose, onCreated }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    rol: "empleado",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password) {
      setError("Usuario y contraseña son obligatorios.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        username: form.username,
        password: form.password,
        rol: form.rol,
      });

      onCreated();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Error al crear el usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Crear usuario</h2>

        <form onSubmit={crearUsuario} className="space-y-4">
          {/* USERNAME */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="ej: empleado1"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="••••••••"
            />
          </div>

          {/* ROL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Rol
            </label>
            <select
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {/* BOTONES */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
