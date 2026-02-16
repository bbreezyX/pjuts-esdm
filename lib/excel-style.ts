import XLSX from "xlsx-js-style";

// ── Style Tokens ──────────────────────────────────────────────
const COLORS = {
  headerBg: "006B5A", // Dark teal
  headerFont: "FFFFFF",
  zebraLight: "F0F9F6", // Light mint
  borderColor: "D1D5DB", // Slate-300
};

const HEADER_STYLE: XLSX.CellStyle = {
  font: {
    bold: true,
    color: { rgb: COLORS.headerFont },
    sz: 11,
    name: "Calibri",
  },
  fill: { fgColor: { rgb: COLORS.headerBg }, patternType: "solid" },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: {
    top: { style: "thin", color: { rgb: COLORS.borderColor } },
    bottom: { style: "thin", color: { rgb: COLORS.borderColor } },
    left: { style: "thin", color: { rgb: COLORS.borderColor } },
    right: { style: "thin", color: { rgb: COLORS.borderColor } },
  },
};

const dataCellStyle = (isZebra: boolean): XLSX.CellStyle => ({
  font: { sz: 10, name: "Calibri", color: { rgb: "1E293B" } },
  fill: isZebra
    ? { fgColor: { rgb: COLORS.zebraLight }, patternType: "solid" }
    : { fgColor: { rgb: "FFFFFF" }, patternType: "solid" },
  alignment: { vertical: "center", wrapText: false },
  border: {
    top: { style: "thin", color: { rgb: COLORS.borderColor } },
    bottom: { style: "thin", color: { rgb: COLORS.borderColor } },
    left: { style: "thin", color: { rgb: COLORS.borderColor } },
    right: { style: "thin", color: { rgb: COLORS.borderColor } },
  },
});

// ── Public Types ──────────────────────────────────────────────
export interface SheetConfig {
  /** Tab name shown in Excel */
  name: string;
  /** Array of objects — each key becomes a column header */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  /** Optional per-column width overrides (in characters) */
  columnWidths?: number[];
}

// ── Main Helper ───────────────────────────────────────────────

/**
 * Create a professionally styled workbook from one or more sheet configs
 * and immediately trigger a browser download.
 */
export function downloadStyledExcel(sheets: SheetConfig[], filename: string) {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    if (sheet.data.length === 0) continue;

    const ws = XLSX.utils.json_to_sheet(sheet.data);
    const headers = Object.keys(sheet.data[0]);
    const colCount = headers.length;
    const rowCount = sheet.data.length + 1; // +1 for header

    // ── Column widths ─────────────────────────────────────
    if (sheet.columnWidths) {
      ws["!cols"] = sheet.columnWidths.map((w) => ({ wch: w }));
    } else {
      // Auto-calculate: max of header length vs longest cell value
      ws["!cols"] = headers.map((header, _colIdx) => {
        let maxLen = header.length;
        for (const row of sheet.data) {
          const val = String(row[header] ?? "");
          maxLen = Math.max(maxLen, val.length);
        }
        return { wch: Math.min(maxLen + 4, 50) };
      });
    }

    // ── Apply styles to every cell ────────────────────────
    for (let R = 0; R < rowCount; R++) {
      for (let C = 0; C < colCount; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellRef];
        if (!cell) continue;

        if (R === 0) {
          // Header row
          cell.s = HEADER_STYLE;
        } else {
          // Data row — alternate zebra
          const isZebra = R % 2 === 0;
          cell.s = dataCellStyle(isZebra);
        }
      }
    }

    // ── Row heights ───────────────────────────────────────
    ws["!rows"] = [{ hpt: 28 }]; // taller header row

    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }

  XLSX.writeFile(wb, filename);
}
