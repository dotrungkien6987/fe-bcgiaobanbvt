import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { thirdUnitsToNumber } from "./tongHopMetrics";

// ── Styling constants ──────────────────────────────────────────────
const FONT = { name: "Times New Roman", size: 11 };
const FONT_BOLD = { ...FONT, bold: true };
const BORDER_THIN = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};
const ALIGN_CENTER = { horizontal: "center", vertical: "middle" };
const ALIGN_RIGHT = { horizontal: "right", vertical: "middle" };
const ALIGN_LEFT = { horizontal: "left", vertical: "middle" };

const HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "1939B7" },
};
const SUBTOTAL_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "E0E0E0" },
};
const GRAND_TOTAL_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "BDBDBD" },
};

// ── Column definitions (maps to export columns) ───────────────────
const COLUMNS = [
  { header: "STT", key: "stt", width: 6, align: "center" },
  { header: "Mã người giới thiệu", key: "ma_ngt", width: 18, align: "left" },
  { header: "Tên người giới thiệu", key: "ten_ngt", width: 22, align: "left" },
  { header: "Điện thoại", key: "dien_thoai", width: 14, align: "left" },
  { header: "Khoa", key: "departmentgroupname", width: 22, align: "left" },
  {
    header: "Tổng đặt lịch",
    key: "tong_dat_lich",
    width: 13,
    align: "right",
    numeric: true,
  },
  {
    header: "Có khám",
    key: "co_kham",
    width: 10,
    align: "right",
    numeric: true,
  },
  {
    header: "Không khám",
    key: "khong_kham",
    width: 12,
    align: "right",
    numeric: true,
  },
  {
    header: "Có khám có tiền",
    key: "co_kham_co_tien",
    width: 16,
    align: "right",
    numeric: true,
  },
  {
    header: "Mãn tính",
    key: "so_man_tinh",
    width: 10,
    align: "right",
    numeric: true,
  },
  {
    header: "Mãn tính đúng tuyến",
    key: "man_tinh_dung_tuyen",
    width: 18,
    align: "right",
    numeric: true,
  },
  {
    header: "Mãn tính chuyển tuyến",
    key: "man_tinh_chuyen_tuyen",
    width: 20,
    align: "right",
    numeric: true,
  },
  {
    header: "Đặt trong ngày",
    key: "trung_ngay",
    width: 12,
    align: "right",
    numeric: true,
  },
  { header: "Hợp lệ", key: "hop_le", width: 12, align: "right", numeric: true },
  {
    header: "Tổng tiền",
    key: "tong_tien",
    width: 16,
    align: "right",
    numeric: true,
  },
];

const NUMERIC_KEYS = COLUMNS.filter((c) => c.numeric).map((c) => c.key);
const LABEL_COL_COUNT = COLUMNS.findIndex((c) => c.numeric); // first 5 cols are label cols
const TOTAL_COL_COUNT = COLUMNS.length;

// ── Helpers ────────────────────────────────────────────────────────
function applyBorderAndFont(row) {
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > TOTAL_COL_COUNT) return;
    cell.border = BORDER_THIN;
    cell.font = { ...FONT };
  });
}

function applyAlignment(row) {
  COLUMNS.forEach((col, idx) => {
    const cell = row.getCell(idx + 1);
    cell.alignment =
      col.align === "right"
        ? ALIGN_RIGHT
        : col.align === "center"
          ? ALIGN_CENTER
          : ALIGN_LEFT;
  });
}

function sumRows(rows) {
  const sums = {};
  NUMERIC_KEYS.forEach((key) => {
    if (key === "hop_le") {
      sums[key] = thirdUnitsToNumber(
        rows.reduce((s, r) => s + Number(r.hop_le_third_units || 0), 0),
      );
      return;
    }
    sums[key] = rows.reduce((s, r) => s + Number(r[key] || 0), 0);
  });
  return sums;
}

function isDecimalColumn(key) {
  return key === "hop_le";
}

function addSubtotalRow(ws, label, sums, fill) {
  const values = new Array(TOTAL_COL_COUNT).fill("");
  values[0] = label;
  COLUMNS.forEach((col, idx) => {
    if (col.numeric) values[idx] = sums[col.key] || 0;
  });
  const row = ws.addRow(values);

  // Merge label cells (columns 1 through LABEL_COL_COUNT)
  const rowNum = row.number;
  ws.mergeCells(rowNum, 1, rowNum, LABEL_COL_COUNT);

  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > TOTAL_COL_COUNT) return;
    cell.border = BORDER_THIN;
    cell.font = FONT_BOLD;
    cell.fill = fill;
    const colDef = COLUMNS[colNumber - 1];
    cell.alignment =
      colDef && colDef.numeric
        ? ALIGN_RIGHT
        : { ...ALIGN_LEFT, wrapText: true };
  });
  // Label cell alignment
  row.getCell(1).alignment = ALIGN_LEFT;

  // Number format for numeric cells
  COLUMNS.forEach((col, idx) => {
    if (col.numeric) {
      row.getCell(idx + 1).numFmt = isDecimalColumn(col.key)
        ? "#,##0.00"
        : "#,##0";
    }
  });

  return row;
}

// ── Main export function ──────────────────────────────────────────
export async function exportTongHopExcel({ data, fromDate, toDate }) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("TongHop");

  const periodFrom = dayjs(fromDate).format("DD/MM/YYYY");
  const periodTo = dayjs(toDate).format("DD/MM/YYYY");

  // ─── Row 1: Title ───────────────────────────────────────────────
  ws.addRow([]);
  ws.mergeCells(1, 1, 1, TOTAL_COL_COUNT);
  const titleCell = ws.getCell("A1");
  titleCell.value = `BÁO CÁO TỔNG HỢP ĐẶT LỊCH KHÁM\nTừ ${periodFrom} đến ${periodTo}`;
  titleCell.font = { ...FONT, size: 14, bold: true };
  titleCell.alignment = { ...ALIGN_CENTER, wrapText: true };
  ws.getRow(1).height = 40;

  // ─── Row 2: Spacer ─────────────────────────────────────────────
  ws.addRow([]);

  // ─── Row 3: Header ─────────────────────────────────────────────
  const headerValues = COLUMNS.map((c) => c.header);
  const headerRow = ws.addRow(headerValues);
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = { ...FONT_BOLD, color: { argb: "FFFFFF" } };
    cell.alignment = ALIGN_CENTER;
    cell.border = BORDER_THIN;
  });
  headerRow.height = 24;

  // ─── Set column widths ─────────────────────────────────────────
  COLUMNS.forEach((col, idx) => {
    ws.getColumn(idx + 1).width = col.width;
  });

  // ─── Sort data by Khoa → Tên NGT ──────────────────────────────
  const sorted = [...data].sort((a, b) => {
    const khoaA = (a.departmentgroupname || "").localeCompare(
      b.departmentgroupname || "",
      "vi",
    );
    if (khoaA !== 0) return khoaA;
    return (a.ten_ngt || "").localeCompare(b.ten_ngt || "", "vi");
  });

  // ─── Group by Khoa ─────────────────────────────────────────────
  const groups = new Map();
  sorted.forEach((row) => {
    const khoa = row.departmentgroupname || "(Không có khoa)";
    if (!groups.has(khoa)) groups.set(khoa, []);
    groups.get(khoa).push(row);
  });

  // ─── Grand total first ─────────────────────────────────────────
  const grandSums = sumRows(sorted);
  addSubtotalRow(
    ws,
    `TỔNG CỘNG (${sorted.length} người giới thiệu)`,
    grandSums,
    GRAND_TOTAL_FILL,
  );

  // ─── Write data rows with subtotals ────────────────────────────
  let stt = 0;

  groups.forEach((rows, khoaName) => {
    // Khoa subtotal before detail rows
    const sums = sumRows(rows);
    addSubtotalRow(
      ws,
      `Tổng ${khoaName} (${rows.length} người giới thiệu)`,
      sums,
      SUBTOTAL_FILL,
    );

    // Data rows for this khoa
    rows.forEach((r) => {
      stt++;
      const rowValues = COLUMNS.map((col) => {
        if (col.key === "stt") return stt;
        if (col.numeric) return Number(r[col.key] || 0);
        return r[col.key] || "";
      });
      const dataRow = ws.addRow(rowValues);
      applyBorderAndFont(dataRow);
      applyAlignment(dataRow);

      // Number format for numeric cells
      COLUMNS.forEach((col, idx) => {
        if (col.numeric) {
          dataRow.getCell(idx + 1).numFmt = isDecimalColumn(col.key)
            ? "#,##0.00"
            : "#,##0";
        }
      });
    });
  });

  // ─── Download ──────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const period = `${dayjs(fromDate).format("DDMMYYYY")}_${dayjs(toDate).format("DDMMYYYY")}`;
  saveAs(blob, `BaoCao_DatLich_TongHop_${period}.xlsx`);
}
