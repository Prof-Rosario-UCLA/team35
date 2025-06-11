let wasmExports = null;

export async function loadWasm() {
  if (wasmExports) return wasmExports;

  const res = await fetch("/seat_encoder.wasm");
  if (!res.ok) throw new Error("WASM file not found (check /public)");

  const buffer = await res.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(buffer, {
    env: {
      abort(_msg, _file, line, column) {
        // AssemblyScript will call this on panic
        console.error(`WASM abort at ${line}:${column}`);
      },
    },
  });

  wasmExports = instance.exports;
  return wasmExports;
}

export async function encodeSeat(row, col) {
  try {
    const wasm = await loadWasm();
    const colChar =
      typeof col === "string" ? col.charCodeAt(0) : col;
    return wasm.encodeSeat(row, colChar);
  } catch (e) {
    console.error("Falling back to raw seat ID:", e);
    return null; // UI will default to seat.id
  }
}


/* ── Synchronous helper ────────────── */
export function encodeSeatSync(row, col) {
  if (!wasmExports) return null;           // WASM not ready yet
  const chr = typeof col === "string" ? col.charCodeAt(0) : col;
  return wasmExports.encodeSeat(row, chr);
}