# Fix: Employee Information Display - NhanVien vs User Model Distinction

## Problem Analysis

### User Question

"Tôi chưa thấy bạn lấy đúng thông tin nhân viên, bạn đang lấy theo logic nào?"

### Root Cause

The frontend was incorrectly trying to access **NhanVien** model fields from the **User** model object, and attempting to populate NhanVienID in backend caused breaking changes to existing code.

## Model Structure Clarification

### User Model (Authentication)

Located: `giaobanbv-be/models/User.js`

```javascript
{
  _id: ObjectId,              // User ID (for authentication)
  UserName: String,
  PassWord: String,
  Email: String,
  PhanQuyen: String,          // Role: 'admin', 'manager', 'nomal', etc.
  KhoaID: ObjectId (ref Khoa),
  NhanVienID: ObjectId (ref NhanVien), // ← Reference to employee record
  HoTen: String,              // Name in User model
  KhoaTaiChinh: [String],
  DashBoard: [String],
  KhoaLichTruc: [String]
}
```

### NhanVien Model (Employee Data)

Located: `giaobanbv-be/models/NhanVien.js`

```javascript
{
  _id: ObjectId,              // NhanVien ID (used in work management)
  MaNhanVien: String,         // ← Employee code
  Ten: String,                // ← Employee name
  Email: String,
  KhoaID: ObjectId (ref Khoa),
  NgaySinh: Date,
  GioiTinh: Number,
  ChucDanh: String,
  ChucVu: String,
  DaNghi: Boolean,
  // ... other employee fields
}
```

### Critical Distinction (from AI Agent Guidelines)

**User Model**: Authentication & Authorization

- Used for login/authentication via `useAuth()` hook
- Contains: `_id`, `UserName`, `PhanQuyen`, `KhoaID`, `HoTen`
- Has `NhanVienID` field that **references** NhanVien model

**NhanVien Model**: Employee/Staff Data

- Used in work management (Quản Lý Công Việc) module
- All work relationships use `NhanVienID` (refers to NhanVien.\_id, NOT User.\_id)

## The Bug

### Initial Attempt (WRONG - Caused Breaking Changes)

**Backend**: Tried to populate `NhanVienID` in `GET /user/me`

```javascript
// ❌ WRONG: This breaks existing code that expects NhanVienID to be a string
const user = await User.findById(curentUserId)
  .populate("KhoaID")
  .populate("NhanVienID"); // ← This caused NhanVienID to become an object
```

**Problem**: All existing code expects `user.NhanVienID` to be a **string ObjectId**, not an object:

- API filters: `{ NhanVienID: user.NhanVienID }` → sent `[object Object]`
- Comparisons: `item.NhanVienID === user.NhanVienID` → always false
- Hundreds of existing usages broke

### Correct Solution

**Backend**: `giaobanbv-be/controllers/user.controller.js`

```javascript
// ✅ CORRECT: Keep NhanVienID as string reference (do NOT populate)
userController.getCurrentUser = catchAsync(async (req, res, next) => {
  const curentUserId = req.userId;
  const user = await User.findById(curentUserId).populate("KhoaID");
  // NO .populate("NhanVienID") - keep it as string ObjectId
  if (!user)
    throw new AppError(400, "User not found", "Get current User Error");
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get current User successful"
  );
});
```

**Frontend**: `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/pages/XemKPIPage.js`

```javascript
// ✅ Fetch NhanVien data separately when needed for display
const { nhanviens } = useSelector((state) => state.nhanvien);
const { user: currentUser } = useAuth();

// Load nhân viên list
useEffect(() => {
  if (nhanviens.length === 0) {
    dispatch(getAllNhanVien());
  }
}, [dispatch, nhanviens.length]);

// Find employee data by NhanVienID (which is a string)
const nhanVienData = nhanviens.find(
  (nv) => nv._id === currentUser?.NhanVienID // String comparison
);

// Use NhanVien fields for display
const nhanVienInfo = {
  ten: nhanVienData?.Ten || currentUser?.HoTen || "N/A",
  maNhanVien: nhanVienData?.MaNhanVien || "N/A",
  email: nhanVienData?.Email || currentUser?.Email || "N/A",
  khoaPhong:
    nhanVienData?.KhoaID?.TenKhoa || currentUser?.KhoaID?.TenKhoa || "N/A",
};

// Use NhanVienID string for API filters
const filters = {
  NhanVienID: currentUser?.NhanVienID, // String, not object
};
dispatch(getDanhGiaKPIs(filters));
```

## Bonus Fix: DanhGiaKPIPage Role Check

### Before

```javascript
// ❌ Wrong: Role field doesn't exist in User model
const canCreateKPI = currentUser?.Role >= 2;
```

### After

```javascript
// ✅ Correct: Use PhanQuyen from User model
const canCreateKPI =
  currentUser?.PhanQuyen === "manager" ||
  currentUser?.PhanQuyen === "admin" ||
  currentUser?.PhanQuyen === "daotao";
```

## Files Changed

### Backend

1. `giaobanbv-be/controllers/user.controller.js`
   - **Kept original** - NO populate on NhanVienID to avoid breaking changes

### Frontend

2. `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/pages/XemKPIPage.js`

   - Load `nhanviens` list via `getAllNhanVien()`
   - Find employee by `currentUser.NhanVienID` (string comparison)
   - Extract employee info from NhanVien model fields

3. `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/pages/DanhGiaKPIPage.js`
   - Fixed role check to use `PhanQuyen` instead of non-existent `Role`

## Data Flow

```
Login → /auth/login → Returns User with accessToken
         ↓
Initialize → /user/me → Returns User (KhoaID populated, NhanVienID as string)
         ↓
AuthContext → dispatch(INITIALIZE) → Sets state with User
         ↓
useAuth() → Returns { user: {...User, NhanVienID: "66b1dba74f79822a4752d90d" } }
         ↓
XemKPIPage → Load getAllNhanVien()
         ↓
Find NhanVien → nhanviens.find(nv => nv._id === currentUser.NhanVienID)
         ↓
Employee Info → nhanVienData.Ten, .MaNhanVien, .Email, etc.
```

## Testing Checklist

- [ ] Backend: Test `/user/me` returns NhanVienID as **string**, not object
- [ ] Frontend: Clear browser cache and reload
- [ ] Frontend: XemKPIPage displays correct employee info:
  - [ ] Tên nhân viên (from NhanVien.Ten)
  - [ ] Mã nhân viên (from NhanVien.MaNhanVien)
  - [ ] Email (from NhanVien.Email or User.Email)
  - [ ] Khoa/Phòng (from NhanVien.KhoaID or User.KhoaID)
- [ ] Frontend: DanhGiaKPIPage shows/hides buttons based on PhanQuyen
- [ ] Frontend: All existing pages using `user.NhanVienID` still work (string comparison)
- [ ] API calls with NhanVienID filter work correctly (no `[object Object]` error)
- [ ] Edge case: User without NhanVienID shows fallback "N/A" values

## Why NOT Populate NhanVienID?

### Breaking Changes Analysis

If we populate `NhanVienID` in `/user/me`, it affects:

1. **All API filters using NhanVienID**:

   ```javascript
   // Would send [object Object] instead of ObjectId string
   {
     NhanVienID: user.NhanVienID;
   }
   ```

2. **All comparisons**:

   ```javascript
   // Would always be false
   item.NhanVienID === user.NhanVienID;
   ```

3. **All assignments/forms**:

   ```javascript
   // Would need to extract _id everywhere
   defaultValues: {
     NhanVienID: user.NhanVienID._id;
   }
   ```

4. **Existing codebase** (per copilot-instructions.md):
   - Giao Nhiệm Vụ pages
   - Đánh Giá KPI pages
   - Quản Lý Nhân Viên pages
   - All work management modules

### Decision: Keep NhanVienID as String

- ✅ No breaking changes to existing code
- ✅ Follows guideline: "User has `NhanVienID` field that references NhanVien model"
- ✅ Pages fetch NhanVien data only when needed for display
- ✅ Clear separation: User (auth) vs NhanVien (employee data)

## Key Takeaway

**Always distinguish between:**

- **User.\_id**: For authentication/authorization (don't use in work management)
- **User.NhanVienID**: Reference to employee record (STRING ObjectId - use in work management APIs)
- **NhanVien.\_id**: The actual employee ID used in KPI/task relationships

**Best Practice:**

```javascript
// ✅ CORRECT: Get NhanVienID from authenticated user
const { user } = useAuth();
const nhanVienId = user?.NhanVienID; // This is a STRING ObjectId

// Use in API calls
dispatch(getDanhGiaKPIs({ NhanVienID: nhanVienId }));

// For display, fetch NhanVien data separately
const nhanVienData = nhanviens.find((nv) => nv._id === nhanVienId);
const displayName = nhanVienData?.Ten || user?.HoTen;

// ❌ WRONG: Using User._id for work management
const userId = user?._id; // This is for authentication, not work data!

// ❌ WRONG: Expecting NhanVienID to be populated
const name = user?.NhanVienID?.Ten; // undefined - NhanVienID is a string, not object
```

**Why Keep NhanVienID as String:**

- Prevents breaking hundreds of existing code locations
- Maintains clear boundary between User (auth) and NhanVien (employee data)
- Allows lazy loading of employee data only when needed
- Follows the principle in copilot-instructions.md
