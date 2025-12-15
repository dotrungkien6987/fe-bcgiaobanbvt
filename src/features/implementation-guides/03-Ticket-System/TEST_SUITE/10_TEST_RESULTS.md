# 📋 TEST RESULTS TRACKING

## Mục Tiêu

Document kết quả test của tất cả 48 test cases

---

## Test Status Legend

- ✅ **PASS**: Test thành công, đúng expected results
- ❌ **FAIL**: Test thất bại, có bug cần fix
- ⚠️ **BLOCKED**: Test không thể chạy do dependency
- 🔄 **RETEST**: Cần test lại sau khi fix bug
- ⏭️ **SKIP**: Bỏ qua (ghi rõ lý do)
- 📝 **PENDING**: Chưa test

---

## Test Execution Log

**Tester**: [Tên người test]
**Test Date**: [DD/MM/YYYY]
**Environment**: Development / Staging / Production
**Browser**: Chrome / Firefox / Safari / Edge
**Device**: Desktop / Mobile

---

## A. MOI Status Tests (18 TC)

### GUI_DEN_KHOA (10 TC)

| Test Case                                  | Status | Tester | Date | Notes |
| ------------------------------------------ | ------ | ------ | ---- | ----- |
| TC-MOI-K-01: NguoiGui HUY                  | 📝     |        |      |       |
| TC-MOI-K-02: NguoiGui XEM khác             | 📝     |        |      |       |
| TC-MOI-K-03: DieuPhoi TIEP_NHAN            | 📝     |        |      |       |
| TC-MOI-K-04: DieuPhoi TU_CHOI              | 📝     |        |      |       |
| TC-MOI-K-05: DieuPhoi CHUYEN_TIEP          | 📝     |        |      |       |
| TC-MOI-K-06: NguoiDuocDieuPhoi TIEP_NHAN   | 📝     |        |      |       |
| TC-MOI-K-07: NguoiDuocDieuPhoi TU_CHOI     | 📝     |        |      |       |
| TC-MOI-K-08: NguoiDuocDieuPhoi CHUYEN_TIEP | 📝     |        |      |       |
| TC-MOI-K-09: Admin full actions            | 📝     |        |      |       |
| TC-MOI-K-10: User khác no actions          | 📝     |        |      |       |

**Sub-total**: 0/10 PASS

### GUI_DEN_CA_NHAN (8 TC)

| Test Case                           | Status | Tester | Date | Notes |
| ----------------------------------- | ------ | ------ | ---- | ----- |
| TC-MOI-CN-01: NguoiGui HUY          | 📝     |        |      |       |
| TC-MOI-CN-02: NguoiNhan TIEP_NHAN   | 📝     |        |      |       |
| TC-MOI-CN-03: NguoiNhan TU_CHOI     | 📝     |        |      |       |
| TC-MOI-CN-04: NguoiNhan CHUYEN_TIEP | 📝     |        |      |       |
| TC-MOI-CN-05: DieuPhoi XEM only     | 📝     |        |      |       |
| TC-MOI-CN-06: Admin full actions    | 📝     |        |      |       |
| TC-MOI-CN-07: User khác no actions  | 📝     |        |      |       |
| TC-MOI-CN-08: HUY ngay lập tức      | 📝     |        |      |       |

**Sub-total**: 0/8 PASS

**MOI Status Total**: 0/18 PASS

---

## B. DANG_XU_LY Status Tests (6 TC)

| Test Case                            | Status | Tester | Date | Notes |
| ------------------------------------ | ------ | ------ | ---- | ----- |
| TC-XL-01: CAP_NHAT_TIEN_DO           | 📝     |        |      |       |
| TC-XL-02: HOAN_THANH → DA_HOAN_THANH | 📝     |        |      |       |
| TC-XL-03: TU_CHOI trong khi xử lý    | 📝     |        |      |       |
| TC-XL-04: CHUYEN_TIEP                | 📝     |        |      |       |
| TC-XL-05: BAO_CAO_SU_CO escalation   | 📝     |        |      |       |
| TC-XL-06: Admin full actions         | 📝     |        |      |       |

**DANG_XU_LY Total**: 0/6 PASS

---

## C. DA_HOAN_THANH Status Tests (6 TC)

| Test Case                                   | Status | Tester | Date | Notes        |
| ------------------------------------------- | ------ | ------ | ---- | ------------ |
| TC-HT-01: DANH_GIA 5 sao                    | 📝     |        |      |              |
| TC-HT-02: DANH_GIA 2 sao (required NhanXet) | 📝     |        |      | **CRITICAL** |
| TC-HT-03: DANH_GIA 1 sao chi tiết           | 📝     |        |      |              |
| TC-HT-04: DONG_YEU_CAU → DA_DONG            | 📝     |        |      |              |
| TC-HT-05: XEM chưa đánh giá                 | 📝     |        |      |              |
| TC-HT-06: Admin DONG_YEU_CAU                | 📝     |        |      |              |

**DA_HOAN_THANH Total**: 0/6 PASS

---

## D. DA_DONG Status Tests (3 TC)

| Test Case                             | Status | Tester | Date | Notes                 |
| ------------------------------------- | ------ | ------ | ---- | --------------------- |
| TC-DONG-01: MO_LAI còn 5 ngày         | 📝     |        |      |                       |
| TC-DONG-02: MO_LAI ngày cuối (0 ngày) | 📝     |        |      | **CRITICAL BOUNDARY** |
| TC-DONG-03: KHÔNG MO_LAI sau 7 ngày   | 📝     |        |      | **CRITICAL BOUNDARY** |

**DA_DONG Total**: 0/3 PASS

---

## E. TU_CHOI Status Tests (2 TC)

| Test Case                   | Status | Tester | Date | Notes |
| --------------------------- | ------ | ------ | ---- | ----- |
| TC-TC-01: APPEAL → MOI      | 📝     |        |      |       |
| TC-TC-02: XEM lý do từ chối | 📝     |        |      |       |

**TU_CHOI Total**: 0/2 PASS

---

## F. Edge Cases (7 TC)

| Test Case                            | Status | Tester | Date | Notes        |
| ------------------------------------ | ------ | ------ | ---- | ------------ |
| TC-EDGE-01: Race condition TIEP_NHAN | 📝     |        |      | **CRITICAL** |
| TC-EDGE-02: Optimistic locking       | 📝     |        |      | **CRITICAL** |
| TC-EDGE-03: Rate limiting 3/giờ      | 📝     |        |      |              |
| TC-EDGE-04: MO_LAI ngày thứ 7 exact  | 📝     |        |      |              |
| TC-EDGE-05: CHUYEN_TIEP loop         | 📝     |        |      |              |
| TC-EDGE-06: DANH_GIA idempotency     | 📝     |        |      |              |
| TC-EDGE-07: HUY < 1 phút             | 📝     |        |      |              |

**Edge Cases Total**: 0/7 PASS

---

## G. Negative Tests (4 TC)

| Test Case                                | Status | Tester | Date | Notes        |
| ---------------------------------------- | ------ | ------ | ---- | ------------ |
| TC-NEG-01: Submit thiếu required field   | 📝     |        |      |              |
| TC-NEG-02: Action không có quyền (403)   | 📝     |        |      | **CRITICAL** |
| TC-NEG-03: TuChoi conditional validation | 📝     |        |      |              |
| TC-NEG-04: ThoiGianHen quá khứ           | 📝     |        |      |              |

**Negative Tests Total**: 0/4 PASS

---

## H. Socket Notifications (2 TC)

| Test Case                       | Status | Tester | Date | Notes |
| ------------------------------- | ------ | ------ | ---- | ----- |
| TC-SOCKET-01: Real-time update  | 📝     |        |      |       |
| TC-SOCKET-02: Multi-device sync | 📝     |        |      |       |

**Notifications Total**: 0/2 PASS

---

## 📊 Overall Test Summary

| Category       | Total TC | PASS  | FAIL  | BLOCKED | RETEST | SKIP  | PENDING |
| -------------- | -------- | ----- | ----- | ------- | ------ | ----- | ------- |
| MOI Status     | 18       | 0     | 0     | 0       | 0      | 0     | 18      |
| DANG_XU_LY     | 6        | 0     | 0     | 0       | 0      | 0     | 6       |
| DA_HOAN_THANH  | 6        | 0     | 0     | 0       | 0      | 0     | 6       |
| DA_DONG        | 3        | 0     | 0     | 0       | 0      | 0     | 3       |
| TU_CHOI        | 2        | 0     | 0     | 0       | 0      | 0     | 2       |
| Edge Cases     | 7        | 0     | 0     | 0       | 0      | 0     | 7       |
| Negative Tests | 4        | 0     | 0     | 0       | 0      | 0     | 4       |
| Notifications  | 2        | 0     | 0     | 0       | 0      | 0     | 2       |
| **TOTAL**      | **48**   | **0** | **0** | **0**   | **0**  | **0** | **48**  |

**Pass Rate**: 0% (0/48)

---

## 🐛 Bugs Found

### Bug #1: [Tên bug]

- **Test Case**: TC-XXX-YY
- **Severity**: Critical / High / Medium / Low
- **Description**: [Mô tả bug]
- **Steps to Reproduce**:
  1. Step 1
  2. Step 2
- **Expected**: [Kết quả mong đợi]
- **Actual**: [Kết quả thực tế]
- **Screenshots**: [Link ảnh]
- **Status**: Open / In Progress / Fixed / Closed

---

## ⚠️ Business Logic Questions

### Question #1: CHUYEN_TIEP reset về MOI hay giữ DANG_XU_LY?

- **From**: TC-XL-04
- **Question**: Khi CHUYEN_TIEP yêu cầu DANG_XU_LY, có reset về MOI không?
- **Answer**: [Pending clarification]

### Question #2: BAO_CAO_SU_CO có chuyển trạng thái YeuCau?

- **From**: TC-XL-05
- **Question**: BAO_CAO_SU_CO có chuyển YeuCau sang trạng thái SU_CO không?
- **Answer**: [Pending clarification]

### Question #3: Rate limit có apply cho Admin không?

- **From**: TC-EDGE-03
- **Question**: Admin có exempt khỏi rate limit không?
- **Answer**: [Pending clarification]

---

## 📝 Test Execution Notes

### Session 1: [DD/MM/YYYY HH:MM]

**Tester**: [Tên]
**Test Cases**: TC-MOI-K-01 to TC-MOI-K-10

**Notes**:

- [Ghi chú chung]
- [Vấn đề phát hiện]

**Result**: X/10 PASS

---

### Session 2: [DD/MM/YYYY HH:MM]

**Tester**: [Tên]
**Test Cases**: TC-MOI-CN-01 to TC-MOI-CN-08

**Notes**:

- [Ghi chú]

**Result**: X/8 PASS

---

## 🔄 Retest Log

### Retest #1: [DD/MM/YYYY]

**Test Cases**: [TC-XXX-YY, TC-XXX-ZZ]
**Reason**: Bug fix #1, #2
**Result**: [PASS/FAIL]

---

## ✅ Test Completion Checklist

- [ ] Tất cả 48 TC đã được test
- [ ] Tất cả bugs đã được document
- [ ] Tất cả business logic questions đã được clarify
- [ ] Pass rate >= 95%
- [ ] Critical bugs đã được fix
- [ ] Regression test hoàn thành
- [ ] Test results đã được review bởi team lead
- [ ] Documentation cập nhật

---

## 📞 Escalation

Nếu cần escalate bugs hoặc questions:

- **Team Lead**: [Tên]
- **Product Owner**: [Tên]
- **Backend Team**: [Tên]

---

## 🎯 Test Metrics

### Timeline

- **Start Date**: [DD/MM/YYYY]
- **Target End Date**: [DD/MM/YYYY]
- **Actual End Date**: [DD/MM/YYYY]
- **Total Hours**: [X hours]

### Quality Metrics

- **Pass Rate**: 0% (0/48)
- **Bug Density**: 0 bugs / 48 TC = 0
- **Critical Bugs**: 0
- **High Priority Bugs**: 0
- **Medium/Low Bugs**: 0

### Coverage

- ✅ All statuses covered: MOI, DANG_XU_LY, DA_HOAN_THANH, DA_DONG, TU_CHOI
- ✅ All roles covered: NguoiGui, DieuPhoi, NguoiDuocDieuPhoi, NguoiNhan, Admin
- ✅ All actions covered: 15 actions from state machine
- ✅ All dialogs tested: 5 dialogs (TiepNhan, TuChoi, MoLai, Appeal, StarRating)
- ✅ Edge cases tested: Race conditions, rate limits, boundaries
- ✅ Negative tests: Validation, permissions, errors
- ✅ Notifications: Real-time socket updates

---

**Last Updated**: [DD/MM/YYYY HH:MM]
**Updated By**: [Tên người cập nhật]
