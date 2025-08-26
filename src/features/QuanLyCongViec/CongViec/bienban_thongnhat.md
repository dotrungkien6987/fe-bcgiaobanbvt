# Biên Bản Thống Nhất – Module Quản Lý Công Việc (Cập nhật)

Ngày: 23/08/2025
Phạm vi: Flow trạng thái, hành động chuyển trạng thái, tính hạn & cảnh báo, lịch sử, quyền thực hiện.

## 1. Mục tiêu & Flow đã thống nhất

1. Trạng thái chính (TrangThai):
   - Không yêu cầu duyệt: `TAO_MOI → DA_GIAO → DANG_THUC_HIEN → HOAN_THANH`.
   - Có yêu cầu duyệt (`CoDuyetHoanThanh=true`): `TAO_MOI → DA_GIAO → DANG_THUC_HIEN → CHO_DUYET → HOAN_THANH`.
2. Bảng hành động & quyền (đã cập nhật theo phản hồi mới nhất):

| Action             | Chuyển Trạng Thái           | Điều kiện thêm             | Quyền thực hiện                   | Ghi chú                                                                 |
| ------------------ | --------------------------- | -------------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| GIAO_VIEC          | TAO_MOI → DA_GIAO           | Có `NgayHetHan`            | NguoiGiaoViecID                   | Tính / cập nhật `NgayCanhBao` theo mode nếu gửi cùng payload            |
| HUY_GIAO           | DA_GIAO → TAO_MOI           |                            | NguoiGiaoViecID                   | Reset `NgayGiaoViec`, `NgayHoanThanh(Tam)`                              |
| TIEP_NHAN          | DA_GIAO → DANG_THUC_HIEN    |                            | NguoiChinhID                      | Set `NgayBatDau` nếu trống, `NgayTiepNhanThucTe`                        |
| HOAN_THANH_TAM     | DANG_THUC_HIEN → CHO_DUYET  | `CoDuyetHoanThanh` = true  | NguoiChinhID                      | Ghi `NgayHoanThanhTam` nếu trống                                        |
| HUY_HOAN_THANH_TAM | CHO_DUYET → DANG_THUC_HIEN  |                            | NguoiChinhID hoặc NguoiGiaoViecID | Reset `NgayHoanThanhTam`                                                |
| DUYET_HOAN_THANH   | CHO_DUYET → HOAN_THANH      |                            | NguoiGiaoViecID                   | Ghi `NgayHoanThanh`, tính trễ                                           |
| HOAN_THANH         | DANG_THUC_HIEN → HOAN_THANH | `CoDuyetHoanThanh` = false | NguoiGiaoViecID                   | Người giao xác nhận hoàn thành (KHÁC với trước: không phải người chính) |
| MO_LAI_HOAN_THANH  | HOAN_THANH → DANG_THUC_HIEN |                            | NguoiGiaoViecID                   | Reset `NgayHoanThanh`, `SoGioTre`, `HoanThanhTreHan`                    |

Lưu ý: Mọi kiểm tra quyền đều dựa trên `NhanVienID` (token → User → NhanVienID). Không sử dụng trực tiếp User `_id` để đối chiếu vai trò nghiệp vụ. 3. Reverse actions phải reset mốc thời gian hợp lý (ví dụ mở lại xóa `NgayHoanThanh`, hủy giao xóa `NgayGiaoViec`). 4. Lịch sử cần lưu: HanhDong, TuTrangThai, DenTrangThai, NguoiThucHien, ThoiGian, GhiChu (+ định hướng thêm IsRevert, ResetFields, Snapshot thời gian sau này). 5. Tình trạng thời hạn (extended due) độc lập với trạng thái: `DUNG_HAN`, `SAP_QUA_HAN`, `QUA_HAN`, `HOAN_THANH_DUNG_HAN`, `HOAN_THANH_TRE_HAN`. 6. Cảnh báo hết hạn: PERCENT (tính tự động theo % quãng thời gian) hoặc FIXED (ngày cảnh báo cố định nằm trong [NgayBatDau..NgayHetHan)). 7. SoGioTre là số giờ >0 khi hoàn thành muộn; nếu đúng hạn hoặc chưa tính được đặt 0 – không để undefined. 8. Quyền tổng quát (đã hiệu chỉnh):

- Người giao: giao, hủy giao, duyệt hoàn thành, mở lại, hoàn thành (khi không cần duyệt), hủy hoàn thành tạm (được phép), xác nhận hoàn thành là người quyết định cuối.
- Người chính: tiếp nhận, hoàn thành tạm (khi cần duyệt), hủy hoàn thành tạm.
- Cả hai: hủy hoàn thành tạm (đã thống nhất “cả 2 là chính xác”).
- Không có tình huống “người giao tiếp nhận thay”.

## 2. Tình trạng code hiện tại

### Backend

| Hạng mục                                            | Trạng thái  | Ghi chú                                                           |
| --------------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| Model `CongViec` trạng thái & mốc thời gian         | OK          | Enum rút gọn đúng flow.                                           |
| Trường `CoDuyetHoanThanh`                           | OK          | Điều hướng nhánh có duyệt.                                        |
| Hàm `computeNgayCanhBao`                            | OK (cơ bản) | Chưa tái tính khi revert/giao lại.                                |
| Hàm `computeLate`                                   | OK          | Bảo đảm SoGioTre luôn number.                                     |
| Endpoint chuyển trạng thái hợp nhất `transition`    | Có          | Action map & mutate/reset chạy được.                              |
| Chuẩn hóa HOAN_THANH → HOAN_THANH_TAM khi cần duyệt | ĐÃ THÊM     | Logic trong `service.transition`.                                 |
| Kiểm tra quyền action (assigner/main)               | ĐÃ THÊM     | Dựa trên userId theo token (req.userId). Không có admin override. |
| Ghi lịch sử (LichSuTrangThai)                       | OK          | Đã có IsRevert, ResetFields, Snapshot hoàn thành.                 |
| Reset trường khi revert                             | Có một phần | HUY_GIAO, MO_LAI_HOAN_THANH, HUY_HOAN_THANH_TAM.                  |
| Chuẩn hóa lại NgayCanhBao khi giao lại              | CHƯA        | Cần bổ sung khi HUY_GIAO → GIAO_VIEC lần hai.                     |
| Dọn hàm cũ (giaoViec, hoanThanh…)                   | ĐANG DẸP    | Đã log @deprecated & FE bỏ gọi trực tiếp.                         |
| Concurrency / version guard                         | CHƯA        | Không khóa xung đột cập nhật.                                     |
| Lỗi nhỏ virtual NguoiChinh (nếu còn)                | CẦN RÀ      | Từng thấy kí tự thừa, cần xác nhận.                               |
| Endpoint riêng lịch sử                              | CHƯA        | Hiện trả trong detail hoặc không có API riêng.                    |

### Frontend

| Hạng mục                                  | Trạng thái | Ghi chú                                                     |
| ----------------------------------------- | ---------- | ----------------------------------------------------------- |
| Dialog chi tiết dùng unified actions      | OK         | Nút động theo `getAvailableActions`.                        |
| Map action → metadata (nhãn, confirm…)    | Có         | `ACTION_META`.                                              |
| Guard hiển thị nút FE (isAssigner/isMain) | OK         | Phù hợp cơ bản với BE.                                      |
| Sau action refetch detail                 | OK         | Chưa tối ưu patch cục bộ.                                   |
| Extended due chips + countdown            | OK         | Tính bằng `deriveDueInfo`.                                  |
| Metrics (Lead, Response, SLA)             | CÓ         | Đã tránh `Trễ undefinedh`.                                  |
| Cấu hình cảnh báo (WarningConfigBlock)    | TỒN TẠI    | Chưa kiểm tra toàn bộ validation.                           |
| Lịch sử trạng thái UI                     | OK         | Accordion hiển thị, patch refresh detail khi chỉ trả patch. |
| Action description riêng từng confirm     | CÓ         | `buildConfirmTexts`.                                        |
| Loại bỏ nút HOAN_THANH sai nhánh duyệt    | CHƯA       | FE vẫn có khả năng gửi HOAN_THANH (BE sửa lại).             |
| Test unit cho action availability         | CHƯA       | Nên thêm.                                                   |
| Tối ưu countdown real-time                | CHƯA       | Không có interval; phụ thuộc refetch.                       |
| Clean console/log dev                     | CHƯA       | Còn log trong service.                                      |

## 3. Khoảng trống / Vấn đề hiện tại

1. (ĐÃ SỬA) FE nút HOAN_THANH theo quyền mới & auto-normalize phía BE.
2. (ĐÃ SỬA) Lịch sử bổ sung IsRevert, ResetFields, Snapshot.
3. (ĐÃ SỬA) Recompute cảnh báo sau hành động liên quan (GIAO_VIEC / reset NgayGiaoViec) & update.
4. (ĐANG DẸP) Legacy endpoints: đã cảnh báo console, FE bỏ thunks.
5. (ĐÃ SỬA) UI lịch sử đã hiển thị.
6. (CHỜ) Concurrency guard.
7. (CHỜ) Phân quyền nâng cao.
8. (ĐÃ SỬA) Constants thống nhất.
9. (CHỜ) Tests BE/FE.
10. (ĐÃ SỬA) 403 có mã lỗi NOT_ASSIGNER / NOT_MAIN.
11. (MỞ) Tách lyDo/ghiChu.

## 4. Đề xuất điều chỉnh & kế hoạch tiếp

### Giai đoạn A (Ổn định & Đồng bộ quyền)

- Điều chỉnh FE: Ẩn hoàn toàn nút `HOAN_THANH` nếu `CoDuyetHoanThanh=true`; và khi `CoDuyetHoanThanh=false` chỉ hiển thị `HOAN_THANH` nếu user là người giao.
- Sửa BE permission cho `HOAN_THANH` nếu chưa khớp (bảo đảm chỉ assigner).
- Thêm UI lịch sử cơ bản (accordion / panel) đọc từ `LichSuTrangThai`.
- Mở rộng schema lịch sử thêm: `IsRevert`, `ResetFields`, (tùy chọn) `Snapshot: { SoGioTre, TrangThaiBefore, TrangThaiAfter }`.
- Bổ sung mapping mã lỗi quyền: phân biệt “NOT_ASSIGNER”, “NOT_MAIN”.

### Giai đoạn B (Hoàn thiện nghiệp vụ)

- Recompute NgayCanhBao khi revert rồi giao lại / cập nhật thời hạn (FIXED & PERCENT); lưu lại mode & percent chính xác.
- Chuẩn hóa nguồn constants: tạo `workActions.constants.js` ở BE; FE import build-time (hoặc copy script).
- Gắn nhãn `@deprecated` vào hàm legacy & log cảnh báo khi gọi.

### Giai đoạn C (Chất lượng & Bảo trì)

- Test BE: matrix (State x Action x Role) + kiểm tra reset fields chính xác.
- Test FE: hàm `getAvailableActions` & hiển thị nút.
- Concurrency: FE gửi `clientUpdatedAt`; BE kiểm tra lệch >0 => 409 Conflict.
- Local patch sau transition (không refetch toàn bộ) khi mutate đơn giản.

### Giai đoạn D (Nâng cao & Báo cáo)

- Endpoint `/congviec/:id/history` (paging + filter action type).
- Snapshot SLA (SoGioTre, Lead, Response) vào bản ghi hoàn thành.
- Admin override + Audit log (bảng riêng) nếu phát sinh yêu cầu quản trị.

## 5. Hỏi – Đáp / Trạng thái quyết định

1. Người giao tiếp nhận thay? → Không (đã chốt).
2. Hủy hoàn thành tạm: cả hai bên? → Có (đã chốt).
3. Reopen giới hạn số lần/thời gian? → Không giới hạn.
4. Tách riêng `lyDo` và `ghiChu`? → CHƯA CHỐT (giữ nguyên gộp tạm thời).
5. Hiển thị trước SoGioTre dự kiến? → Chưa cần.

Vui lòng xem lại, ghi chú chỉnh sửa hoặc trả lời các câu hỏi. Sau khi chốt sẽ triển khai theo các phase ở trên.

---

## 6. Ghi chú thêm

- Phân quyền LUÔN quy chiếu theo `NhanVienID` (User → NhanVienID). Không so và KHÔNG ĐƯỢC fallback sang User `_id` trong mọi trường hợp. Nếu không resolve được `NhanVienID` thì từ chối (401/403) thay vì so sánh bằng User `_id`.
- Chuẩn hóa middleware auth: sau khi decode token phải tra cứu User → gắn `req.nhanVienId` (và có thể `req.userId`), nếu User không có `NhanVienID` thì reject.

---

_Biên bản cập nhật nhằm phản ánh chính xác quyền HOAN_THANH (assigner) và các xác nhận đã trả lời. Hạng mục mở: tách lyDo/ghiChu._

---

## 7. Kế hoạch triển khai chi tiết (Actionable Roadmap)

### Bước 0 – Chuẩn bị

| Việc            | Mô tả                                                                 | Tiêu chí hoàn thành                                |
| --------------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| Audit mã cũ     | Liệt kê tất cả hàm/endpoint legacy (giaoViec, tiepNhan, hoanThanh...) | Danh sách rõ ràng + đánh dấu deprecated trong code |
| Auth middleware | Bổ sung tra cứu User → NhanVien, set `req.nhanVienId` hoặc trả 401    | Request hợp lệ luôn có `req.nhanVienId`            |

### Bước 1 – Chuẩn hóa hạ tầng quyền & constants

| BE                                                                      | FE                                             | Tiêu chí                                            |
| ----------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- | ----------------------------------- |
| Tạo `workActions.constants.js` export ACTIONS + MAP_ROLE_REQUIREMENTS   | Import (hoặc copy) constants vào slice         | Không còn khai báo trùng lặp literal action strings |
| Cập nhật `service.transition` dùng `req.nhanVienId` thay performerIdCtx | Điều chỉnh `getAvailableActions` theo bảng mới | Gửi sai action bị trả 403 với mã lỗi rõ ràng        |
| Trả JSON error `{ code: "NOT_ASSIGNER"                                  | "NOT_MAIN" }`                                  | FE map -> thông báo tiếng Việt cụ thể               | Người dùng thấy lý do quyền rõ ràng |

### Bước 2 – Lịch sử mở rộng

| BE                                                                                                                                                         | FE                                                                               | Tiêu chí                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| Migrate schema LichSuTrangThai: thêm `IsRevert:Boolean`, `ResetFields:[String]`, `Snapshot:{SoGioTre,Lead,Response}` (tùy snapshot chỉ set khi hoàn thành) | Hiển thị bảng/accordion lịch sử (thời gian, hành động, ai, ghi chú, icon revert) | Lịch sử hiển thị đủ cột, không lỗi dữ liệu cũ |
| Transition: khi revert ghi ResetFields thực tế                                                                                                             | Color chip khác cho revert                                                       | Dễ phân biệt forward vs revert                |
| Transition: tính lead/response tại thời điểm hoàn thành và snapshot                                                                                        | SLA hiển thị từ snapshot nếu có                                                  | Snapshot không thay đổi khi chỉnh ngày về sau |

### Bước 3 – Cảnh báo & hạn

| BE                                                                                                                             | FE                                                                   | Tiêu chí                                              |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------- |
| Hàm tái tính `NgayCanhBao` khi: (a) GIAO_VIEC (kể cả lần 2), (b) update NgayBatDau/NgayHetHan, (c) đổi mode/percent/fixed date | Form cảnh báo: disable nút lưu nếu FIXED ngoài khoảng hợp lệ         | NgayCanhBao luôn nằm trong [BatDau..HetHan) hoặc null |
| Thêm util `recomputeWarningIfNeeded(congviec, changedFields)`                                                                  | Sau update thời hạn FE hiển thị cảnh báo mới không reload toàn trang | Thời gian cảnh báo cập nhật đúng case test            |

### Bước 4 – Dọn legacy & tối ưu refetch

| BE                                                                                                                                  | FE                                                        | Tiêu chí                             |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------ |
| Đánh dấu @deprecated & log console.warn khi gọi legacy                                                                              | Loại bỏ gọi legacy trong UI                               | Không còn network call legacy        |
| Sau khi chưa thấy sử dụng → gỡ endpoint                                                                                             | Slice loại bỏ thunk cũ                                    | Codebase sạch không duplicate logic  |
| Transition trả về patch: `{TrangThai, NgayHoanThanh?, NgayHoanThanhTam?, NgayGiaoViec?, NgayCanhBao?, SoGioTre?, HoanThanhTreHan?}` | FE áp dụng patch + refetch mềm chi tiết khi cần (history) | Giảm round-trip, vẫn đồng bộ history |

### Bước 5 – Concurrency & an toàn dữ liệu

| BE                                                         | FE                                                          | Tiêu chí                         |
| ---------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------- |
| Thêm field `updatedAt` (đã có timestamps) dùng làm version | Gửi header `If-Unmodified-Since: updatedAt` hoặc trong body | (ĐÃ THÊM) BE trả version & guard |
| Transition kiểm tra lệch >0ms (hoặc strict equality)       | FE hiển thị dialog “Nội dung đã thay đổi, tải lại?”         | (CHƯA) FE chưa hiện dialog       |

### Bước 6 – Test & chất lượng

| BE                                          | FE                                              | Tiêu chí                                      |
| ------------------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| Jest test ma trận: (State × Action × Role)  | Unit test `getAvailableActions` + deriveDueInfo | Coverage > các case chính (≥90% action paths) |
| Test migrate lịch sử backward compatibility | Snapshot tests cho history UI                   | Không crash với bản ghi cũ thiếu trường mới   |

### Bước 7 – Nâng cao (Optional / Future)

| Hạng mục                     | Mô tả                                              |
| ---------------------------- | -------------------------------------------------- |
| Admin override               | Thêm action `FORCE_COMPLETE` ghi audit riêng       |
| Audit collection             | Ghi log bất biến vào collection phụ để truy vết    |
| Báo cáo SLA                  | Aggregation tổng hợp SoGioTre, % đúng hạn          |
| WebSocket/Server-Sent Events | Push cập nhật trạng thái real-time thay vì polling |

### Timeline gợi ý

1. Ngày 1–2: Bước 0–1
2. Ngày 3: Bước 2
3. Ngày 4: Bước 3
4. Ngày 5: Bước 4 + 50% Bước 5
5. Ngày 6: Hoàn tất Bước 5 + Bước 6 test
6. Ngày 7+: Optional (Bước 7)

### Nguyên tắc rollback

| Thay đổi                         | Rollback                                                    |
| -------------------------------- | ----------------------------------------------------------- |
| Migrate lịch sử                  | Giữ nguyên field cũ, thêm field mới optional, không xóa cột |
| Permission siết chặt             | Có feature flag tạm (env: ENABLE_STRICT_WM_PERM)            |
| Refactor transition return patch | Giữ endpoint trả full khi `?full=1`                         |

### Chỉ số hoàn thành (Definition of Done)

- 100% action hợp lệ test pass (BE & FE).
- Không còn literal action string ngoài constants.
- Lịch sử hiển thị đủ và phân biệt forward/revert.
- Không xuất hiện SoGioTre = undefined.
- Permission sai trả về code rõ ràng.

---

## 8. Gán Nhiệm Vụ Thường Quy (NVTQ) đơn giản hóa

Phiên bản rút gọn theo yêu cầu mới (thay cho đề xuất phức tạp trước đó):

### 8.1. Phạm vi & Mục tiêu

Cho phép Người Chính (duy nhất) chọn đúng 1 Nhiệm Vụ Thường Quy (NVTQ) (single select) thuộc về chính họ để gán vào công việc nhằm phục vụ phân loại / báo cáo nhẹ. Không lưu lịch sử, không snapshot. Người Phối Hợp chỉ được xem (read-only), không chỉnh sửa. Nếu không có NVTQ phù hợp, Người Chính có thể chọn giá trị đặc biệt "Khác".

### 8.2. Thiết kế Backend

- Thêm trường mới trực tiếp trong `CongViec`:
  - `NhiemVuThuongQuyID: ObjectId | null` (ref `NhiemVuThuongQuy`, mặc định null).
- Chỉ cập nhật trường này khi `req.nhanVienId === NguoiChinhID`.
- Không cần collection trung gian, không ghi lịch sử riêng.
- Cho phép giá trị đặc biệt "Khác" được lưu dưới dạng:
  - Cách 1 (đề xuất hiện tại): Field phụ `FlagNVTQKhac: Boolean` nếu chọn "Khác" mà không gán ID nào.
  - Cách 2: Thêm một ObjectId giả không tồn tại (KHÔNG khuyến nghị). => Chọn Cách 1.
- Khi gửi update, nếu body chứa `NhiemVuThuongQuyID` và/hoặc `FlagNVTQKhac`:
  - Validate: Nếu ID không thuộc danh sách NVTQ active của Người Chính -> 403.
  - Nếu `NhiemVuThuongQuyID` null và chọn "Khác" -> `FlagNVTQKhac=true`.
  - Nếu có ID hợp lệ -> lưu ID và đặt `FlagNVTQKhac=false`.

### 8.3. API Bổ sung

| Method | Endpoint                                     | Mục đích                                                                     |
| ------ | -------------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/workmanagement/nhiemvuthuongquy/my`        | Lấy danh sách NVTQ của Người Chính (dựa NhanVienNhiemVu) để FE autocomplete. |
| PUT    | `/workmanagement/congviec/:id` (tái sử dụng) | Cho phép gửi thêm `NhiemVuThuongQuyID`, `FlagNVTQKhac`.                      |

### 8.4. Frontend UI / UX

- Trong `CongViecDetailDialog`, nếu user là Người Chính: hiển thị Select / Autocomplete single "Nhiệm vụ thường quy của tôi".
- Người Phối Hợp: hiển thị read-only một badge (hoặc "(Chưa gán)").
- Option đặc biệt: "Khác" luôn có ở cuối danh sách; chọn -> gửi update `NhiemVuThuongQuyID=null`, `FlagNVTQKhac=true`.
- Hiển thị: Chip duy nhất (NVTQ) hoặc Chip "Khác" hoặc trạng thái trống.
- Khi có xung đột version (409) sử dụng cơ chế concurrency đã thêm ở Step 5.

### 8.5. Quy tắc dữ liệu

| Trường hợp                   | Kết quả lưu                                 | Ghi chú                   |
| ---------------------------- | ------------------------------------------- | ------------------------- |
| Chọn "Khác"                  | NhiemVuThuongQuyID=null; FlagNVTQKhac=true  | Hiển thị chip "Khác"      |
| Chọn 1 NVTQ                  | NhiemVuThuongQuyID=<id>; FlagNVTQKhac=false | Loại bỏ trạng thái "Khác" |
| Đổi từ Khác -> ID            | NhiemVuThuongQuyID=<id>; FlagNVTQKhac=false |                           |
| Đổi từ ID -> Khác            | NhiemVuThuongQuyID=null; FlagNVTQKhac=true  | Ghi đè giá trị cũ         |
| Gửi ID không thuộc sở hữu    | 403                                         | Không thay đổi dữ liệu    |
| Người Phối Hợp cố gửi update | 403                                         | FE disable                |

### 8.6. Edge Cases

- Xóa (deactivate): vẫn hiển thị tên (nếu populate trả null -> hiển thị "(Đã ẩn)").
- Từ Khác -> ID: bỏ FlagNVTQKhac.
- Từ ID -> Khác: set ID=null & FlagNVTQKhac=true.
- Chuyển Người Chính (tương lai): có thể reset về null (ngoài phạm vi hiện tại).

### 8.7. Kế hoạch triển khai bổ sung (nhúng vào roadmap)

| Bước | Việc          | Mô tả ngắn                                                              | Tiêu chí                              |
| ---- | ------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| 5.1  | BE Field      | Thêm `NhiemVuThuongQuyID`, `FlagNVTQKhac` vào model + validation update | Build ok, không ảnh hưởng update khác |
| 5.2  | API My NVTQ   | Endpoint trả danh sách NVTQ sở hữu                                      | FE nhận đúng danh sách <= vài trăm ms |
| 5.3  | FE Slice      | Thunk fetchMyRoutineTasks + state lưu                                   | Gọi khi mở dialog nếu isMain          |
| 5.4  | FE UI Main    | Select/Autocomplete đơn + update ngay                                   | Phản hồi <1s                          |
| 5.5  | FE UI View    | Read-only khi isParticipant                                             | Không có hành động click              |
| 5.6  | "Khác" Option | Chọn -> gửi null + Flag=true                                            | Đổi qua lại ổn định                   |
| 5.7  | Concurrency   | Reuse version guard khi update                                          | 409 hiển thị banner như đã có         |
| 5.8  | Test nhẹ      | BE: 403 non-main; FE: disable control                                   | Case chính thông qua                  |

### 8.8. Definition of Done (NVTQ đơn giản)

- Người Chính chọn 1 NVTQ hoặc "Khác" (không multi) cập nhật tức thời.
- Người Phối Hợp nhìn thấy nhưng không chỉnh.
- BE chặn mọi cập nhật từ user không phải Người Chính.
- Không phát sinh document phụ hoặc lịch sử.
- Concurrency guard vẫn hoạt động (409 nếu version lệch).

---
