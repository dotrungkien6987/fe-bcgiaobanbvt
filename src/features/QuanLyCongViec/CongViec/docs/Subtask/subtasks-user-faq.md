# FAQ – Câu hỏi thường gặp về Công Việc Con (Subtasks)

Tài liệu này dành cho NGƯỜI DÙNG (không phải kỹ thuật) để hiểu và sử dụng tính năng phân rã công việc.

---

## 1. Subtask là gì?

Là công việc con nằm trong một công việc lớn (công việc cha). Bạn có thể chia nhỏ để dễ theo dõi tiến độ và phân trách nhiệm.

## 2. Khi nào nên tạo subtask?

Tạo khi:

- Công việc lớn có nhiều bước độc lập.
- Cần giao một phần việc cho người khác nhưng vẫn nằm trong phạm vi chung.
- Muốn theo dõi trạng thái / tiến độ riêng từng phần.

## 3. Ai được phép tạo subtask?

Chỉ Người chính (NgườiChính) của công việc cha (hoặc quản trị hệ thống). Người phối hợp không tạo được.

## 4. Có giới hạn số cấp hay số lượng subtask không?

Không giới hạn kỹ thuật, nhưng nên giữ cây dễ đọc (khuyến nghị < 8 cấp, mỗi cấp < 50 mục).

## 5. Sau khi công việc cha đã Hoàn thành có thể thêm subtask không?

KHÔNG. Bạn phải mở lại (nếu quy trình cho phép) rồi mới tạo thêm.

## 6. Tiến độ (%) của công việc cha có tự động cộng từ các con không?

Không. Tiến độ cha được Người chính cập nhật thủ công để chủ động kiểm soát. (Trong tương lai có thể có gợi ý).

## 7. Khi tất cả subtask đều Hoàn thành thì sao?

Hệ thống hiển thị banner gợi ý bạn đánh dấu Hoàn thành cho công việc cha (nếu vẫn đang thực hiện).

## 8. Vì sao tôi không hoàn thành được công việc cha?

Vì vẫn còn ít nhất 1 subtask chưa Hoàn thành. Hoàn tất hoặc đóng những subtask còn lại trước.

## 9. Tôi không thấy một số subtask – có lỗi không?

Không hẳn. Bạn chỉ thấy subtask khi:

- Bạn là NgườiChính / NgườiGiao / NgườiPhốiHợp của chính subtask đó; hoặc
- Bạn là NgườiChính / NgườiGiao ở một ancestor (cấp cha cao hơn); hoặc
- Bạn là quản lý (theo cấu hình QuanLyNhanVien) hoặc admin.

## 10. Tôi có thể di chuyển (đổi cha) cho một subtask không?

Chưa hỗ trợ ở phiên bản này.

## 11. Có thể xoá công việc cha có subtask không?

Không. Hệ thống sẽ báo còn công việc con và chặn thao tác. Bạn cần xử lý / xoá từng subtask trước (nếu quy trình cho phép).

## 12. Tôi có thể bình luận và đính kèm tệp ở subtask không?

Có. Mỗi subtask hoạt động như một công việc độc lập: bình luận, file, tiến độ, lịch sử.

## 13. Tại sao progress của tôi hiển thị sai hoặc ChildrenCount không khớp?

Hiếm gặp. Có thể do cập nhật đồng thời. Hệ thống có cơ chế đồng bộ lại – thử tải lại trang. Nếu vẫn sai hãy báo quản trị.

## 14. Làm sao tìm subtask bằng ô tìm kiếm hiện tại?

Bạn tìm như công việc bình thường. Subtask cũng là một công việc – chỉ khác là nó thuộc một cây.

## 15. Có cách xem toàn bộ cây ở trang danh sách không?

Hiện tại chỉ xem dạng cây trong màn hình chi tiết. Trang danh sách vẫn hiển thị phẳng để nhanh và nhẹ.

## 16. Tôi có cần đặt tên đặc biệt cho subtask không?

Không bắt buộc. Khuyến nghị đặt tên ngắn, mô tả hành động rõ ("Chuẩn bị tài liệu A", "Test module B").

## 17. Có thông báo khi tạo subtask không?

Giai đoạn này: thông báo tối giản (tùy cấu hình). Hệ thống sẽ nâng cấp thông báo chi tiết ở bản sau.

## 18. Có thể sao chép (clone) một subtask nhiều lần không?

Chưa hỗ trợ. Tạo mới thủ công từng cái (hoặc đề xuất tính năng nếu nhu cầu cao).

## 19. Thứ tự subtask có thay đổi được (kéo thả) không?

Chưa. Hiện sắp xếp mặc định theo thời gian tạo / trạng thái. Tính năng sắp xếp sẽ cân nhắc sau.

## 20. Mẹo sử dụng hiệu quả

- Đừng tạo quá sâu nếu không cần – dễ mất cái nhìn tổng quan.
- Hoàn thành sớm các subtask nhỏ để kích hoạt gợi ý hoàn thành cha.
- Ghi chú rõ ở từng subtask thay vì mô tả dài ở cha.
- Dùng banner gợi ý như checklist cuối cùng trước khi đóng.

## 21. Nếu tôi cần gộp lại hoặc chỉnh lại cấu trúc?

Hiện chưa hỗ trợ di chuyển. Giải pháp tạm: tạo subtask mới ở vị trí đúng và đóng (hoặc ghi chú) các subtask cũ.

## 22. Tôi thấy subtask nhưng không sửa được – lý do?

Bạn không phải Người chính của subtask đó. Bạn chỉ có thể bình luận / xem file (nếu được cấp quyền).

## 23. Có giới hạn dung lượng tệp riêng cho subtask không?

Dùng chung chính sách tệp của hệ thống (kích thước tối đa / loại file). Không khác công việc thường.

## 24. Shortcut hữu ích

| Hành động                        | Mô tả                          |
| -------------------------------- | ------------------------------ |
| Ctrl + Enter (ở ghi chú tiến độ) | Lưu nhanh cập nhật tiến độ     |
| Expand node ▶                    | Tải & mở danh sách subtask con |
| Reload (F5)                      | Đồng bộ lại cây & counters     |

## 25. Tôi nên báo gì khi gặp lỗi?

Cung cấp: ID công việc cha, ID subtask (nếu có), thao tác vừa làm, ảnh chụp màn hình thông báo lỗi.

---

**Cần thêm câu hỏi khác?** Ghi nhận và đưa vào phiên bản FAQ tiếp theo.
