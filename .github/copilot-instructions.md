# Hospital Management System - AI Agent Guidelines

## Architecture Overview

This is a **bilingual (Vietnamese) React + Node.js hospital management system** with three main domains:

1. **Daily Medical Reports** (`BaoCaoNgay`, `BCGiaoBan`): Department-based reporting with patient tracking, statistics, and PowerPoint exports
2. **Medical Incident Management** (`BaoCaoSuCo`): Incident reporting, analysis workflow, quality management per MOH Circular 43/2018
3. **Work Management & KPI** (`QuanLyCongViec`): Task management, routine duties, cycle-based KPI evaluations, and performance tracking

### Key Technology Stack

- **Frontend**: React 18 + Redux Toolkit + Material-UI v5 + React Hook Form + Yup validation + React Table
- **Backend**: Express.js + MongoDB (Mongoose) + JWT auth + Multer file uploads
- **Architecture**: Feature-based folder structure with Redux slices per domain, modular backend (`modules/workmanagement`)
- **Monorepo**: Two separate workspaces - `fe-bcgiaobanbvt` (frontend) and `giaobanbv-be` (backend)

## ⚠️ CRITICAL: User vs NhanVien Model Distinction

**DO NOT CONFUSE User and NhanVien models - this is the #1 source of bugs:**

### User Model (Authentication & Authorization)

- Used for login/authentication via `useAuth()` hook
- Contains: `_id`, `UserName`, `PassWord`, `Email`, `PhanQuyen` (role), `KhoaID` (department)
- **Critical**: User has `NhanVienID` field that references NhanVien model
- Example structure:
  ```javascript
  {
    _id: "64f3cb6035c717ab00d75b8b",      // ← User ID
    UserName: "kiendt",
    NhanVienID: "66b1dba74f79822a4752d90d", // ← Reference to NhanVien
    PhanQuyen: "manager",
    KhoaID: { _id: "...", TenKhoa: "..." },
    HoTen: "Đỗ Trung Kiên",
    Email: "dotrungkien6987@gmail.com"
  }
  ```

### NhanVien Model (Employee/Staff Data)

- Used in work management (`QuanLyCongViec`) module for all employee-related operations
- Contains detailed employee information: PhongBanID, CapBac, ChucDanh, work assignments
- **All relationships in work management use `NhanVienID`** (refers to `NhanVien._id`, NOT `User._id`)
- Models using NhanVienID: NhanVienNhiemVu, DanhGiaKPI, QuanLyNhanVien, CongViec (AssignedTask), etc.

### Best Practice:

```javascript
// ✅ CORRECT: Get NhanVienID from authenticated user
const { user } = useAuth();
const nhanVienId = user?.NhanVienID; // Use this for work management APIs

// ❌ WRONG: Using User._id for work management
const userId = user?._id; // This is User ID, not NhanVien ID!

// Example API call:
await apiService.get(`/workmanagement/kpi/nhanvien/${nhanVienId}`); // ✅
await apiService.get(`/workmanagement/kpi/nhanvien/${user._id}`); // ❌ WRONG!
```

## Critical Patterns & Conventions

### 1. Redux State Management Pattern

**Every feature follows the standard slice pattern:**

```javascript
// Standard slice structure
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

// Standard thunk pattern with toast notifications
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

### 2. Form Component Pattern

**All forms use React Hook Form + Yup + custom form components:**

```javascript
// Standard form pattern
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
    // Redux dispatch logic
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <FTextField name="fieldName" label="Vietnamese Label" />
        {/* Custom form components: FTextField, FDatePicker, FAutocomplete, etc. */}
      </FormProvider>
    </Dialog>
  );
}
```

### 3. Table + CRUD Button Pattern

**Standard table with Add/Update/Delete buttons:**

```javascript
// TableComponent.js - displays data with action buttons
// AddButton.js - opens form with empty/default data
// UpdateButton.js - opens form with existing data for editing
// Form.js - handles both create and update modes based on item._id

// Action column pattern in tables:
Cell: ({ row }) => (
  <Stack direction="row">
    <UpdateButton item={row.original} />
    <DeleteButton itemId={row.original._id} />
  </Stack>
);
```

### 4. DataFix Pattern (Master Data Management)

**Centralized master data with automatic indexing:**

```javascript
// Backend automatically adds index field to arrays for frontend table operations
// Frontend references: state.nhanvien.VaiTro, state.nhanvien.ChucDanh, etc.
// CRUD operations update the single datafix document
dispatch(updateOrInsertDatafix(datafixUpdate));
```

## Development Workflows

### Starting the Application

**Frontend:**

```powershell
cd d:\project\webBV\fe-bcgiaobanbvt
npm start  # Runs on http://localhost:3000
```

**Backend:**

```powershell
cd d:\project\webBV\giaobanbv-be
npm start  # or npm run dev (with nodemon)
```

**Required Environment Variables:**

- Frontend `.env`:
  ```
  REACT_APP_BACKEND_API=http://localhost:8020/api
  REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
  REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_preset
  ```
- Backend `.env`:
  ```
  PORT=8020
  MONGODB_URI=mongodb://127.0.0.1:27017/giaoban_bvt
  JWT_SECRET_KEY=your_secret_key
  ```

### File Organization

```
src/
├── features/           # Feature-based modules (primary structure)
│   ├── FeatureName/
│   │   ├── featureSlice.js      # Redux logic (required)
│   │   ├── FeatureTable.js      # Data display component
│   │   ├── FeatureForm.js       # Create/Edit form
│   │   ├── AddFeatureButton.js  # Opens create form
│   │   └── UpdateFeatureButton.js # Opens edit form
│   └── QuanLyCongViec/          # Work Management domain
│       ├── CongViec/            # Task management
│       │   ├── docs/            # Comprehensive architecture docs
│       │   ├── components/      # UI components
│       │   └── utils/           # Business logic utilities
│       ├── KPI/                 # KPI evaluation system
│       ├── NhiemVuThuongQuy/    # Routine duties
│       └── GiaoNhiemVu/         # Task assignments
├── components/form/    # Reusable form components
│   ├── FTextField.js   # Form text field
│   ├── FDatePicker.js  # Form date picker
│   ├── FAutocomplete.js # Form autocomplete
│   └── FormProvider.js # React Hook Form provider
├── app/
│   ├── apiService.js   # Axios instance with interceptors
│   └── store.js        # Redux store configuration
├── pages/             # Route-level page components
└── routes/           # React Router configuration
```

### Backend Structure

```
giaobanbv-be/
├── modules/
│   └── workmanagement/         # Work management domain
│       ├── models/             # Mongoose schemas
│       ├── controllers/        # Business logic controllers
│       ├── routes/            # API routes
│       ├── services/          # Business services
│       └── validators/        # Input validation
├── controllers/       # Other domain controllers
├── models/           # Other domain models
├── routes/           # Other domain routes
├── helpers/
│   └── utils.js      # catchAsync, sendResponse, AppError
└── middlewares/      # Auth, validation, error handling
```

### Backend API Patterns

```javascript
// Standard controller pattern with error handling
const { catchAsync, sendResponse, AppError } = require("helpers/utils");

controller.action = catchAsync(async (req, res, next) => {
  // Business logic
  // Throw AppError for controlled errors:
  // throw new AppError(400, "Error message", "ERROR_TYPE");

  return sendResponse(res, 200, true, { data }, null, "Success message");
});

// Routes follow REST conventions: GET/POST/PUT/DELETE
router.get("/", controller.getAll);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
```

### API Response Format (Standard)

```javascript
// Success response
{
  success: true,
  data: { /* actual data */ },
  message: "Vietnamese success message"
}

// Error response
{
  success: false,
  errors: { /* error details */ },
  message: "Vietnamese error message"
}
```

## Domain-Specific Knowledge

### Work Management (QuanLyCongViec) - Critical Business Logic

#### KPI Evaluation System (V2 Architecture)

- **Single Source of Truth**: Never store calculated fields in DB (TongDiemTieuChi, DiemNhiemVu removed)
- **Calculation Pattern**:
  - Real-time preview: Use `utils/kpiCalculation.js` on frontend
  - Snapshot on approval: `danhGiaKPI.duyet()` method calculates and saves `TongDiemKPI`
- **Formula**: For criteria with "mức độ hoàn thành":
  ```javascript
  DiemNhiemVu = (DiemQL × 2 + DiemTuDanhGia) / 3
  ```
  Otherwise: `DiemNhiemVu = DiemQL`
- **Approval Workflow**:
  - Status: CHUA_DUYET → DA_DUYET (with audit trail in LichSuDuyet)
  - Undo approval: `huyDuyet(nguoiHuyId, lyDo)` - saves LichSuHuyDuyet snapshot
- **Key Models**:
  - `DanhGiaKPI`: Main KPI evaluation (has methods: duyet(), huyDuyet())
  - `DanhGiaNhiemVuThuongQuy`: Routine duty evaluation (ChiTietDiem array)
  - `NhanVienNhiemVu`: Employee-routine duty assignment (has DiemTuDanhGia)

#### Task Management (CongViec)

- **Optimistic Concurrency**: All updates send `If-Unmodified-Since` header with `updatedAt`
  - Backend returns `VERSION_CONFLICT` if data changed
  - Frontend auto-refreshes on conflict
- **State Machine**: Transitions validated by `getAvailableActions(status, role)`
- **Comments with Threading**: Parent comments + lazy-loaded replies with cache (`repliesByParent`)
- **File Management**: Separate from comment files, uses soft delete pattern
- **Deadline Warnings**: Configurable by percentage or fixed date (`NgayCanhBao`, `PhanTramCanhBao`)

### Patient Data Structure

- **LoaiBN field**: 1=Death, 2=Transfer, 3=Severe, 4=Surgery, 5=Emergency, 6=Intervention, 7=Monitoring
- **Image uploads**: Cloudinary integration with multiple image support per patient
- **Department-based filtering**: Data isolation per medical department (Khoa)

### Medical Incident Workflow

- **Status progression**: Reported → Accepted → Analyzed → Completed
- **Role-based access**: Quality managers can accept/analyze, admins have full access
- **Document exports**: Word document generation for incident reports

### Authentication & Authorization

```javascript
// Role hierarchy: 1=User, 2=Manager, 3=Admin, 4=SuperAdmin
// Department-based data access via KhoaID
// JWT tokens with refresh mechanism
```

### Image Handling

- Cloudinary for image storage with automatic compression
- Multiple image uploads per record with preview functionality
- Custom ImageUploader and ImageListDisplay components

## Key Conventions

1. **Vietnamese UI**: All labels, messages, and form fields use Vietnamese text
2. **Date Handling**: Consistent dayjs usage with Vietnamese formatting
3. **Loading States**: Every async operation shows loading spinners/buttons
4. **Toast Notifications**: Success/error feedback on all CRUD operations
5. **Responsive Design**: Mobile-first MUI breakpoints throughout
6. **Error Boundaries**: Comprehensive error handling with user-friendly messages

## Common Gotchas

- DataFix arrays need `index` field for table operations (backend auto-generates)
- Form defaultValues must match Vietnamese field names from API
- Redux actions require consistent `startLoading/hasError/success` pattern
- File uploads need FormData with specific Multer field names
- Date fields require dayjs parsing for compatibility

When working with this codebase, always follow the established patterns for Redux, forms, and component structure. The bilingual nature and medical domain require careful attention to field names and business logic.
