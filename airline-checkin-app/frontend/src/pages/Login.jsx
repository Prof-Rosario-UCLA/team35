import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { useContext } from "react";
import NavBar from "../components/NavBar";

export default function Login() {
  const [bookingId, setBookingId] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  /* const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // call backend auth route
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, lastName }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const { token } = await res.json();
      setToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }; */

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",                        // receive jwt cookie
      body: JSON.stringify({ bookingId, lastName }),
    });
    if (!res.ok) throw await res.json();
    const { token } = await res.json();              // server still echoes token
    setToken(token);
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
          <input
            aria-label="Booking ID"
            placeholder="Booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            required
          />
          <input
            aria-label="Last name"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <button className="btn" type="submit">
            Continue
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </main>
    </>
  );
}
