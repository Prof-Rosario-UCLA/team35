import { useEffect, useState } from "react";

export default function CookieBanner() {
  // doesn’t pop up again on the next visit
  const [show, setShow] = useState(() => {
    return localStorage.getItem("cookie-consent") !== "accepted";
  });

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  // hide banner when user presses Esc (optional a11y nicety)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShow(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#111827",
        color: "#f9fafb",
        padding: "0.75rem 1rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: ".75rem",
        zIndex: 1000,
      }}
    >
      <span style={{ flex: "1 1 280px", fontSize: ".875rem" }}>
        This site uses cookies to store your session (JWT) and improve the user
        experience. By continuing you consent to cookie storage.
      </span>
      <button
        onClick={accept}
        className="btn"
        style={{ padding: ".45rem 1rem", fontSize: ".875rem" }}
        aria-label="Accept cookies"
      >
        Got&nbsp;it
      </button>
    </div>
  );
}
