# Plan: Tối ưu AI Workflow cho VS Code Copilot Chat

**TL;DR**: Hệ thống agent/skill/workflow được thiết kế rất tốt về lý thuyết, nhưng có **3 vấn đề thực tế** khi chạy trên VS Code Copilot Chat: (1) auto-handoff `send: true` **không hoạt động**, (2) Phase 3 (Implementer) bị hết token vì plan quá dài + quá nhiều files reference, (3) khi nói "tiếp tục" sau hết token, model **mất context trước đó** → code có thể sai plan. Giải pháp: tái cấu trúc workflow thành **micro-task pattern** — mỗi prompt chỉ làm 1 việc nhỏ, dùng `docs/<module>-context.md` làm checkpoint.

---

## A. Những gì cần hiểu rõ về VS Code Copilot Chat Agent Mode

| Khả năng | Hỗ trợ? | Giải thích |
|---|---|---|
| `@Agent` gọi trực tiếp | ✅ | `@MigrateCoordinator KPI` hoạt động |
| Agent gọi sub-agents (`agents:` field) | ✅ | MigrateCoordinator → V1Analyzer, Planner... |
| Handoff button (manual) | ✅ | User thấy nút "▶ Bắt đầu Implementation" → click |
| Auto-handoff (`send: true`) | ❌ | **KHÔNG hoạt động** — Implementer KHÔNG tự động chuyển sang ReviewAndComplete |
| Skills referenced trong agent | ⚠️ | Agent **có thể đọc** skill files, nhưng nếu tổng context quá lớn → bị truncate |
| Multi-turn memory | ❌ | Mỗi lần click handoff button hoặc gõ prompt mới = **conversation mới**, model không nhớ turn trước |
| `.github/instructions/` auto-inject | ✅ | Hoạt động tốt — inject theo glob của file đang mở |
| Prompt templates `/migrate-fast` | ✅ | Hoạt động khi gõ `/` trong chat |

**Kết luận**: Khi nói "tiếp tục" sau hết token, model **tạo turn mới** nhưng **mất phần context bị truncate**. Model có thể code sai pattern, bỏ sót business rules, hoặc tạo file trùng lặp.

---

## B. Phân tích vấn đề Token (tại sao Phase 3 hết token)

Khi Implementer chạy, nó cần đọc **tất cả** files sau:

| File | Est. tokens | Bắt buộc? |
|---|---|---|
| Agent instructions (Implementer.md) | ~2,000 | ✅ |
| CLAUDE.md (quy tắc) | ~3,500 | ✅ |
| PROGRESS.md | ~4,000 | ❌ (quá dài, chỉ cần phần tracking) |
| `<module>-migration-plan.md` | ~3,000-5,000 | ✅ |
| `<module>-context.md` | ~1,500 | ✅ |
| `<module>-logic-inventory.md` | ~2,500 | ⚠️ |
| `<module>-state-machine.md` | ~1,500 | ⚠️ |
| `<module>-ux-flows.md` | ~1,000 | ⚠️ |
| Skills (create-api, create-page, mobile-first-design...) | ~5,000-8,000 | ⚠️ conflict |
| Backend/Frontend instructions.md | ~2,000 | ✅ (auto-inject) |
| **Tổng ước tính** | **~25,000-30,000** | — |

**Vấn đề thực sự**: khi Implementer bắt đầu **viết code**, nó phải đọc thêm existing files + viết output dài → **output tokens** bị giới hạn và conversation dài dần hết budget.

---

## C. Đề xuất tinh chỉnh (5 thay đổi)

### C1. Chuyển sang "Micro-Task Pattern" cho Phase 3

Thay vì để Implementer làm cả sprint (8-10 action items) trong 1 turn, **tách thành từng prompt nhỏ**:

- Tạo 1 prompt template mới: `/implement-step` — nhận module name + action item number (vd: B1.1, F1.3)
- Mỗi prompt chỉ tạo 1-2 files, reference chỉ những gì cần cho action item đó
- Sau mỗi step → cập nhật checklist trong `docs/<module>-context.md`

Workflow mới:
```
Phase 1+1.5+2:  @MigrateCoordinator KPI  → plan (1 turn, OK)
Phase 3:        /implement-step KPI B1.1  → tạo model (1 turn)
                /implement-step KPI B1.2  → tạo service (1 turn)  
                /implement-step KPI F1.1  → tạo api layer (1 turn)
                ...
Phase 4+5:      /run-tests KPI → fix → manual review
```

### C2. Cắt gọn Plan Template — thêm "Sprint Checklist" compact

Hiện tại plan file quá chi tiết (CongViec = 28 items mô tả dài). Đề xuất thêm 1 section **Checklist** ở cuối plan — dạng compact, Implementer chỉ cần đọc section này:

```markdown
## Quick Checklist — Sprint 1
- [ ] B1.1: `kpi.model.js` — DanhGiaKPI schema (15 fields, 3 indexes)
- [ ] B1.2: `kpi.service.js` — CRUD + duyet() + huyDuyet() 
- [ ] B1.3: `kpi.controller.js` — 8 endpoints thin
- [ ] B1.4: `kpi.validation.js` — express-validator
- [ ] B1.5: `kpi.routes.js` + register app.js
- [ ] B1.6: `tests/kpi.test.js` — 20+ test cases
- [ ] F1.1: `kpiApi.js` — axios
- [ ] F1.2: `kpiSlice.js` — Redux manual thunks
- [ ] F1.3: `KpiListPage.jsx` — DataTable + mobile cards
```

Mỗi action item chỉ 1 dòng, ghi rõ file + scope. Implementer đọc 1 dòng → biết phải làm gì.

### C3. Tạo file `docs/<module>-implementation-tracker.md`

File nhỏ, cập nhật realtime sau mỗi micro-task, format:

```markdown
# Implementation Tracker: KPI Sprint 1
## Checklist
- [x] B1.1 ✅ kpi.model.js (2026-02-26)
- [x] B1.2 ✅ kpi.service.js (2026-02-26)
- [ ] B1.3 ⏳ kpi.controller.js
- [ ] B1.4 ...
## Notes
- B1.2: Tách duyet logic ra kpi.approval.service.js (>300 LOC)
```

Khi "tiếp tục" sau hết token hoặc bắt đầu turn mới → model đọc tracker → biết đã làm đến đâu.

### C4. Đơn giản hóa Agent Instructions — giảm skill references

Implementer agent hiện reference 5 skills (create-api, create-page, mobile-first-design, navigation-system, kaizen). Đề xuất:

- **Inline hóa** những rules thiết yếu nhất (5-10 rules cốt lõi) trực tiếp vào Implementer.md
- **Bỏ reference** skills dài (mobile-first-design 816 dòng!) — thay bằng link trong `.instructions.md` (chỉ inject khi edit FE files)
- Kết quả: Implementer context giảm từ ~30K → ~15K tokens

### C5. Cập nhật `copilot-instructions.md` — thêm section "Workflow thực tế"

Thêm 1 section ngắn mô tả workflow thực tế trên VS Code:

```markdown
## Workflow thực tế (VS Code Copilot Chat)
- Phase 1+2: `@MigrateCoordinator <Module>` → approve plan
- Phase 3: `/implement-step <Module> <ItemID>` — từng bước 1
- Phase 4: `/run-tests <Module>` → fix manually
- Resume: Đọc `docs/<module>-implementation-tracker.md`
- **KHÔNG dùng auto-handoff** (send:true không hoạt động)
```

---

## D. Trả lời câu hỏi: "Nói tiếp tục sau hết token có vấn đề không?"

Có 3 rủi ro:
1. **Mất context plan** — model có thể tạo files không đúng structure trong plan
2. **Code duplicate** — model không nhớ đã tạo file nào → tạo lại hoặc ghi đè
3. **Pattern drift** — ban đầu follow đúng conventions, càng về sau càng lệch

**Giải pháp**: Thay vì "tiếp tục", dùng `/implement-step` prompt mới với action item cụ thể. Model đọc tracker file → biết context → code đúng.

---

## E. Action Items để triển khai plan này

- [ ] 1. Tạo prompt template `/implement-step` trong `.github/prompts/`
- [ ] 2. Cập nhật `plan-template.md` — thêm section Quick Checklist
- [ ] 3. Tạo template `implementation-tracker.md`
- [ ] 4. Tinh gọn `Implementer.agent.md` — inline rules cốt lõi, bỏ skill references dài
- [ ] 5. Cập nhật `copilot-instructions.md` — thêm Workflow thực tế
- [ ] 6. Test workflow mới với KPI Sprint 1

---

## F. Decisions

| Quyết định | Lý do |
|---|---|
| **Micro-task > Monolithic** | Chia nhỏ Phase 3 thành từng action item thay vì giao toàn bộ sprint cho 1 turn |
| **Tracker file** | Thêm `implementation-tracker.md` làm checkpoint giữa các turns |
| **Giữ nguyên agent system** | Không xóa agents/skills hiện có — chỉ tinh chỉnh cách sử dụng |
| **Bỏ auto-handoff claim** | `send: true` không work trên VS Code → document rõ ràng |
