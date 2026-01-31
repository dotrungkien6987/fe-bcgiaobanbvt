# 📱 Plan: Mobile-First ISO Procedure Viewing UI/UX

> **Mục tiêu**: Cải thiện trải nghiệm xem quy trình ISO trên mobile với UI card-based, 1-click xem PDF, và download options rõ ràng.

## 🎯 Phạm vi

**2 trang cần redesign:**

- `/quytrinh-iso/duoc-phan-phoi` (DistributedToMePage.js) - Quy trình được phân phối cho khoa
- `/quytrinh-iso/khoa-xay-dung` (BuiltByMyDeptPage.js) - Quy trình khoa xây dựng

**Target Users:**

- Nhân viên y tế tại các khoa
- Chủ yếu sử dụng mobile
- Cần xem nhanh quy trình, không cần chỉnh sửa

---

## 📋 Tổng quan các việc cần làm

### Phase 1: Backend API Enhancement

| #   | Task                               | File                        | Mô tả                                                                                    |
| --- | ---------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| 1.1 | Thêm FilePDF info vào API response | `quytrinhiso.controller.js` | Include `FilePDF: { _id, TenFile, KichThuoc }` trong list response để tránh fetch detail |
| 1.2 | Thêm FileWord info (optional)      | `quytrinhiso.controller.js` | Include `FileWord` nếu có, để hiển thị trong bottom sheet                                |

### Phase 2: Frontend Components

| #   | Task                             | File                               | Mô tả                                   |
| --- | -------------------------------- | ---------------------------------- | --------------------------------------- |
| 2.1 | Tạo `ISOProcedureCard.js`        | `features/QuyTrinhISO/components/` | Mobile-optimized card component         |
| 2.2 | Tạo `DownloadBottomSheet.js`     | `features/QuyTrinhISO/components/` | Bottom sheet chọn file tải về           |
| 2.3 | Cải thiện `PDFQuickViewModal.js` | `features/QuyTrinhISO/components/` | Thêm swipe-to-dismiss, loading skeleton |

### Phase 3: Page Refactoring

| #   | Task                              | File                    | Mô tả                                 |
| --- | --------------------------------- | ----------------------- | ------------------------------------- |
| 3.1 | Refactor `DistributedToMePage.js` | `features/QuyTrinhISO/` | Thêm mobile view với ISOProcedureCard |
| 3.2 | Refactor `BuiltByMyDeptPage.js`   | `features/QuyTrinhISO/` | Tương tự, reuse components            |

### Phase 4: Polish & Testing

| #   | Task               | Mô tả                           |
| --- | ------------------ | ------------------------------- |
| 4.1 | Responsive testing | Test trên các screen sizes      |
| 4.2 | Pull-to-refresh    | Thêm gesture refresh cho mobile |
| 4.3 | Loading states     | Skeleton loading cho cards      |

---

## 🏗️ Chi tiết Implementation

### 1️⃣ Backend: API Enhancement (Task 1.1, 1.2)

**File:** `giaobanbv-be/modules/quytrinhiso/quytrinhiso.controller.js`

**Hiện tại:** API `/distributed-to-me` và `/built-by-my-dept` không trả về file info

**Cần thêm:** Aggregate pipeline để include file attachments

```javascript
// Sau khi query quy trình, thêm:
const TepTin = require("../workmanagement/models/TepTin");

// Batch query files cho tất cả quy trình
const quyTrinhIds = results.map((qt) => qt._id.toString());
const files = await TepTin.find({
  OwnerType: "quytrinhiso",
  OwnerID: { $in: quyTrinhIds },
  TrangThai: "ACTIVE",
}).select("OwnerID OwnerField TenFile KichThuoc _id");

// Map files vào results
results.forEach((qt) => {
  const qtFiles = files.filter((f) => f.OwnerID === qt._id.toString());
  qt.FilePDF = qtFiles.find((f) => f.OwnerField === "filepdf") || null;
  qt.FileWord = qtFiles.find((f) => f.OwnerField === "fileword") || null;
});
```

---

### 2️⃣ Component: ISOProcedureCard (Task 2.1)

**File:** `fe-bcgiaobanbvt/src/features/QuyTrinhISO/components/ISOProcedureCard.js`

**Design:**

```
┌─────────────────────────────────────────┐
│ 📘 QT-001 v1.0           📅 15/01/2026 │
├─────────────────────────────────────────┤
│ Quy trình khám bệnh ngoại trú           │
│ 🏥 Khoa: Khám bệnh                      │
├─────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │  👁 Xem PDF     │ │  ⬇️ Tải về      │ │
│ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────┘
```

**Props:**

```typescript
interface ISOProcedureCardProps {
  quyTrinh: {
    _id: string;
    MaQuyTrinh: string;
    TenQuyTrinh: string;
    PhienBan: string;
    KhoaXayDungID: { TenKhoa: string };
    NgayPhanPhoi?: Date; // Cho DistributedToMe
    FilePDF?: { _id: string; TenFile: string; KichThuoc: number };
    FileWord?: { _id: string; TenFile: string; KichThuoc: number };
  };
  onViewPDF: (file) => void;
  onDownload: (quyTrinh) => void;
  showDistributionDate?: boolean; // true cho DistributedToMe
}
```

**Key Features:**

- Touch target 48px+ cho buttons
- 2-line text truncation cho tên quy trình
- Version badge (Chip)
- Conditional date display

---

### 3️⃣ Component: DownloadBottomSheet (Task 2.2)

**File:** `fe-bcgiaobanbvt/src/features/QuyTrinhISO/components/DownloadBottomSheet.js`

**Design:**

```
┌─────────────────────────────────────────┐
│            ═══════════                  │  ← Drag handle
│        Tải về quy trình                 │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📄 File PDF                 2.5 MB  │ │
│ │    Tài liệu chính thức              │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 📝 File Word                1.8 MB  │ │
│ │    File nguồn để chỉnh sửa          │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│              [Hủy]                      │
└─────────────────────────────────────────┘
```

**Props:**

```typescript
interface DownloadBottomSheetProps {
  open: boolean;
  onClose: () => void;
  filePDF?: { _id: string; TenFile: string; KichThuoc: number };
  fileWord?: { _id: string; TenFile: string; KichThuoc: number };
  quyTrinhName: string;
}
```

**Behavior:**

- Nếu chỉ có 1 file → **KHÔNG hiện bottom sheet**, download trực tiếp
- Nếu có 2 files → Hiện bottom sheet để chọn
- Sử dụng MUI `SwipeableDrawer` với `anchor="bottom"`

---

### 4️⃣ Improve: PDFQuickViewModal (Task 2.3)

**File:** `fe-bcgiaobanbvt/src/features/QuyTrinhISO/components/PDFQuickViewModal.js`

**Cải thiện:**

1. **Loading Skeleton:**

   ```jsx
   {
     loading && (
       <Box sx={{ p: 2 }}>
         <Skeleton variant="rectangular" height={600} />
       </Box>
     );
   }
   ```

2. **Error với Retry:**

   ```jsx
   {
     error && (
       <Alert
         severity="error"
         action={<Button onClick={fetchPdf}>Thử lại</Button>}
       >
         {error}
       </Alert>
     );
   }
   ```

3. **Mobile: Swipe to dismiss (optional enhancement):**
   - Sử dụng `react-swipeable` hoặc touch events
   - Swipe down từ top → close modal

4. **Thêm Download button trong modal:**
   ```jsx
   <DialogActions>
     <Button startIcon={<DocumentDownload />} onClick={handleDownload}>
       Tải về
     </Button>
     <Button onClick={handleClose}>Đóng</Button>
   </DialogActions>
   ```

---

### 5️⃣ Refactor: DistributedToMePage (Task 3.1)

**File:** `fe-bcgiaobanbvt/src/features/QuyTrinhISO/DistributedToMePage.js`

**Strategy: Conditional rendering based on screen size**

```jsx
import { useMediaQuery, useTheme } from "@mui/material";
import ISOProcedureCard from "./components/ISOProcedureCard";
import DownloadBottomSheet from "./components/DownloadBottomSheet";

function DistributedToMePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ... existing state ...
  const [downloadSheet, setDownloadSheet] = useState({ open: false, quyTrinh: null });

  const handleDownload = (quyTrinh) => {
    // Nếu chỉ có PDF, download trực tiếp
    if (quyTrinh.FilePDF && !quyTrinh.FileWord) {
      downloadFile(quyTrinh.FilePDF);
      return;
    }
    // Nếu có cả 2, show bottom sheet
    setDownloadSheet({ open: true, quyTrinh });
  };

  return (
    <Container>
      {/* Search Bar - giữ nguyên */}

      {isMobile ? (
        // MOBILE: Card List
        <Stack spacing={2}>
          {distributedList.map(qt => (
            <ISOProcedureCard
              key={qt._id}
              quyTrinh={qt}
              onViewPDF={(file) => setPdfModal({ open: true, file })}
              onDownload={handleDownload}
              showDistributionDate={true}
            />
          ))}
        </Stack>
      ) : (
        // DESKTOP: Table - giữ nguyên code hiện tại
        <TableContainer>...</TableContainer>
      )}

      {/* Modals */}
      <PDFQuickViewModal ... />
      <DownloadBottomSheet
        open={downloadSheet.open}
        onClose={() => setDownloadSheet({ open: false, quyTrinh: null })}
        filePDF={downloadSheet.quyTrinh?.FilePDF}
        fileWord={downloadSheet.quyTrinh?.FileWord}
        quyTrinhName={downloadSheet.quyTrinh?.TenQuyTrinh}
      />
    </Container>
  );
}
```

---

### 6️⃣ Refactor: BuiltByMyDeptPage (Task 3.2)

**File:** `fe-bcgiaobanbvt/src/features/QuyTrinhISO/BuiltByMyDeptPage.js`

**Tương tự Task 3.1**, nhưng:

- `showDistributionDate={false}`
- Có thể show thêm info như "Phân phối cho X khoa"

---

## 📁 Files cần tạo/sửa

### Tạo mới:

```
fe-bcgiaobanbvt/src/features/QuyTrinhISO/components/
├── ISOProcedureCard.js        # Mobile card component
└── DownloadBottomSheet.js     # Bottom sheet for download options
```

### Sửa đổi:

```
giaobanbv-be/
└── modules/quytrinhiso/quytrinhiso.controller.js  # Add file info to API

fe-bcgiaobanbvt/src/features/QuyTrinhISO/
├── DistributedToMePage.js     # Add mobile view
├── BuiltByMyDeptPage.js       # Add mobile view
└── components/
    └── PDFQuickViewModal.js   # Improve loading/error states
```

---

## ⏱️ Ước tính thời gian

| Phase     | Task                           | Estimate     |
| --------- | ------------------------------ | ------------ |
| 1         | Backend API Enhancement        | 30 phút      |
| 2.1       | ISOProcedureCard component     | 45 phút      |
| 2.2       | DownloadBottomSheet component  | 30 phút      |
| 2.3       | PDFQuickViewModal improvements | 20 phút      |
| 3.1       | DistributedToMePage refactor   | 30 phút      |
| 3.2       | BuiltByMyDeptPage refactor     | 20 phút      |
| 4         | Testing & Polish               | 30 phút      |
| **Total** |                                | **~3.5 giờ** |

---

## 🚀 Thứ tự thực hiện

```
1. Backend: Thêm file info vào API (Phase 1)
   ↓
2. Tạo ISOProcedureCard component (Phase 2.1)
   ↓
3. Tạo DownloadBottomSheet component (Phase 2.2)
   ↓
4. Cải thiện PDFQuickViewModal (Phase 2.3)
   ↓
5. Refactor DistributedToMePage (Phase 3.1)
   ↓
6. Refactor BuiltByMyDeptPage (Phase 3.2)
   ↓
7. Testing trên mobile (Phase 4)
```

---

## ✅ Definition of Done

- [x] API trả về FilePDF và FileWord info trong list response
- [x] Mobile view hiển thị cards thay vì table
- [x] 1-click "Xem PDF" mở modal fullscreen
- [x] "Tải về" button:
  - 1 file → download trực tiếp
  - 2+ files → bottom sheet chọn
- [x] Touch targets ≥ 48px
- [x] Loading skeleton khi fetch data
- [ ] Pull-to-refresh hoạt động (bonus - chưa implement)
- [ ] Test trên iOS Safari và Android Chrome

---

## 📝 Implementation Summary (Completed)

### Files Created:

1. `ISOProcedureCard.js` - Mobile-optimized card with 2 action buttons
2. `DownloadBottomSheet.js` - SwipeableDrawer for file selection

### Files Modified:

1. `quyTrinhISO.controller.js` - Added FilePDF/FileWord to API responses
2. `PDFQuickViewModal.js` - Added retry button on error
3. `DistributedToMePage.js` - Added mobile card view with isMobile breakpoint
4. `BuiltByMyDeptPage.js` - Added mobile card view with isMobile breakpoint

### Key Features:

- **Responsive**: Table on desktop (md+), Cards on mobile (<md)
- **1-Click PDF**: Cards include FilePDF data, no extra API call
- **Smart Download**:
  - Single file → direct download
  - Multiple files → bottom sheet selection
- **Optimized API**: Batch query files in list endpoints (1 query instead of N)

**Sẵn sàng bắt đầu? Hãy confirm để tôi thực hiện từng phase!** 🚀
