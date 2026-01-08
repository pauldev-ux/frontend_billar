import { useEffect, useState } from "react";
import api from "../api/api";
import ModalCrearUsuario from "../components/ModalCrearUsuario";
import ModalEditarPassword from "../components/ModalEditarUsuario";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [showCrear, setShowCrear] = useState(false);
  const [userEditar, setUserEditar] = useState(null);

  const cargarUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error cargando usuarios", err);
    }
  };

  useEffect(() => {
    cargarUsers();
  }, []);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>

        <button
          onClick={() => setShowCrear(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          + Crear usuario
        </button>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-6">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {u.username}
                  </td>

                  <td className="px-4 py-3 capitalize">
                    {u.rol}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setUserEditar(u)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Quitar Acceso
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALES */}
      {showCrear && (
        <ModalCrearUsuario
          onClose={() => setShowCrear(false)}
          onCreated={cargarUsers}
        />
      )}

      {userEditar && (
        <ModalEditarPassword
          user={userEditar}
          onClose={() => setUserEditar(null)}
        />
      )}
    </div>
  );
}
