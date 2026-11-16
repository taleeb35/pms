// Download one or more tables as an Excel file (.xlsx).
// The xlsx library is loaded only when someone actually exports, so pages stay light.
export type SheetRow = Record<string, string | number | null | undefined>;
export type Sheet = { name: string; rows: SheetRow[] };

// Excel sheet names: max 31 chars, none of : \ / ? * [ ]
export const safeSheetName = (n: string) => n.replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Sheet";

// Turn any filename into something every OS accepts.
export const safeFileName = (n: string) => n.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_");

export async function downloadSheets(fileName: string, sheets: Sheet[]) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.json_to_sheet(s.rows.length ? s.rows : [{ Note: "No rows" }]);
    // Column widths from the longest value in each column.
    const keys = Object.keys(s.rows[0] || { Note: "" });
    ws["!cols"] = keys.map((k) => ({ wch: Math.min(50, Math.max(k.length, ...s.rows.map((r) => String(r[k] ?? "").length)) + 2) }));
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName(s.name));
  }
  XLSX.writeFile(wb, safeFileName(fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`));
}
