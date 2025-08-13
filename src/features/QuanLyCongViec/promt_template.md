 Prompt mẫu tái sử dụng —

Bạn đang ở agentmode. Luôn giao tiếp bằng tiếng Việt.

Nhiệm vụ: Triển khai end-to-end (BE → Redux slice → FE) cho cụm chức năng “{FEATURE_NAME}” dựa trên:

Tài liệu yêu cầu: {FEATURE_DOC_FILE} (ví dụ: #file:GIAO_VIEC_THIET_KE_TONG_KET.md)
Hệ thống model hiện có trong thư mục models của repo (context hiện tại)
Ràng buộc/kỳ vọng chung

Bám sát nghiệp vụ và mô hình dữ liệu trong tài liệu: trạng thái/tiến độ/luồng nghiệp vụ, phân quyền, phân cấp cha–con (nếu có), bình luận thread (nếu có), tệp đính kèm nhiều phạm vi (nếu có), soft delete, lịch sử thay đổi. Bỏ qua realtime nếu ngoài phạm vi.
Tương thích hoàn hảo với codebase hiện có: tái sử dụng models trong models/, giữ naming theo tài liệu (ưu tiên tiếng Việt trong module), hợp nhất/xóa trùng lặp theo hướng dẫn.
FE: React + Redux Toolkit (RTK) + Material UI (MUI), UI/UX hiện đại, responsive, có loading/error/empty states, routing chuẩn, snackbar/toast, dialog xác nhận, skeleton.
BE: nhóm endpoint theo tài liệu, validate chặt, phân quyền đúng, soft delete đúng, lưu file local đúng chuẩn (ví dụ uploads/workmanagement/), MIME whitelist, giới hạn dung lượng qua env, chống XSS (đặc biệt bình luận/ nhập liệu), chống path traversal, format lỗi nhất quán.
Yêu cầu bắt buộc về Redux và cách dùng state (theo sở thích của tôi)

Sử dụng createSlice của Redux Toolkit với thunks thủ công (redux-thunk) thay vì createAsyncThunk hay RTK Query, trừ khi tôi cho phép.
Mẫu chuẩn thunks: dispatch(slice.actions.startLoading()); try { …success… } catch(e) { hasError(e.message); toast.error(e.message); }.
Trong reducer phải có tối thiểu: startLoading, hasError, và các actionSuccess theo từng nghiệp vụ.
Luôn dispatch action kèm dấu ngoặc: dispatch(slice.actions.startLoading()).
Sử dụng apiService hiện có để gọi API; dùng react-toastify (toast) cho thông báo.
Trong component, dùng useSelector trực tiếp và destructuring theo module slice. Ví dụ: const { bcGiaoBanTheoNgay, khoas, ctChiSos, isLoading } = useSelector((state) => state.baocaongay);
Đặt tên slice theo module tiếng Việt/ngữ cảnh (ví dụ: congviec, binhluan, teptin), initialState gồm isLoading, error và các trường domain cần thiết.
Kết nối BE–FE

Định nghĩa rõ DTO request/response cho từng bước, map lỗi lên UI, viết thunks tương ứng, selectors cơ bản.
Tránh N+1 query; bổ sung index DB theo gợi ý trong tài liệu nếu cần.
Test và bảo mật

Test: unit (validate/service), integration (luồng chính), E2E cơ bản trang chính.
Bảo mật upload (MIME whitelist, size limit), chống XSS, chống path traversal, chuẩn hóa error format.
Quy trình làm việc UI-first theo bước, có thể xem ngay

Mỗi “Bước” tương ứng một Page/Component theo workflow người dùng. Sau MỖI Bước phải dừng lại để tôi review/confirm rồi mới sang bước tiếp theo.
Mỗi Bước được mô tả trong MỘT file đặc tả (SPEC) duy nhất để làm ngữ cảnh sinh code sau này. Không sinh code khi chưa có yêu cầu.
Định dạng file SPEC cho MỖI Bước (1 file/bước, ví dụ: docs/{MODULE_KEY}-step-{n}.spec.md)

Mục tiêu + Phạm vi bước
UI/UX: Layout (Page/Modal), danh sách component MUI, interaction chính, loading/error/empty, responsive
Backend: endpoint/method/route, DTO request/response (JSON schema), validate, quyền, soft delete, ảnh hưởng model/index (nếu có)
Frontend: Redux slice (tên slice, initialState, thunks, reducers, selectors), service/API client, routing, types/interfaces (nếu TS), error mapping
Cấu trúc file dự kiến (theo codebase hiện có, đường dẫn BE/FE cụ thể)
Mẫu payload request/response (JSON ví dụ)
Checklist Definition of Done (DoD) cho bước
Ghi chú kỹ thuật: bảo mật, hiệu năng, i18n/a11y (nếu có)
Câu hỏi/giả định của bước (nếu còn)
Nguyên tắc xuất kết quả khi tới pha sinh code

Tôn trọng convention repo (TS/JS, alias, eslint/prettier, router, logger).
Module hoá rõ (ví dụ: server/modules/{MODULE_KEY}/… và client/src/modules/{MODULE_KEY}/…).
Khi đề xuất/tạo file phải dùng “file block syntax” với name=đường-dẫn-đầy-đủ để tôi có thể áp dụng ngay.
Mỗi bước tạo 1 PR riêng (nếu có), gắn link SPEC của bước.
Trình tự phản hồi của bạn

Phase A (ngay bây giờ):
Xác nhận đã đọc {FEATURE_DOC_FILE} và models/.
Chỉ đặt CÂU HỎI LÀM RÕ (ngắn gọn, nhóm theo chủ đề: BE/FE/Phân quyền/Upload/Deployment/Quy trình), và liệt kê CÁC GIẢ ĐỊNH an toàn nếu tôi không trả lời.
KHÔNG lập kế hoạch và KHÔNG sinh code ở phase này.
Phase B (khi tôi nói “OK, lập kế hoạch”):
Lập danh sách BƯỚC theo nguyên tắc UI-first (chỉ nêu tên bước, mục tiêu, và tên file SPEC dự định). KHÔNG sinh code.
Dừng chờ tôi confirm/thay đổi thứ tự/nội dung bước.
Phase C (triển khai từng bước):
Cho Bước n: sinh 1 file SPEC theo đúng định dạng trên (không code).
Khi tôi nói “Sinh code Bước n”: sinh code BE + Redux slice (theo mẫu thunks thủ công) + FE (MUI, useSelector trực tiếp) đầy đủ cho bước đó, đúng cấu trúc thư mục của repo.
Dừng chờ tôi review/confirm trước khi chuyển bước.
Ràng buộc nghiệp vụ (tùy cụm, lấy theo {FEATURE_DOC_FILE})

Ví dụ với “Giao Việc”: CongViec có duy nhất 1 VaiTro='CHINH' khớp NguoiChinhID; không trùng NhanVienID; NgayHetHan > NgayBatDau; không tự tham chiếu; PhanTramTienDoTong mặc định theo người ‘CHINH’; isDeleted; LichSuTrangThai. BinhLuan thread + softDeleteWithFiles; TepTin 3 phạm vi + MIME/size + lưu local + soft delete. Quyền theo tài liệu.
Nếu bạn hiểu yêu cầu, hãy bắt đầu theo Phase A: chỉ xác nhận, nêu câu hỏi làm rõ và giả định mặc định. Không lập kế hoạch và không sinh code cho đến khi tôi yêu cầu.