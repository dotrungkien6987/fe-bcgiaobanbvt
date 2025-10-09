# 📊 Visual Comparison - Chênh lệch Fix

## Scenario: Ngày 5/10/2025 với khoa mới

### 📅 Dữ liệu

**Ngày 5/10/2025 (hiện tại):**

```json
[
  { "KhoaID": 1, "TenKhoa": "Nội A", "vienphi_count": 100 },
  { "KhoaID": 2, "TenKhoa": "Ngoại B", "vienphi_count": 50 }
]
```

**Ngày 4/10/2025 (so sánh):**

```json
[{ "KhoaID": 1, "TenKhoa": "Nội A", "vienphi_count": 80 }]
```

---

## ❌ BEFORE (SAI)

```
┌─────────────────────────────────────────────────┐
│ STT │ Tên Khoa │ Số ca                          │
├─────────────────────────────────────────────────┤
│ 1   │ Nội A    │ 100 BN                         │
│     │          │ ▲ +20 BN                       │  ✅ ĐÚNG
├─────────────────────────────────────────────────┤
│ 2   │ Ngoại B  │ 50 BN                          │
│     │          │ ▲ +50 BN                       │  ❌ SAI - Không nên có mũi tên!
├─────────────────────────────────────────────────┤
│     │ Tổng cộng│ 150 BN                         │
│     │          │ ▲ +70 BN                       │  ❌ SAI - Phải là +20 BN
└─────────────────────────────────────────────────┘
```

**Logic SAI:**

```javascript
Khoa "Ngoại B":
  current = 50
  previous = undefined
  diff = 50 - 0 = 50  ❌ SAI

Totals:
  totalCases_diff = 20 + 50 = 70  ❌ SAI
```

---

## ✅ AFTER (ĐÚNG)

```
┌─────────────────────────────────────────────────┐
│ STT │ Tên Khoa │ Số ca                          │
├─────────────────────────────────────────────────┤
│ 1   │ Nội A    │ 100 BN                         │
│     │          │ ▲ +20 BN                       │  ✅ ĐÚNG
├─────────────────────────────────────────────────┤
│ 2   │ Ngoại B  │ 50 BN                          │  ✅ ĐÚNG - Không có mũi tên
├─────────────────────────────────────────────────┤
│     │ Tổng cộng│ 150 BN                         │
│     │          │ ▲ +20 BN                       │  ✅ ĐÚNG
└─────────────────────────────────────────────────┘
```

**Logic ĐÚNG:**

```javascript
Khoa "Ngoại B":
  current = 50
  previous = undefined
  diff = 0  ✅ ĐÚNG - Không có dữ liệu để so sánh

Totals:
  totalCases_diff = 20 + 0 = 20  ✅ ĐÚNG
```

---

## 🎯 Key Differences

| Aspect                    | BEFORE        | AFTER                     |
| ------------------------- | ------------- | ------------------------- |
| **Khoa mới - diff value** | 50 ❌         | 0 ✅                      |
| **Khoa mới - UI**         | `▲ +50 BN` ❌ | Không hiển thị mũi tên ✅ |
| **Totals - diff value**   | 70 ❌         | 20 ✅                     |
| **Totals - UI**           | `▲ +70 BN` ❌ | `▲ +20 BN` ✅             |

---

## 📝 Business Logic

**Quy tắc:**

1. Khoa có trong cả 2 ngày → Tính chênh lệch = current - previous
2. Khoa CHỈ có ở ngày hiện tại (khoa mới) → Chênh lệch = 0 (vì không có gì để so sánh)
3. Ngày 1 của tháng → Tất cả chênh lệch = 0

**Lý do:**

- Khoa mới chưa có lịch sử → Không thể tính chênh lệch → diff = 0
- Chỉ hiển thị mũi tên khi có dữ liệu so sánh thực sự
- Totals chỉ cộng các chênh lệch thực (bỏ qua khoa mới)

---

## 🔍 Real Example

**Tình huống:** Bệnh viện mở khoa mới "Tim mạch C" vào ngày 5/10

**Ngày 5/10:**

- Nội A: 100 BN (hôm qua: 80 BN)
- Ngoại B: 50 BN (hôm qua: 45 BN)
- **Tim mạch C: 30 BN** (khoa mới - hôm qua không có)

**Hiển thị ĐÚNG:**

```
Nội A:        100 BN  ▲ +20 BN  (tăng 20 so với hôm qua)
Ngoại B:       50 BN  ▲ +5 BN   (tăng 5 so với hôm qua)
Tim mạch C:    30 BN              (khoa mới - không hiển thị mũi tên)
─────────────────────────────────────────────────────────
Tổng cộng:    180 BN  ▲ +25 BN  (chỉ tính tăng của Nội A + Ngoại B)
```

**Giải thích cho lãnh đạo:**

- "Hôm nay tăng 25 bệnh nhân so với hôm qua"
- "Tim mạch C là khoa mới nên chưa có dữ liệu so sánh"

---

**Fix verified:** ✅  
**Logic correct:** ✅  
**UI accurate:** ✅
