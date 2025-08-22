# Instruction cập nhật CongViecFormDialog.js theo flow mới

Mục tiêu ngắn gọn

- Bám đặc tả trong flow_congviec.md và plan_update_flow_new.md.
- Form chỉ phục vụ tạo/sửa “planned data” + cấu hình cảnh báo + CoDuyetHoanThanh.
- Không cho chỉnh trạng thái workflow trực tiếp trong form (trạng thái chuyển qua các action riêng).

## 1. Phạm vi (Scope)

MUST

- Thêm checkbox CoDuyetHoanThanh.
- Loại bỏ (hoặc chỉ read-only) Select TrangThai khi tạo/sửa.
- Cập nhật tính preview NgayCanhBao dựa NgayBatDau (không dùng NgayGiaoViec).
- Validation:
  - NgayHetHan > NgayBatDau (cho phép cùng ngày nhưng phải sau thời điểm).
  - Mode=PERCENT: 0.5 ≤ percent < 1.0 (chặn =1.0 hoặc cảnh báo).
  - Mode=FIXED: NgayCanhBao ∈ [NgayBatDau, NgayHetHan).
  - NgayCanhBao nullable khi PERCENT.
- Submit:
  - Create: không gửi TrangThai (BE mặc định TAO_MOI).
  - Edit: không thay đổi TrangThai.
  - Không gửi NgayCanhBao nếu PERCENT.
  - Luôn gửi CanhBaoMode + CanhBaoSapHetHanPercent (round 2 decimals).
  - Gửi CoDuyetHoanThanh.

SHOULD

- Preview “Cảnh báo vào … (còn ~X giờ)” khi PERCENT.
- Tooltip cảnh báo nếu percent ≥ 0.95.
- Disable nút submit rõ ràng theo required logic.

OPTIONAL

- Warning nếu thời lượng (NgayHetHan - NgayBatDau) < 15 phút.
- Warning nếu FIXED cảnh báo cách hạn < 10 phút.

## 2. Những gì KHÔNG làm ở file này

- Không xử lý action workflow (giao / tiếp nhận / hoàn thành / duyệt).
- Không sửa Redux slice logic sâu (chỉ bảo đảm payload đúng).
- Không implement audit.

## 3. Cấu trúc thay đổi

| Thành phần                 | Hành động                                                                   |
| -------------------------- | --------------------------------------------------------------------------- |
| State formik.initialValues | Thêm CoDuyetHoanThanh, bỏ TrangThai hoặc giữ để hiển thị read-only khi edit |
| Validation Schema          | Điều chỉnh NgayCanhBao.when, percent < 1.0, thêm CoDuyetHoanThanh           |
| UI                         | Section “Cấu hình cảnh báo” + checkbox “Yêu cầu duyệt khi hoàn thành”       |
| Submit logic               | Chuẩn hóa payload + bỏ TrangThai ở create                                   |
| Button Submit              | Explicit validateForm + highlight errors                                    |
| Preview                    | Tính NgayCanhBao (PERCENT) dựa NgayBatDau & NgayHetHan ngay khi thay đổi    |

## 4. Chi tiết chỉnh sửa từng phần

### 4.1 Imports

- Đảm bảo đã có Tooltip, Alert (đang có).
- Không cần RadioGroup cho CoDuyetHoanThanh → dùng Checkbox hoặc FormControlLabel với Checkbox (đề xuất: đổi từ custom Radio hack sang Checkbox).

### 4.2 initialValues

Thêm:

```
CoDuyetHoanThanh: false
```

Giữ:

```
CanhBaoMode: "PERCENT"
CanhBaoSapHetHanPercent: 0.8
NgayCanhBao: null
```

Bỏ/không dùng khi submit:

```
TrangThai
```

### 4.3 Validation Schema

- CanhBaoSapHetHanPercent: `.min(0.5).max(0.99)` (hoặc cho 1.0 kèm cảnh báo UI).
- NgayCanhBao: `nullable()` ở nhánh otherwise.
- NgayHetHan test: `dayjs(value).isAfter(dayjs(NgayBatDau))`.
- CoDuyetHoanThanh: Yup.boolean().optional().

### 4.4 Preview NgayCanhBao khi PERCENT

Công thức:

```
const diff = end.diff(start);
const warnMoment = start.add(diff * percent, 'millisecond');
const hoursBefore = end.diff(warnMoment, 'hour', true).toFixed(1);
```

Hiển thị:
`Cảnh báo vào: DD/MM/YYYY HH:mm (còn ~X giờ tới hạn)`

Nếu `percent >= 0.95` → Tooltip/Alert cảnh báo “Cảnh báo quá sát hạn”.

### 4.5 UI thay đổi

- Bỏ Select TrangThai trong chế độ tạo.
- Khi edit: hiển thị TextField read-only “Trạng thái hiện tại”.
- Thêm:

```
<FormControlLabel
  control={<Checkbox checked={formik.values.CoDuyetHoanThanh}
    onChange={(e)=>formik.setFieldValue('CoDuyetHoanThanh', e.target.checked)} />}
  label="Yêu cầu duyệt khi hoàn thành"
/>
```

### 4.6 Submit logic

Pseudo:

```
const percent = Number((values.CanhBaoSapHetHanPercent ?? 0.8).toFixed(2));
const payload = {
  TieuDe, MoTa,
  NgayBatDau: iso(values.NgayBatDau),
  NgayHetHan: iso(values.NgayHetHan),
  MucDoUuTien: mapPriority(values.MucDoUuTien),
  NguoiChinh,
  NhomViecUserID: values.NhomViecUserID || null,
  CanhBaoMode: values.CanhBaoMode || 'PERCENT',
  CanhBaoSapHetHanPercent: percent,
  CoDuyetHoanThanh: !!values.CoDuyetHoanThanh,
  NguoiThamGia: mapParticipants(...)
};
if (values.CanhBaoMode === 'FIXED' && values.NgayCanhBao) payload.NgayCanhBao = iso(values.NgayCanhBao);
if (isEdit) dispatch(updateCongViec({ id: congViec._id, data: payload }));
else dispatch(createCongViec(payload));
```

Loại bỏ trường TrangThai luôn.

### 4.7 Disabled Submit

Disabled nếu:

- Thiếu: TieuDe, NguoiChinh, NgayBatDau, NgayHetHan.
- Mode FIXED nhưng không có NgayCanhBao.
- Có errors blocking (TieuDe / NgayBatDau / NgayHetHan / NgayCanhBao(FIXED)).
- loading hoặc isSubmitting.

### 4.8 setValues khi edit

Map:

```
CoDuyetHoanThanh: congViec.CoDuyetHoanThanh ?? false
CanhBaoMode: congViec.CanhBaoMode || 'PERCENT'
CanhBaoSapHetHanPercent: congViec.CanhBaoSapHetHanPercent || 0.8
NgayCanhBao: congViec.NgayCanhBao ? dayjs(...) : null
Trạng thái: chỉ để hiển thị read-only
```

### 4.9 Clean up

- Xóa statusOptions nếu không dùng nữa.
- Xóa logic gửi TrangThai.
- Đảm bảo không còn code tham chiếu NgayGiaoViec trong form.

## 5. Test cases thủ công

| Case                             | Kỳ vọng                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| Create PERCENT default           | Gửi payload không có NgayCanhBao, BE tính.                            |
| Create FIXED                     | Bắt buộc chọn NgayCanhBao hợp lệ; gửi kèm.                            |
| Create với percent=0.95          | Hiển thị cảnh báo nhưng vẫn submit.                                   |
| Edit thay đổi percent            | Preview cập nhật đúng ngay.                                           |
| Edit chuyển PERCENT→FIXED        | Yêu cầu chọn NgayCanhBao nếu chưa có.                                 |
| Edit chuyển FIXED→PERCENT        | Xóa field NgayCanhBao khỏi payload gửi.                               |
| CoDuyetHoanThanh bật             | Payload có "CoDuyetHoanThanh": true.                                  |
| NgayHetHan = NgayBatDau + 5 phút | Cho phép; hiển thị cảnh báo thời lượng ngắn (nếu implement OPTIONAL). |

## 6. Rủi ro & kiểm soát

| Rủi ro                                     | Giảm thiểu                                             |
| ------------------------------------------ | ------------------------------------------------------ |
| Vô tình gửi TrangThai                      | Loại khỏi payload create/update.                       |
| Null NgayCanhBao (PERCENT) vẫn bị validate | Đảm bảo `.nullable()` + không đưa lên errors.          |
| Sai timezone                               | Dùng dayjs(...).toDate().toISOString() thống nhất UTC. |
| Percent = 1.0 gây cảnh báo trùng hạn       | Chặn max 0.99 hoặc hiển thị cảnh báo UI.               |

## 7. Checklist thực thi (Developer)

- [ ] Cập nhật validation schema (percent <1.0, NgayCanhBao nullable).
- [ ] Thêm CoDuyetHoanThanh vào initialValues + setValues khi edit.
- [ ] Refactor UI: Checkbox + bỏ Select trạng thái (tạo).
- [ ] Viết preview cảnh báo PERCENT.
- [ ] Điều chỉnh submit payload (remove TrangThai).
- [ ] Xóa code không dùng (statusOptions nếu thừa).
- [ ] Test 8 case thủ công.

## 8. Chuẩn hóa coding style

- Dùng const helpers nhỏ (iso = (v)=> dayjs(v).toDate().toISOString()).
- Log debug prefix “[CongViecFormDialog] …” (có thể tắt khi release).
- Không thêm logic domain ngoài phạm vi (e.g. derive due status).

## 9. Ghi chú đồng bộ BE

- BE phải chấp nhận CoDuyetHoanThanh, CanhBaoMode, CanhBaoSapHetHanPercent trong create.
- BE tự tính NgayCanhBao nếu
