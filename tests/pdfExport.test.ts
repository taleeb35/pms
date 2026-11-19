import { describe, expect, it } from "vitest";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// The finance and report pages build PDFs this way; make sure it still works after library updates.
describe("PDF export", () => {
  it("builds a table PDF like the finance report", () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Finance Report", 14, 20);
    autoTable(doc, {
      startY: 28,
      head: [["Patient Name", "Date", "Total Fee", "Clinic Share", "Dr Share"]],
      body: [["Test Patient", "2026-11-19", "Rs. 2,500", "Rs. 0", "Rs. 2,500"]],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: "bold" },
    });
    const out = doc.output("arraybuffer");
    expect(out.byteLength).toBeGreaterThan(1000);
    expect(new TextDecoder().decode(new Uint8Array(out).slice(0, 5))).toBe("%PDF-");
    expect((doc as any).lastAutoTable?.finalY).toBeGreaterThan(28);
  });
});
