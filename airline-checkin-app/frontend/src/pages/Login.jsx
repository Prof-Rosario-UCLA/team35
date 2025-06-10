import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import NavBar from "../components/NavBar";
import { useApi } from "../utils/api";

export default function Login() {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const { setToken } = useContext(AuthContext);
  const { req }      = useApi();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await req("/api/login", {
        method: "POST",
        body: JSON.stringify({ name, email }),
      });
      setToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.error || "Login failed");
    }
  };

  return (
    <>
      <NavBar />
      <main className="container" style={{ maxWidth: 420 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1.5rem 0" }}>
          Log in / Check-in
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <input placeholder="Name"  value={name}  onChange={(e)=>setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <button className="btn" type="submit">Continue</button>
          {error && <p style={{ color:"red" }}>{error}</p>}
        </form>
      </main>
    </>
  );
}
