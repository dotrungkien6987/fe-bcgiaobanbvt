# 🌟 QUY TRÌNH LÀM VIỆC CÁ NHÂN VỚI GIT/GITHUB CHUYÊN NGHIỆP

## 1. **Tạo branch mới cho mỗi tính năng/bug**

```bash
git checkout main
git pull origin main
git checkout -b ten-branch-moi
```
- **Mục đích:** Luôn xuất phát từ code mới nhất trên main, tránh xung đột.

---

## 2. **Làm việc & commit với thông điệp rõ ràng**

```bash
git add . # hoặc git add <file>
git commit -m "Mô tả ngắn gọn, rõ ràng cho thay đổi"
```
- **Kiểm tra lịch sử:**  
  `git log --oneline`

---

## 3. **Push branch lên GitHub**

```bash
git push origin ten-branch-moi
```

---

## 4. **Tạo Pull Request (PR) trên GitHub**

- Vào GitHub repo, chọn branch vừa push → "Compare & pull request".
- Viết mô tả, kiểm tra thay đổi trên tab “Files changed”.

---

## 5. **Tự review code trên PR**

- Đọc lại thay đổi trước khi merge.
- Nếu cần sửa, chỉnh lại code trên branch local rồi push lại (PR sẽ cập nhật tự động).

---

## 6. **Merge PR vào main khi đã OK**

- Nhấn **“Merge pull request”** trên GitHub.
- Xóa branch nếu không dùng nữa:

```bash
git branch -d ten-branch-moi
git push origin --delete ten-branch-moi
```

---

## 7. **Cập nhật main local sau khi merge**

```bash
git checkout main
git pull origin main
```

---

## 8. **Rollback khi cần**

- **Trên GitHub:**  
  Vào PR đã merge → Nhấn “Revert” (tạo PR đảo ngược).
- **Hoặc dùng terminal:**  
  ```bash
  git log --oneline                   # Tìm commit muốn revert
  git revert <commit-hash>            # Tạo commit đảo ngược
  git push origin main
  ```

---

## 9. **Kiểm tra trạng thái/lịch sử**

```bash
git branch -a                         # Xem tất cả branch
git log --graph --oneline --all       # Xem lịch sử dạng cây
```

---

## 🎯 **TÓM TẮT QUY TRÌNH**

1. Tạo branch mới cho mỗi task/bug.
2. Code, commit nhỏ gọn, rõ ràng.
3. Push branch lên GitHub.
4. Tạo PR, tự review.
5. Merge PR vào main, xóa branch.
6. Luôn cập nhật main local.
7. Rollback bằng revert PR hoặc git revert.
8. Kiểm tra branch/lịch sử thường xuyên.

---

> **Lưu ý:**  
> - Luôn kiểm tra code chạy ổn trên local trước khi push.
> - PR giúp bạn quản lý lịch sử, rollback, thử nghiệm song song, và làm quen workflow chuyên nghiệp nếu sau này làm nhóm.

---

**Chúc bạn code hiệu quả và an toàn với Git/GitHub!**