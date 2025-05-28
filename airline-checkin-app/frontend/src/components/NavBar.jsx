import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const { pathname } = useLocation();
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
    <nav className="nav">
      <div className="container" style={{ display: "flex", gap: "1rem" }}>
        {link("/", "Home")}
        {link("/dashboard", "Dashboard")}
      </div>
    </nav>
  );
}
