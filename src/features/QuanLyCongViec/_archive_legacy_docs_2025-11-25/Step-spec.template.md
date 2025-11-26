Bước {n}: {Tên Page/Component}
Mục tiêu + Phạm vi
Mục tiêu người dùng thấy được gì sau bước này
Phạm vi (in/out of scope)
UI/UX
Layout: {Page/Modal/Drawer + cấu trúc vùng UI}
Components MUI: {DataGrid/List/Tabs/Dialog/...}
States: {loading/error/empty/disabled}
Interaction: {click/add/edit/delete/upload/filter/sort/paginate}
Responsive: {breakpoints/chuyển đổi layout}
Backend (API/Model)
Endpoints (method + route):
DTO Request/Response (JSON schema hoặc interface)
Validate/Permissions:
Soft delete/Audit:
Ảnh hưởng model/index (nếu có):
Frontend (State/Logic)
Redux slice: {tên slice}, initialState, thunks/RTK Query, reducers, selectors
API client/service:
Routing: {route path, guard}
Types/interfaces:
Error mapping lên UI:
Cấu trúc file (dự kiến)
server/... (controllers, services, routes, models)
client/src/... (modules/{module}/pages, components, store/slices, api)
assets/constants (nếu cần)
Mẫu payload
Request ví dụ:
Response ví dụ:
Definition of Done (DoD)
UI hiển thị đúng và responsive
Gọi API thật, xử lý loading/error/empty
Validate/permissions đúng nghiệp vụ
Test tối thiểu: {unit/integration}
Docs/README cập nhật (nếu cần)
Ghi chú kỹ thuật
Bảo mật (XSS, upload)
Hiệu năng (debounce, pagination)
i18n/a11y (nếu áp dụng)
Câu hỏi/giả định
Câu hỏi mở:
Giả định tạm thời: