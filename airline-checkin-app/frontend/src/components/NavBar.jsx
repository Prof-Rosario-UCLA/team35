import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";
import OfflineBanner from './OfflineBanner';
import { useApi } from "../utils/api";
import ThemeToggleButton from "./ThemeToggleButton";

export default function NavBar() {
  const { pathname } = useLocation();
  const { token, logout } = useContext(AuthContext);
  const { apiLogout } = useApi();

    /* 🔑 Decode email from JWT (simple helper) */
  let email = "";
  if (token) {
    try {
      email = JSON.parse(atob(token.split(".")[1])).email;
    } catch {}
  }

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
      <OfflineBanner />
      <nav className="container" style={{ display: "flex", gap: "1rem" }}>
        {link("/", "Home")}
        {token && link("/dashboard", "Dashboard")}

        
        {token && email === "admin@gmail.com" && link("/admin", "Admin")}
        <ThemeToggleButton />
        {!token ? link("/login", "Log in") : (
          <button
            onClick={async () => {
              await apiLogout();
              logout();
            }}
            aria-label="Log out"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "0.75rem 1rem", color: "#dc2626" }}
          >
            Log out
          </button>
        )}
      </nav>
    </header>
  );
}
