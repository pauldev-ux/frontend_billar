import { useAuthStore } from "../store/authStore";
import AdminLayout from "./AdminLayout";
import EmpleadoLayout from "./EmpleadoLayout";
import { Outlet } from "react-router-dom";

export default function AutoLayout() {
  const { user } = useAuthStore();

  if (!user) return null;

  const Layout = user.rol === "admin" ? AdminLayout : EmpleadoLayout;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
