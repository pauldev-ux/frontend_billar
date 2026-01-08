import { useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(username, password);
      window.location.replace("/dashboard");
    } catch (e) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundImage: 'url("/assets/login-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "350px",
          padding: "25px",
          background: "rgba(255,255,255,0.85)",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <img
          src="/assets/logo.jpg"
          alt="logo"
          style={{
            width: "110px",
            marginBottom: "15px",
          }}
        />

        <h2 style={{ marginBottom: "20px", fontSize: "22px" }}>Iniciar Sesión</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />

          <button
            style={{
              width: "100%",
              padding: "12px",
              background: "#276ef1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
