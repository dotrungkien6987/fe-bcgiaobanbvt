# 08. KPI Reports & Export System 📊📄

> **Module**: QuanLyCongViec/KPI - Báo cáo và xuất dữ liệu KPI  
> **Version**: 2.1.1  
> **Last Updated**: 5/1/2026

---

## 📑 Table of Contents

1. [Overview](#1-overview)
2. [Excel Export System](#2-excel-export-system)
3. [PowerPoint Generation](#3-powerpoint-generation)
4. [PDF Reports](#4-pdf-reports)
5. [Report Types & Templates](#5-report-types--templates)
6. [Data Aggregation & Formatting](#6-data-aggregation--formatting)
7. [Chart Generation](#7-chart-generation)
8. [Export Workflow](#8-export-workflow)
9. [Performance Optimization](#9-performance-optimization)
10. [Error Handling & Edge Cases](#10-error-handling--edge-cases)
11. [Real-World Examples](#11-real-world-examples)

---

## 1. Overview

### 1.1 Purpose

Export functionality cho phép xuất báo cáo KPI sang các định dạng:

- **Excel (.xlsx)**: Chi tiết đánh giá từng nhân viên, bảng tổng hợp
- **PowerPoint (.pptx)**: Trình bày kết quả, biểu đồ, so sánh phòng ban
- **PDF**: Báo cáo chính thức, in ấn, lưu trữ

### 1.2 Use Cases

```
┌─────────────────────────────────────────────────────────┐
│             KPI EXPORT USE CASES                         │
└─────────────────────────────────────────────────────────┘

1. EXCEL EXPORT
   ├─ Quản lý: Xuất danh sách KPI tất cả nhân viên trong phòng ban
   ├─ Giám đốc: Xuất tổng hợp toàn bệnh viện
   └─ Nhân viên: Xuất lịch sử đánh giá cá nhân

2. POWERPOINT EXPORT
   ├─ Họp phòng ban: Trình bày kết quả tháng
   ├─ Họp Ban Giám Đốc: So sánh phòng ban, xu hướng
   └─ Họp đánh giá: Kết quả cá nhân với biểu đồ

3. PDF EXPORT
   ├─ Báo cáo chính thức: Gửi BGĐ, lưu trữ
   ├─ Chứng từ: Đính kèm quyết định khen thưởng
   └─ In ấn: Phát cho nhân viên
```

### 1.3 Key Files

**Frontend:**

```
fe-bcgiaobanbvt/src/features/QuanLyCongViec/
├── BaoCaoThongKeKPI/
│   ├── baoCaoKPISlice.js                (~200 lines - Redux logic)
│   ├── components/
│   │   ├── ExportButtons.js             (Excel/PDF export buttons)
│   │   └── BaoCaoKPIFilters.js         (Filter UI cho export)
│   └── pages/
│       └── BaoCaoThongKePage.js        (Main report page)
├── KPI/v2/
│   └── components/
│       └── KPIExportToolbar.js         (Individual export buttons)
```

**Backend:**

```
giaobanbv-be/modules/workmanagement/
├── controllers/
│   └── kpi.controller.js               (exportExcel, exportPDF methods)
├── services/
│   ├── kpiExportService.js            (Business logic)
│   └── excelGeneratorService.js       (Excel generation)
└── templates/
    ├── kpi-report-template.xlsx       (Excel template)
    └── kpi-report-template.pptx       (PowerPoint template)
```

### 1.4 Technology Stack

- **Frontend**: `pptxgenjs` (PowerPoint), `file-saver` (download helper)
- **Backend**: `exceljs` (Excel), `pdfkit` or `puppeteer` (PDF)
- **Charts**: Backend generates base64 images, embedded in files

---

## 2. Excel Export System

### 2.1 Export Flow

**Sequence Diagram:**

```
┌────────┐          ┌──────────┐          ┌─────────┐          ┌──────────┐
│ User   │          │ Frontend │          │ Backend │          │ Database │
└────┬───┘          └────┬─────┘          └────┬────┘          └────┬─────┘
     │                   │                     │                     │
     │ Click Export      │                     │                     │
     ├──────────────────>│                     │                     │
     │                   │                     │                     │
     │                   │ Validate filters    │                     │
     │                   │ (chuKyId, khoaId)  │                     │
     │                   │                     │                     │
     │                   │ GET /export-excel   │                     │
     │                   ├────────────────────>│                     │
     │                   │ ?chuKyId=xxx        │                     │
     │                   │ &khoaId=yyy         │                     │
     │                   │                     │                     │
     │                   │                     │ Query DanhGiaKPI    │
     │                   │                     ├────────────────────>│
     │                   │                     │ with populate       │
     │                   │                     │                     │
     │                   │                     │<────────────────────│
     │                   │                     │ Array of evaluations│
     │                   │                     │                     │
     │                   │                     │ Generate Excel      │
     │                   │                     │ (ExcelJS)          │
     │                   │                     │                     │
     │                   │<────────────────────│                     │
     │                   │ Binary file (blob)  │                     │
     │                   │                     │                     │
     │ Download file     │ Create <a> element  │                     │
     │<──────────────────│ trigger download    │                     │
     │ BaoCaoKPI_xxx.xlsx│                     │                     │
     │                   │                     │                     │
```

**Frontend Code:**

```javascript
// fe-bcgiaobanbvt/src/features/QuanLyCongViec/BaoCaoThongKeKPI/baoCaoKPISlice.js

/**
 * Export báo cáo KPI ra Excel
 * @param {Object} filters - {chuKyId, khoaId, startDate, endDate}
 */
export const exportExcelKPI = (filters) => async (dispatch) => {
  try {
    const params = {};
    if (filters.chuKyId) params.chuKyId = filters.chuKyId;
    if (filters.khoaId) params.khoaId = filters.khoaId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    toast.info("Đang xuất báo cáo Excel...");

    // API call with blob response type
    const response = await apiService.get(
      "/workmanagement/kpi/bao-cao/export-excel",
      {
        params,
        responseType: "blob", // ⚠️ CRITICAL: Must specify blob
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCaoKPI_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Xuất báo cáo Excel thành công");
  } catch (error) {
    toast.error(error.message || "Lỗi xuất báo cáo Excel");
  }
};
```

**Button Component:**

```javascript
// fe-bcgiaobanbvt/src/features/QuanLyCongViec/BaoCaoThongKeKPI/components/ExportButtons.js

import { Button } from "@mui/material";
import { Description as ExcelIcon } from "@mui/icons-material";

function ExportButtons() {
  const dispatch = useDispatch();
  const { filters, isLoading } = useSelector((state) => state.baoCaoKPI);

  const handleExportExcel = async () => {
    try {
      await dispatch(exportExcelKPI(filters)).unwrap();
    } catch (error) {
      console.error("Export Excel failed:", error);
    }
  };

  return (
    <Button
      variant="contained"
      color="success"
      startIcon={<ExcelIcon />}
      onClick={handleExportExcel}
      disabled={isLoading}
    >
      Xuất Excel
    </Button>
  );
}
```

### 2.2 Backend Implementation

**API Endpoint:**

```javascript
// giaobanbv-be/modules/workmanagement/routes/kpi.api.js

router.get(
  "/bao-cao/export-excel",
  authentication.loginRequired,
  kpiController.exportBaoCaoExcel
);
```

**Controller:**

```javascript
// giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js

const ExcelJS = require("exceljs");
const {
  catchAsync,
  sendResponse,
  AppError,
} = require("../../../helpers/utils");

kpiController.exportBaoCaoExcel = catchAsync(async (req, res, next) => {
  const { chuKyId, khoaId, startDate, endDate } = req.query;
  const currentUser = req.userId;

  // 1. Build query
  const query = { isDeleted: false };

  if (chuKyId) {
    query.ChuKyDanhGiaID = chuKyId;
  }

  // Filter by date range if provided
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // 2. Query data with population
  let danhGiaKPIs = await DanhGiaKPI.find(query)
    .populate({
      path: "NhanVienID",
      select: "HoTen MaNhanVien Email PhongBanID ChucDanh",
      populate: {
        path: "PhongBanID",
        select: "TenPhongBan MaPhongBan",
      },
    })
    .populate("ChuKyDanhGiaID", "TenChuKy NgayBatDau NgayKetThuc")
    .populate("NguoiDanhGiaID", "HoTen")
    .populate({
      path: "DanhGiaNhiemVuThuongQuys",
      populate: {
        path: "NhiemVuThuongQuyID",
        select: "TenNhiemVu MoTa",
      },
    })
    .sort({ "NhanVienID.HoTen": 1 });

  // 3. Filter by department if needed
  if (khoaId) {
    danhGiaKPIs = danhGiaKPIs.filter(
      (kpi) => kpi.NhanVienID?.PhongBanID?._id?.toString() === khoaId
    );
  }

  // 4. Permission check: Manager can only see their department
  const userDoc = await User.findById(currentUser).populate("KhoaID");
  const isManager = userDoc.PhanQuyen === "manager";
  const isAdmin = ["admin", "superadmin"].includes(userDoc.PhanQuyen);

  if (isManager && !isAdmin) {
    const userKhoaId = userDoc.KhoaID?._id?.toString();
    danhGiaKPIs = danhGiaKPIs.filter(
      (kpi) => kpi.NhanVienID?.PhongBanID?._id?.toString() === userKhoaId
    );
  }

  if (danhGiaKPIs.length === 0) {
    throw new AppError(404, "Không có dữ liệu để xuất", "NO_DATA");
  }

  // 5. Generate Excel file
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Báo cáo KPI");

  // 5.1 Set column definitions
  worksheet.columns = [
    { header: "STT", key: "stt", width: 8 },
    { header: "Mã NV", key: "maNV", width: 12 },
    { header: "Họ và Tên", key: "hoTen", width: 25 },
    { header: "Chức danh", key: "chucDanh", width: 20 },
    { header: "Phòng ban", key: "phongBan", width: 25 },
    { header: "Chu kỳ", key: "chuKy", width: 25 },
    { header: "Điểm tự đánh giá", key: "diemTuDanhGia", width: 16 },
    { header: "Điểm quản lý", key: "diemQuanLy", width: 16 },
    { header: "Tổng điểm KPI", key: "tongDiemKPI", width: 16 },
    { header: "Trạng thái", key: "trangThai", width: 15 },
    { header: "Người đánh giá", key: "nguoiDanhGia", width: 25 },
    { header: "Ngày tạo", key: "ngayTao", width: 18 },
  ];

  // 5.2 Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1939B7" }, // Blue header
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 30;

  // 5.3 Add data rows
  danhGiaKPIs.forEach((kpi, index) => {
    const row = worksheet.addRow({
      stt: index + 1,
      maNV: kpi.NhanVienID?.MaNhanVien || "N/A",
      hoTen: kpi.NhanVienID?.HoTen || "N/A",
      chucDanh: kpi.NhanVienID?.ChucDanh || "N/A",
      phongBan: kpi.NhanVienID?.PhongBanID?.TenPhongBan || "N/A",
      chuKy: kpi.ChuKyDanhGiaID?.TenChuKy || "N/A",
      diemTuDanhGia: kpi.DiemTuDanhGia ?? "Chưa tự đánh giá",
      diemQuanLy: kpi.DiemQuanLy ?? "Chưa đánh giá",
      tongDiemKPI: kpi.TongDiemKPI ?? "N/A",
      trangThai: kpi.TrangThai === "DA_DUYET" ? "Đã duyệt" : "Chưa duyệt",
      nguoiDanhGia: kpi.NguoiDanhGiaID?.HoTen || "N/A",
      ngayTao: kpi.createdAt
        ? new Date(kpi.createdAt).toLocaleDateString("vi-VN")
        : "N/A",
    });

    // Alternate row colors
    if (index % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F5" }, // Light gray
      };
    }

    // Center align numeric columns
    row.getCell("diemTuDanhGia").alignment = { horizontal: "center" };
    row.getCell("diemQuanLy").alignment = { horizontal: "center" };
    row.getCell("tongDiemKPI").alignment = { horizontal: "center" };
    row.getCell("trangThai").alignment = { horizontal: "center" };
  });

  // 5.4 Add border to all cells
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // 6. Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="BaoCaoKPI_${chuKyId || "All"}_${Date.now()}.xlsx"`
  );

  // 7. Write to response stream
  await workbook.xlsx.write(res);
  res.end();
});
```

### 2.3 Excel Templates

**Current Approach**: Dynamic generation (no template file needed)

**Alternative Approach with Template:**

```javascript
// If using template file
const templatePath = path.join(
  __dirname,
  "../templates/kpi-report-template.xlsx"
);
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(templatePath);

const worksheet = workbook.getWorksheet("Sheet1");
// Modify template cells
worksheet.getCell("A1").value = "Báo cáo KPI";
worksheet.getCell("B1").value = chuKy.TenChuKy;

// Add data starting from row 5 (after template header)
danhGiaKPIs.forEach((kpi, index) => {
  const row = worksheet.getRow(5 + index);
  row.getCell(1).value = index + 1;
  row.getCell(2).value = kpi.NhanVienID?.MaNhanVien;
  // ... more cells
});
```

**Template Structure (if using):**

```
┌─────────────────────────────────────────────────────────┐
│              BỆNH VIỆN PHÚ THỌ                          │ ← Row 1: Title
│       BÁO CÁO ĐÁNH GIÁ KPI                              │ ← Row 2: Subtitle
│       Chu kỳ: [TenChuKy]                                │ ← Row 3: Dynamic
│                                                          │
├───┬───────┬──────────┬────────┬─────────┬──────────┬───┤ ← Row 4: Headers
│STT│ Mã NV │ Họ tên   │ Phòng  │ Điểm QL │ Tổng KPI │...│
├───┼───────┼──────────┼────────┼─────────┼──────────┼───┤
│ 1 │ NV001 │ Nguyễn A │ Khoa X │   8.5   │   8.3    │...│ ← Row 5+: Data
│ 2 │ NV002 │ Trần B   │ Khoa Y │   9.0   │   8.8    │...│
└───┴───────┴──────────┴────────┴─────────┴──────────┴───┘
```

### 2.4 Data Formatting

**Number Formatting:**

```javascript
// Format score columns with 1 decimal place
worksheet.getColumn("diemTuDanhGia").numFmt = "0.0";
worksheet.getColumn("diemQuanLy").numFmt = "0.0";
worksheet.getColumn("tongDiemKPI").numFmt = "0.0";

// Format date columns
worksheet.getColumn("ngayTao").numFmt = "dd/mm/yyyy hh:mm";
```

**Conditional Formatting (highlight high/low scores):**

```javascript
// Add conditional formatting: green for >= 9, red for < 6
worksheet.addConditionalFormatting({
  ref: "I2:I100", // TongDiemKPI column (assuming 100 rows max)
  rules: [
    {
      type: "cellIs",
      operator: "greaterThanOrEqual",
      formulae: [9],
      style: {
        fill: {
          type: "pattern",
          pattern: "solid",
          bgColor: { argb: "FF90EE90" }, // Light green
        },
      },
    },
    {
      type: "cellIs",
      operator: "lessThan",
      formulae: [6],
      style: {
        fill: {
          type: "pattern",
          pattern: "solid",
          bgColor: { argb: "FFFF6B6B" }, // Light red
        },
      },
    },
  ],
});
```

**Vietnamese Text Handling:**

```javascript
// ExcelJS handles UTF-8 automatically, but ensure proper encoding
workbook.creator = "Bệnh viện Phú Thọ";
workbook.lastModifiedBy = "Hệ thống KPI";
workbook.created = new Date();
workbook.modified = new Date();

// Vietnamese characters work natively
worksheet.getCell("A1").value = "Báo cáo đánh giá hiệu suất làm việc";
```

**Summary Statistics Row:**

```javascript
// Add summary row at the end
const summaryRow = worksheet.addRow({
  stt: "",
  maNV: "",
  hoTen: "TRUNG BÌNH",
  chucDanh: "",
  phongBan: "",
  chuKy: "",
  diemTuDanhGia: {
    formula: `AVERAGE(G2:G${danhGiaKPIs.length + 1})`,
  },
  diemQuanLy: {
    formula: `AVERAGE(H2:H${danhGiaKPIs.length + 1})`,
  },
  tongDiemKPI: {
    formula: `AVERAGE(I2:I${danhGiaKPIs.length + 1})`,
  },
  trangThai: "",
  nguoiDanhGia: "",
  ngayTao: "",
});

summaryRow.font = { bold: true };
summaryRow.fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFEB3B" }, // Yellow highlight
};
```

---

## 3. PowerPoint Generation

### 3.1 Template System

**Library**: `pptxgenjs` (v3.x)

**Installation:**

```bash
npm install pptxgenjs
```

**Basic Usage:**

```javascript
import pptxgen from "pptxgenjs";

// Create presentation
const pres = new pptxgen();

// Define custom layout (A4-like for Vietnamese reports)
pres.defineLayout({ name: "A4", width: 10, height: 5.65 });
pres.layout = "A4";

// Set metadata
pres.author = "Bệnh viện Phú Thọ";
pres.subject = "Báo cáo KPI";
pres.title = "Đánh giá hiệu suất làm việc";

// Add slides...

// Export
pres.writeFile(`BaoCaoKPI_${chuKyName}.pptx`);
```

**Template Approach:**

```javascript
// Define master slide template
pres.defineSlideMaster({
  title: "KPI_MASTER",
  background: { color: "FFFFFF" },
  objects: [
    // Header bar
    {
      rect: {
        x: 0,
        y: 0,
        w: "100%",
        h: 0.6,
        fill: { color: "1939B7" }, // Hospital blue
      },
    },
    // Hospital logo
    {
      image: {
        x: 0.2,
        y: 0.1,
        w: 0.5,
        h: 0.4,
        path: "/hospital-logo.png",
      },
    },
    // Title placeholder
    {
      placeholder: {
        options: {
          name: "title",
          type: "title",
          x: 1,
          y: 0.1,
          w: 8,
          h: 0.4,
          fontSize: 20,
          color: "FFFFFF",
          bold: true,
        },
      },
    },
    // Footer with page number
    {
      text: {
        text: "Bệnh viện Phú Thọ",
        options: {
          x: 0.5,
          y: 5.3,
          w: 4,
          h: 0.3,
          fontSize: 10,
          color: "808080",
        },
      },
    },
  ],
  slideNumber: { x: 9, y: 5.3, fontFace: "Arial", fontSize: 10 },
});
```

### 3.2 Slide Types

**1. Cover Slide:**

```javascript
// Slide 1: Cover with background image
const coverSlide = pres.addSlide();

coverSlide.addImage({
  path: "/backgroundSlide.png", // Or base64 data
  x: 0,
  y: 0,
  w: 10,
  h: 5.65,
});

coverSlide.addText("BÁO CÁO ĐÁNH GIÁ KPI", {
  x: 1,
  y: 2,
  w: 8,
  h: 1,
  fontSize: 40,
  bold: true,
  color: "1939B7",
  align: "center",
  fontFace: "Times New Roman",
});

coverSlide.addText(`Chu kỳ: ${chuKy.TenChuKy}`, {
  x: 1,
  y: 3,
  w: 8,
  h: 0.5,
  fontSize: 24,
  color: "363636",
  align: "center",
  fontFace: "Arial",
});

coverSlide.addText(`Ngày ${new Date().toLocaleDateString("vi-VN")}`, {
  x: 1,
  y: 4.5,
  w: 8,
  h: 0.3,
  fontSize: 16,
  color: "808080",
  align: "center",
});
```

**2. Summary Statistics Slide:**

```javascript
// Slide 2: Summary with key metrics
const summarySlide = pres.addSlide({ masterName: "KPI_MASTER" });

summarySlide.addText("TỔNG QUAN", { placeholder: "title" });

// Key metrics in colored boxes
const metrics = [
  { label: "Tổng số đánh giá", value: danhGiaKPIs.length, color: "3498DB" },
  { label: "Đã duyệt", value: approvedCount, color: "27AE60" },
  { label: "Chờ duyệt", value: pendingCount, color: "F39C12" },
  { label: "Điểm TB toàn BV", value: avgScore.toFixed(2), color: "9B59B6" },
];

metrics.forEach((metric, index) => {
  const xPos = 0.5 + index * 2.4;

  // Background box
  summarySlide.addShape(pres.ShapeType.rect, {
    x: xPos,
    y: 1.5,
    w: 2,
    h: 1.5,
    fill: { color: metric.color },
    line: { type: "none" },
  });

  // Label
  summarySlide.addText(metric.label, {
    x: xPos,
    y: 1.6,
    w: 2,
    h: 0.5,
    fontSize: 14,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
  });

  // Value
  summarySlide.addText(String(metric.value), {
    x: xPos,
    y: 2.2,
    w: 2,
    h: 0.7,
    fontSize: 36,
    bold: true,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
  });
});
```

**3. Data Table Slide:**

```javascript
// Slide 3: Top performers table
const tableSlide = pres.addSlide({ masterName: "KPI_MASTER" });

tableSlide.addText("TOP 10 NHÂN VIÊN XUẤT SẮC", { placeholder: "title" });

// Prepare table data
const topPerformers = danhGiaKPIs
  .sort((a, b) => (b.TongDiemKPI || 0) - (a.TongDiemKPI || 0))
  .slice(0, 10);

const tableData = [
  // Header row
  [
    { text: "Hạng", options: { bold: true, color: "FFFFFF", fill: "1939B7" } },
    {
      text: "Họ và Tên",
      options: { bold: true, color: "FFFFFF", fill: "1939B7" },
    },
    {
      text: "Phòng ban",
      options: { bold: true, color: "FFFFFF", fill: "1939B7" },
    },
    {
      text: "Điểm KPI",
      options: { bold: true, color: "FFFFFF", fill: "1939B7" },
    },
  ],
];

// Data rows
topPerformers.forEach((kpi, index) => {
  const rowColor = index % 2 === 0 ? "F5F5F5" : "FFFFFF"; // Alternate colors

  tableData.push([
    { text: String(index + 1), options: { fill: rowColor, align: "center" } },
    { text: kpi.NhanVienID?.HoTen || "N/A", options: { fill: rowColor } },
    {
      text: kpi.NhanVienID?.PhongBanID?.TenPhongBan || "N/A",
      options: { fill: rowColor },
    },
    {
      text: kpi.TongDiemKPI?.toFixed(2) || "N/A",
      options: {
        fill: rowColor,
        align: "center",
        bold: true,
        color: kpi.TongDiemKPI >= 9 ? "27AE60" : "000000", // Green if >= 9
      },
    },
  ]);
});

tableSlide.addTable(tableData, {
  x: 0.5,
  y: 1.5,
  w: 9,
  border: { type: "solid", color: "CCCCCC", pt: 1 },
  fontSize: 14,
  fontFace: "Arial",
});
```

**4. Chart Slide:**

```javascript
// Slide 4: Distribution chart (see Section 3.3 for details)
const chartSlide = pres.addSlide({ masterName: "KPI_MASTER" });

chartSlide.addText("PHÂN BỐ ĐIỂM ĐÁNH GIÁ", { placeholder: "title" });

// Add chart data
const chartData = [
  {
    name: "Số lượng nhân viên",
    labels: ["< 6.0", "6.0-7.0", "7.0-8.0", "8.0-9.0", ">= 9.0"],
    values: [2, 5, 15, 25, 10], // Calculate from actual data
  },
];

chartSlide.addChart(pres.ChartType.bar, chartData, {
  x: 1,
  y: 1.5,
  w: 8,
  h: 3.5,
  barDir: "col",
  chartColors: ["3498DB"],
  showTitle: false,
  showLegend: true,
  legendPos: "b",
  valAxisMaxVal: 30,
  catAxisLabelFontSize: 12,
  valAxisLabelFontSize: 12,
});
```

### 3.3 Chart Integration

**Chart Types Supported:**

```javascript
// 1. BAR CHART - Department comparison
const deptChartData = [
  {
    name: "Điểm KPI trung bình",
    labels: phongBanNames, // ["Khoa Nội", "Khoa Ngoại", ...]
    values: phongBanScores, // [8.2, 8.5, 7.9, ...]
  },
];

slide.addChart(pres.ChartType.bar, deptChartData, {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 3.5,
  barDir: "bar", // Horizontal bars
  chartColors: ["1939B7"],
  showValue: true,
  dataLabelFormatCode: "#0.0",
});

// 2. PIE CHART - Status distribution
const statusChartData = [
  {
    name: "Trạng thái",
    labels: ["Đã duyệt", "Chờ duyệt"],
    values: [approvedCount, pendingCount],
  },
];

slide.addChart(pres.ChartType.pie, statusChartData, {
  x: 1,
  y: 1.5,
  w: 4,
  h: 3.5,
  chartColors: ["27AE60", "F39C12"],
  showPercent: true,
  showLegend: true,
  legendPos: "r",
});

// 3. LINE CHART - Trend over cycles
const trendChartData = [
  {
    name: "Điểm trung bình",
    labels: ["Q1", "Q2", "Q3", "Q4"],
    values: [7.8, 8.1, 8.3, 8.5],
  },
];

slide.addChart(pres.ChartType.line, trendChartData, {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 3.5,
  lineDataSymbol: "circle",
  lineDataSymbolSize: 8,
  showValue: true,
  chartColors: ["E74C3C"],
});
```

**Embedding Backend-Generated Charts:**

```javascript
// Backend generates chart as base64 image
// Frontend embeds in PowerPoint

// Backend (using Chart.js or similar):
const chartBuffer = await generateChartImage(data);
const chartBase64 = `data:image/png;base64,${chartBuffer.toString("base64")}`;

// Send to frontend
res.json({ chartBase64 });

// Frontend receives and adds to slide:
slide.addImage({
  data: chartBase64, // Base64 string
  x: 1,
  y: 1.5,
  w: 8,
  h: 3.5,
});
```

### 3.4 Vietnamese Formatting

**Font Compatibility:**

```javascript
// Use Vietnamese-compatible fonts
const vietnameseFonts = {
  title: "Times New Roman", // Best for Vietnamese
  body: "Arial",
  data: "Calibri",
};

// Set theme fonts
pres.theme = {
  headFontFace: vietnameseFonts.title,
  bodyFontFace: vietnameseFonts.body,
};
```

**Date Formatting:**

```javascript
// Vietnamese date format: "Ngày DD tháng MM năm YYYY"
const formatVietnameseDate = (date) => {
  const d = new Date(date);
  return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
};

slide.addText(formatVietnameseDate(new Date()), {
  x: 7,
  y: 5,
  fontSize: 12,
  color: "808080",
});
```

**Vietnamese Text in Tables:**

```javascript
// Vietnamese text works natively with proper font
const tableData = [
  [
    { text: "Họ và Tên", options: { fontFace: "Times New Roman" } },
    { text: "Phòng ban", options: { fontFace: "Times New Roman" } },
    { text: "Điểm đánh giá", options: { fontFace: "Times New Roman" } },
  ],
  [{ text: "Nguyễn Văn A" }, { text: "Khoa Nội" }, { text: "8.5" }],
];
```

**Signature Block (Vietnamese Style):**

```javascript
// Add signature section at bottom
const addSignatureBlock = (slide, date) => {
  const leftX = 1;
  const rightX = 6;
  const yPos = 4.5;

  // Left signature: Người lập báo cáo
  slide.addText("NGƯỜI LẬP BÁO CÁO", {
    x: leftX,
    y: yPos,
    w: 3,
    h: 0.3,
    fontSize: 12,
    bold: true,
    align: "center",
  });
  slide.addText("(Ký và ghi rõ họ tên)", {
    x: leftX,
    y: yPos + 0.3,
    w: 3,
    h: 0.3,
    fontSize: 10,
    italic: true,
    align: "center",
  });

  // Right signature: Giám đốc
  slide.addText("GIÁM ĐỐC", {
    x: rightX,
    y: yPos,
    w: 3,
    h: 0.3,
    fontSize: 12,
    bold: true,
    align: "center",
  });
  slide.addText("(Ký và đóng dấu)", {
    x: rightX,
    y: yPos + 0.3,
    w: 3,
    h: 0.3,
    fontSize: 10,
    italic: true,
    align: "center",
  });

  // Date in center
  slide.addText(formatVietnameseDate(date), {
    x: 3.5,
    y: 4.2,
    w: 3,
    h: 0.3,
    fontSize: 11,
    italic: true,
    align: "center",
  });
};
```

---

## 4. PDF Reports

### 4.1 PDF Generation Methods

**Method 1: PDFKit (Backend Library)**

```javascript
// giaobanbv-be/package.json
{
  "dependencies": {
    "pdfkit": "^0.13.0"
  }
}

// Backend implementation
const PDFDocument = require("pdfkit");
const fs = require("fs");

kpiController.exportBaoCaoPDF = catchAsync(async (req, res, next) => {
  const { chuKyId } = req.query;

  // Query data (same as Excel export)
  const danhGiaKPIs = await DanhGiaKPI.find({ ChuKyDanhGiaID: chuKyId })
    .populate("NhanVienID")
    .populate("ChuKyDanhGiaID");

  // Create PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="BaoCaoKPI_${chuKyId}_${Date.now()}.pdf"`
  );

  // Pipe to response
  doc.pipe(res);

  // Register Vietnamese font
  doc.registerFont("TimesNewRoman", "./fonts/times.ttf");
  doc.font("TimesNewRoman");

  // Add header
  doc.fontSize(20).text("BÁO CÁO ĐÁNH GIÁ KPI", { align: "center" });
  doc.fontSize(14).text(`Chu kỳ: ${danhGiaKPIs[0].ChuKyDanhGiaID.TenChuKy}`, {
    align: "center",
  });
  doc.moveDown();

  // Add table (manual positioning)
  const tableTop = 200;
  const rowHeight = 30;

  // Table headers
  doc.fontSize(10);
  doc.text("Họ và Tên", 50, tableTop);
  doc.text("Phòng ban", 200, tableTop);
  doc.text("Điểm KPI", 350, tableTop);

  // Data rows
  danhGiaKPIs.forEach((kpi, index) => {
    const y = tableTop + (index + 1) * rowHeight;
    doc.text(kpi.NhanVienID?.HoTen || "N/A", 50, y);
    doc.text(kpi.NhanVienID?.PhongBanID?.TenPhongBan || "N/A", 200, y);
    doc.text(kpi.TongDiemKPI?.toFixed(2) || "N/A", 350, y);
  });

  // Finalize PDF
  doc.end();
});
```

**Method 2: Puppeteer (HTML → PDF)**

```javascript
// Better for complex layouts, uses Chrome headless

const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const fs = require("fs");

kpiController.exportBaoCaoPDF = catchAsync(async (req, res, next) => {
  // Query data
  const danhGiaKPIs = await DanhGiaKPI.find(/* ... */);

  // Load HTML template
  const templateHtml = fs.readFileSync("./templates/kpi-report.html", "utf8");
  const template = handlebars.compile(templateHtml);

  // Render with data
  const html = template({
    chuKy: danhGiaKPIs[0].ChuKyDanhGiaID,
    danhGiaKPIs: danhGiaKPIs.map((kpi) => ({
      hoTen: kpi.NhanVienID?.HoTen,
      phongBan: kpi.NhanVienID?.PhongBanID?.TenPhongBan,
      tongDiemKPI: kpi.TongDiemKPI?.toFixed(2),
    })),
  });

  // Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
  });

  await browser.close();

  // Send PDF
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="BaoCaoKPI.pdf"`);
  res.send(pdfBuffer);
});
```

### 4.2 Report Structure

**Standard PDF Layout:**

```
┌─────────────────────────────────────────────────────────┐
│                   [LOGO]  BỆNH VIỆN PHÚ THỌ            │ ← Header
│                                                          │
│             BÁO CÁO ĐÁNH GIÁ HIỆU SUẤT                  │ ← Title
│                  Chu kỳ: Q1/2026                        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  I. TỔNG QUAN                                           │ ← Section 1
│     - Tổng số đánh giá: 57                             │
│     - Đã duyệt: 52                                      │
│     - Điểm trung bình toàn BV: 8.3                     │
│                                                          │
│  II. PHÂN TÍCH THEO PHÒNG BAN                          │ ← Section 2
│     [Chart: Bar chart phòng ban]                       │
│                                                          │
│  III. DANH SÁCH CHI TIẾT                               │ ← Section 3
│     ┌────┬──────────┬───────────┬──────────┐          │
│     │STT │ Họ tên   │ Phòng ban │ Điểm KPI │          │
│     ├────┼──────────┼───────────┼──────────┤          │
│     │ 1  │ Nguyễn A │ Khoa Nội  │   8.5    │          │
│     │ 2  │ Trần B   │ Khoa Ngoại│   9.0    │          │
│     └────┴──────────┴───────────┴──────────┘          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Phú Thọ, ngày 05 tháng 01 năm 2026                   │ ← Footer
│                                                          │
│  NGƯỜI LẬP          TRƯỞNG PHÒNG          GIÁM ĐỐC    │ ← Signatures
│  (Ký, họ tên)       (Ký, họ tên)         (Ký, đóng dấu)│
└─────────────────────────────────────────────────────────┘
```

### 4.3 Signature Blocks

**HTML Template (for Puppeteer):**

```html
<!-- templates/kpi-report.html -->
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <style>
      @page {
        size: A4;
        margin: 2cm;
      }

      body {
        font-family: "Times New Roman", serif;
        font-size: 14px;
        line-height: 1.6;
      }

      .signature-section {
        margin-top: 50px;
        page-break-inside: avoid;
      }

      .signature-block {
        display: inline-block;
        width: 30%;
        text-align: center;
        vertical-align: top;
      }

      .signature-title {
        font-weight: bold;
        font-size: 12px;
        margin-bottom: 5px;
      }

      .signature-subtitle {
        font-style: italic;
        font-size: 11px;
        color: #666;
      }

      .signature-space {
        height: 60px; /* Space for handwritten signature */
      }
    </style>
  </head>
  <body>
    <!-- Report content -->
    <h1 style="text-align: center;">BÁO CÁO ĐÁNH GIÁ KPI</h1>
    <p style="text-align: center;">Chu kỳ: {{chuKy.TenChuKy}}</p>

    <!-- Data table -->
    <table>
      {{#each danhGiaKPIs}}
      <tr>
        <td>{{this.hoTen}}</td>
        <td>{{this.phongBan}}</td>
        <td>{{this.tongDiemKPI}}</td>
      </tr>
      {{/each}}
    </table>

    <!-- Signature section -->
    <div class="signature-section">
      <p style="text-align: center; font-style: italic;">
        Phú Thọ, ngày {{currentDay}} tháng {{currentMonth}} năm {{currentYear}}
      </p>

      <div style="margin-top: 30px;">
        <div class="signature-block">
          <div class="signature-title">NGƯỜI LẬP BÁO CÁO</div>
          <div class="signature-subtitle">(Ký và ghi rõ họ tên)</div>
          <div class="signature-space"></div>
        </div>

        <div class="signature-block">
          <div class="signature-title">TRƯỞNG PHÒNG</div>
          <div class="signature-subtitle">(Ký và ghi rõ họ tên)</div>
          <div class="signature-space"></div>
        </div>

        <div class="signature-block">
          <div class="signature-title">GIÁM ĐỐC</div>
          <div class="signature-subtitle">(Ký và đóng dấu)</div>
          <div class="signature-space"></div>
        </div>
      </div>
    </div>
  </body>
</html>
```

### 4.4 Print Optimization

**Page Breaks:**

```css
/* Prevent page breaks inside critical sections */
.summary-section,
.signature-section,
table thead {
  page-break-inside: avoid;
}

/* Force page break before major sections */
.new-section {
  page-break-before: always;
}

/* Keep table rows together */
table tr {
  page-break-inside: avoid;
}
```

**Header/Footer on Every Page:**

```javascript
// Puppeteer options
await page.pdf({
  format: "A4",
  displayHeaderFooter: true,
  headerTemplate: `
    <div style="font-size: 10px; text-align: center; width: 100%;">
      <img src="data:image/png;base64,..." style="height: 30px;" />
      <span>Bệnh viện Phú Thọ - Báo cáo KPI</span>
    </div>
  `,
  footerTemplate: `
    <div style="font-size: 10px; text-align: center; width: 100%;">
      <span>Trang <span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  `,
  margin: { top: "1.5cm", bottom: "1.5cm" },
});
```

**Font Embedding (for Vietnamese):**

```javascript
// PDFKit method
doc.registerFont("TimesNewRoman", "./fonts/times.ttf");
doc.registerFont("TimesNewRomanBold", "./fonts/timesbd.ttf");

// Use registered font
doc.font("TimesNewRoman").fontSize(14).text("Đánh giá KPI");
```

**Print Styles:**

```css
@media print {
  /* Hide non-printable elements */
  .no-print {
    display: none !important;
  }

  /* Optimize colors for printing */
  body {
    background: white;
    color: black;
  }

  /* Ensure links are visible */
  a[href]:after {
    content: " (" attr(href) ")";
  }

  /* Optimize table borders for printing */
  table {
    border-collapse: collapse;
  }

  table,
  th,
  td {
    border: 1px solid #000;
  }
}
```

---

## 5. Report Types & Templates

### 5.1 Individual Employee Report

**Use Case**: Nhân viên xem/in báo cáo đánh giá cá nhân

**Data Structure:**

```javascript
// API: GET /workmanagement/kpi/bao-cao/individual/:nhanVienId?chuKyId=xxx

const individualReport = {
  nhanVien: {
    HoTen: "Nguyễn Văn A",
    MaNhanVien: "NV001",
    ChucDanh: "Điều dưỡng trưởng",
    PhongBan: { TenPhongBan: "Khoa Nội Tổng Hợp", MaPhongBan: "KNTH" },
  },
  chuKy: {
    TenChuKy: "Quý 1/2026",
    NgayBatDau: "2026-01-01",
    NgayKetThuc: "2026-03-31",
  },
  danhGia: {
    TongDiemKPI: 8.5,
    DiemTuDanhGia: 8.3,
    DiemQuanLy: 8.6,
    TrangThai: "DA_DUYET",
    NgayDuyet: "2026-04-05",
    NguoiDanhGia: { HoTen: "Trần Thị B", ChucDanh: "Trưởng khoa" },
  },
  nhiemVuThuongQuy: [
    {
      TenNhiemVu: "Chăm sóc bệnh nhân",
      DiemQuanLy: 9.0,
      DiemTuDanhGia: 8.5,
      DiemNhiemVu: 8.83,
      GhiChu: "Hoàn thành xuất sắc",
    },
    {
      TenNhiemVu: "Vệ sinh phòng bệnh",
      DiemQuanLy: 8.0,
      DiemTuDanhGia: 8.0,
      DiemNhiemVu: 8.0,
      GhiChu: "",
    },
  ],
  congViec: {
    TongSo: 12,
    HoanThanh: 10,
    DangThucHien: 2,
    QuaHan: 0,
  },
  lichSu: [
    { ChuKy: "Q4/2025", TongDiemKPI: 8.2 },
    { ChuKy: "Q3/2025", TongDiemKPI: 8.0 },
    { ChuKy: "Q2/2025", TongDiemKPI: 7.8 },
  ],
};
```

**PowerPoint Template:**

```javascript
// Generate individual report PPT
const generateIndividualReport = async (data) => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";

  // Slide 1: Cover
  const cover = pres.addSlide();
  cover.addText("PHIẾU ĐÁNH GIÁ HIỆU SUẤT", {
    x: 1,
    y: 2,
    w: 8,
    h: 1,
    fontSize: 36,
    bold: true,
    align: "center",
    color: "1939B7",
  });
  cover.addText(data.nhanVien.HoTen, {
    x: 1,
    y: 3,
    w: 8,
    h: 0.5,
    fontSize: 24,
    align: "center",
  });
  cover.addText(
    `${data.nhanVien.ChucDanh} - ${data.nhanVien.PhongBan.TenPhongBan}`,
    {
      x: 1,
      y: 3.5,
      w: 8,
      h: 0.4,
      fontSize: 16,
      align: "center",
      color: "666666",
    }
  );

  // Slide 2: Summary Score
  const summary = pres.addSlide();
  summary.addText("KẾT QUẢ ĐÁNH GIÁ", {
    x: 0.5,
    y: 0.5,
    fontSize: 28,
    bold: true,
  });

  // Large score display
  summary.addShape(pres.ShapeType.ellipse, {
    x: 3.5,
    y: 1.5,
    w: 3,
    h: 3,
    fill: { color: data.danhGia.TongDiemKPI >= 8.5 ? "27AE60" : "3498DB" },
  });
  summary.addText(data.danhGia.TongDiemKPI.toFixed(2), {
    x: 3.5,
    y: 2.5,
    w: 3,
    h: 1,
    fontSize: 72,
    bold: true,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
  });

  // Score breakdown
  const breakdownY = 5;
  summary.addText(`Điểm tự đánh giá: ${data.danhGia.DiemTuDanhGia}`, {
    x: 2,
    y: breakdownY,
    fontSize: 18,
  });
  summary.addText(`Điểm quản lý: ${data.danhGia.DiemQuanLy}`, {
    x: 2,
    y: breakdownY + 0.4,
    fontSize: 18,
  });

  // Slide 3: Routine Duties Detail
  const duties = pres.addSlide();
  duties.addText("CHI TIẾT NHIỆM VỤ THƯỜNG QUY", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    bold: true,
  });

  const dutyTableData = [
    [
      {
        text: "Nhiệm vụ",
        options: { bold: true, fill: "1939B7", color: "FFFFFF" },
      },
      {
        text: "Điểm QL",
        options: { bold: true, fill: "1939B7", color: "FFFFFF" },
      },
      {
        text: "Điểm TĐG",
        options: { bold: true, fill: "1939B7", color: "FFFFFF" },
      },
      {
        text: "Điểm NV",
        options: { bold: true, fill: "1939B7", color: "FFFFFF" },
      },
      {
        text: "Ghi chú",
        options: { bold: true, fill: "1939B7", color: "FFFFFF" },
      },
    ],
  ];

  data.nhiemVuThuongQuy.forEach((nv) => {
    dutyTableData.push([
      { text: nv.TenNhiemVu },
      { text: nv.DiemQuanLy.toFixed(1), options: { align: "center" } },
      { text: nv.DiemTuDanhGia.toFixed(1), options: { align: "center" } },
      {
        text: nv.DiemNhiemVu.toFixed(2),
        options: { align: "center", bold: true },
      },
      { text: nv.GhiChu || "" },
    ]);
  });

  duties.addTable(dutyTableData, {
    x: 0.5,
    y: 1.5,
    w: 9,
    border: { type: "solid", pt: 1 },
  });

  // Slide 4: Historical Trend
  const trend = pres.addSlide();
  trend.addText("XU HƯỚNG ĐÁNH GIÁ", {
    x: 0.5,
    y: 0.5,
    fontSize: 24,
    bold: true,
  });

  const trendData = [
    {
      name: "Điểm KPI",
      labels: data.lichSu.map((h) => h.ChuKy),
      values: data.lichSu.map((h) => h.TongDiemKPI),
    },
  ];

  trend.addChart(pres.ChartType.line, trendData, {
    x: 1,
    y: 1.5,
    w: 8,
    h: 4,
    showValue: true,
  });

  return pres;
};
```

### 5.2 Department Summary Report

**Use Case**: Trưởng khoa/Quản lý xem tổng quan phòng ban

**Data Structure:**

```javascript
// API: GET /workmanagement/kpi/bao-cao/department/:khoaId?chuKyId=xxx

const departmentReport = {
  phongBan: {
    TenPhongBan: "Khoa Nội Tổng Hợp",
    MaPhongBan: "KNTH",
    TruongKhoa: { HoTen: "BS. Trần Văn C" },
  },
  chuKy: {
    TenChuKy: "Quý 1/2026",
    NgayBatDau: "2026-01-01",
    NgayKetThuc: "2026-03-31",
  },
  thongKe: {
    TongSoNhanVien: 25,
    DaDanhGia: 23,
    DaDuyet: 20,
    ChuaDuyet: 3,
    DiemTrungBinh: 8.2,
    DiemCaoNhat: 9.2,
    DiemThapNhat: 6.5,
  },
  phanBo: {
    "< 6.0": 0,
    "6.0-7.0": 2,
    "7.0-8.0": 8,
    "8.0-9.0": 11,
    ">= 9.0": 2,
  },
  top5: [
    { HoTen: "Nguyễn Văn A", TongDiemKPI: 9.2 },
    { HoTen: "Trần Thị B", TongDiemKPI: 9.0 },
    // ... 3 more
  ],
  bottom5: [
    { HoTen: "Lê Văn X", TongDiemKPI: 6.5 },
    { HoTen: "Phạm Thị Y", TongDiemKPI: 6.8 },
    // ... 3 more
  ],
  soSanh: [
    { PhongBan: "Khoa Ngoại", DiemTB: 8.4 },
    { PhongBan: "Khoa Nội", DiemTB: 8.2 }, // Current
    { PhongBan: "Khoa Sản", DiemTB: 8.0 },
  ],
};
```

**Excel Export:**

```javascript
// Add summary worksheet for department report
const summaryWS = workbook.addWorksheet("Tổng quan");

// Title
summaryWS.mergeCells("A1:F1");
summaryWS.getCell(
  "A1"
).value = `BÁO CÁO TỔNG HỢP - ${data.phongBan.TenPhongBan}`;
summaryWS.getCell("A1").font = { size: 18, bold: true };
summaryWS.getCell("A1").alignment = { horizontal: "center" };

// Statistics table
summaryWS.getCell("A3").value = "CHỈ TIÊU";
summaryWS.getCell("B3").value = "GIÁ TRỊ";
summaryWS.getRow(3).font = { bold: true };

const stats = [
  ["Tổng số nhân viên", data.thongKe.TongSoNhanVien],
  ["Đã đánh giá", data.thongKe.DaDanhGia],
  ["Đã duyệt", data.thongKe.DaDuyet],
  ["Điểm trung bình", data.thongKe.DiemTrungBinh.toFixed(2)],
  ["Điểm cao nhất", data.thongKe.DiemCaoNhat.toFixed(2)],
  ["Điểm thấp nhất", data.thongKe.DiemThapNhat.toFixed(2)],
];

stats.forEach((stat, index) => {
  summaryWS.getCell(`A${4 + index}`).value = stat[0];
  summaryWS.getCell(`B${4 + index}`).value = stat[1];
});

// Distribution table
summaryWS.getCell("D3").value = "PHÂN BỐ ĐIỂM";
summaryWS.getCell("E3").value = "SỐ LƯỢNG";

Object.entries(data.phanBo).forEach(([range, count], index) => {
  summaryWS.getCell(`D${4 + index}`).value = range;
  summaryWS.getCell(`E${4 + index}`).value = count;
});
```

### 5.3 Comparative Report

**Use Case**: BGĐ so sánh giữa các phòng ban

**Data Structure:**

```javascript
// API: GET /workmanagement/kpi/bao-cao/comparative?chuKyId=xxx

const comparativeReport = {
  chuKy: { TenChuKy: "Quý 1/2026" },
  phongBans: [
    {
      TenPhongBan: "Khoa Nội",
      DiemTrungBinh: 8.2,
      SoNhanVien: 25,
      TyLeDuyet: 92, // %
    },
    {
      TenPhongBan: "Khoa Ngoại",
      DiemTrungBinh: 8.4,
      SoNhanVien: 30,
      TyLeDuyet: 95,
    },
    // ... more departments
  ],
  thongKeToanBV: {
    TongSoNhanVien: 120,
    DiemTrungBinhToanBV: 8.3,
    TyLeDuyetTrungBinh: 93,
  },
};
```

**PowerPoint Chart:**

```javascript
// Comparative bar chart
const comparisonSlide = pres.addSlide();

comparisonSlide.addText("SO SÁNH ĐIỂM TRUNG BÌNH THEO PHÒNG BAN", {
  x: 0.5,
  y: 0.5,
  fontSize: 24,
  bold: true,
});

const chartData = [
  {
    name: "Điểm TB",
    labels: data.phongBans.map((pb) => pb.TenPhongBan),
    values: data.phongBans.map((pb) => pb.DiemTrungBinh),
  },
];

comparisonSlide.addChart(pres.ChartType.bar, chartData, {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 4,
  barDir: "bar",
  chartColors: ["1939B7"],
  showValue: true,
  dataLabelFormatCode: "#0.0",
  catAxisLabelFontSize: 12,
  valAxisMaxVal: 10,
});

// Add average line
comparisonSlide.addShape(pres.ShapeType.line, {
  x: 0.5 + (data.thongKeToanBV.DiemTrungBinhToanBV / 10) * 9,
  y: 1.5,
  w: 0,
  h: 4,
  line: { color: "E74C3C", width: 3, dashType: "dash" },
});

comparisonSlide.addText(
  `Trung bình toàn BV: ${data.thongKeToanBV.DiemTrungBinhToanBV.toFixed(2)}`,
  {
    x: 0.5,
    y: 5.8,
    fontSize: 14,
    color: "E74C3C",
    italic: true,
  }
);
```

### 5.4 Trend Analysis Report

**Use Case**: Phân tích xu hướng qua nhiều chu kỳ

**Data Structure:**

```javascript
// API: GET /workmanagement/kpi/bao-cao/trend?startDate=xxx&endDate=yyy

const trendReport = {
  period: {
    StartDate: "2025-01-01",
    EndDate: "2026-03-31",
  },
  chuKys: [
    { TenChuKy: "Q1/2025", DiemTB: 7.8, SoDanhGia: 110 },
    { TenChuKy: "Q2/2025", DiemTB: 8.0, SoDanhGia: 115 },
    { TenChuKy: "Q3/2025", DiemTB: 8.2, SoDanhGia: 118 },
    { TenChuKy: "Q4/2025", DiemTB: 8.3, SoDanhGia: 120 },
    { TenChuKy: "Q1/2026", DiemTB: 8.5, SoDanhGia: 120 },
  ],
  trends: {
    DiemTB: {
      TangTruong: "+8.97%", // (8.5 - 7.8) / 7.8 * 100
      Slope: 0.175, // Linear regression slope
      Trend: "TANG", // TANG, GIAM, ON_DINH
    },
    SoDanhGia: {
      TangTruong: "+9.09%",
      Trend: "TANG",
    },
  },
  phongBanTrends: [
    {
      TenPhongBan: "Khoa Nội",
      Data: [7.5, 7.8, 8.0, 8.2, 8.4],
      Trend: "TANG",
    },
    // ... more departments
  ],
};
```

**Multi-line Chart:**

```javascript
// Trend analysis slide
const trendSlide = pres.addSlide();

trendSlide.addText("XU HƯỚNG ĐIỂM KPI QUA CÁC CHU KỲ", {
  x: 0.5,
  y: 0.5,
  fontSize: 24,
  bold: true,
});

// Prepare multi-line chart data
const chartData = data.phongBanTrends.map((pbTrend) => ({
  name: pbTrend.TenPhongBan,
  labels: data.chuKys.map((ck) => ck.TenChuKy),
  values: pbTrend.Data,
}));

trendSlide.addChart(pres.ChartType.line, chartData, {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 4,
  showValue: false,
  showLegend: true,
  legendPos: "r",
  lineDataSymbol: "circle",
});

// Add trend indicators
const indicatorY = 5.8;
trendSlide.addText(
  `📈 Xu hướng chung: Tăng ${data.trends.DiemTB.TangTruong} so với chu kỳ đầu`,
  {
    x: 0.5,
    y: indicatorY,
    fontSize: 14,
    color: "27AE60",
    bold: true,
  }
);
```

---

## 6. Data Aggregation & Formatting

### 6.1 Query Optimization

**Problem**: Slow queries when exporting large datasets

**Solution**: Aggregation pipeline + indexes

```javascript
// BEFORE: N+1 queries (slow)
const danhGiaKPIs = await DanhGiaKPI.find({ ChuKyDanhGiaID: chuKyId });
for (const kpi of danhGiaKPIs) {
  kpi.nhanVien = await NhanVien.findById(kpi.NhanVienID);
  kpi.phongBan = await PhongBan.findById(kpi.nhanVien.PhongBanID);
}

// AFTER: Single aggregation query (fast)
const danhGiaKPIs = await DanhGiaKPI.aggregate([
  {
    $match: {
      ChuKyDanhGiaID: mongoose.Types.ObjectId(chuKyId),
      isDeleted: false,
    },
  },

  // Join with NhanVien
  {
    $lookup: {
      from: "nhanviens",
      localField: "NhanVienID",
      foreignField: "_id",
      as: "nhanVien",
    },
  },
  { $unwind: "$nhanVien" },

  // Join with PhongBan
  {
    $lookup: {
      from: "phongbans",
      localField: "nhanVien.PhongBanID",
      foreignField: "_id",
      as: "phongBan",
    },
  },
  { $unwind: "$phongBan" },

  // Join with ChuKyDanhGia
  {
    $lookup: {
      from: "chukydanhgias",
      localField: "ChuKyDanhGiaID",
      foreignField: "_id",
      as: "chuKy",
    },
  },
  { $unwind: "$chuKy" },

  // Project only needed fields
  {
    $project: {
      "nhanVien.HoTen": 1,
      "nhanVien.MaNhanVien": 1,
      "phongBan.TenPhongBan": 1,
      "chuKy.TenChuKy": 1,
      TongDiemKPI: 1,
      DiemQuanLy: 1,
      DiemTuDanhGia: 1,
      TrangThai: 1,
      createdAt: 1,
    },
  },

  // Sort by department, then name
  { $sort: { "phongBan.TenPhongBan": 1, "nhanVien.HoTen": 1 } },
]);

// Performance: ~3s → ~200ms for 1000 records
```

**Required Indexes:**

```javascript
// models/DanhGiaKPI.js
DanhGiaKPISchema.index({ ChuKyDanhGiaID: 1, isDeleted: 1 });
DanhGiaKPISchema.index({ NhanVienID: 1, ChuKyDanhGiaID: 1 });
DanhGiaKPISchema.index({ TrangThai: 1 });
DanhGiaKPISchema.index({ createdAt: -1 });

// models/NhanVien.js
NhanVienSchema.index({ PhongBanID: 1 });
NhanVienSchema.index({ MaNhanVien: 1 });
```

### 6.2 Data Transformation

**Transform raw data for export:**

```javascript
// Transform function for Excel/PDF export
const transformKPIDataForExport = (danhGiaKPIs) => {
  return danhGiaKPIs.map((kpi, index) => ({
    STT: index + 1,
    MaNV: kpi.nhanVien?.MaNhanVien || "N/A",
    HoTen: kpi.nhanVien?.HoTen || "N/A",
    ChucDanh: kpi.nhanVien?.ChucDanh || "N/A",
    PhongBan: kpi.phongBan?.TenPhongBan || "N/A",
    ChuKy: kpi.chuKy?.TenChuKy || "N/A",
    DiemTuDanhGia: formatScore(kpi.DiemTuDanhGia),
    DiemQuanLy: formatScore(kpi.DiemQuanLy),
    TongDiemKPI: formatScore(kpi.TongDiemKPI),
    TrangThai: translateStatus(kpi.TrangThai),
    NguoiDanhGia: kpi.NguoiDanhGiaID?.HoTen || "N/A",
    NgayTao: formatVietnameseDate(kpi.createdAt),
    XepLoai: classifyScore(kpi.TongDiemKPI),
  }));
};

// Helper functions
const formatScore = (score) => {
  if (score === null || score === undefined) return "Chưa có";
  return score.toFixed(2);
};

const translateStatus = (status) => {
  const statusMap = {
    CHUA_DUYET: "Chờ duyệt",
    DA_DUYET: "Đã duyệt",
    TU_CHOI: "Từ chối",
  };
  return statusMap[status] || status;
};

const classifyScore = (score) => {
  if (!score) return "Chưa xếp loại";
  if (score >= 9) return "Xuất sắc";
  if (score >= 8) return "Tốt";
  if (score >= 7) return "Khá";
  if (score >= 6) return "Trung bình";
  return "Yếu";
};
```

### 6.3 Vietnamese Date/Number Formatting

**Date Formatting:**

```javascript
// Vietnamese date formatter
const formatVietnameseDate = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Full text date (for signatures)
const formatFullVietnameseDate = (date) => {
  if (!date) return "";

  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  return `Ngày ${day} tháng ${month} năm ${year}`;
};

// Date range
const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return `Từ ngày ${start.getDate()}/${
    start.getMonth() + 1
  }/${start.getFullYear()} đến ngày ${end.getDate()}/${
    end.getMonth() + 1
  }/${end.getFullYear()}`;
};
```

**Number Formatting:**

```javascript
// Vietnamese number formatter
const formatVietnameseNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return "N/A";

  return num.toLocaleString("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Examples:
formatVietnameseNumber(1234567); // "1.234.567"
formatVietnameseNumber(8.5, 2); // "8,50"
formatVietnameseNumber(1234567.89, 2); // "1.234.567,89"

// Percentage
const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};

// Currency (if needed)
const formatCurrency = (amount) => {
  return formatVietnameseNumber(amount, 0) + " VNĐ";
};
```

### 6.4 Calculated Fields

**Statistics Calculation:**

```javascript
// Calculate statistics for department report
const calculateDepartmentStats = (danhGiaKPIs) => {
  const scores = danhGiaKPIs
    .map((kpi) => kpi.TongDiemKPI)
    .filter((score) => score !== null && score !== undefined);

  if (scores.length === 0) {
    return {
      TongSo: 0,
      DiemTrungBinh: 0,
      DiemCaoNhat: 0,
      DiemThapNhat: 0,
      DoDiemChuan: 0,
    };
  }

  const sum = scores.reduce((acc, score) => acc + score, 0);
  const avg = sum / scores.length;
  const max = Math.max(...scores);
  const min = Math.min(...scores);

  // Standard deviation
  const variance =
    scores.reduce((acc, score) => acc + Math.pow(score - avg, 2), 0) /
    scores.length;
  const stdDev = Math.sqrt(variance);

  return {
    TongSo: danhGiaKPIs.length,
    DiemTrungBinh: avg,
    DiemCaoNhat: max,
    DiemThapNhat: min,
    DoDiemChuan: stdDev,
  };
};

// Calculate distribution
const calculateDistribution = (danhGiaKPIs) => {
  const distribution = {
    "< 6.0": 0,
    "6.0-7.0": 0,
    "7.0-8.0": 0,
    "8.0-9.0": 0,
    ">= 9.0": 0,
  };

  danhGiaKPIs.forEach((kpi) => {
    const score = kpi.TongDiemKPI;
    if (score === null || score === undefined) return;

    if (score < 6) distribution["< 6.0"]++;
    else if (score < 7) distribution["6.0-7.0"]++;
    else if (score < 8) distribution["7.0-8.0"]++;
    else if (score < 9) distribution["8.0-9.0"]++;
    else distribution[">= 9.0"]++;
  });

  return distribution;
};

// Calculate trend (linear regression)
const calculateTrend = (dataPoints) => {
  // dataPoints: [{x: 1, y: 7.8}, {x: 2, y: 8.0}, ...]
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
  const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
  const sumXY = dataPoints.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumX2 = dataPoints.reduce((acc, p) => acc + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return {
    Slope: slope,
    Intercept: intercept,
    Trend: slope > 0.1 ? "TANG" : slope < -0.1 ? "GIAM" : "ON_DINH",
  };
};
```

---

## 7. Chart Generation

### 7.1 Chart Types

**Supported Chart Types for KPI Reports:**

| Chart Type       | Use Case                                  | Library          |
| ---------------- | ----------------------------------------- | ---------------- |
| **Bar Chart**    | Department comparison, Score distribution | pptxgenjs        |
| **Pie Chart**    | Status distribution (Approved/Pending)    | pptxgenjs        |
| **Line Chart**   | Trend over multiple cycles                | pptxgenjs        |
| **Stacked Bar**  | Multi-metric comparison                   | pptxgenjs        |
| **Scatter Plot** | Individual vs Manager score correlation   | Chart.js (image) |
| **Heat Map**     | Department × Cycle matrix (future)        | D3.js (image)    |

### 7.2 Backend Chart Generation

**Using Chart.js (Node Canvas):**

```bash
npm install chart.js chartjs-node-canvas
```

```javascript
// Backend service: services/chartGeneratorService.js
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

class ChartGeneratorService {
  constructor() {
    this.canvasRenderService = new ChartJSNodeCanvas({
      width: 800,
      height: 600,
      backgroundColour: "white",
    });
  }

  // Generate bar chart for department comparison
  async generateDepartmentComparisonChart(data) {
    const configuration = {
      type: "bar",
      data: {
        labels: data.labels, // ["Khoa Nội", "Khoa Ngoại", ...]
        datasets: [
          {
            label: "Điểm KPI trung bình",
            data: data.values, // [8.2, 8.5, 7.9, ...]
            backgroundColor: "#1939B7",
            borderColor: "#1939B7",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y", // Horizontal bars
        plugins: {
          title: {
            display: true,
            text: "So sánh điểm KPI theo phòng ban",
            font: { size: 18 },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: "Điểm KPI",
            },
          },
        },
      },
    };

    const buffer = await this.canvasRenderService.renderToBuffer(configuration);
    return buffer.toString("base64");
  }

  // Generate line chart for trend analysis
  async generateTrendChart(data) {
    const configuration = {
      type: "line",
      data: {
        labels: data.labels, // ["Q1/2025", "Q2/2025", ...]
        datasets: data.datasets.map((dataset, index) => ({
          label: dataset.name,
          data: dataset.values,
          borderColor: this.getColorByIndex(index),
          backgroundColor: this.getColorByIndex(index, 0.1),
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
        })),
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Xu hướng điểm KPI qua các chu kỳ",
            font: { size: 18 },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 6,
            max: 10,
            title: {
              display: true,
              text: "Điểm KPI",
            },
          },
        },
      },
    };

    const buffer = await this.canvasRenderService.renderToBuffer(configuration);
    return buffer.toString("base64");
  }

  // Generate pie chart for status distribution
  async generateStatusDistributionChart(approved, pending) {
    const configuration = {
      type: "pie",
      data: {
        labels: ["Đã duyệt", "Chờ duyệt"],
        datasets: [
          {
            data: [approved, pending],
            backgroundColor: ["#27AE60", "#F39C12"],
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Phân bố trạng thái đánh giá",
            font: { size: 18 },
          },
          legend: {
            position: "bottom",
          },
        },
      },
    };

    const buffer = await this.canvasRenderService.renderToBuffer(configuration);
    return buffer.toString("base64");
  }

  // Helper: Get color by index
  getColorByIndex(index, alpha = 1) {
    const colors = [
      `rgba(25, 57, 183, ${alpha})`, // Blue
      `rgba(231, 76, 60, ${alpha})`, // Red
      `rgba(39, 174, 96, ${alpha})`, // Green
      `rgba(243, 156, 18, ${alpha})`, // Orange
      `rgba(155, 89, 182, ${alpha})`, // Purple
    ];
    return colors[index % colors.length];
  }
}

module.exports = new ChartGeneratorService();
```

**API Endpoint for Chart:**

```javascript
// controllers/kpi.controller.js

kpiController.getComparisonChartImage = catchAsync(async (req, res, next) => {
  const { chuKyId } = req.query;

  // Aggregate data by department
  const departmentData = await DanhGiaKPI.aggregate([
    { $match: { ChuKyDanhGiaID: mongoose.Types.ObjectId(chuKyId) } },
    {
      $lookup: {
        from: "nhanviens",
        localField: "NhanVienID",
        foreignField: "_id",
        as: "nhanVien",
      },
    },
    { $unwind: "$nhanVien" },
    {
      $lookup: {
        from: "phongbans",
        localField: "nhanVien.PhongBanID",
        foreignField: "_id",
        as: "phongBan",
      },
    },
    { $unwind: "$phongBan" },
    {
      $group: {
        _id: "$phongBan._id",
        TenPhongBan: { $first: "$phongBan.TenPhongBan" },
        DiemTrungBinh: { $avg: "$TongDiemKPI" },
      },
    },
    { $sort: { DiemTrungBinh: -1 } },
  ]);

  // Generate chart
  const chartBase64 =
    await chartGeneratorService.generateDepartmentComparisonChart({
      labels: departmentData.map((d) => d.TenPhongBan),
      values: departmentData.map((d) => d.DiemTrungBinh.toFixed(2)),
    });

  // Return as base64 or binary
  res.json({ success: true, data: { chartBase64 } });
});
```

### 7.3 Embedding Charts

**In PowerPoint (Direct Chart Data):**

```javascript
// Method 1: Use pptxgenjs built-in charts (recommended for simple charts)
slide.addChart(pres.ChartType.bar, chartData, options);

// Method 2: Embed backend-generated chart as image
const chartResponse = await apiService.get(
  "/workmanagement/kpi/charts/comparison",
  {
    params: { chuKyId },
  }
);

slide.addImage({
  data: `data:image/png;base64,${chartResponse.data.chartBase64}`,
  x: 1,
  y: 1.5,
  w: 8,
  h: 4,
});
```

**In PDF (Puppeteer):**

```html
<!-- Include chart as <img> tag in HTML template -->
<div class="chart-container">
  <img
    src="data:image/png;base64,{{chartBase64}}"
    alt="Department Comparison Chart"
    style="width: 100%; height: auto;"
  />
</div>
```

**In Excel (Embedded Chart):**

```javascript
// ExcelJS supports chart generation (v4.3+)
const imageId = workbook.addImage({
  base64: chartBase64,
  extension: "png",
});

worksheet.addImage(imageId, {
  tl: { col: 1, row: 5 }, // Top-left position
  ext: { width: 600, height: 400 },
});

// Alternative: Add chart data for Excel native charts
worksheet.addChart({
  type: "bar",
  title: { name: "So sánh điểm KPI" },
  series: [
    {
      name: "Điểm KPI",
      categories: "Sheet1!$A$2:$A$6",
      values: "Sheet1!$B$2:$B$6",
    },
  ],
  legend: { position: "bottom" },
});
```

### 7.4 Chart Styling

**Consistent Color Palette:**

```javascript
// styles/chartColors.js
const KPI_CHART_COLORS = {
  primary: "#1939B7", // Hospital blue
  success: "#27AE60", // Green (high scores, approved)
  warning: "#F39C12", // Orange (pending, medium scores)
  danger: "#E74C3C", // Red (low scores, issues)
  info: "#3498DB", // Light blue
  purple: "#9B59B6",

  // Score-based gradient
  scoreColors: {
    excellent: "#27AE60", // >= 9
    good: "#3498DB", // 8-9
    fair: "#F39C12", // 7-8
    poor: "#E74C3C", // < 7
  },

  // Department colors (rotate through)
  departments: [
    "#1939B7",
    "#E74C3C",
    "#27AE60",
    "#F39C12",
    "#9B59B6",
    "#3498DB",
  ],
};

// Get color by score
const getColorByScore = (score) => {
  if (score >= 9) return KPI_CHART_COLORS.scoreColors.excellent;
  if (score >= 8) return KPI_CHART_COLORS.scoreColors.good;
  if (score >= 7) return KPI_CHART_COLORS.scoreColors.fair;
  return KPI_CHART_COLORS.scoreColors.poor;
};

module.exports = { KPI_CHART_COLORS, getColorByScore };
```

**Apply Styling:**

```javascript
// In chart configuration
const configuration = {
  type: "bar",
  data: {
    labels: data.labels,
    datasets: [
      {
        label: "Điểm KPI",
        data: data.values,
        backgroundColor: data.values.map((score) => getColorByScore(score)),
        borderWidth: 0,
      },
    ],
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: "Phân bố điểm KPI",
        font: {
          family: "Arial",
          size: 18,
          weight: "bold",
        },
        color: "#333",
      },
      legend: {
        labels: {
          font: { family: "Arial", size: 12 },
          color: "#666",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { family: "Arial", size: 11 },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          font: { family: "Arial", size: 11 },
        },
        grid: {
          color: "#E0E0E0",
        },
      },
    },
  },
};
```

---

## 8. Export Workflow

### 8.1 Frontend Export Trigger

**Export Button Component:**

```javascript
// components/ExportToolbar.js
import { Button, Menu, MenuItem, Stack } from "@mui/material";
import {
  Download,
  PictureAsPdf,
  Description,
  InsertDriveFile,
} from "@mui/icons-material";
import { useState } from "react";

function ExportToolbar({ filters, onExport }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleExport = async (format) => {
    setAnchorEl(null);
    await onExport(format);
  };

  return (
    <Stack direction="row" spacing={2}>
      {/* Quick export buttons */}
      <Button
        variant="contained"
        color="success"
        startIcon={<Description />}
        onClick={() => handleExport("excel")}
      >
        Xuất Excel
      </Button>

      {/* Dropdown for more formats */}
      <Button
        variant="outlined"
        startIcon={<Download />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Xuất khác
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport("powerpoint")}>
          <InsertDriveFile sx={{ mr: 1 }} /> PowerPoint (.pptx)
        </MenuItem>
        <MenuItem onClick={() => handleExport("pdf")}>
          <PictureAsPdf sx={{ mr: 1 }} /> PDF (.pdf)
        </MenuItem>
      </Menu>
    </Stack>
  );
}
```

**Export Handler:**

```javascript
// pages/BaoCaoThongKePage.js
const handleExport = async (format) => {
  try {
    switch (format) {
      case "excel":
        await dispatch(exportExcelKPI(filters)).unwrap();
        break;

      case "powerpoint":
        await dispatch(exportPowerPointKPI(filters)).unwrap();
        break;

      case "pdf":
        await dispatch(exportPDFKPI(filters)).unwrap();
        break;

      default:
        toast.error("Định dạng không hợp lệ");
    }
  } catch (error) {
    console.error("Export failed:", error);
  }
};
```

### 8.2 Backend Processing

**Export Controller Pattern:**

```javascript
// controllers/kpi.controller.js

// Shared data fetching logic
const fetchKPIDataForExport = async (filters) => {
  const query = { isDeleted: false };

  if (filters.chuKyId) query.ChuKyDanhGiaID = filters.chuKyId;
  if (filters.startDate)
    query.createdAt = { $gte: new Date(filters.startDate) };
  if (filters.endDate)
    query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };

  const danhGiaKPIs = await DanhGiaKPI.aggregate([
    { $match: query },
    // ... lookup and project stages (see Section 6.1)
  ]);

  return danhGiaKPIs;
};

// Excel export
kpiController.exportBaoCaoExcel = catchAsync(async (req, res, next) => {
  const filters = req.query;
  const data = await fetchKPIDataForExport(filters);

  // Generate Excel (see Section 2.2)
  const workbook = await excelGeneratorService.generateKPIReport(data);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="BaoCaoKPI.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
});

// PDF export
kpiController.exportBaoCaoPDF = catchAsync(async (req, res, next) => {
  const filters = req.query;
  const data = await fetchKPIDataForExport(filters);

  // Generate PDF (see Section 4.1)
  const pdfBuffer = await pdfGeneratorService.generateKPIReport(data);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="BaoCaoKPI.pdf"`);
  res.send(pdfBuffer);
});

// PowerPoint export (via frontend pptxgenjs)
kpiController.getKPIDataForPowerPoint = catchAsync(async (req, res, next) => {
  const filters = req.query;
  const data = await fetchKPIDataForExport(filters);

  // Send data to frontend for pptxgenjs generation
  return sendResponse(res, 200, true, { data }, null, "Lấy dữ liệu thành công");
});
```

### 8.3 File Download

**Blob Download (Excel/PDF):**

```javascript
// Redux thunk for Excel export
export const exportExcelKPI = (filters) => async (dispatch) => {
  try {
    toast.info("Đang xuất báo cáo Excel...");

    const response = await apiService.get(
      "/workmanagement/kpi/bao-cao/export-excel",
      {
        params: filters,
        responseType: "blob", // ⚠️ Critical
      }
    );

    // Create download link
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCaoKPI_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Xuất báo cáo Excel thành công");
  } catch (error) {
    toast.error(error.message || "Lỗi xuất báo cáo Excel");
  }
};
```

**Client-Side Generation (PowerPoint):**

```javascript
// Redux thunk for PowerPoint export
export const exportPowerPointKPI = (filters) => async (dispatch) => {
  try {
    toast.info("Đang chuẩn bị dữ liệu PowerPoint...");

    // Fetch data from backend
    const response = await apiService.get(
      "/workmanagement/kpi/bao-cao/data-for-powerpoint",
      {
        params: filters,
      }
    );

    const data = response.data.data;

    // Generate PowerPoint on client (see Section 3)
    const pres = new pptxgen();
    // ... add slides with data

    // Download
    await pres.writeFile(`BaoCaoKPI_${Date.now()}.pptx`);

    toast.success("Xuất báo cáo PowerPoint thành công");
  } catch (error) {
    toast.error(error.message || "Lỗi xuất báo cáo PowerPoint");
  }
};
```

### 8.4 Progress Indication

**Progress Bar for Large Exports:**

```javascript
// components/ExportProgressDialog.js
import {
  Dialog,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";

function ExportProgressDialog({ open, progress, message }) {
  return (
    <Dialog open={open} disableEscapeKeyDown>
      <DialogTitle>Đang xuất báo cáo</DialogTitle>
      <DialogContent sx={{ width: 400 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {message}
        </Typography>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="caption" sx={{ mt: 1 }}>
          {progress}%
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

// Usage in export handler
const [exportProgress, setExportProgress] = useState({
  open: false,
  progress: 0,
  message: "",
});

const handleExport = async (format) => {
  setExportProgress({
    open: true,
    progress: 0,
    message: "Đang lấy dữ liệu...",
  });

  try {
    // Step 1: Fetch data (20%)
    setExportProgress({
      open: true,
      progress: 20,
      message: "Đang xử lý dữ liệu...",
    });
    const data = await fetchData();

    // Step 2: Generate file (60%)
    setExportProgress({
      open: true,
      progress: 60,
      message: "Đang tạo file...",
    });
    await generateFile(data);

    // Step 3: Download (100%)
    setExportProgress({ open: true, progress: 100, message: "Hoàn thành!" });

    setTimeout(() => {
      setExportProgress({ open: false, progress: 0, message: "" });
    }, 1000);
  } catch (error) {
    setExportProgress({ open: false, progress: 0, message: "" });
    toast.error(error.message);
  }
};
```

---

## 9. Performance Optimization

### 9.1 Large Dataset Handling

**Problem**: Export 1000+ records → Slow query + Large file

**Solution 1: Pagination/Streaming (Excel)**

```javascript
// Stream Excel generation for large datasets
kpiController.exportBaoCaoExcel = catchAsync(async (req, res, next) => {
  const filters = req.query;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="BaoCaoKPI.xlsx"`);

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res, // Stream directly to response
  });

  const worksheet = workbook.addWorksheet("Báo cáo KPI");

  // Add headers
  worksheet.columns = [
    /* ... column definitions ... */
  ];

  // Stream data in batches
  const BATCH_SIZE = 100;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await DanhGiaKPI.find(filters)
      .skip(skip)
      .limit(BATCH_SIZE)
      .populate("NhanVienID")
      .lean();

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    // Add rows
    batch.forEach((kpi) => {
      worksheet
        .addRow({
          /* ... row data ... */
        })
        .commit(); // Commit each row to stream
    });

    skip += BATCH_SIZE;
  }

  await workbook.commit();
});
```

**Solution 2: Background Job (Large Reports)**

```javascript
// controllers/kpi.controller.js
const Bull = require("bull");
const exportQueue = new Bull("kpi-export-queue");

kpiController.requestExportJob = catchAsync(async (req, res, next) => {
  const { filters } = req.body;
  const userId = req.userId;

  // Add job to queue
  const job = await exportQueue.add(
    "export-excel",
    { filters, userId },
    {
      attempts: 3,
      backoff: 5000,
    }
  );

  return sendResponse(
    res,
    202,
    true,
    { jobId: job.id },
    null,
    "Đang xử lý báo cáo. Bạn sẽ nhận được thông báo khi hoàn thành."
  );
});

// Worker process
exportQueue.process("export-excel", async (job) => {
  const { filters, userId } = job.data;

  job.progress(10); // Update progress

  // Generate file
  const data = await fetchKPIDataForExport(filters);
  job.progress(50);

  const workbook = await excelGeneratorService.generateKPIReport(data);
  job.progress(80);

  // Save to cloud storage
  const buffer = await workbook.xlsx.writeBuffer();
  const fileUrl = await uploadToCloudStorage(
    buffer,
    `kpi-report-${userId}-${Date.now()}.xlsx`
  );
  job.progress(100);

  // Send notification to user
  await sendNotification(userId, {
    type: "EXPORT_COMPLETE",
    message: "Báo cáo KPI đã sẵn sàng",
    fileUrl,
  });

  return { fileUrl };
});
```

### 9.2 Background Processing

**Using Web Workers (Frontend - PowerPoint):**

```javascript
// workers/pptxGenerator.worker.js
import pptxgen from "pptxgenjs";

self.onmessage = async (e) => {
  const { data, filters } = e.data;

  try {
    const pres = new pptxgen();
    // ... generate slides

    const blob = await pres.write({ outputType: "blob" });

    self.postMessage({ success: true, blob });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};

// Usage in React component
import PptxWorker from "./workers/pptxGenerator.worker.js";

const handleExportPowerPoint = async () => {
  const worker = new PptxWorker();

  worker.postMessage({ data, filters });

  worker.onmessage = (e) => {
    if (e.data.success) {
      const url = window.URL.createObjectURL(e.data.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "BaoCaoKPI.pptx";
      link.click();
      toast.success("Xuất thành công!");
    } else {
      toast.error(e.data.error);
    }
  };
};
```

### 9.3 Caching Strategies

**Cache Aggregated Data:**

```javascript
// Use Redis to cache department statistics
const redis = require("redis");
const client = redis.createClient();

kpiController.getDepartmentStats = catchAsync(async (req, res, next) => {
  const { chuKyId } = req.query;
  const cacheKey = `kpi:stats:${chuKyId}`;

  // Check cache first
  const cachedData = await client.get(cacheKey);
  if (cachedData) {
    return sendResponse(
      res,
      200,
      true,
      JSON.parse(cachedData),
      null,
      "From cache"
    );
  }

  // Calculate stats
  const stats = await calculateDepartmentStats(chuKyId);

  // Cache for 1 hour
  await client.setEx(cacheKey, 3600, JSON.stringify(stats));

  return sendResponse(res, 200, true, stats, null, "Success");
});

// Invalidate cache on approval
kpiController.duyetKPI = catchAsync(async (req, res, next) => {
  // ... approval logic

  // Invalidate cache for this cycle
  const cacheKey = `kpi:stats:${danhGia.ChuKyDanhGiaID}`;
  await client.del(cacheKey);

  // ... rest of logic
});
```

### 9.4 File Size Optimization

**Excel Optimization:**

```javascript
// Avoid formulas in large sheets - pre-calculate values
// BAD: worksheet.getCell("I2").value = { formula: "=G2*H2" };
// GOOD: worksheet.getCell("I2").value = calculatedValue;

// Remove unnecessary styles
worksheet.eachRow({ includeEmpty: false }, (row) => {
  row.eachCell({ includeEmpty: false }, (cell) => {
    // Only apply borders, skip fills for data rows
    cell.border = simpleBorder;
  });
});

// Use shared strings (ExcelJS does this automatically)

// Compress images
const compressedImage = await sharp(buffer)
  .resize(600, 400, { fit: "inside" })
  .jpeg({ quality: 80 })
  .toBuffer();
```

**PowerPoint Optimization:**

```javascript
// Reduce image quality
slide.addImage({
  path: imageUrl,
  x: 1,
  y: 1,
  w: 8,
  h: 4,
  sizing: {
    type: "contain",
    w: 800, // Max width
    h: 600, // Max height
  },
});

// Limit data points in charts
const chartData = fullData.slice(0, 50); // Show top 50 only

// Use built-in charts instead of images when possible
```

**PDF Optimization:**

```javascript
// Puppeteer PDF options
await page.pdf({
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: false, // Reduce file size if not needed
  margin: { top: "1cm", bottom: "1cm" },
  // Compress images in HTML before PDF generation
});
```

---

## 10. Error Handling & Edge Cases

### 10.1 Common Error Scenarios

**1. No Data to Export:**

```javascript
// Backend validation
if (danhGiaKPIs.length === 0) {
  throw new AppError(404, "Không có dữ liệu để xuất", "NO_DATA_TO_EXPORT");
}

// Frontend handling
try {
  await dispatch(exportExcelKPI(filters)).unwrap();
} catch (error) {
  if (error.message.includes("Không có dữ liệu")) {
    toast.warning("Không có dữ liệu phù hợp với bộ lọc. Vui lòng thử lại.");
  } else {
    toast.error("Lỗi xuất báo cáo");
  }
}
```

**2. Permission Denied:**

```javascript
// Backend check
const userDoc = await User.findById(req.userId);
const isManager = userDoc.PhanQuyen === "manager";

if (isManager && filters.khoaId !== userDoc.KhoaID.toString()) {
  throw new AppError(
    403,
    "Bạn chỉ có thể xuất báo cáo phòng ban của mình",
    "PERMISSION_DENIED"
  );
}

// Frontend error display
<Alert severity="error" sx={{ mb: 2 }}>
  Bạn không có quyền xuất báo cáo này. Vui lòng liên hệ quản trị viên.
</Alert>;
```

**3. File Generation Timeout:**

```javascript
// Backend timeout handling
const timeout = 30000; // 30 seconds

const generateWithTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs)
    ),
  ]);
};

try {
  await generateWithTimeout(workbook.xlsx.write(res), timeout);
} catch (error) {
  if (error.message === "TIMEOUT") {
    throw new AppError(
      408,
      "Thời gian xử lý quá lâu. Vui lòng giảm phạm vi dữ liệu hoặc thử lại sau.",
      "TIMEOUT"
    );
  }
  throw error;
}
```

**4. Invalid Filter Parameters:**

```javascript
// Validation middleware
const validateExportFilters = (req, res, next) => {
  const { chuKyId, startDate, endDate } = req.query;

  if (chuKyId && !mongoose.Types.ObjectId.isValid(chuKyId)) {
    return next(new AppError(400, "Chu kỳ không hợp lệ", "INVALID_CYCLE_ID"));
  }

  if (startDate && !dayjs(startDate).isValid()) {
    return next(
      new AppError(400, "Ngày bắt đầu không hợp lệ", "INVALID_START_DATE")
    );
  }

  if (endDate && !dayjs(endDate).isValid()) {
    return next(
      new AppError(400, "Ngày kết thúc không hợp lệ", "INVALID_END_DATE")
    );
  }

  if (startDate && endDate && dayjs(startDate).isAfter(endDate)) {
    return next(
      new AppError(
        400,
        "Ngày bắt đầu phải trước ngày kết thúc",
        "INVALID_DATE_RANGE"
      )
    );
  }

  next();
};

// Apply to route
router.get(
  "/export-excel",
  validateExportFilters,
  kpiController.exportBaoCaoExcel
);
```

**5. Memory Overflow (Large Dataset):**

```javascript
// Monitor memory usage
const checkMemoryUsage = () => {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round((used.heapUsed / 1024 / 1024) * 100) / 100;

  if (heapUsedMB > 400) {
    // 400MB threshold
    console.warn(`High memory usage: ${heapUsedMB} MB`);
    return false;
  }
  return true;
};

// Before export
if (!checkMemoryUsage()) {
  throw new AppError(
    503,
    "Hệ thống đang quá tải. Vui lòng thử lại sau hoặc giảm phạm vi dữ liệu.",
    "SERVICE_OVERLOAD"
  );
}
```

### 10.2 Validation Before Export

**Frontend Pre-Export Validation:**

```javascript
// components/ExportValidationDialog.js
function ExportValidationDialog({ filters, onConfirm, onCancel }) {
  const [estimatedRows, setEstimatedRows] = useState(0);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    // Estimate data size
    const estimate = async () => {
      try {
        const response = await apiService.get(
          "/workmanagement/kpi/bao-cao/estimate-size",
          {
            params: filters,
          }
        );

        setEstimatedRows(response.data.data.count);

        const warns = [];
        if (response.data.data.count > 1000) {
          warns.push(
            "Dữ liệu lớn (>1000 dòng) - quá trình xuất có thể mất vài phút."
          );
        }
        if (response.data.data.count === 0) {
          warns.push("Không có dữ liệu phù hợp với bộ lọc.");
        }
        setWarnings(warns);
      } catch (error) {
        console.error(error);
      }
    };

    estimate();
  }, [filters]);

  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>Xác nhận xuất báo cáo</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Dữ liệu sẽ xuất: <strong>{estimatedRows}</strong> bản ghi
        </Typography>

        {warnings.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {warnings.map((warn, idx) => (
              <div key={idx}>• {warn}</div>
            ))}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Hủy</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={estimatedRows === 0}
        >
          Tiếp tục
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Backend Estimate Endpoint:**

```javascript
kpiController.estimateExportSize = catchAsync(async (req, res, next) => {
  const filters = req.query;
  const query = buildQueryFromFilters(filters);

  const count = await DanhGiaKPI.countDocuments(query);

  return sendResponse(
    res,
    200,
    true,
    { count },
    null,
    "Ước tính kích thước thành công"
  );
});
```

### 10.3 Timeout Handling

**Progressive Timeout Strategy:**

```javascript
// Backend: Increase timeout for large exports
app.use("/api/workmanagement/kpi/bao-cao/export-*", (req, res, next) => {
  req.setTimeout(120000); // 2 minutes for export endpoints
  res.setTimeout(120000);
  next();
});

// Frontend: Show timeout warning
const EXPORT_TIMEOUT = 90000; // 90 seconds

const exportWithTimeout = async (exportFn, timeoutMs) => {
  return Promise.race([
    exportFn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("FRONTEND_TIMEOUT")), timeoutMs)
    ),
  ]);
};

try {
  await exportWithTimeout(
    () => dispatch(exportExcelKPI(filters)).unwrap(),
    EXPORT_TIMEOUT
  );
} catch (error) {
  if (error.message === "FRONTEND_TIMEOUT") {
    toast.error(
      "Quá trình xuất mất quá nhiều thời gian. Vui lòng giảm phạm vi dữ liệu hoặc thử lại sau.",
      { autoClose: 5000 }
    );
  }
}
```

### 10.4 Partial Success

**Scenario**: Some data fails validation during export

```javascript
// Backend: Collect validation errors
const exportWithValidation = async (danhGiaKPIs) => {
  const validRecords = [];
  const invalidRecords = [];

  danhGiaKPIs.forEach((kpi, index) => {
    try {
      // Validate record
      if (!kpi.NhanVienID) {
        throw new Error("Missing employee data");
      }
      if (kpi.TongDiemKPI === null) {
        throw new Error("Missing score");
      }

      validRecords.push(kpi);
    } catch (error) {
      invalidRecords.push({
        index,
        _id: kpi._id,
        error: error.message,
      });
    }
  });

  return { validRecords, invalidRecords };
};

kpiController.exportBaoCaoExcel = catchAsync(async (req, res, next) => {
  const data = await fetchKPIDataForExport(req.query);
  const { validRecords, invalidRecords } = await exportWithValidation(data);

  if (validRecords.length === 0) {
    throw new AppError(400, "Không có dữ liệu hợp lệ để xuất", "NO_VALID_DATA");
  }

  // Generate workbook with valid records
  const workbook = await excelGeneratorService.generateKPIReport(validRecords);

  // Add warning sheet if there are invalid records
  if (invalidRecords.length > 0) {
    const warningSheet = workbook.addWorksheet("Cảnh báo");
    warningSheet.getCell(
      "A1"
    ).value = `Có ${invalidRecords.length} bản ghi không hợp lệ:`;

    invalidRecords.forEach((record, index) => {
      warningSheet.getCell(`A${index + 3}`).value = `ID: ${record._id}`;
      warningSheet.getCell(`B${index + 3}`).value = record.error;
    });
  }

  // ... write to response
});
```

**Frontend Notification:**

```javascript
// Redux slice
slice.reducers.exportExcelSuccess = (state, action) => {
  const { validCount, invalidCount } = action.payload;

  if (invalidCount > 0) {
    toast.warning(
      `Xuất thành công ${validCount} bản ghi. ${invalidCount} bản ghi bị bỏ qua (xem sheet "Cảnh báo").`,
      { autoClose: 7000 }
    );
  } else {
    toast.success(`Xuất thành công ${validCount} bản ghi!`);
  }
};
```

---

## 11. Real-World Examples

### 11.1 Monthly Department Report (Excel)

**Scenario**: Trưởng khoa xuất báo cáo tháng 3 cho Khoa Nội

**Request:**

```javascript
const filters = {
  chuKyId: "66a1234567890abcdef12345", // Tháng 3/2026
  khoaId: "66b9876543210fedcba54321", // Khoa Nội
};

await dispatch(exportExcelKPI(filters)).unwrap();
```

**Generated File Structure:**

```
BaoCaoKPI_Thang03_2026.xlsx
├─ Sheet: "Tổng quan"
│  ├─ Tiêu đề: "BÁO CÁO KPI - KHOA NỘI - THÁNG 3/2026"
│  ├─ Thống kê:
│  │  ├─ Tổng số nhân viên: 25
│  │  ├─ Đã đánh giá: 23
│  │  ├─ Đã duyệt: 20
│  │  ├─ Điểm trung bình: 8.2
│  │  └─ Xếp loại: Tốt
│  └─ Phân bố:
│     ├─ >= 9.0: 2 người (8.7%)
│     ├─ 8.0-9.0: 11 người (47.8%)
│     ├─ 7.0-8.0: 8 người (34.8%)
│     └─ 6.0-7.0: 2 người (8.7%)
│
├─ Sheet: "Chi tiết"
│  └─ Danh sách 23 nhân viên với:
│     ├─ Mã NV, Họ tên, Chức danh
│     ├─ Điểm tự đánh giá, Điểm quản lý, Tổng điểm
│     ├─ Trạng thái, Ngày duyệt
│     └─ Highlight: Green nếu >= 9, Yellow nếu < 7
│
└─ Sheet: "Top 5"
   └─ Top 5 nhân viên xuất sắc với ảnh đại diện (nếu có)
```

**Backend Query:**

```javascript
// Optimized aggregation for monthly report
const monthlyData = await DanhGiaKPI.aggregate([
  {
    $match: {
      ChuKyDanhGiaID: mongoose.Types.ObjectId(chuKyId),
      isDeleted: false,
    },
  },
  {
    $lookup: {
      from: "nhanviens",
      let: { nhanVienId: "$NhanVienID" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$nhanVienId"] } } },
        {
          $lookup: {
            from: "phongbans",
            localField: "PhongBanID",
            foreignField: "_id",
            as: "phongBan",
          },
        },
        { $unwind: "$phongBan" },
        { $match: { "phongBan._id": mongoose.Types.ObjectId(khoaId) } },
      ],
      as: "nhanVien",
    },
  },
  { $unwind: "$nhanVien" },
  { $sort: { TongDiemKPI: -1 } },
  {
    $facet: {
      data: [
        {
          $project: {
            /* all fields */
          },
        },
      ],
      stats: [
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgScore: { $avg: "$TongDiemKPI" },
            maxScore: { $max: "$TongDiemKPI" },
            minScore: { $min: "$TongDiemKPI" },
          },
        },
      ],
    },
  },
]);
```

### 11.2 Quarterly Presentation (PowerPoint)

**Scenario**: BGĐ trình bày kết quả Q1/2026 tại họp Ban Giám Đốc

**Request:**

```javascript
const filters = {
  chuKyId: "66c1111222333444555666", // Q1/2026
};

await dispatch(exportPowerPointKPI(filters)).unwrap();
```

**Slide Structure (15 slides):**

```
BaoCaoKPI_Q1_2026.pptx

1. COVER SLIDE
   - Title: "BÁO CÁO ĐÁNH GIÁ KPI - QUÝ 1/2026"
   - Background: Hospital logo + theme color

2. EXECUTIVE SUMMARY
   - 4 key metrics in colored boxes:
     • Tổng đánh giá: 120 | Đã duyệt: 115 | Điểm TB: 8.3 | Tăng trưởng: +3.7%

3. OVERALL DISTRIBUTION
   - Pie chart: Status distribution (96% approved, 4% pending)
   - Bar chart: Score distribution by range

4. DEPARTMENT COMPARISON
   - Horizontal bar chart: 10 departments sorted by average score
   - Highlight: Top 3 (green), Bottom 3 (red)

5-8. DEPARTMENT DEEP DIVE (4 slides)
   - Slide per department: Khoa Nội, Khoa Ngoại, Khoa Sản, Khoa Nhi
   - Each slide:
     • Department stats
     • Top 3 performers table
     • Mini trend chart (last 4 quarters)

9. TOP PERFORMERS
   - Table: Top 10 employees across hospital
   - Includes: Photo, Name, Department, Score

10. IMPROVEMENT AREAS
    - Table: Bottom 10 employees (anonymized)
    - Focus on departments needing support

11. TREND ANALYSIS
    - Multi-line chart: Score trends over last 12 months
    - By department

12. TASK COMPLETION CORRELATION
    - Scatter plot: CongViec completion rate vs KPI score
    - Shows positive correlation

13. RECOMMENDATIONS
    - Bullet points:
      • Recognize top performers
      • Support improvement areas
      • Maintain momentum

14. NEXT STEPS
    - Timeline for Q2:
      • Đánh giá: 01/04 - 30/06
      • Duyệt: 01/07 - 15/07
      • Họp tổng kết: 20/07

15. THANK YOU SLIDE
    - Contact info for questions
```

**Frontend Generation Code:**

```javascript
// exportPowerPointService.js
export const generateQuarterlyPresentation = async (data) => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Bệnh viện Phú Thọ";
  pres.title = "Báo cáo KPI Q1/2026";

  // Slide 1: Cover
  const cover = pres.addSlide();
  cover.background = { path: "/assets/bv-background.png" };
  cover.addText("BÁO CÁO ĐÁNH GIÁ KPI", {
    x: 1,
    y: 2,
    w: 8,
    h: 1,
    fontSize: 44,
    bold: true,
    color: "1939B7",
    align: "center",
  });
  cover.addText("Quý 1/2026", {
    x: 1,
    y: 3,
    w: 8,
    h: 0.6,
    fontSize: 32,
    color: "363636",
    align: "center",
  });

  // Slide 2: Executive Summary
  const summary = pres.addSlide();
  addMetricBoxes(summary, data.metrics);

  // Slide 3: Distribution charts
  const distribution = pres.addSlide();
  distribution.addChart(pres.ChartType.pie, data.statusDistribution, {
    x: 0.5,
    y: 1.5,
    w: 4.5,
    h: 4,
  });
  distribution.addChart(pres.ChartType.bar, data.scoreDistribution, {
    x: 5.5,
    y: 1.5,
    w: 4.5,
    h: 4,
  });

  // ... more slides

  return pres;
};
```

### 11.3 Individual Assessment (PDF)

**Scenario**: Nhân viên yêu cầu in phiếu đánh giá cá nhân để nộp hồ sơ

**Request:**

```javascript
const params = {
  nhanVienId: "66d7777888999aaabbbccc",
  chuKyId: "66c1111222333444555666",
};

await dispatch(exportIndividualPDF(params)).unwrap();
```

**PDF Structure (3 pages):**

```
PhieuDanhGia_NguyenVanA_Q1_2026.pdf

PAGE 1: COVER & SUMMARY
┌────────────────────────────────────────┐
│ [LOGO] BỆNH VIỆN PHÚ THỌ               │
│                                        │
│     PHIẾU ĐÁNH GIÁ HIỆU SUẤT          │
│        Quý 1/2026                      │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Họ và tên: Nguyễn Văn A           │ │
│ │ Mã NV: NV001                       │ │
│ │ Chức danh: Điều dưỡng trưởng      │ │
│ │ Phòng ban: Khoa Nội Tổng Hợp      │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌─────────────────────────┐           │
│ │   KẾT QUẢ ĐÁNH GIÁ     │           │
│ │                         │           │
│ │        8.5              │ (Large)   │
│ │   Xếp loại: TỐT        │           │
│ └─────────────────────────┘           │
│                                        │
│ • Điểm tự đánh giá: 8.3               │
│ • Điểm quản lý: 8.6                   │
│ • Người đánh giá: BS. Trần Thị B      │
│ • Ngày duyệt: 05/04/2026              │
└────────────────────────────────────────┘

PAGE 2: DETAILED DUTIES
┌────────────────────────────────────────┐
│ CHI TIẾT NHIỆM VỤ THƯỜNG QUY          │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Nhiệm vụ | Điểm QL | ĐiểmTĐG | ĐNV│ │
│ ├────────────────────────────────────┤ │
│ │ Chăm sóc BN | 9.0 | 8.5 | 8.83    │ │
│ │ Vệ sinh PB  | 8.0 | 8.0 | 8.0     │ │
│ │ Báo cáo BS  | 8.5 | 8.0 | 8.33    │ │
│ │ ...         | ... | ... | ...     │ │
│ └────────────────────────────────────┘ │
│                                        │
│ NHẬN XÉT CỦA QUẢN LÝ:                 │
│ "Nhân viên có tinh thần trách nhiệm   │
│ cao, hoàn thành tốt công việc..."     │
└────────────────────────────────────────┘

PAGE 3: HISTORICAL PERFORMANCE
┌────────────────────────────────────────┐
│ LỊCH SỬ ĐÁNH GIÁ                      │
│                                        │
│ [Line chart: Điểm KPI 4 quý gần nhất] │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Chu kỳ    │ Điểm KPI │ Xếp loại  │ │
│ ├────────────────────────────────────┤ │
│ │ Q4/2025   │ 8.2      │ Tốt       │ │
│ │ Q3/2025   │ 8.0      │ Tốt       │ │
│ │ Q2/2025   │ 7.8      │ Khá       │ │
│ │ Q1/2025   │ 7.5      │ Khá       │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ────────────────────────────────────── │
│ Phú Thọ, ngày 05 tháng 04 năm 2026    │
│                                        │
│ NHÂN VIÊN        QUẢN LÝ       GIÁM ĐỐC│
│ (Ký, họ tên)   (Ký, họ tên)  (Ký, dấu)│
│                                        │
└────────────────────────────────────────┘
```

### 11.4 Hospital-Wide Summary (All Formats)

**Scenario**: Cuối năm xuất báo cáo tổng kết toàn bệnh viện (Excel + PowerPoint + PDF)

**Request:**

```javascript
const filters = {
  startDate: "2026-01-01",
  endDate: "2026-12-31",
};

// Export all formats
await Promise.all([
  dispatch(exportExcelKPI(filters)).unwrap(),
  dispatch(exportPowerPointKPI(filters)).unwrap(),
  dispatch(exportPDFKPI(filters)).unwrap(),
]);

toast.success("Đã xuất 3 file: Excel, PowerPoint, PDF");
```

**Excel File (Multiple Sheets):**

```
BaoCaoKPI_NamKPI_2026.xlsx
├─ Sheet 1: "Tổng quan"
│  ├─ Summary stats for entire year
│  ├─ Chart: Monthly average score trend
│  └─ Chart: Department comparison
│
├─ Sheet 2: "Q1_ChiTiet" (357 records)
├─ Sheet 3: "Q2_ChiTiet" (362 records)
├─ Sheet 4: "Q3_ChiTiet" (368 records)
├─ Sheet 5: "Q4_ChiTiet" (375 records)
│
├─ Sheet 6: "Top_Performers"
│  └─ Top 20 employees of the year
│
├─ Sheet 7: "Phong_Ban"
│  └─ Department-level aggregation
│
└─ Sheet 8: "Thong_Ke"
   └─ Pivot-like statistics
```

**PowerPoint (30 slides):**

- Executive summary
- Quarterly breakdown (4 sections)
- Department deep dives (10 departments)
- Award recommendations
- Year-over-year comparison
- Action items for next year

**PDF (50 pages):**

- Official report format
- Detailed analysis
- Charts and graphs
- Statistical appendix
- Signatures from all department heads

---

## 📚 Related Documents

- [00_OVERVIEW.md](./00_OVERVIEW.md) - Data models & architecture
- [04_APPROVAL_WORKFLOW.md](./04_APPROVAL_WORKFLOW.md) - Approval status required for reports
- [06_SELF_ASSESSMENT.md](./06_SELF_ASSESSMENT.md) - Self-assessment data in reports
- [07_BATCH_OPERATIONS.md](./07_BATCH_OPERATIONS.md) - Batch export operations
- [09_API_REFERENCE.md](./09_API_REFERENCE.md) - Export API endpoints

---

**Next**: [09_API_REFERENCE.md](./09_API_REFERENCE.md) - Complete API catalog →
