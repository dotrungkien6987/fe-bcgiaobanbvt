# 🔄 Context for New Conversation

> **📍 MỤC ĐÍCH FILE NÀY:** Khi token hết và bắt đầu hội thoại mới với AI, đọc file này trước để AI hiểu đầy đủ ngữ cảnh.

**Ngày tạo:** 09/01/2026  
**Trạng thái:** Project Planning Complete, Ready for Implementation

---

## 📚 Tóm Tắt Hội Thoại Trước

### Vấn Đề Ban Đầu

User muốn cải thiện UX/UI cho module QuanLyCongViec nhưng phát hiện có **2 kế hoạch chồng chéo**:

1. **docs/UX_IMPROVEMENT_2026/** - Tạo ngày 08/01/2026

   - Focus: Navigation unification, Breadcrumb, Dashboard
   - Đã implement Phase 1 (26h) + Phase 2 partial (24h)
   - Tạo ra: `useMobileLayout.js`, Touch components, ResponsiveDialog, etc.

2. **docs/PWA_CONVERSION/** - Tạo ngày 07/01/2026
   - Focus: Mobile-first PWA (bottom nav, gestures, splash, offline)
   - Chưa implement gì cả, chỉ có documentation (3,600+ dòng)

**Overlap:** Phase 2 của UX plan trùng ~35% với PWA plan (mobile components)

### Quyết Định Quan Trọng

✅ **User đã chạy `git reset --hard`** → Xóa hết code Phase 1-2 đã làm  
✅ **Merge 2 plans thành 1 plan duy nhất:** UNIFIED_PLAN_2026  
✅ **Bắt đầu lại từ đầu** với kế hoạch rõ ràng, không chồng chéo

### Kết Quả

Tạo ra **8-phase unified plan** (140 giờ):

- **Phase 0:** Navigation Refactor (24h) - BLOCKING
- **Phase 1:** Mobile Bottom Nav (5h)
- **Phase 2:** Dashboard Architecture + "Công việc của tôi" UI/UX (40h) ⭐
- **Phase 3:** Splash + Mobile Layouts (33h)
- **Phase 4:** Gestures (8h)
- **Phase 5:** Performance (10h)
- **Phase 6:** Testing (15h)

---

## 🎯 Trọng Tâm Kế Hoạch: "Công việc của tôi" Redesign

### Component Hiện Tại

**File:** `src/features/QuanLyCongViec/CongViec/CongViecByNhanVienPage.js`  
**Dòng:** 716 dòng (monolithic)  
**Route hiện tại:** `/quan-ly-cong-viec/cong-viec-nhan-vien/:id` ❌ (kebab-case)  
**Vấn đề:**

- Không có dashboard overview (user nhìn list ngay)
- Status ẩn trong filter thay vì tabs rõ ràng
- Mobile không responsive (filters 2 cột bị ép)
- Technical debt (filters + dialogs + logic trộn lẫn)

### Redesign Plan (Phase 2C - 28h)

**Chia làm 2 sub-phases:**

#### **Phase 2C.1: Dashboard Pages (14h)**

**Tạo mới:**

```
CongViecDashboardPage.js
├─ 8 StatusCards (2 columns: Nhận | Giao)
│  ├─ Nhận: Đã giao (5) → Đang làm (12) → Chờ duyệt (2) → Hoàn thành (34)
│  └─ Giao: Quá hạn (3) → Đang TH (8) → Chờ duyệt (5) → Hoàn thành (45)
├─ Click card → Navigate to filtered list
├─ Mobile: Stack cards vertically
└─ Backend API: GET /workmanagement/congviec/dashboard-summary/:nhanVienId
```

**Menu change:**

```javascript
// menu-items/quanlycongviec.js
{
  id: "congvieccuatoi",
  url: "/quanlycongviec/congviec/dashboard" // ← Changed from old route
}
```

#### **Phase 2C.2: List Page Refactor (14h)**

**Refactor existing:**

```
CongViecByNhanVienPage.js → CongViecListPage.js
├─ Replace TabContext (2 tabs) → CongViecNestedTabs (2-level)
│  ├─ Level 1: [Nhận | Giao]
│  └─ Level 2: [Tất cả | Đã giao | Đang làm | Chờ duyệt | Hoàn thành]
├─ URL params: ?role=received&status=DA_GIAO
├─ Remove TrangThai from FilterPanel (replaced by tabs)
├─ Extract hooks: useCongViecFilters(), useCongViecPagination()
└─ Backend: Move TinhTrangHan filter to server-side (+2h)
```

**Navigation flow:**

```
Menu "Công việc của tôi"
    ↓
CongViecDashboardPage (visual overview with 8 cards)
    ↓ Click StatusCard
CongViecListPage (filtered by role + status)
```

### User's Requirements

User xác nhận:

1. ✅ **Tuần tự** - Phase 2C.1 (Dashboard) trước, 2C.2 (List refactor) sau
2. ✅ **Có chia sub-phases** - Để test incremental
3. ✅ **Có performance optimization** - Move TinhTrangHan to backend (+2h)

---

## 📂 Cấu Trúc Codebase Hiện Tại

### Trạng Thái Sau Git Reset

**✅ Files CÒN:**

- `src/features/QuanLyCongViec/` - All existing modules
- `src/routes/index.js` - Mixed route patterns (not unified yet)
- Standard components (no PWA components)

**❌ Files ĐÃ XÓA:**

- `src/hooks/useMobileLayout.js` - Đã xóa
- `src/components/touch/` - Đã xóa
- `src/components/dialog/ResponsiveDialog.js` - Đã xóa
- `src/features/QuanLyCongViec/Dashboard/` - Đã xóa
- `src/utils/navigationHelper.js` - Đã xóa
- `src/features/QuanLyCongViec/components/WorkManagementBreadcrumb.js` - Đã xóa

### Routes Hiện Tại (Inconsistent)

```javascript
// src/routes/index.js - MIXED PATTERNS ❌
/quanlycongviec/kpi/*              // ✅ Unified
/quan-ly-cong-viec/nhan-vien/:id   // ❌ Kebab-case variant
/congviec/:id                      // ❌ Standalone
/yeu-cau/*                         // ❌ Standalone
```

**Target:** Tất cả về `/quanlycongviec/*` (Phase 0)

### Dual Theme Architecture

**2 Theme Systems:**

1. **MainLayout** - Basic theme (ThemeProvider)
   - Routes: `/home`, `/dashboard`, `/khoa`, etc. (~20 routes)
   - Menu state: Không dùng Redux
2. **MainLayoutAble** - Able theme (ThemeCustomization)
   - Routes: `/nhanvien`, `/lopdaotao`, `/dev`, etc. (~30 routes)
   - Menu state: Redux `menuSlice` (openDrawer, drawerOpen, activeItem)

**Mobile Strategy:**

- Shared `useMobileLayout()` hook (sẽ tạo trong Phase 1)
- Both themes hiển thị bottom nav trên mobile
- Both themes hiển thị drawer trên desktop

---

## 🛠️ Technology Stack

### Frontend

- **Framework:** React 18.2.0
- **State Management:** Redux Toolkit
- **UI Library:** Material-UI v5
- **Forms:** React Hook Form + Yup validation
- **Routing:** React Router v6
- **Animation:** Framer Motion (for splash screen)
- **Tables:** React Table

### Backend

- **Framework:** Express.js + Node.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT tokens
- **File Upload:** Multer + Cloudinary

### Dev Tools

- **Package Manager:** npm
- **Version Control:** Git
- **IDE:** VS Code
- **Browser DevTools:** Chrome + React DevTools

---

## 📋 Critical Context Points

### 1. User vs NhanVien Model (⚠️ CRITICAL)

```javascript
// User model (Authentication)
{
  _id: "64f3cb6035c717ab00d75b8b",      // ← User ID
  UserName: "kiendt",
  NhanVienID: "66b1dba74f79822a4752d90d", // ← Reference to NhanVien
  PhanQuyen: "manager",
  KhoaID: { _id: "...", TenKhoa: "..." }
}

// NhanVien model (Employee data)
{
  _id: "66b1dba74f79822a4752d90d",      // ← NhanVien ID
  HoTen: "Đỗ Trung Kiên",
  PhongBanID: "...",
  ChucDanh: "Trưởng khoa",
  // Work management relationships use THIS ID
}

// ✅ CORRECT: Get NhanVienID for work APIs
const { user } = useAuth();
const nhanVienId = user?.NhanVienID;
await apiService.get(`/workmanagement/kpi/nhanvien/${nhanVienId}`);

// ❌ WRONG: Using User._id
const userId = user?._id; // This is NOT NhanVien ID!
```

### 2. Redux Patterns

**Standard Slice Pattern:**

```javascript
const slice = createSlice({
  name: "featureName",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Feature-specific success reducers
  },
});

// Standard thunk with toast
export const someAction = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/endpoint", data);
    dispatch(slice.actions.someActionSuccess(response.data.data));
    toast.success("Success message");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
```

### 3. Form Pattern

```javascript
// Standard form with React Hook Form + Yup
const yupSchema = Yup.object().shape({
  fieldName: Yup.string().required("Vietnamese error message"),
});

function SomeForm({ open, handleClose, item = {} }) {
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      /* Vietnamese field names */
    },
  });

  const onSubmit = (data) => {
    // Redux dispatch
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <FTextField name="fieldName" label="Vietnamese Label" />
      </FormProvider>
    </Dialog>
  );
}
```

### 4. Backend API Response Format

```javascript
// Success
{ success: true, data: { /* data */ }, message: "Vietnamese message" }

// Error
{ success: false, errors: { /* errors */ }, message: "Vietnamese error" }

// Controller pattern
const { catchAsync, sendResponse, AppError } = require("helpers/utils");

controller.action = catchAsync(async (req, res, next) => {
  // Logic
  return sendResponse(res, 200, true, { data }, null, "Success");
});
```

---

## 🚀 Next Steps for New Conversation

### Immediate Actions

1. **Đọc Master Plan:**

   ```bash
   code docs/UNIFIED_PLAN_2026/00_MASTER_PLAN.md
   ```

2. **Check Git Status:**

   ```bash
   git status
   # Should be clean after reset --hard
   ```

3. **Review Phase 0 Details:**

   ```bash
   code docs/UNIFIED_PLAN_2026/PHASE_0_NAVIGATION.md
   ```

4. **Bắt đầu Implementation:**
   - Nếu user chưa bắt đầu: Bắt đầu Phase 0
   - Nếu đang giữa phase: Check PROGRESS_TRACKER.md

### Questions to Ask User

- [ ] "Bạn đã review xong master plan chưa? Có thay đổi gì không?"
- [ ] "Bạn muốn bắt đầu Phase 0 ngay, hay có câu hỏi về plan trước?"
- [ ] "Branch git tên gì? `feature/pwa-ux-unified-2026` ổn không?"

### Context Validation Commands

```bash
# Verify clean state
git status

# Check current branch
git branch --show-current

# List QuanLyCongViec files
ls src/features/QuanLyCongViec/

# Check routes file
code src/routes/index.js
```

---

## 📊 Progress Tracking

**Check progress:**

```bash
code docs/UNIFIED_PLAN_2026/PROGRESS_TRACKER.md
```

**Format:**

```markdown
## Phase 0: Navigation Refactor (24h)

- [ ] Task 1 (2h)
- [x] Task 2 (4h) - Completed 09/01
- [ ] Task 3 (6h)

Current Phase: 0 - Navigation Refactor
Current Task: Creating navigationHelper.js
Hours Spent: 12 / 24
Blocked: No
```

---

## 🔑 Key Decisions Made

| Decision               | Reasoning                                          |
| ---------------------- | -------------------------------------------------- |
| **Git reset --hard**   | Avoid confusion, start clean with unified plan     |
| **Merge 2 plans**      | UX + PWA complementary, not conflicting            |
| **8 phases**           | Clear milestones, manageable scope                 |
| **Phase 0 first**      | BLOCKS everything, must unify routes               |
| **Phase 2C split**     | Test dashboard incremental before refactoring list |
| **Tuần tự sub-phases** | User confirmed sequential (2C.1 → 2C.2)            |
| **Feature flags**      | Gradual rollout, can disable if bugs               |
| **Dual theme support** | Both Basic + Able must work                        |

---

## 📞 Important Commands

```bash
# Frontend dev server
cd d:\project\webBV\fe-bcgiaobanbvt
npm start  # http://localhost:3000

# Backend dev server
cd d:\project\webBV\giaobanbv-be
npm start  # http://localhost:8020

# Git workflow
git checkout -b feature/pwa-ux-unified-2026
git add .
git commit -m "feat: implement Phase X - description"
git push origin feature/pwa-ux-unified-2026
```

---

## 💡 Tips for AI Assistant

1. **Always check PROGRESS_TRACKER.md first** to see what's done
2. **Reference phase documents** for detailed specs
3. **Follow existing patterns** (Redux slices, form components)
4. **Test dual themes** (MainLayout + MainLayoutAble)
5. **Update PROGRESS_TRACKER** after completing tasks
6. **Ask before major deviations** from plan
7. **Use Vietnamese** for UI labels, messages, field names

---

## 🔗 Quick Reference Links

- **Master Plan:** [00_MASTER_PLAN.md](./00_MASTER_PLAN.md)
- **Progress:** [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md)
- **Phase 0:** [PHASE_0_NAVIGATION.md](./PHASE_0_NAVIGATION.md) ← START HERE
- **Phase 2:** [PHASE_2_DASHBOARD.md](./PHASE_2_DASHBOARD.md) ← Contains "Công việc của tôi" redesign

---

**Last Updated:** 09/01/2026  
**Status:** ✅ Ready for implementation  
**Current Phase:** 0 - Navigation Refactor (not started)
