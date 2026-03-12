import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

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
const SUBTOTAL_NGT_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "E8F5E9" }, // green tint for NGT subtotal
};
const SUBTOTAL_KHOA_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "E0E0E0" }, // gray for Khoa subtotal
};
const GRAND_TOTAL_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "BDBDBD" },
};

// ── Column definitions (maps to export columns) ───────────────────
const COLUMNS = [
  { header: "STT", key: "stt", width: 6, align: "center" },
  { header: "Mã BN", key: "patientid", width: 10, align: "left" },
  { header: "Mã BN cũ", key: "patientid_old", width: 10, align: "left" },
  {
    header: "Ngày đặt lịch",
    key: "dangkykhaminitdate",
    width: 14,
    align: "center",
  },
  { header: "Ngày ĐK khám", key: "dangkykhamdate", width: 14, align: "center" },
  { header: "Bệnh nhân", key: "patientname", width: 22, align: "left" },
  { header: "Ngày sinh", key: "birthday", width: 12, align: "center" },
  { header: "Giới tính", key: "gioitinhname", width: 10, align: "center" },
  { header: "NGT", key: "ten_ngt", width: 18, align: "left" },
  {
    header: "Khoa NGT",
    key: "ngt_departmentgroupname",
    width: 18,
    align: "left",
  },
  { header: "Trạng thái", key: "status", width: 14, align: "center" },
  { header: "Mã HSBA", key: "hosobenhancode", width: 12, align: "left" },
  { header: "Chẩn đoán", key: "chandoanravien", width: 28, align: "left" },
  { header: "Mã ICD", key: "chandoanravien_code", width: 10, align: "left" },
  {
    header: "Khoa khám",
    key: "vp_departmentgroupname",
    width: 18,
    align: "left",
  },
  { header: "Phòng khám", key: "vp_departmentname", width: 18, align: "left" },
  {
    header: "Tổng tiền",
    key: "tong_tien",
    width: 14,
    align: "right",
    numeric: true,
  },
  { header: "Mãn tính", key: "mantinh", width: 10, align: "center" },
];

const TOTAL_COL_COUNT = COLUMNS.length;
const TONG_TIEN_IDX = COLUMNS.findIndex((c) => c.key === "tong_tien"); // 0-based
const LABEL_MERGE_END = TONG_TIEN_IDX; // merge label from col 1 to col before Tổng tiền

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

function addSummaryRow(ws, label, tongTien, count, fill, fontOverride) {
  const values = new Array(TOTAL_COL_COUNT).fill("");
  values[0] = label;
  values[TONG_TIEN_IDX] = tongTien;
  values[TOTAL_COL_COUNT - 1] = ""; // Mãn tính col — leave empty

  const row = ws.addRow(values);
  const rowNum = row.number;

  // Merge label cells: column 1 → column before Tổng tiền
  ws.mergeCells(rowNum, 1, rowNum, LABEL_MERGE_END);

  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > TOTAL_COL_COUNT) return;
    cell.border = BORDER_THIN;
    cell.font = fontOverride || FONT_BOLD;
    cell.fill = fill;
    cell.alignment = ALIGN_LEFT;
  });

  // Tổng tiền alignment right + number format
  const tongTienCell = row.getCell(TONG_TIEN_IDX + 1);
  tongTienCell.alignment = ALIGN_RIGHT;
  tongTienCell.numFmt = "#,##0";

  return row;
}

function formatDate(val) {
  if (!val) return "";
  return dayjs(val).format("DD/MM/YYYY");
}

// ── Main export function ──────────────────────────────────────────
export async function exportChiTietExcel({
  data,
  danhSachManTinh = {},
  fromDate,
  toDate,
}) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("ChiTiet");

  const periodFrom = dayjs(fromDate).format("DD/MM/YYYY");
  const periodTo = dayjs(toDate).format("DD/MM/YYYY");

  // ─── Row 1: Title ───────────────────────────────────────────────
  ws.addRow([]);
  ws.mergeCells(1, 1, 1, TOTAL_COL_COUNT);
  const titleCell = ws.getCell("A1");
  titleCell.value = `BÁO CÁO CHI TIẾT ĐẶT LỊCH KHÁM\nTừ ${periodFrom} đến ${periodTo}`;
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

  // ─── Sort data by Khoa NGT → Tên NGT → Ngày ĐK ───────────────
  const sorted = [...data].sort((a, b) => {
    const khoaCmp = (a.ngt_departmentgroupname || "").localeCompare(
      b.ngt_departmentgroupname || "",
      "vi",
    );
    if (khoaCmp !== 0) return khoaCmp;
    const ngtCmp = (a.ten_ngt || "").localeCompare(b.ten_ngt || "", "vi");
    if (ngtCmp !== 0) return ngtCmp;
    return (a.dangkykhamdate || "").localeCompare(b.dangkykhamdate || "");
  });

  // ─── Group: Level1 = Khoa NGT, Level2 = NGT ───────────────────
  const khoaGroups = new Map();
  sorted.forEach((row) => {
    const khoa = row.ngt_departmentgroupname || "(Không có khoa)";
    const ngt = row.ten_ngt || "(Không rõ NGT)";
    if (!khoaGroups.has(khoa)) khoaGroups.set(khoa, new Map());
    const ngtMap = khoaGroups.get(khoa);
    if (!ngtMap.has(ngt)) ngtMap.set(ngt, []);
    ngtMap.get(ngt).push(row);
  });

  // ─── Write data rows with 2-level subtotals ────────────────────
  let stt = 0;
  let grandTongTien = 0;
  let grandCount = 0;

  khoaGroups.forEach((ngtMap, khoaName) => {
    let khoaTongTien = 0;
    let khoaCount = 0;

    ngtMap.forEach((rows, ngtName) => {
      let ngtTongTien = 0;

      // Data rows for this NGT
      rows.forEach((r) => {
        stt++;
        const rowValues = COLUMNS.map((col) => {
          if (col.key === "stt") return stt;
          if (col.key === "dangkykhaminitdate")
            return formatDate(r.dangkykhaminitdate);
          if (col.key === "dangkykhamdate") return formatDate(r.dangkykhamdate);
          if (col.key === "birthday") return formatDate(r.birthday);
          if (col.key === "status")
            return r.dangkykhamstatus === 1 ? "Có khám" : "Không khám";
          if (col.key === "tong_tien") return Number(r.tong_tien || 0);
          if (col.key === "mantinh")
            return danhSachManTinh[r.dangkykhamid] ? "Có" : "";
          return r[col.key] || "";
        });
        const dataRow = ws.addRow(rowValues);
        applyBorderAndFont(dataRow);
        applyAlignment(dataRow);

        // Number format for Tổng tiền
        dataRow.getCell(TONG_TIEN_IDX + 1).numFmt = "#,##0";

        ngtTongTien += Number(r.tong_tien || 0);
      });

      // ── Subtotal level 2: per NGT ─────────────────────────────
      addSummaryRow(
        ws,
        `Tổng ${ngtName}: ${rows.length} bản ghi`,
        ngtTongTien,
        rows.length,
        SUBTOTAL_NGT_FILL,
      );

      khoaTongTien += ngtTongTien;
      khoaCount += rows.length;
    });

    // ── Subtotal level 1: per Khoa ────────────────────────────────
    addSummaryRow(
      ws,
      `TỔNG ${khoaName}: ${khoaCount} bản ghi, ${ngtMap.size} NGT`,
      khoaTongTien,
      khoaCount,
      SUBTOTAL_KHOA_FILL,
      { ...FONT_BOLD, size: 12 },
    );

    grandTongTien += khoaTongTien;
    grandCount += khoaCount;
  });

  // ─── Grand total row ───────────────────────────────────────────
  addSummaryRow(
    ws,
    `TỔNG CỘNG: ${grandCount} bản ghi, ${khoaGroups.size} khoa`,
    grandTongTien,
    grandCount,
    GRAND_TOTAL_FILL,
    { ...FONT_BOLD, size: 12 },
  );

  // ─── Download ──────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const period = `${dayjs(fromDate).format("DDMMYYYY")}_${dayjs(toDate).format("DDMMYYYY")}`;
  saveAs(blob, `BaoCao_DatLich_ChiTiet_${period}.xlsx`);
}
