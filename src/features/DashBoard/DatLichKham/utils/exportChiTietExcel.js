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
const INVALID_ROW_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFEBEE" }, // red tint for invalid rows
};

// ── Column definitions (maps to export columns) ───────────────────
const COLUMNS = [
  { header: "STT", key: "stt", width: 6, align: "center" },
  { header: "Mã bệnh nhân", key: "patientid", width: 14, align: "left" },
  { header: "Mã bệnh nhân cũ", key: "patientid_old", width: 16, align: "left" },
  {
    header: "Mã CSKCB ban đầu",
    key: "macskcbbd",
    width: 18,
    align: "left",
  },
  {
    header: "Ngày đặt lịch",
    key: "dangkykhaminitdate",
    width: 14,
    align: "center",
  },
  {
    header: "Ngày đăng ký khám",
    key: "dangkykhamdate",
    width: 18,
    align: "center",
  },
  {
    header: "Khám gần nhất có hẹn",
    key: "kham_gan_nhat_co_hen",
    width: 20,
    align: "center",
  },
  { header: "Bệnh nhân", key: "patientname", width: 22, align: "left" },
  { header: "Ngày sinh", key: "birthday", width: 12, align: "center" },
  { header: "Giới tính", key: "gioitinhname", width: 10, align: "center" },
  { header: "Người giới thiệu", key: "ten_ngt", width: 20, align: "left" },
  {
    header: "Khoa người giới thiệu",
    key: "ngt_departmentgroupname",
    width: 22,
    align: "left",
  },
  { header: "Trạng thái", key: "status", width: 22, align: "center" },
  {
    header: "Mã hồ sơ bệnh án",
    key: "hosobenhancode",
    width: 18,
    align: "left",
  },
  { header: "Chẩn đoán", key: "chandoanravien", width: 28, align: "left" },
  { header: "Mã ICD", key: "chandoanravien_code", width: 10, align: "left" },
  { header: "Mã kèm theo", key: "makemtheo", width: 14, align: "left" },
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
  { header: "Ghi chú", key: "ghichu", width: 40, align: "left" },
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
  values[TOTAL_COL_COUNT - 1] = ""; // Ghi chú col — leave empty

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

function formatKhamGanNhatCoHen(row) {
  if (
    !row?.vienphiid ||
    !row?.co_hen_kham_gan_nhat ||
    !row?.ngay_xu_tri_hen_gan_nhat
  ) {
    return "";
  }
  return `Hẹn - ${formatDate(row.ngay_xu_tri_hen_gan_nhat)}`;
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

  // ─── Metrics: compute stats from data ──────────────────────────
  const metricTongDL = data.length;
  let metricCoKham = 0;
  let metricKhongKham = 0;
  let metricKham0d = 0;
  let metricManTinh = 0;
  data.forEach((r) => {
    const st = Number(r.dangkykhamstatus);
    const tt = Number(r.tong_tien || 0);
    const isManTinh = !!danhSachManTinh[r.dangkykhamid];
    if (st === 1) {
      metricCoKham++;
      if (tt <= 0) metricKham0d++;
    } else {
      metricKhongKham++;
    }
    if (isManTinh) metricManTinh++;
  });
  const metricHopLe = metricCoKham - metricManTinh;

  const METRICS = [
    {
      label: "Tổng đặt lịch",
      value: metricTongDL,
      color: "1976D2",
      bg: "E3F2FD",
    },
    { label: "Có khám", value: metricCoKham, color: "2E7D32", bg: "E8F5E9" },
    {
      label: "Không khám",
      value: metricKhongKham,
      color: "D32F2F",
      bg: "FFEBEE",
    },
    { label: "Khám 0Đ", value: metricKham0d, color: "757575", bg: "F5F5F5" },
    {
      label: "Mãn tính",
      value: metricManTinh,
      color: "9C27B0",
      bg: "F3E5F5",
    },
    {
      label: "Hợp lệ (CK có tiền − MT)",
      value: metricHopLe,
      color: "0288D1",
      bg: "E1F5FE",
    },
  ];

  // Each metric takes 2 columns; merge width is independent from detail column count.
  const COLS_PER_METRIC = 2;

  // Row 3: metric labels
  const labelRow = ws.addRow([]);
  labelRow.height = 18;
  METRICS.forEach((m, i) => {
    const startCol = i * COLS_PER_METRIC + 1;
    const endCol = startCol + COLS_PER_METRIC - 1;
    const cell = labelRow.getCell(startCol);
    cell.value = m.label;
    cell.font = { ...FONT_BOLD, size: 10, color: { argb: m.color } };
    cell.alignment = ALIGN_CENTER;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: m.bg } };
    // Fill second cell with same bg
    const cell2 = labelRow.getCell(endCol);
    cell2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: m.bg } };
    if (endCol > startCol) {
      ws.mergeCells(labelRow.number, startCol, labelRow.number, endCol);
    }
  });

  // Row 4: metric values
  const valueRow = ws.addRow([]);
  valueRow.height = 24;
  METRICS.forEach((m, i) => {
    const startCol = i * COLS_PER_METRIC + 1;
    const endCol = startCol + COLS_PER_METRIC - 1;
    const cell = valueRow.getCell(startCol);
    cell.value = m.value;
    cell.font = { ...FONT_BOLD, size: 14, color: { argb: m.color } };
    cell.alignment = ALIGN_CENTER;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: m.bg } };
    cell.numFmt = "#,##0";
    const cell2 = valueRow.getCell(endCol);
    cell2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: m.bg } };
    if (endCol > startCol) {
      ws.mergeCells(valueRow.number, startCol, valueRow.number, endCol);
    }
  });

  // Row 5: Spacer after metrics
  ws.addRow([]);

  // ─── Header row ────────────────────────────────────────────────
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

  // ─── Pre-calculate grand total ─────────────────────────────────
  let grandTongTien = 0;
  let grandCount = 0;
  khoaGroups.forEach((ngtMap) => {
    ngtMap.forEach((rows) => {
      grandCount += rows.length;
      rows.forEach((r) => {
        grandTongTien += Number(r.tong_tien || 0);
      });
    });
  });

  // ─── Grand total first ─────────────────────────────────────────
  addSummaryRow(
    ws,
    `TỔNG CỘNG: ${grandCount} bệnh nhân, ${khoaGroups.size} khoa`,
    grandTongTien,
    grandCount,
    GRAND_TOTAL_FILL,
    { ...FONT_BOLD, size: 12 },
  );

  // ─── Write data rows with 2-level subtotals ────────────────────
  let stt = 0;

  khoaGroups.forEach((ngtMap, khoaName) => {
    // Pre-calculate khoa total
    let khoaTongTien = 0;
    let khoaCount = 0;
    ngtMap.forEach((rows) => {
      khoaCount += rows.length;
      rows.forEach((r) => {
        khoaTongTien += Number(r.tong_tien || 0);
      });
    });

    // ── Khoa subtotal before detail ───────────────────────────────
    addSummaryRow(
      ws,
      `TỔNG ${khoaName}: ${khoaCount} bệnh nhân, ${ngtMap.size} người giới thiệu`,
      khoaTongTien,
      khoaCount,
      SUBTOTAL_KHOA_FILL,
      { ...FONT_BOLD, size: 12 },
    );

    ngtMap.forEach((rows, ngtName) => {
      const ngtTongTien = rows.reduce(
        (s, r) => s + Number(r.tong_tien || 0),
        0,
      );

      // ── NGT subtotal before detail ──────────────────────────────
      addSummaryRow(
        ws,
        `  Tổng ${ngtName}: ${rows.length} bệnh nhân`,
        ngtTongTien,
        rows.length,
        SUBTOTAL_NGT_FILL,
      );

      // Data rows for this NGT
      rows.forEach((r) => {
        stt++;
        const st = Number(r.dangkykhamstatus);
        const tt = Number(r.tong_tien || 0);
        const isManTinh = !!danhSachManTinh[r.dangkykhamid];

        let statusText;
        if (st !== 1) {
          statusText = "Không khám";
        } else if (tt > 0) {
          statusText = "Có khám có tiền";
        } else {
          statusText = "Khám 0Đ";
        }

        const isInvalid = st !== 1 || isManTinh;

        const rowValues = COLUMNS.map((col) => {
          if (col.key === "stt") return stt;
          if (col.key === "dangkykhaminitdate")
            return formatDate(r.dangkykhaminitdate);
          if (col.key === "dangkykhamdate") return formatDate(r.dangkykhamdate);
          if (col.key === "kham_gan_nhat_co_hen")
            return formatKhamGanNhatCoHen(r);
          if (col.key === "birthday") return formatDate(r.birthday);
          if (col.key === "gioitinhname") {
            const raw = r.gioitinhname;
            if (raw === "01" || raw === 1) return "Nam";
            if (raw === "02" || raw === 2) return "Nữ";
            return raw || "";
          }
          if (col.key === "status") return statusText;
          if (col.key === "tong_tien") return tt;
          if (col.key === "mantinh") return isManTinh ? "Có" : "";
          if (col.key === "makemtheo")
            return r.chandoanravien_kemtheo_code || "";
          if (col.key === "ghichu")
            return danhSachManTinh[r.dangkykhamid]?.ghiChu || "";
          return r[col.key] || "";
        });
        const dataRow = ws.addRow(rowValues);
        applyBorderAndFont(dataRow);
        applyAlignment(dataRow);

        // Number format for Tổng tiền
        dataRow.getCell(TONG_TIEN_IDX + 1).numFmt = "#,##0";

        // Highlight invalid rows with red tint
        if (isInvalid) {
          dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber > TOTAL_COL_COUNT) return;
            cell.fill = INVALID_ROW_FILL;
          });
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
  saveAs(blob, `BaoCao_DatLich_ChiTiet_${period}.xlsx`);
}
