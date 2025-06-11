import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import NavBar from "../components/NavBar";
import { useApi } from "../utils/api";

export default function Register() {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const { setToken } = useContext(AuthContext);
  const { req }      = useApi();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await req("/api/register", {
        method: "POST",
        body: JSON.stringify({ name, email }),
      });
      setToken(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.error || err.message || "Registration failed");
    }
  };

  return (
    <>
      <NavBar />
      <main className="container" style={{ maxWidth: 420 }}>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} style={{ display:"grid", gap:"1rem" }}>
          <input
            type="text"
            aria-label="Name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            aria-label="Email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn" type="submit">Register</button>
          {error && <p style={{ color:"red" }}>{error}</p>}
        </form>
        <p style={{marginTop:"1rem"}}>
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </main>
    </>
  );
}
