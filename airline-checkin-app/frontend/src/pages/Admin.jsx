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

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const fileContent = reader.result;
      const manifestData = JSON.parse(fileContent); // Parse the JSON content of the file

      await req("/flights/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manifestData) // Send as JSON body
      });

      setStatus("Upload successful ✔️");
    } catch (err) {
      console.error("Upload failed", err);
      setStatus("Upload failed ❌");
    }
  };

  reader.onerror = () => {
    console.error("Failed to read file");
    setStatus("Upload failed ❌");
  };

  reader.readAsText(file); // Read file content as text (JSON string)
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
