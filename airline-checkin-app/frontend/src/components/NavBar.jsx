import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";

export default function NavBar() {
  const { pathname } = useLocation();
  const { token, logout } = useContext(AuthContext);
  const link = (to, label) => (
    <Link
      to={to}
      className={pathname === to ? "active" : undefined}
      aria-current={pathname === to ? "page" : undefined}
    >
      {label}
    </Link>
  );

  return (
    <header>
      <nav className="container" style={{ display: "flex", gap: "1rem" }}>
        {link("/", "Home")}
        {token && link("/dashboard", "Dashboard")}
        {token && link("/admin", "Admin")}
        {!token ? link("/login", "Log in") : (
          <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.75rem 1rem", color: "#dc2626" }}>
            Log out
          </button>
        )}
      </nav>
    </header>
  );
}
