# Đặc tả Trang Tóm Tắt Chỉ Số Doanh Thu (ChiSoSummaryForm)

## 1. Mục tiêu

Cung cấp cho Ban Giám đốc cái nhìn tức thời, cô đọng và trực quan về dòng chảy doanh thu trong tháng hiện tại, nhấn mạnh:

- Sự khác biệt giữa Doanh thu THEO CHỈ ĐỊNH (phát sinh dịch vụ) và Doanh thu ĐÃ DUYỆT KẾ TOÁN (ghi nhận chính thức).
- Vùng giao thoa: giá trị dịch vụ phát sinh và được duyệt ngay trong chính tháng đó.
- Phần chuyển kỳ: chỉ định tháng trước nhưng được duyệt trong tháng này.
- Phần CHƯA DUYỆT: các chỉ định (tháng trước & tháng này) chưa được duyệt kế toán, tách theo trạng thái ra viện.

## 2. 6 Chỉ số cốt lõi

| STT | Nhãn                                           | Biến trong `metrics`           | Nguồn Redux / Mô tả                                               |
| --- | ---------------------------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| 1   | Tổng duyệt kế toán (A)                         | `tongDuyetKeToan`              | Tổng từ `Pie_DoanhThu_DuyetKeToan` (sum value)                    |
| 2   | Tổng theo chỉ định (B)                         | `tongTheoChiDinh`              | Tổng từ `Pie_DoanhThu_TheoChiDinh` (sum value)                    |
| 3   | Chỉ định THÁNG TRƯỚC chưa duyệt - ĐÃ RA VIỆN   | `chuaKT_ThangTruoc_RaVien`     | `SoLuong_TongTien_ChuaDuyetKeToan_ThangTruoc` (vienphistatus=1)   |
| 4   | Chỉ định THÁNG TRƯỚC chưa duyệt - CHƯA RA VIỆN | `chuaKT_ThangTruoc_ChuaRaVien` | `SoLuong_TongTien_ChuaDuyetKeToan_ThangTruoc` (vienphistatus=0)   |
| 5   | Chỉ định THÁNG NÀY chưa duyệt - ĐÃ RA VIỆN     | `chuaKT_ThangNay_RaVien`       | `SoLuong_TongTien_ChuaDuyetKeToan_ThangHienTai` (vienphistatus=1) |
| 6   | Chỉ định THÁNG NÀY chưa duyệt - CHƯA RA VIỆN   | `chuaKT_ThangNay_ChuaRaVien`   | `SoLuong_TongTien_ChuaDuyetKeToan_ThangHienTai` (vienphistatus=0) |

## 3. Các đại lượng dẫn xuất

- `overlap` (A ∩ B): phần theo chỉ định THÁNG NÀY đã được duyệt trong THÁNG NÀY.
  Công thức: `overlap = tongTheoChiDinh - (chuaKT_ThangNay_RaVien + chuaKT_ThangNay_ChuaRaVien)` (cắt âm = 0).
- `daDuyet_ChiDinhThangTruoc`: phần trong A xuất phát từ chỉ định của THÁNG TRƯỚC.
  Công thức: `daDuyet_ChiDinhThangTruoc = tongDuyetKeToan - overlap` (cắt âm = 0).
- Tổng chỉ định tháng trước chưa duyệt: `tongChuaDuyet_ThangTruoc = chuaKT_ThangTruoc_RaVien + chuaKT_ThangTruoc_ChuaRaVien`.
- Tổng chỉ định tháng này chưa duyệt: `tongChuaDuyet_ThangNay = chuaKT_ThangNay_RaVien + chuaKT_ThangNay_ChuaRaVien`.

## 4. Mô hình trực quan (Phiên bản chữ nhật chồng – "Rectangular Venn")

```
[Cũ chưa duyệt]   |--- A: [Chuyển kỳ][Overlap] ---|
                  |--- B: [Overlap][Chưa duyệt đã ra viện][Chưa duyệt chưa ra viện] ---|
```

- A và B thẳng hàng (cùng cao độ), không còn lệch dọc; vùng giao thoa thể hiện bằng lớp cùng vị trí ngang, dùng màu/độ trong suốt để người xem nhận biết.
- Overlap căn cùng toạ độ ngang ở cả hai hình (A: nằm ở giữa sau phần chuyển kỳ, B: bắt đầu từ overlap).
- Chiều rộng các segment tỷ lệ với giá trị tiền theo thang chung (unit = maxPixel / maxValue).
- Segment có giá trị > 0 nhưng chiều rộng quá nhỏ được ép minWidth để vẫn đọc số / tooltip.

## 5. Ý nghĩa từng vùng

| Vùng                         | Màu               | Ý nghĩa nghiệp vụ                                                   |
| ---------------------------- | ----------------- | ------------------------------------------------------------------- |
| Cũ chưa duyệt – Đã ra viện   | #3b82f6           | Chỉ định tháng trước, bệnh nhân đã ra viện nhưng chưa duyệt kế toán |
| Cũ chưa duyệt – Chưa ra viện | #60a5fa           | Chỉ định tháng trước, bệnh nhân còn nằm viện, chưa duyệt            |
| A_prev (Chuyển kỳ)           | #0f172a           | Phần chỉ định tháng trước được duyệt trong tháng này (đi vào A)     |
| Overlap (A ∩ B)              | #2563eb / #1e3a8a | Chỉ định và duyệt trong cùng tháng (luồng chuẩn)                    |
| B_un_rv                      | #d97706           | Chỉ định tháng này, đã ra viện, chưa duyệt kế toán                  |
| B_un_crv                     | #fbbf24           | Chỉ định tháng này, chưa ra viện, chưa duyệt                        |

## 6. Trục thời gian

- Gốc: 0h00 ngày 01 (mốc logic, không phải scale thời gian chính xác của tiền).
- Các tick (10,20,30) chỉ mang tính tham chiếu tổng quan.
- Khối "Cũ chưa duyệt" đặt bên trái gốc để nhấn mạnh thuộc về kỳ trước.

## 7. Quy tắc hiển thị

1. Luôn định dạng tiền tệ: `Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' })`.
2. Không hiển thị segment nếu giá trị = 0 (trừ vùng overlap label riêng nếu = 0 thì ẩn label).
3. Tooltip mỗi segment: `Label: Giá trị (X%)` – phần trăm so với tổng của hình tương ứng (A hoặc B).
4. Vùng overlap có label nổi riêng ở giữa.
5. Legend nằm góc dưới phải, nền mờ để không che nội dung.

## 8. Edge Cases & Bảo vệ

| Tình huống                    | Xử lý                                                               |
| ----------------------------- | ------------------------------------------------------------------- |
| overlap tính ra âm            | Đặt = 0 (do dữ liệu bất đồng bộ)                                    |
| daDuyet_ChiDinhThangTruoc < 0 | Đặt = 0                                                             |
| Tất cả giá trị = 0            | Hiển thị khung rỗng + ghi chú "Không có dữ liệu" (có thể bổ sung)   |
| Segment quá nhỏ               | Ép minWidth (46px) + ẩn text, vẫn có tooltip                        |
| Tổng A hoặc B cực lớn         | Các vùng khác scale theo `unit`; có thể cần future dynamic maxPixel |

## 9. Màu sắc & Phong cách

- Ưu tiên tương phản chữ trắng trên nền đậm, chữ sẫm trên nền vàng nhạt.
- Đổ bóng nhẹ để tách các layer.
- Overlap dùng màu xanh đậm hơn trong B để nhận diện.

## 10. Công thức tổng quát

```
overlap = max(0, B - (B_un_rv + B_un_crv))
A_prev = max(0, A - overlap)
A = A_prev + overlap
B = overlap + B_un_rv + B_un_crv
```

Đảm bảo bất biến: `A >= overlap`, `B >= overlap`.

## 11. Khả năng mở rộng (Đề xuất)

| Hạng mục                  | Mô tả                                                           |
| ------------------------- | --------------------------------------------------------------- |
| Drill-down                | Click vào segment mở modal danh sách chi tiết khoa / bệnh nhân  |
| Export                    | Export PNG / PDF gửi lãnh đạo nhanh                             |
| Tỷ lệ phần trăm trực tiếp | Hiện % trên mỗi vùng nếu đủ lớn                                 |
| Chuẩn hoá ngưỡng          | Cho phép người dùng chọn ngưỡng scale (ví dụ 1 tỷ = 100%)       |
| Animation                 | Fade-in + grow chiều rộng khi mở dialog để dễ cảm nhận cấu trúc |
| Snapshot compare          | So sánh song song với tháng trước (2 cụm song song)             |

## 12. File liên quan

- Component chính: `src/features/DashBoard/ChiSoSummaryForm.js`.
- Nơi tính `metrics`: `TaiChinh.js` (dashboard tài chính).

## 13. Checklist hoàn thành hiện tại

- [x] 6 chỉ số trích xuất đúng nguồn Redux.
- [x] Tách 2 lớp A & B với vùng giao thoa chung.
- [x] Hiển thị chuyển kỳ & phần chưa duyệt rõ ràng.
- [x] Tooltip giá trị + phần trăm.
- [x] Legend đầy đủ.
- [x] Trục thời gian gốc chuẩn 0h00 ngày 01.
- [x] Bảo vệ giá trị âm.
- [x] Min width segment.

## 14. Ghi chú nghiệp vụ

- Phần "Chỉ định tháng trước chưa duyệt" chỉ chuyển sang A khi được duyệt trong tháng => di chuyển logic từ backlog vào doanh thu ghi nhận.
- Vùng overlap càng lớn chứng tỏ quy trình duyệt nhanh (hạn chế phần chuyển sang kỳ sau).
- `B_un_rv` nên được theo dõi sát để tránh dồn cuối kỳ.

---

## 15. Thiết kế Animation & Tương tác lựa chọn nguồn

### Mục tiêu

Làm nổi bật nhanh một nguồn doanh thu hoặc một nhóm vùng khi người dùng (Giám đốc / Kế toán trưởng) tick chọn, giúp tập trung thị giác vào phần cần phân tích.

### Thành phần đề xuất

1. Nhóm Checkbox (MUI):
   - A_prev (Chuyển kỳ đã duyệt)
   - Overlap (Trong tháng đã duyệt)
   - B_un_rv (Chưa duyệt đã ra viện)
   - B_un_crv (Chưa duyệt chưa ra viện)
   - Cũ chưa duyệt (gộp 2 trạng thái) hoặc chi tiết từng trạng thái nếu cần.
2. State: `highlightKeys: string[]` – lưu các key đang được chọn.

### Hành vi khi chọn

| Trạng thái       | Hiệu ứng segment được chọn                                         | Hiệu ứng segment không chọn         |
| ---------------- | ------------------------------------------------------------------ | ----------------------------------- |
| Có ít nhất 1 key | Scale 1.08–1.12 + border sáng + nâng z-index + tăng độ bão hòa màu | Giảm opacity (0.25–0.35), bỏ shadow |
| Không có key     | Tất cả ở trạng thái mặc định                                       | N/A                                 |

### CSS / Style gợi ý

```js
const highlight = {
  transform: "scale(1.1)",
  boxShadow: "0 0 0 2px #fff8, 0 6px 18px -6px #000a",
  filter: "saturate(1.4) brightness(1.05)",
};
const dimmed = { opacity: 0.3, filter: "grayscale(0.4) brightness(0.85)" };
```

### Animation

- Dùng `transition: 'all .28s cubic-bezier(.4,0,.2,1)'` trên wrapper segment.
- Khi thay đổi highlightKeys: render lại với class/ sx tương ứng.
- Có thể dùng `requestAnimationFrame` để delay áp lớp highlight sau 1 frame tránh giật.

### Trường hợp nhiều lựa chọn

- Nếu chọn cả Overlap và A_prev: cả hai segment được highlight, phần khác mờ.
- Nếu chọn Overlap và một phần chưa duyệt trong B: highlight không ảnh hưởng căn chỉnh overlap (chỉ thay đổi style).

### Tooltip mở rộng khi highlight

- Khi segment đang highlight: Tooltip bổ sung dòng “Tỷ trọng trong A:” hoặc “Tỷ trọng trong B:” tùy ngữ cảnh.

### Khả năng mở rộng

- Mode “Focus” (toggle): click đúp vào một segment sẽ khóa highlight đơn, bỏ chọn các checkbox khác.
- Mode “Compare”: giữ phím Alt khi chọn để giữ nguyên opacity phần còn lại (không dim) – tập trung vào so sánh trực quan kích thước.

### Pseudocode xử lý

```js
const [highlightKeys, setHighlightKeys] = useState([]);

const toggleKey = (k) => {
  setHighlightKeys((prev) =>
    prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
  );
};

const getSegStyle = (key) => {
  if (!highlightKeys.length) return baseStyle;
  return highlightKeys.includes(key)
    ? { ...baseStyle, ...highlight }
    : { ...baseStyle, ...dimmed };
};
```

### Kiểm thử UX đề xuất

| Case            | Kỳ vọng                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| Chọn 1          | Dễ nhìn, các phần khác đủ mờ vẫn giữ bố cục tổng thể                                    |
| Chọn 2–3        | Không chồng label, scale không đẩy vỡ layout (nên dùng transform-origin: 'center left') |
| Bỏ chọn hết     | Trả về trạng thái ban đầu mượt, không nhấp nháy                                         |
| Segment rất nhỏ | Vẫn highlight bằng viền & halo, even khi text ẩn                                        |

---

**Version**: 1.1 (bỏ từ “backlog”, chỉnh mô tả A & B thẳng hàng, bổ sung thiết kế animation highlight theo checkbox)
