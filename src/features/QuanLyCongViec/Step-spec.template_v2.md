# Bước {n}: {Tên Page/Component}

## Mục tiêu + Phạm vi

**Mục tiêu người dùng:** {Mô tả những gì người dùng sẽ thấy/thực hiện được sau bước này}
**Phạm vi:**

- In scope: {Những tính năng sẽ triển khai}
- Out of scope: {Những tính năng tạm thời bỏ qua}

## UI/UX Design

### Layout Structure

- **Container:** {Page/Modal/Drawer + mô tả cấu trúc vùng UI chính}
- **Responsive breakpoints:**
  - Desktop (≥1200px): {Mô tả layout}
  - Tablet (768-1199px): {Mô tả thay đổi}
  - Mobile (<768px): {Mô tả thay đổi}

### Components MUI

- **Data Display:** {DataGrid/Table/List/Cards}
- **Input Controls:** {FTextField/FDatePicker/FAutocomplete/FRadioGroup}
- **Navigation:** {Tabs/Stepper/Breadcrumb}
- **Feedback:** {Dialog/Snackbar/Progress/Skeleton}
- **Layout:** {Grid/Stack/Box/Paper}

### Interaction Flow

- **Primary actions:** {Add/Edit/Delete/Submit/Cancel}
- **Secondary actions:** {Filter/Sort/Search/Export/View}
- **User journey:** {Mô tả luồng tương tác từng bước}

### State Management (UI)

- **Loading states:** {Skeleton/Spinner/Disabled buttons during API calls}
- **Error states:** {Form validation/API errors/Network errors}
- **Empty states:** {No data/No search results/Initial state}
- **Success states:** {Toast notifications/Form reset/Navigation}

## Backend Implementation

### API Endpoints

```javascript
// Method: {GET/POST/PUT/DELETE}
// Route: {/api/module/endpoint}
// Authentication: {required/optional}
// Authorization: {role requirements}
```

### Request/Response DTOs

```typescript
// Request DTO
interface {RequestName} {
  // Vietnamese field names matching frontend
  fieldName: string;
  ngayTao: Date;
  nguoiTaoID: ObjectId;
  khoaID?: ObjectId; // Department-based filtering
}

// Response DTO
interface {ResponseName} {
  success: boolean;
  data: {
    // Response data structure
  };
  message: string;
  error?: string;
}
```

### Validation Rules

- **Required fields:** {List mandatory fields}
- **Business logic:** {Domain-specific validations}
- **Data integrity:** {Unique constraints/Foreign keys}
- **Security:** {Input sanitization/XSS prevention}

### Database Operations

- **Model updates:** {New fields/Indexes needed}
- **Soft delete:** {isDeleted flag usage}
- **Audit trail:** {createdAt/updatedAt/modifiedBy}
- **Department isolation:** {KhoaID filtering}

## Frontend Implementation

### Redux Slice Design

```javascript
// Slice name: {sliceName}
const initialState = {
  isLoading: false,
  error: null,
  // Domain-specific state fields
  {items}: [],
  {currentItem}: null,
};

// Key reducers needed:
// - startLoading
// - hasError
// - get{Items}Success
// - create{Item}Success
// - update{Item}Success
// - delete{Item}Success

// Manual thunks (NOT createAsyncThunk):
// - get{Items}()
// - create{Item}(data)
// - update{Item}(id, data)
// - delete{Item}(id)
```

### Form Integration

```javascript
// Yup validation schema
const validationSchema = Yup.object().shape({
  // Vietnamese field validations
});

// React Hook Form setup
const methods = useForm({
  resolver: yupResolver(validationSchema),
  defaultValues: {
    // Match API field names (Vietnamese)
  },
});

// Custom form components usage:
// - FTextField for text inputs
// - FDatePicker for dates
// - FAutocomplete for dropdowns with DataFix data
```

### DataFix Integration

```javascript
// Master data access
const { datafix } = useSelector((state) => state.nhanvien);
const vaiTros = datafix.VaiTro || [];
const khoaDanhSach = datafix.Khoa || [];

// DataFix updates (if needed)
dispatch(updateOrInsertDatafix(updatedDatafix));
```

### API Service Integration

```javascript
// Use existing apiService
import apiService from "app/apiService";

// Toast notifications
import { toast } from "react-toastify";

// Error handling in thunks
catch (error) {
  dispatch(slice.actions.hasError(error.message));
  toast.error(error.message);
}
```

### Routing Configuration

```javascript
// Route path: {/path/to/component}
// Guard requirements: {AuthRequire/AdminRequire/etc.}
// Navigation integration: {Breadcrumb/Menu items}
```

## File Structure (Expected)

### Backend Files

```
giaobanbv-be/
├── models/{modelName}.js
├── controllers/{moduleName}.controller.js
├── routes/{moduleName}.api.js
├── middlewares/{customMiddleware}.js (if needed)
└── modules/{moduleName}/ (if complex module)
    ├── controllers/
    ├── services/
    └── routes/
```

### Frontend Files

```
src/
├── features/{ModuleName}/
│   ├── {ModuleName}Table.js
│   ├── {ModuleName}Form.js
│   ├── Add{ModuleName}Button.js
│   ├── Update{ModuleName}Button.js
│   ├── Delete{ModuleName}Button.js
│   └── {moduleName}Slice.js
├── components/form/ (reuse existing)
├── pages/{ModulePage}.js (if needed)
└── routes/index.js (route registration)
```

## Sample Payloads

### Request Examples

```json
// POST /api/{module}
{
  "tenMuc": "Tên mục việc",
  "moTa": "Mô tả chi tiết",
  "ngayBatDau": "2024-01-15",
  "nguoiTaoID": "507f1f77bcf86cd799439011",
  "khoaID": "507f1f77bcf86cd799439012"
}

// PUT /api/{module}/{id}
{
  "tenMuc": "Tên đã cập nhật",
  "trangThai": "HOAN_THANH"
}
```

### Response Examples

```json
// Success Response
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "tenMuc": "Tên mục việc",
    "trangThai": "DANG_THUC_HIEN",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Tạo mới thành công"
}

// Error Response
{
  "success": false,
  "error": "Validation failed",
  "message": "Tên mục việc không được để trống"
}
```

## Definition of Done (DoD)

### Functional Requirements

- [ ] UI hiển thị đúng trên desktop/tablet/mobile
- [ ] Form validation hoạt động với Yup schema
- [ ] API calls thành công với loading/error states
- [ ] Toast notifications hiển thị đúng
- [ ] Navigation/routing hoạt động
- [ ] DataFix integration (nếu cần)

### Technical Requirements

- [ ] Redux slice tuân theo manual thunks pattern
- [ ] Component sử dụng useSelector trực tiếp
- [ ] Error boundaries xử lý lỗi gracefully
- [ ] API validation và authorization đúng role
- [ ] Soft delete implementation (nếu cần)
- [ ] Department-based filtering (nếu cần)

### Testing Requirements

- [ ] Manual testing các luồng chính
- [ ] Error scenarios handling
- [ ] Responsive design verification
- [ ] Form validation edge cases
- [ ] API error handling

### Documentation

- [ ] Code comments cho business logic phức tạp
- [ ] README updates (nếu cần)
- [ ] API documentation (nếu public endpoints)

## Technical Notes

### Security Considerations

- **Input validation:** {XSS prevention/SQL injection}
- **Authorization:** {Role-based access/Department isolation}
- **File uploads:** {MIME type validation/Size limits} (nếu có)
- **Audit logging:** {User actions tracking} (nếu cần)

### Performance Optimizations

- **Frontend:** {Memoization/Lazy loading/Debouncing}
- **Backend:** {Database indexing/Query optimization}
- **Caching:** {Redis/Memory caching} (nếu cần)
- **Pagination:** {Table pagination/Infinite scroll}

### Accessibility (a11y)

- **Keyboard navigation:** {Tab order/Focus management}
- **Screen readers:** {ARIA labels/Semantic HTML}
- **Color contrast:** {WCAG compliance}
- **Form accessibility:** {Label associations/Error announcements}

### Internationalization (i18n)

- **Vietnamese text:** {All UI text in Vietnamese}
- **Date formatting:** {dayjs với Vietnamese locale}
- **Number formatting:** {Vietnamese number/currency format}
- **Error messages:** {User-friendly Vietnamese messages}

## Questions & Assumptions

### Open Questions

1. {Câu hỏi về business logic chưa rõ}
2. {Câu hỏi về UI/UX design}
3. {Câu hỏi về integration với systems khác}
4. {Câu hỏi về performance requirements}

### Working Assumptions

1. {Giả định về user workflows}
2. {Giả định về data structure}
3. {Giả định về authorization rules}
4. {Giả định về integration points}

### Dependencies

- **Backend:** {APIs/Services cần có sẵn}
- **Frontend:** {Components/Libraries cần}
- **DataFix:** {Master data requirements}
- **External:** {Third-party services} (nếu có)
