import { useState } from "react";
import api from "../services/api";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@email.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      console.log("LOGIN OK:", response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      onLogin(response.data.user);
    } catch (err) {
      console.error("ERRO LOGIN:", err);

      const mensagem =
        err.response?.data?.message ||
        err.message ||
        "Erro ao fazer login";

      setError(mensagem);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Bus Tracker</h1>

        <p>Faça login para acessar o sistema</p>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <label>E-mail</label>

        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Senha</label>

        <input
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Entrar
        </button>

        <small>
          Admin: admin@email.com
          <br />
          Senha: 123456
        </small>
      </form>
    </div>
  );
}

export default Login;