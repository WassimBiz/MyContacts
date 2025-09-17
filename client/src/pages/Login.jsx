import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      navigate("/contacts");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
        <p style={{textAlign:'center',marginTop:8}}>
          Pas de compte ? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
