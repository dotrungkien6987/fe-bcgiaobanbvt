# Quy trình quản lý công việc & tình trạng thời hạn (Phiên bản mở rộng linh hoạt)

Tài liệu mô tả đầy đủ:

- Trạng thái workflow (có hoặc không bước chờ duyệt, tùy cấu hình từng công việc).
- Các mốc thời gian planned vs actual và ngày ghi nhận sự kiện.
- Cảnh báo sắp hết hạn (FIXED / PERCENT) & recalc rules.
- Phân tách “Trạng thái” và “Tình trạng” (due status) độc lập.
- Trường mới phục vụ audit & báo cáo.

---

## 1. Khái niệm chính

| Nhóm           | Trường                  | Ý nghĩa                                                                                     |
| -------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| Kế hoạch       | NgayBatDau              | Ngày giờ dự kiến bắt đầu (manager nhập khi tạo).                                            |
| Kế hoạch       | NgayHetHan              | Thời điểm phải hoàn thành (bắt buộc).                                                       |
| Cấu hình duyệt | CoDuyetHoanThanh        | Boolean – có yêu cầu duyệt khi nhân viên bấm hoàn thành (mặc định false).                   |
| Cảnh báo       | CanhBaoMode             | 'PERCENT' hoặc 'FIXED'.                                                                     |
| Cảnh báo       | CanhBaoSapHetHanPercent | Tỷ lệ (0.5–<1.0), mặc định 0.8 khi PERCENT.                                                 |
| Cảnh báo       | NgayCanhBao             | Thời điểm bắt đầu hiển thị “Sắp quá hạn” (FIXED nhập; PERCENT tính).                        |
| Thực tế        | NgayGiaoViec            | Lúc manager bấm “Giao việc”.                                                                |
| Thực tế        | NgayTiepNhanThucTe      | Lúc nhân viên bấm “Tiếp nhận”.                                                              |
| Thực tế        | NgayHoanThanhTam        | Lúc nhân viên bấm “Hoàn thành” (khi CoDuyetHoanThanh=true).                                 |
| Thực tế        | NgayHoanThanh           | Lúc trạng thái vào HOAN_THANH (duyệt hoặc hoàn thành trực tiếp).                            |
| Chất lượng     | HoanThanhTreHan         | Bool: NgayHoanThanh > NgayHetHan.                                                           |
| Chất lượng     | SoGioTre                | Số giờ trễ (>=0, tính khi HOAN_THANH).                                                      |
| Audit          | LichSuTrangThai[]       | {from,to,at,by,meta}.                                                                       |
| Audit          | LichSuCauHinhCanhBao[]  | {at,by,modeBefore,modeAfter,percentBefore,percentAfter,ngayCanhBaoBefore,ngayCanhBaoAfter}. |
| (Tùy chọn)     | FirstSapQuaHanAt        | Lần đầu vào SAP_QUA_HAN.                                                                    |
| (Tùy chọn)     | FirstQuaHanAt           | Lần đầu vượt hạn.                                                                           |

---

## 2. Workflow linh hoạt

### Khi CoDuyetHoanThanh = false (đa số)

`TAO_MOI → DA_GIAO → DANG_THUC_HIEN → HOAN_THANH`

### Khi CoDuyetHoanThanh = true

`TAO_MOI → DA_GIAO → DANG_THUC_HIEN → CHO_DUYET → HOAN_THANH`

Không quay lại (reopen tương lai: thêm flag + lịch sử, không phá tuyến).

---

## 3. Quy tắc mốc thời gian & sự kiện

| Hành động                                       | Ảnh hưởng                                                                                     |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Tạo                                             | Set NgayBatDau, NgayHetHan, CoDuyetHoanThanh; nếu mode=PERCENT có thể tính trước NgayCanhBao. |
| Giao việc                                       | TrangThai=DA_GIAO; nếu !NgayGiaoViec → now.                                                   |
| Tiếp nhận                                       | TrangThai=DANG_THUC_HIEN; nếu !NgayTiepNhanThucTe → now.                                      |
| Hoàn thành (CoDuyetHoanThanh=false)             | TrangThai=HOAN_THANH; NgayHoanThanh=now; tính SoGioTre & HoanThanhTreHan.                     |
| Hoàn thành (CoDuyetHoanThanh=true)              | TrangThai=CHO_DUYET; NgayHoanThanhTam=now.                                                    |
| Duyệt hoàn thành                                | TrangThai=HOAN_THANH; NgayHoanThanh=now; tính SoGioTre & HoanThanhTreHan.                     |
| Sửa NgayHetHan (mode=PERCENT)                   | Recalc NgayCanhBao.                                                                           |
| Sửa NgayBatDau (mode=PERCENT & chưa HOAN_THANH) | Recalc NgayCanhBao.                                                                           |
| Đổi mode FIXED→PERCENT                          | Xóa / override NgayCanhBao cũ, tính mới từ percent.                                           |
| Đổi mode PERCENT→FIXED                          | Yêu cầu NgayCanhBao hợp lệ.                                                                   |

Same-day: cho phép NgayBatDau & NgayHetHan cùng ngày miễn NgayHetHan > NgayBatDau (chênh >0 phút; cảnh báo nếu <15’).

---

## 4. Công thức cảnh báo

Mode=PERCENT:

```
NgayCanhBao = NgayBatDau + (NgayHetHan - NgayBatDau) * percent
```

- percent mặc định 0.8 nếu null.
- Giới hạn nhập <1.0 (nếu =1.0: cảnh báo “không hữu ích”).
- Recalc khi đổi NgayBatDau / NgayHetHan.

Mode=FIXED:

- Validate NgayCanhBao ∈ [NgayBatDau, NgayHetHan).
- Nếu sửa NgayBatDau làm NgayCanhBao < NgayBatDau → yêu cầu sửa.

Materialize vs Virtual:

- Khuyến nghị lưu (materialize) để index truy vấn sắp quá hạn.

---

## 5. Tình trạng thời hạn (Due Status)

Derive:

- SAP_QUA_HAN: now ≥ NgayCanhBao && now < NgayHetHan && !HOAN_THANH.
- QUA_HAN: now > NgayHetHan && !HOAN_THANH.
- HOAN_THANH_TRE_HAN: HOAN_THANH && NgayHoanThanh > NgayHetHan.
- HOAN_THANH_DUNG_HAN: HOAN_THANH && NgayHoanThanh ≤ NgayHetHan.
- DUNG_HAN: còn thời gian, chưa đến cảnh báo.

BE trả `TinhTrangThoiHan`; FE fallback tính khi thiếu.

---

## 6. Validation

- NgayHetHan > NgayBatDau (cho phép chênh nhỏ, FE cảnh báo nếu <15’).
- FIXED: NgayCanhBao ∈ [NgayBatDau, NgayHetHan).
- PERCENT: 0.5 ≤ percent < 1.0.
- Không Giao việc nếu thiếu NgayBatDau hoặc NgayHetHan.
- Recalc PERCENT khi đổi NgayBatDau/NgayHetHan.
- Concurrency: kiểm tra updatedAt/\_\_v trước khi đổi trạng thái.

---

## 7. API đề xuất

| Endpoint                            | Mô tả                  | Lưu ý                                                   |
| ----------------------------------- | ---------------------- | ------------------------------------------------------- |
| POST /congviec                      | Tạo mới                | Body gồm CoDuyetHoanThanh, mode, percent/fixed.         |
| POST /congviec/:id/giao-viec        | Giao                   | Trả actionExecuted=GIAO_VIEC.                           |
| POST /congviec/:id/tiep-nhan        | Tiếp nhận              | actionExecuted=TIEP_NHAN.                               |
| POST /congviec/:id/hoan-thanh       | Hoàn thành             | Nếu CoDuyetHoanThanh=true → CHO_DUYET; else HOAN_THANH. |
| POST /congviec/:id/duyet-hoan-thanh | Duyệt                  | Chỉ khi CHO_DUYET.                                      |
| PATCH /congviec/:id/cauhinh-canhbao | Đổi mode/percent/fixed | Audit thay đổi.                                         |
| PUT /congviec/:id                   | Sửa planned dates      | Recalc nếu PERCENT.                                     |
| GET /congviec/detail/:id            | Chi tiết               | Trả đầy đủ DTO + due status.                            |

Mọi mutation trả `actionExecuted` để FE thống nhất hiển thị toast.

---

## 8. DTO trả về FE (gợi ý)

```
{
  _id,
  TieuDe,
  TrangThai,
  CoDuyetHoanThanh,
  NgayBatDau,
  NgayHetHan,
  NgayGiaoViec,
  NgayTiepNhanThucTe,
  NgayHoanThanhTam,
  NgayHoanThanh,
  CanhBaoMode,
  CanhBaoSapHetHanPercent,
  NgayCanhBao,
  TinhTrangThoiHan,          // DUNG_HAN | SAP_QUA_HAN | QUA_HAN | HOAN_THANH_TRE_HAN | HOAN_THANH_DUNG_HAN
  HoanThanhTreHan,
  SoGioTre,
  FirstSapQuaHanAt?,
  FirstQuaHanAt?,
  MucDoUuTien,
  PhanTramTienDoTong
}
```

---

## 9. FE hành vi

- Form: checkbox “Yêu cầu duyệt khi hoàn thành” (CoDuyetHoanThanh). Preview cảnh báo (thời điểm & phần trăm).
- Tooltip cảnh báo if percent ≥0.95 (“Cảnh báo quá muộn”).
- Detail dialog: countdown (SAP_QUA_HAN), hiển thị “Trễ X giờ” (QUA_HAN / HOAN_THANH_TRE_HAN).
- Danh sách: icon đồng hồ (sap), icon đỏ (quá hạn), badge “+Xh” (tre hạn hoàn thành).

---

## 10. Báo cáo / phân tích

- SLA đúng hạn: tỷ lệ HOAN_THANH & !HoanThanhTreHan.
- Lead time thực tế: NgayHoanThanh - NgayTiepNhanThucTe.
- Response time nhận việc: NgayTiepNhanThucTe - NgayGiaoViec.
- Tỷ lệ bỏ qua duyệt: count(CoDuyetHoanThanh=false)/tổng.

---

## 11. Edge Cases

| Case                                                  | Xử lý                                              |
| ----------------------------------------------------- | -------------------------------------------------- |
| Sửa NgayBatDau khi đã DANG_THUC_HIEN                  | Cho phép; recalc nếu PERCENT; audit.               |
| CoDuyetHoanThanh=false nhưng dữ liệu ở CHO_DUYET (cũ) | Migration: chuyển HOAN_THANH.                      |
| percent=1.0                                           | Cho lưu hoặc ép 0.99 + cảnh báo (“Không hữu ích”). |
| FIXED > NgayHetHan                                    | Reject.                                            |
| FIXED < NgayBatDau                                    | Reject.                                            |
| NgayTiepNhanThucTe sau NgayHetHan                     | Hợp lệ; due status có thể ngay QUA_HAN.            |

---

## 12. Audit & lịch sử

- LichSuTrangThai: push mỗi khi đổi trạng thái.
- LichSuCauHinhCanhBao: push khi đổi mode/percent/fixed.
- (Optional) ghi FirstSapQuaHanAt / FirstQuaHanAt khi điều kiện đầu tiên xảy ra.

---

## 13. Migration (gợi ý)

1. Backfill NgayBatDau = NgayGiaoViec || createdAt nếu null.
2. Thêm CoDuyetHoanThanh=false mặc định.
3. Bản ghi CHO_DUYET nhưng CoDuyetHoanThanh=false → chuyển HOAN_THANH (NgayHoanThanh=NgayHoanThanhTam||now).
4. set CanhBaoSapHetHanPercent=0.8 nếu mode=PERCENT thiếu.
5. Recalc NgayCanhBao (mode=PERCENT) nếu null hoặc sai khoảng.

---

## 14. Index đề xuất

- `{ TrangThai:1, NgayCanhBao:1 }` – truy vấn việc sắp quá hạn chưa hoàn thành.
- `{ TrangThai:1, NgayHetHan:1 }` – danh sách theo hạn.
- (Optional) `{ CoDuyetHoanThanh:1, TrangThai:1 }` – thống kê duyệt.

---

## 15. Phân loại ưu tiên

MUST:

- CoDuyetHoanThanh + workflow nhánh.
- Recalc NgayCanhBao khi đổi NgayBatDau / NgayHetHan (mode=PERCENT).
- SoGioTre & HoanThanhTreHan khi hoàn thành.
- Audit thay đổi cảnh báo & lịch sử trạng thái.
- Index `{TrangThai, NgayCanhBao}`.

SHOULD:

- Countdown & hiển thị giờ trễ realtime.
- Cảnh báo percent ≥0.95 & fixed quá sát hạn (<10’).
- FirstSapQuaHanAt / FirstQuaHanAt.

OPTIONAL:

- Virtual NgayCanhBao cho mode PERCENT (materialize on demand).
- Batch endpoints.
- Reopen logic (flag ReopenedCount).
- Reaction time analytics & SLA dashboard nâng cao.

---

## 16. Pseudo-code chính

```js
function computeNgayCanhBao({
  mode,
  ngayBatDau,
  ngayHetHan,
  fixedNgayCanhBao,
  percent,
}) {
  if (mode === "FIXED") return fixedNgayCanhBao;
  const p = percent ?? 0.8;
  return new Date(ngayBatDau.getTime() + (ngayHetHan - ngayBatDau) * p);
}

function deriveDueStatus(cv, now = Date.now()) {
  if (!cv.NgayHetHan) return "KHONG_CO_HAN";
  if (cv.TrangThai === "HOAN_THANH") {
    return cv.NgayHoanThanh > cv.NgayHetHan
      ? "HOAN_THANH_TRE_HAN"
      : "HOAN_THANH_DUNG_HAN";
  }
  if (now > cv.NgayHetHan) return "QUA_HAN";
  if (cv.NgayCanhBao && now >= cv.NgayCanhBao) return "SAP_QUA_HAN";
  return "DUNG_HAN";
}
```

---

## 17. Tổng kết

Thiết kế mới:

- Giảm rườm rà nhờ tùy chọn duyệt.
- Vẫn đầy đủ dữ liệu phân tích (planned vs actual, delay, SLA).
- Cấu trúc rõ ràng để mở rộng: notification, reopen, SLA dashboard.
- Kiểm soát cảnh báo linh hoạt và tránh cảnh báo vô nghĩa (percent=1.0).

(ĐÃ CẬP NHẬT THEO ĐỀ XUẤT – SẴN SÀNG BƯỚC IMPLEMENT KHI CẦN.)
