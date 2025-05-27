import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "1rem" }}>
          Airline ✈️
        </h1>
        <p style={{ marginBottom: "2rem", color: "#6b7280" }}>
          Check in, choose your seat, and get your boarding pass in seconds.
        </p>
        <Link to="/dashboard" className="btn">
          Get Started
        </Link>
      </main>
    </>
  );
}
