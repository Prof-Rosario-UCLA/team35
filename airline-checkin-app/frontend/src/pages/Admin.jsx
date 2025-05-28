import { useState } from "react";
import NavBar from "../components/NavBar";
import { useApi } from "../utils/api";

export default function Admin() {
  const { req } = useApi();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append("manifest", file);
    try {
      await req("/api/admin/upload", { method: "POST", body: form });
      setStatus("Upload successful ✔️");
    } catch {
      setStatus("Upload failed ❌");
    }
  };

  return (
    <>
      <NavBar />
      <main className="container">
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "1.5rem 0" }}>
          Admin · Upload flight manifest
        </h2>
        <form onSubmit={handleUpload} style={{ display: "grid", gap: "1rem" }}>
          <input
            type="file"
            accept=".csv,.json"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <button className="btn" type="submit">Upload</button>
        </form>
        {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
      </main>
    </>
  );
}
