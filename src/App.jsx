import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";


// Protecciones
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import AutoLayout from "./layouts/AutoLayout";

export default function App() {
  const { user, loadUser, loading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <BrowserRouter>
      <Routes>

        {!user && <Route path="/" element={<Login />} />}

        {user && (
          <Route element={<AutoLayout />}>

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/productos"
              element={
                <ProtectedRoute>
                  <Productos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <Reportes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <Usuarios />
                </ProtectedRoute>
              }
            />

          </Route>

          
        )}

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
