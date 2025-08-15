# Bước 1: Danh sách công việc với Filter

## Mục tiêu + Phạm vi

**Mục tiêu người dùng:** Xem danh sách công việc liên quan đến một nhân viên cụ thể, chia thành 2 tab "Việc tôi nhận" và "Việc tôi giao", có filter/search và CRUD
**Phạm vi:**

- In scope:
  - Route `/congviec/:nhanvienid` để xem công việc của nhân viên cụ thể
  - 2 tabs riêng biệt:
    - Tab "Việc tôi nhận": công việc mà nhanvienid là người xử lý chính (nguoiChinhID)
    - Tab "Việc tôi giao": công việc mà nhanvienid là người giao việc (nguoiGiaoViecID)
  - Filter theo trạng thái, mức độ ưu tiên, thời gian trong mỗi tab
  - Search text trong tiêu đề/mô tả
  - Pagination với MUI Table cho mỗi tab
  - Quick actions: Tạo mới, Sửa, Xóa, Xem chi tiết
  - Tạm thời bỏ qua phân quyền - hiển thị tất cả công việc liên quan
- Out of scope:
  - Dashboard metrics, công việc con (phân cấp), comment/file attachment, tiến độ chi tiết
  - Department-based filtering, role-based authorization

## UI/UX Design

### Layout Structure

- **Container:** Page layout với header + tabs (Việc tôi nhận | Việc tôi giao) + filter panel + table + pagination
- **Responsive breakpoints:**
  - Desktop (≥1200px): Full table với tất cả columns, filter panel mở rộng, tabs ngang
  - Tablet (768-1199px): Ẩn một số columns phụ, filter panel collapse, tabs ngang
  - Mobile (<768px): Card view thay table, filter trong drawer, tabs fullwidth

### Components MUI

- **Data Display:** Table với TableContainer, TableHead, TableBody, TablePagination (cho mỗi tab)
- **Input Controls:** TextField (search), Select (filters), DatePicker (date range)
- **Navigation:** Breadcrumb, Pagination, Tabs (2 tabs: Việc tôi nhận | Việc tôi giao)
- **Feedback:** Skeleton loading, Empty state, Toast notifications
- **Layout:** Grid, Stack, Paper, Card (mobile), Drawer (mobile filter), TabPanel

### Interaction Flow

- **Primary actions:**
  - Tạo công việc mới (FAB + Button)
  - Xem chi tiết (click row/button)
  - Sửa công việc (icon button)
  - Xóa công việc (icon button + confirmation)
- **Secondary actions:**
  - Filter theo multiple criteria
  - Search text real-time
  - Sort theo columns
  - Reset filters
- **User journey:**
  1. Navigate to `/congviec/:nhanvienid` → Load thông tin nhân viên và 2 tabs
  2. Click tab "Việc tôi nhận" → Load công việc mà nhân viên này là người xử lý chính
  3. Click tab "Việc tôi giao" → Load công việc mà nhân viên này là người giao việc
  4. Apply filters trong mỗi tab → Real-time filtering
  5. Click actions → Navigate hoặc open modals

### State Management (UI)

- **Loading states:**
  - Table skeleton khi load initial data
  - Row skeleton khi filter/search
  - Button loading khi CRUD operations
- **Error states:**
  - API error toast
  - Network error retry button
  - Permission denied message
- **Empty states:**
  - "Chưa có công việc nào" với illustration
  - "Không tìm thấy kết quả" khi search
  - "Bạn chưa được giao công việc nào" (Role 1)
- **Success states:**
  - Toast "Tạo thành công", "Cập nhật thành công", "Xóa thành công"
  - Refresh table data

## Backend Implementation

### API Endpoints

```javascript
// Method: GET
// Route: /api/workmanagement/congviec/:nhanvienid/received
// Authentication: required
// Authorization: Tạm thời bỏ qua phân quyền
// Query params: page, limit, search, trangThai, mucDoUuTien, ngayBatDau, ngayHetHan
// Mô tả: Lấy công việc mà nhanvienid là người xử lý chính

// Method: GET
// Route: /api/workmanagement/congviec/:nhanvienid/assigned
// Authentication: required
// Authorization: Tạm thời bỏ qua phân quyền
// Query params: page, limit, search, trangThai, mucDoUuTien, ngayBatDau, ngayHetHan
// Mô tả: Lấy công việc mà nhanvienid là người giao việc

// Method: GET
// Route: /api/workmanagement/nhanvien/:nhanvienid
// Authentication: required
// Mô tả: Lấy thông tin nhân viên để hiển thị header
```

### Request/Response DTOs

```typescript
// Request DTO (Query params) - Chung cho cả 2 endpoints
interface GetCongViecByNhanVienRequest {
  page?: number; // Default: 1
  limit?: number; // Default: 10
  search?: string; // Search trong TieuDe, MoTa
  TrangThai?: string; // TAO_MOI|DA_GIAO|CHAP_NHAN|TU_CHOI|DANG_THUC_HIEN|CHO_DUYET|HOAN_THANH|QUA_HAN|HUY
  MucDoUuTien?: string; // THAP|BINH_THUONG|CAO|KHAN_CAP
  NgayBatDau?: string; // YYYY-MM-DD
  NgayHetHan?: string; // YYYY-MM-DD
}

// Response DTO - Chung cho cả 2 endpoints
interface GetCongViecByNhanVienResponse {
  success: boolean;
  data: {
    CongViecs: CongViec[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message: string;
}

// Response DTO cho thông tin nhân viên
interface GetNhanVienResponse {
  success: boolean;
  data: {
    _id: string;
    HoTen: string;
    Email: string;
    ChucDanhHienTai?: string;
    KhoaLamViecHienTai?: string;
  };
  message: string;
}

interface CongViec {
  _id: string;
  TieuDe: string;
  MoTa: string;
  NguoiGiaoViecID: {
    _id: string;
    HoTen: string;
    Email: string;
  };
  NguoiChinhID: {
    _id: string;
    HoTen: string;
    Email: string;
  };
  MucDoUuTien: string;
  NgayBatDau: Date;
  NgayHetHan: Date;
  TrangThai: string;
  PhanTramTienDoTong: number;
  SoLuongNguoiThamGia: number;
  SoLuongBinhLuan: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Validation Rules

- **Required fields:** nhanvienid param phải là valid ObjectId
- **Business logic:**
  - Route `/received`: Query CongViec where nguoiChinhID = nhanvienid
  - Route `/assigned`: Query CongViec where nguoiGiaoViecID = nhanvienid
  - Soft delete: isDeleted = false
  - Tạm thời bỏ qua role-based và department-based filtering
- **Data integrity:** Valid ObjectId cho nhanvienid parameter
- **Security:**
  - Sanitize search input
  - Validate date format
  - Rate limiting cho search API

### Database Operations

- **Model updates:**
  - Index cho (trangThai, ngayHetHan, khoaID, isDeleted)
  - Text index cho TieuDe, MoTa
  - Compound index (nguoiChinhID, trangThai)
- **Soft delete:** Query với { isDeleted: { $ne: true } }
- **Audit trail:** Không cần cho read operation
- **Department isolation:**
  - Tạm thời bỏ qua department filtering
  - Query trực tiếp theo nhanvienid parameter

## Frontend Implementation

### Redux Slice Design

```javascript
// Slice name: congViec
const initialState = {
  isLoading: false,
  error: null,
  // Domain-specific state fields
  currentNhanVien: null, // Thông tin nhân viên hiện tại
  activeTab: "received", // 'received' | 'assigned'
  receivedCongViecs: [], // Công việc được giao (nhân viên là người xử lý chính)
  assignedCongViecs: [], // Công việc đã giao (nhân viên là người giao việc)
  receivedTotal: 0,
  assignedTotal: 0,
  receivedPages: 0,
  assignedPages: 0,
  currentPage: {
    received: 1,
    assigned: 1,
  },
  filters: {
    received: {
      search: "",
      trangThai: "",
      mucDoUuTien: "",
      ngayBatDau: null,
      ngayHetHan: null,
    },
    assigned: {
      search: "",
      trangThai: "",
      mucDoUuTien: "",
      ngayBatDau: null,
      ngayHetHan: null,
    },
  },
};

// Key reducers needed:
// - startLoading
// - hasError
// - getNhanVienSuccess
// - getReceivedCongViecsSuccess
// - getAssignedCongViecsSuccess
// - setActiveTab
// - setFilters (for specific tab)
// - resetFilters (for specific tab)
// - deleteCongViecSuccess

// Manual thunks (NOT createAsyncThunk):
// - getNhanVien(nhanvienid)
// - getReceivedCongViecs(nhanvienid, filters)
// - getAssignedCongViecs(nhanvienid, filters)
// - deleteCongViec(id)
```

### Form Integration

```javascript
// Filter form với controlled components cho mỗi tab
const FilterPanel = ({ activeTab, nhanvienid }) => {
  const { filters } = useSelector((state) => state.congViec);
  const currentFilters = filters[activeTab]; // received hoặc assigned
  const dispatch = useDispatch();

  const handleFilterChange = (field, value) => {
    const newFilters = { ...currentFilters, [field]: value };
    dispatch(setFilters({ tab: activeTab, filters: newFilters }));

    // Call appropriate API based on active tab
    if (activeTab === "received") {
      dispatch(getReceivedCongViecs(nhanvienid, { ...newFilters, page: 1 }));
    } else {
      dispatch(getAssignedCongViecs(nhanvienid, { ...newFilters, page: 1 }));
    }
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="Tìm kiếm"
        value={currentFilters.search}
        onChange={(e) => handleFilterChange("search", e.target.value)}
      />
      <FormControl>
        <InputLabel>Trạng thái</InputLabel>
        <Select
          value={currentFilters.trangThai}
          onChange={(e) => handleFilterChange("trangThai", e.target.value)}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="TAO_MOI">Tạo mới</MenuItem>
          <MenuItem value="DA_GIAO">Đã giao</MenuItem>
          {/* ... other statuses */}
        </Select>
      </FormControl>
    </Stack>
  );
};

// Tab Panel component
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`congviec-tabpanel-${index}`}
      aria-labelledby={`congviec-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};
```

### DataFix Integration

```javascript
// Tạm thời không dùng DataFix - hardcode options
const TRANG_THAI_OPTIONS = [
  { value: "TAO_MOI", label: "Tạo mới" },
  { value: "DA_GIAO", label: "Đã giao" },
  { value: "CHAP_NHAN", label: "Chấp nhận" },
  { value: "TU_CHOI", label: "Từ chối" },
  { value: "DANG_THUC_HIEN", label: "Đang thực hiện" },
  { value: "CHO_DUYET", label: "Chờ duyệt" },
  { value: "HOAN_THANH", label: "Hoàn thành" },
  { value: "QUA_HAN", label: "Quá hạn" },
  { value: "HUY", label: "Hủy" },
];

const MUC_DO_UU_TIEN_OPTIONS = [
  { value: "THAP", label: "Thấp" },
  { value: "BINH_THUONG", label: "Bình thường" },
  { value: "CAO", label: "Cao" },
  { value: "KHAN_CAP", label: "Khẩn cấp" },
];
```

### API Service Integration

```javascript
// Use existing apiService
import apiService from "app/apiService";

// Toast notifications
import { toast } from "react-toastify";

// API service methods
const congViecAPI = {
  getNhanVien: (nhanvienid) =>
    apiService.get(`/workmanagement/nhanvien/${nhanvienid}`),
  getReceived: (nhanvienid, params) =>
    apiService.get(`/workmanagement/congviec/${nhanvienid}/received`, {
      params,
    }),
  getAssigned: (nhanvienid, params) =>
    apiService.get(`/workmanagement/congviec/${nhanvienid}/assigned`, {
      params,
    }),
  delete: (id) => apiService.delete(`/workmanagement/congviec/${id}`),
};

// Error handling in thunks
export const getNhanVien = (nhanvienid) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await congViecAPI.getNhanVien(nhanvienid);
    dispatch(slice.actions.getNhanVienSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getReceivedCongViecs =
  (nhanvienid, filters = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await congViecAPI.getReceived(nhanvienid, filters);
      dispatch(slice.actions.getReceivedCongViecsSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const getAssignedCongViecs =
  (nhanvienid, filters = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await congViecAPI.getAssigned(nhanvienid, filters);
      dispatch(slice.actions.getAssignedCongViecsSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
```

### Routing Configuration

```javascript
// Route path: /congviec/:nhanvienid
// Guard requirements: AuthRequire
// Navigation integration:
// - Sidebar menu item với Assignment icon
// - Breadcrumb: Trang chủ > Quản lý công việc > [Tên nhân viên]
// - Page title: "Công việc của [Tên nhân viên]"
```

## File Structure (Expected)

### Backend Files

```
giaobanbv-be/modules/workmanagement/
├── models/CongViec.js (đã có)
├── controllers/congViec.controller.js (new)
├── services/congViec.service.js (new)
├── routes/congViec.api.js (new, hoặc thêm vào index.js)
└── controllers/nhanVien.controller.js (nếu cần separate)
```

### Frontend Files

```
src/
├── features/QuanLyCongViec/
│   ├── CongViecTable.js (reused cho cả 2 tabs)
│   ├── CongViecFilterPanel.js (with activeTab prop)
│   ├── CongViecTabs.js (Tab navigation component)
│   ├── AddCongViecButton.js
│   ├── UpdateCongViecButton.js
│   ├── DeleteCongViecButton.js
│   └── congViecSlice.js
├── pages/CongViecByNhanVienPage.js
└── routes/index.js (route registration)
```

## Sample Payloads

### Request Examples

```json
// GET /api/workmanagement/congviec/507f1f77bcf86cd799439012/received?page=1&limit=10&search=triển khai&TrangThai=DANG_THUC_HIEN
{
  "query": {
    "page": 1,
    "limit": 10,
    "search": "triển khai",
    "TrangThai": "DANG_THUC_HIEN",
    "MucDoUuTien": "CAO"
  }
}

// GET /api/workmanagement/congviec/507f1f77bcf86cd799439012/assigned?page=1&limit=10
{
  "query": {
    "page": 1,
    "limit": 10
  }
}

// GET /api/workmanagement/nhanvien/507f1f77bcf86cd799439012
// No body required

// DELETE /api/workmanagement/congviec/507f1f77bcf86cd799439011
// No body required
```

### Response Examples

```json
// Success Response - GET Nhân viên
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "HoTen": "Trần Thị B",
    "Email": "tranthib@hospital.com",
    "ChucDanhHienTai": "Bác sĩ khoa Nội",
    "KhoaLamViecHienTai": "Khoa Nội"
  },
  "message": "Lấy thông tin nhân viên thành công"
}

// Success Response - GET Công việc received/assigned (format giống nhau)
{
  "success": true,
  "data": {
    "CongViecs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "TieuDe": "Triển khai hệ thống mới",
        "MoTa": "Triển khai và test hệ thống quản lý công việc",
        "NguoiGiaoViecID": {
          "_id": "507f1f77bcf86cd799439012",
          "HoTen": "Nguyễn Văn A",
          "Email": "nguyenvana@hospital.com"
        },
        "NguoiChinhID": {
          "_id": "507f1f77bcf86cd799439013",
          "HoTen": "Trần Thị B",
          "Email": "tranthib@hospital.com"
        },
        "MucDoUuTien": "CAO",
        "NgayBatDau": "2025-08-01T00:00:00Z",
        "NgayHetHan": "2025-08-30T00:00:00Z",
        "TrangThai": "DANG_THUC_HIEN",
        "PhanTramTienDoTong": 65,
        "SoLuongNguoiThamGia": 3,
        "SoLuongBinhLuan": 5,
        "createdAt": "2025-08-01T10:30:00Z",
        "updatedAt": "2025-08-14T15:20:00Z"
      }
    ],
    "totalItems": 15,
    "totalPages": 2,
    "currentPage": 1,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Lấy danh sách công việc thành công"
}

// Error Response
{
  "success": false,
  "error": "Unauthorized access",
  "message": "Bạn không có quyền xem công việc này"
}
```

## Definition of Done (DoD)

### Functional Requirements

- [ ] Table hiển thị đúng data theo quyền user (Role 1 vs Role 2+)
- [ ] Filter panel hoạt động với real-time filtering
- [ ] Search text trong tiêu đề/mô tả
- [ ] Pagination với MUI TablePagination
- [ ] Sort theo columns (tiêu đề, trạng thái, deadline, tiến độ)
- [ ] CRUD buttons hoạt động (Add/Edit/Delete/View)
- [ ] Responsive design cho mobile/tablet

### Technical Requirements

- [ ] Redux slice tuân theo manual thunks pattern
- [ ] Component sử dụng useSelector trực tiếp
- [ ] Loading states cho initial load và filter changes
- [ ] Error handling với toast notifications
- [ ] Department-based filtering theo KhoaID
- [ ] Soft delete implementation
- [ ] API authorization theo role

### Testing Requirements

- [ ] Manual testing filter combinations
- [ ] Role-based access testing (Role 1 vs Role 2+)
- [ ] Responsive breakpoints verification
- [ ] Error scenarios (network, permission, validation)
- [ ] Performance với large dataset (100+ records)

### Documentation

- [ ] Code comments cho business logic filters
- [ ] API endpoint documentation
- [ ] Component prop interfaces

## Technical Notes

### Security Considerations

- **Input validation:** Sanitize search input để tránh XSS
- **Authorization:** Department-based access control qua KhoaID
- **Rate limiting:** Limit search API calls
- **Audit logging:** Log view/filter actions (optional)

### Performance Optimizations

- **Frontend:**
  - Debounce search input (300ms)
  - Memoize filter components
  - Virtual scrolling nếu cần (large datasets)
- **Backend:**
  - Database indexing cho filter fields
  - Limit query results (max 100 per page)
  - Aggregate pipelines cho counts
- **Caching:** Redis cache cho common filters (optional)

### Accessibility (a11y)

- **Keyboard navigation:** Tab order cho table và filters
- **Screen readers:** ARIA labels cho table headers và filter controls
- **Color contrast:** Status badges tuân theo WCAG
- **Form accessibility:** Label associations cho filter inputs

### Internationalization (i18n)

- **Vietnamese text:** Tất cả UI text bằng tiếng Việt
- **Date formatting:** dayjs với Vietnamese locale
- **Number formatting:** Vietnamese format cho progress percentage
- **Error messages:** Friendly Vietnamese error messages

## Questions & Assumptions

### Open Questions

1. **Bulk operations:** Có cần select multiple rows để bulk delete/update không?
2. **Export functionality:** Có cần export Excel/PDF không?
3. **Advanced search:** Có cần saved search presets không?
4. **Real-time updates:** Có cần WebSocket updates khi có thay đổi không?

### Working Assumptions

1. **User workflows:** Users chủ yếu filter theo trạng thái và deadline
2. **Data volume:** Mỗi user có tối đa 100-500 công việc
3. **Department isolation:** Strict separation theo KhoaID
4. **Mobile usage:** 30% traffic từ mobile devices

### Dependencies

- **Backend:** CongViec model đã tồn tại hoặc cần tạo mới
- **Frontend:** Existing auth system với user role và KhoaID
- **Navigation:** Sidebar menu component để add new item
- **External:** Không có dependencies external
