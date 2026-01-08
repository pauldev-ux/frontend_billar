import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children, role, roles }) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/" />;

  // compat: role string antiguo
  const allowed = roles ?? (role ? [role] : null);

  if (allowed && !allowed.includes(user.rol)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
