import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";
import "./Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      alert("User registered!");
      navigate("/login");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error?.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Register</button>
        <p style={{textAlign:'center',marginTop:8}}>
          Déjà un compte ? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
