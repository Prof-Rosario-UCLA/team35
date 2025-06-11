// Encode "row+col" into an int and back.
// 12A -> 12065   (12*100 + 'A'.charCode)
export function encodeSeat(row: i32, col: string): i32 {
  return row * 100 + col.charCodeAt(0);
}

// Decode 12065 -> "12A"   (treat <100 as char code)
export function decodeSeat(code: i32): string {
  const row = code / 100;
  const col = String.fromCharCode(code % 100);
  return row.toString() + col;
}
