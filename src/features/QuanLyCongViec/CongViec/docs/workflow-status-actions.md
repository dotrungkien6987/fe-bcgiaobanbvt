# Workflow Trạng thái & Hành động

## 1. Trạng thái chính

| Code           | Nhãn           | Ý nghĩa                                                    |
| -------------- | -------------- | ---------------------------------------------------------- |
| TAO_MOI        | Tạo mới        | Vừa tạo, chưa giao chính thức                              |
| DA_GIAO        | Đã giao        | Đã giao cho người chính, chờ tiếp nhận                     |
| DANG_THUC_HIEN | Đang thực hiện | Người chính đã tiếp nhận và đang làm                       |
| CHO_DUYET      | Chờ duyệt      | Người chính gửi hoàn thành tạm (khi CoDuyetHoanThanh=true) |
| HOAN_THANH     | Hoàn thành     | Kết thúc (có thể mở lại nếu cần)                           |

## 2. Thuộc tính ảnh hưởng

- `CoDuyetHoanThanh = true`: Luồng hoàn thành có bước tạm (HOAN_THANH_TAM -> CHO_DUYET -> DUYET_HOAN_THANH -> HOAN_THANH) và chỉ Main tạo bước tạm, Assigner duyệt.
- `CoDuyetHoanThanh = false`: Main chuyển trực tiếp từ DANG_THUC_HIEN -> HOAN_THANH (Assigner không hoàn thành thay). Assigner chỉ có thể mở lại sau khi đã HOAN_THANH.

## 3. Hành động (WORK_ACTIONS)

| Action             | Label FE               | Từ trạng thái  | Đến trạng thái   | Quyền                                       |
| ------------------ | ---------------------- | -------------- | ---------------- | ------------------------------------------- |
| GIAO_VIEC          | Giao việc              | TAO_MOI        | DA_GIAO          | Assigner                                    |
| HUY_GIAO           | Hủy giao               | DA_GIAO        | TAO_MOI (revert) | Assigner                                    |
| TIEP_NHAN          | Tiếp nhận              | DA_GIAO        | DANG_THUC_HIEN   | Main                                        |
| HOAN_THANH_TAM     | Hoàn thành (chờ duyệt) | DANG_THUC_HIEN | CHO_DUYET        | Main (khi CoDuyetHoanThanh=true)            |
| HUY_HOAN_THANH_TAM | Hủy hoàn thành tạm     | CHO_DUYET      | DANG_THUC_HIEN   | Main                                        |
| DUYET_HOAN_THANH   | Duyệt hoàn thành       | CHO_DUYET      | HOAN_THANH       | Assigner                                    |
| HOAN_THANH         | Hoàn thành             | DANG_THUC_HIEN | HOAN_THANH       | Main (khi CoDuyetHoanThanh=false)           |
| MO_LAI_HOAN_THANH  | Mở lại                 | HOAN_THANH     | DANG_THUC_HIEN   | Assigner (sau khi hoàn thành có thể reopen) |

## 4. Sơ đồ trạng thái (ASCII)

```
(Có duyệt)
TAO_MOI --GIAO_VIEC--> DA_GIAO --TIEP_NHAN--> DANG_THUC_HIEN --HOAN_THANH_TAM--> CHO_DUYET --DUYET_HOAN_THANH--> HOAN_THANH
        ^              |                               ^                                 |
        |              |                               |                                 |
      HUY_GIAO           |                               +-- HUY_HOAN_THANH_TAM -----------+
                 +---------------- MO_LAI_HOAN_THANH (Assigner) <-------------------+

(Không duyệt)
TAO_MOI --GIAO_VIEC--> DA_GIAO --TIEP_NHAN--> DANG_THUC_HIEN --HOAN_THANH (Main)--> HOAN_THANH --MO_LAI_HOAN_THANH (Assigner)--> DANG_THUC_HIEN
        ^              |
        |              |
      HUY_GIAO           |
```

(GHI CHÚ: MO_LAI_HOAN_THANH chỉ hợp lệ sau khi đã HOAN_THANH.)

## 5. Điều kiện bổ sung

| Điều kiện        | Mô tả                                                  |
| ---------------- | ------------------------------------------------------ |
| isAssigner       | Người hiện tại là người giao (so sánh NguoiGiaoViecID) |
| isMain           | Người hiện tại là người chính (NguoiChinhID)           |
| CoDuyetHoanThanh | Bật flow chờ duyệt                                     |

Hàm `getAvailableActions(cv, {isAssigner, isMain})` triển khai toàn bộ logic này ở FE để hiển thị đúng button.

## 6. Thuộc tính thời gian cập nhật bởi Transition

| Trạng thái đích | Set thêm field                                                         |
| --------------- | ---------------------------------------------------------------------- |
| DA_GIAO         | `NgayGiaoViec`                                                         |
| CHO_DUYET       | `NgayHoanThanhTam`                                                     |
| HOAN_THANH      | `NgayHoanThanh` + tính `HoanThanhTreHan` + cập nhật `SoGioTre` nếu trễ |

## 7. Patch Tối ưu

Transition trả `patch` gồm: `_id, TrangThai` và các trường thời gian vừa thay đổi (`NgayHoanThanh`, `NgayCanhBao`, `SoGioTre`...). FE áp dụng tức thì để tránh delay, sau đó (nếu chỉ patch) refetch detail nền để đồng bộ lịch sử.

## 8. Xử lý mở lại

- From HOAN_THANH -> MO_LAI_HOAN_THANH -> DANG_THUC_HIEN.
- Có thể reset `NgayHoanThanh` (tùy BE), FE tin theo dữ liệu trả về.

## 9. Cảnh báo hạn (Extended Due Status)

Tính dựa trên util hoặc BE field `TinhTrangThoiHan`:
| Code | Nghĩa |
|------|-------|
| DUNG_HAN | Chưa tới hạn / chưa tới ngưỡng cảnh báo |
| SAP_QUA_HAN | Qua `NgayCanhBao` nhưng chưa quá hạn |
| QUA_HAN | Vượt `NgayHetHan` chưa hoàn thành |
| HOAN_THANH_DUNG_HAN | Hoàn thành trước hoặc đúng hạn |
| HOAN_THANH_TRE_HAN | Hoàn thành trễ |

## 10. Quy tắc hiển thị hành động FE

Pseudo-code rút gọn từ `getAvailableActions`:

```
if (TAO_MOI && isAssigner) GIAO_VIEC
if (DA_GIAO) {
  if (isMain) TIEP_NHAN
  if (isAssigner) HUY_GIAO
}
if (DANG_THUC_HIEN) {
  if (coDuyet && isMain) HOAN_THANH_TAM
  else if (!coDuyet && isMain) HOAN_THANH
}
if (CHO_DUYET) {
  if (isMain) HUY_HOAN_THANH_TAM
  if (isAssigner) DUYET_HOAN_THANH
}
if (HOAN_THANH && isAssigner) MO_LAI_HOAN_THANH
```

## 11. Mở rộng tương lai

- Thêm trạng thái HUY (cancel) & action CANCEL (có audit reason) -> cập nhật getAvailableActions.
- Thêm lịch sử chi tiết patch diff để HistoryAccordion rich hơn.
- Áp dụng finite state machine library để formal hóa.

---

Tiếp tục: `frontend-components.md`.
