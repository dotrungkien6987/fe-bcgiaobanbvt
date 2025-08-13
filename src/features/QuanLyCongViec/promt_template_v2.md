Prompt mẫu tái sử dụng — Hospital Management System

Bạn đang ở agentmode. Luôn giao tiếp bằng tiếng Việt.

Nhiệm vụ: Triển khai end-to-end (BE → Redux slice → FE) cho cụm chức năng "{FEATURE_NAME}" dựa trên:

Tài liệu yêu cầu: {FEATURE_DOC_FILE} (ví dụ: #file:GIAO_VIEC_THIET_KE_TONG_KET.md)
Hệ thống model hiện có trong thư mục giaobanbv-be/models/ của repo (context hiện tại)
DataFix master data system hiện có (state.nhanvien.datafix)

## Ràng buộc/kỳ vọng chung

### Nghiệp vụ y tế

Bám sát nghiệp vụ và mô hình dữ liệu trong tài liệu:

- Trạng thái/tiến độ/luồng nghiệp vụ theo đặc thù bệnh viện
- Phân quyền theo role (1=User, 2=Manager, 3=Admin, 4=SuperAdmin)
- Phân cấp cha–con (nếu có), bình luận thread (nếu có)
- Tệp đính kèm với Cloudinary (nếu có), soft delete với isDeleted flag
- Lịch sử thay đổi, audit trail
- Department-based data isolation qua KhoaID
- Bỏ qua realtime nếu ngoài phạm vi

### Tương thích với codebase hiện có

- **Models**: Tái sử dụng models trong giaobanbv-be/models/
- **DataFix system**: Sử dụng cho master data (VaiTro, ChucDanh, Khoa, etc.)
- **Naming**: Ưu tiên tiếng Việt trong module, tuân theo convention hiện có
- **File structure**: src/features/{Module}/{Component}
- **API patterns**: Tuân theo sendResponse format, error handling patterns

### Frontend stack

- **React 18** + Redux Toolkit (createSlice) + Material UI v5
- **Form handling**: React Hook Form + Yup validation + custom form components (FTextField, FDatePicker, FAutocomplete)
- **UI/UX**: Hiện đại, responsive, loading/error/empty states
- **Navigation**: React Router v6, breadcrumb navigation
- **Feedback**: react-toastify, MUI Dialog xác nhận, Skeleton loading
- **Table patterns**: MUI Table/DataGrid với AddButton + UpdateButton + DeleteButton

### Backend stack

- **Express.js** + MongoDB (Mongoose)
- **API design**: RESTful endpoints, grouped by module
- **Validation**: Mongoose schemas + custom validators + express-validator
- **Auth**: JWT middleware, role-based permissions
- **File handling**: Multer + Cloudinary integration, MIME whitelist, size limits
- **Security**: XSS protection, path traversal prevention
- **Response format**: Consistent sendResponse(res, status, success, data, error, message)

## Yêu cầu bắt buộc về Redux và state management

### Redux Toolkit patterns (theo sở thích hiện tại)

```javascript
// Sử dụng createSlice với manual thunks (redux-thunk), KHÔNG dùng createAsyncThunk hay RTK Query
const slice = createSlice({
  name: "moduleName",
  initialState: {
    isLoading: false,
    error: null,
    // domain-specific fields
  },
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // feature-specific success reducers
  },
});

// Manual thunks pattern
export const someAction = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/endpoint", data);
    dispatch(slice.actions.someActionSuccess(response.data.data));
    toast.success("Thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
```

### Component state management

```javascript
// Component sử dụng useSelector trực tiếp với destructuring
const { items, isLoading, error } = useSelector((state) => state.moduleName);

// Luôn dispatch action với parentheses
dispatch(slice.actions.startLoading());
```

### API service integration

```javascript
// Sử dụng apiService hiện có từ app/apiService.js
import apiService from "app/apiService";

// Toast notifications với react-toastify
import { toast } from "react-toastify";
```

## Form component patterns

### Standard form với React Hook Form + Yup

```javascript
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  FTextField,
  FDatePicker,
  FAutocomplete,
  FormProvider,
} from "components/form";

const yupSchema = Yup.object().shape({
  fieldName: Yup.string().required("Bắt buộc nhập"),
});

function SomeForm({ open, handleClose, item = {} }) {
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      // Vietnamese field names matching API
    },
  });

  const onSubmit = (data) => {
    // Redux dispatch logic
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <FTextField name="fieldName" label="Vietnamese Label" />
        <FDatePicker name="dateField" label="Ngày" />
        <FAutocomplete
          name="selectField"
          options={options}
          displayField="TenHienThi"
          label="Chọn"
        />
      </FormProvider>
    </Dialog>
  );
}
```

## Table + CRUD patterns

### Standard table component structure

```javascript
// {Module}Table.js - displays data with action buttons
// Add{Module}Button.js - opens form with empty/default data
// Update{Module}Button.js - opens form with existing data for editing
// {Module}Form.js - handles both create and update modes based on item._id

// Action column pattern
Cell: ({ row }) => (
  <Stack direction="row">
    <Update{Module}Button item={row.original} />
    <Delete{Module}Button itemId={row.original._id} />
  </Stack>
);
```

### DataFix integration for master data

```javascript
// Access master data from datafix
const { datafix } = useSelector((state) => state.nhanvien);
const vaiTros = datafix.VaiTro || [];
const chucDanhs = datafix.ChucDanh || [];

// Update datafix (automatic index field addition on backend)
dispatch(updateOrInsertDatafix(datafixUpdate));
```

## Backend API patterns

### Controller structure với error handling

```javascript
const controller = {};

controller.action = catchAsync(async (req, res, next) => {
  // Business logic
  const result = await SomeModel.find({});
  return sendResponse(res, 200, true, { data: result }, null, "Thành công");
});

module.exports = controller;
```

### Routes theo RESTful conventions

```javascript
// routes/{module}.api.js
router.get("/", authentication.loginRequired, controller.getAll);
router.post("/", authentication.loginRequired, controller.create);
router.put("/:id", authentication.loginRequired, controller.update);
router.delete("/:id", authentication.loginRequired, controller.delete);
```

## File upload patterns

### Cloudinary integration

```javascript
// Multiple image support với ImageUploader component
import ImageUploader from "components/form/ImageUploader";
import ImageListDisplay from "components/form/ImageListDisplay";

// Backend: Multer + Cloudinary với MIME whitelist
const upload = multer({
  storage: multerCloudinary.storage,
  fileFilter: (req, file, cb) => {
    // MIME type validation
  },
  limits: { fileSize: process.env.MAX_FILE_SIZE },
});
```

## Quy trình làm việc UI-first theo bước

Mỗi "Bước" tương ứng một Page/Component theo workflow người dùng. Sau MỖI Bước phải dừng lại để tôi review/confirm rồi mới sang bước tiếp theo.

Mỗi Bước được mô tả trong MỘT file đặc tả (SPEC) duy nhất để làm ngữ cảnh sinh code sau này. Không sinh code khi chưa có yêu cầu.

### File SPEC format cho mỗi bước

Tên file: `docs/{MODULE_KEY}-step-{n}.spec.md`

Nội dung bao gồm:

- Mục tiêu + Phạm vi bước
- UI/UX: Layout (Page/Modal), danh sách component MUI, interaction chính, loading/error/empty, responsive breakpoints
- Backend: endpoint/method/route, DTO request/response (JSON schema), validate, quyền, soft delete, ảnh hưởng model/index
- Frontend: Redux slice (tên slice, initialState, thunks, reducers, selectors), service/API client, routing, error mapping
- Cấu trúc file dự kiến theo structure hiện có
- Mẫu payload request/response (JSON ví dụ)
- Definition of Done (DoD) checklist
- Ghi chú kỹ thuật: bảo mật, hiệu năng, i18n/a11y
- Câu hỏi/giả định

## Trình tự phản hồi

### Phase A (ngay bây giờ):

- Xác nhận đã đọc {FEATURE_DOC_FILE} và giaobanbv-be/models/
- Chỉ đặt CÂU HỎI LÀM RÕ (ngắn gọn, nhóm theo chủ đề: BE/FE/Phân quyền/Upload/DataFix/Quy trình)
- Liệt kê CÁC GIẢ ĐỊNH an toàn nếu tôi không trả lời
- **KHÔNG lập kế hoạch và KHÔNG sinh code ở phase này**

### Phase B (khi tôi nói "OK, lập kế hoạch"):

- Lập danh sách BƯỚC theo nguyên tắc UI-first (chỉ nêu tên bước, mục tiêu, và tên file SPEC dự định)
- **KHÔNG sinh code**
- Dừng chờ tôi confirm/thay đổi thứ tự/nội dung bước

### Phase C (triển khai từng bước):

- Cho Bước n: sinh 1 file SPEC theo đúng định dạng trên (không code)
- Khi tôi nói "Sinh code Bước n": sinh code BE + Redux slice (theo manual thunks) + FE (MUI, useSelector trực tiếp) đầy đủ cho bước đó, đúng cấu trúc thư mục
- Dừng chờ tôi review/confirm trước khi chuyển bước

## Ràng buộc nghiệp vụ chung

### Authentication & Authorization

- Role hierarchy: 1=User, 2=Manager, 3=Admin, 4=SuperAdmin
- Department-based access control qua KhoaID
- JWT tokens với refresh mechanism

### Data handling

- Vietnamese UI text cho tất cả labels, messages, form fields
- Date handling với dayjs và Vietnamese formatting
- Consistent loading states cho mọi async operations
- Toast notifications cho success/error feedback
- Responsive design với MUI breakpoints
- Error boundaries với user-friendly messages

### Master data management

- DataFix arrays cần `index` field cho table operations (backend auto-generates)
- Form defaultValues phải match Vietnamese field names từ API
- Consistent `startLoading/hasError/success` pattern trong Redux actions

Nếu bạn hiểu yêu cầu, hãy bắt đầu theo Phase A: chỉ xác nhận, nêu câu hỏi làm rõ và giả định mặc định. Không lập kế hoạch và không sinh code cho đến khi tôi yêu cầu.
