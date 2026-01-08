import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition
   ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`;

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const isAdmin = user.rol === "admin";

  const items = [
    { to: "/dashboard", label: "Mesas", roles: ["admin", "empleado"] },
    { to: "/productos", label: "Inventario", roles: ["admin", "empleado"] },
    { to: "/arqueo", label: "Arqueo de caja", roles: ["admin", "empleado"] },
    { to: "/usuarios", label: "Usuarios", roles: ["admin"] },
    { to: "/reportes", label: "Informe de arqueo", roles: ["admin", "empleado"] },
  ].filter((i) => i.roles.includes(user.rol));

  const handleLogout = () => {
    // asumiendo que tu store tiene logout(); si no, abajo te digo cómo
    logout?.();
    navigate("/");
  };

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo + título */}
          <div className="flex items-center gap-3 min-w-0">
            <img src="/assets/logo.jpg" alt="Logo" className="h-10 w-auto object-contain" />
            <div className="min-w-0">
              <div className="text-sm text-gray-500 leading-tight">
                {isAdmin ? "Panel Administrador" : "Panel Empleado"}
              </div>
              <div className="text-base font-semibold text-gray-900 truncate">
                {user?.nombre || user?.username || "Usuario"}
              </div>
            </div>
          </div>

          {/* Menú */}
          <nav className="hidden md:flex items-center gap-1">
            {items.map((it) => (
              <NavLink key={it.to} to={it.to} className={linkClass}>
                {it.label}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Menú responsive */}
        <nav className="md:hidden pb-3 flex flex-wrap gap-2">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} className={linkClass}>
              {it.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
