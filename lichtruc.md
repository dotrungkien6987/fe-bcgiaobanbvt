Chức năng quản lý lịch trực cho bệnh viện
Mục tiêu
Xây dựng một chức năng quản lý lịch trực cho các khoa và phòng khám trong bệnh viện, cho phép người dùng nhập, xem, sửa, và xóa lịch trực theo các quy định cụ thể. Chức năng này phải dễ sử dụng, bảo mật, và có giao diện hiện đại, responsive.
Ngữ cảnh

Đối tượng sử dụng: Nhân viên thuộc các khoa và phòng khám trong bệnh viện.
Phân quyền:
Người dùng chỉ có thể nhập, sửa, xóa lịch trực của khoa mình cho các ngày chưa đến.
Tất cả người dùng có thể xem lịch trực của tất cả các khoa.


Yêu cầu đặc biệt:
Không thể sửa hoặc xóa lịch trực của các ngày đã qua.
Lịch trực bao gồm: ngày (theo giờ Việt Nam), điều dưỡng/kỹ thuật viên trực, bác sĩ trực.



Yêu cầu chi tiết
1. Quản lý lịch trực

Nhập lịch trực:
Người dùng thuộc khoa cụ thể có thể nhập lịch trực cho khoa của mình.
Có thể nhập trước cho nhiều ngày trong tương lai.
Thông tin bao gồm: ngày, điều dưỡng/kỹ thuật viên trực, bác sĩ trực.


Sửa lịch trực:
Chỉ có thể sửa lịch trực của các ngày chưa đến.
Không cho phép sửa lịch trực của các ngày đã qua.


Xóa lịch trực:
Chỉ có thể xóa lịch trực của các ngày chưa đến.
Không cho phép xóa lịch trực của các ngày đã qua.



2. Xem lịch trực

Xem theo khoa:
Người dùng có thể chọn một khoa và xem lịch trực của khoa đó cho tất cả các ngày.


Xem theo ngày:
Người dùng có thể chọn một ngày cụ thể và xem lịch trực của tất cả các khoa trong ngày đó.


Quyền xem:
Tất cả người dùng có quyền xem lịch trực của tất cả các khoa.



3. Giao diện người dùng

Thiết kế:
Giao diện hiện đại, responsive, đẹp mắt.
Sử dụng các thành phần UI như bảng, lịch, dropdown để hiển thị và lọc dữ liệu.


Tính năng:
Lọc lịch trực theo khoa hoặc theo ngày.
Hiển thị thông tin chi tiết của lịch trực khi chọn.



4. Dữ liệu và bảo mật

Dữ liệu:
Lịch trực được lưu trữ với các trường: ngày (theo giờ Việt Nam), khoa, điều dưỡng/kỹ thuật viên, bác sĩ.


Bảo mật:
Phân quyền chặt chẽ: chỉ người dùng thuộc khoa cụ thể mới có thể nhập, sửa, xóa lịch trực của khoa mình.
Không cho phép sửa hoặc xóa lịch trực của các ngày đã qua.



Công nghệ đề xuất

Frontend: ReactJS với Material-UI để đảm bảo giao diện đẹp và responsive.
Backend: Node.js với Express.js để xây dựng API.
Cơ sở dữ liệu: MongoDB để lưu trữ dữ liệu lịch trực và thông tin người dùng.

Hướng dẫn thực hiện

Thiết lập cơ sở dữ liệu:
 LichTruc (lịch trực).
LichTruc bao gồm các trường: Ngay, KhoaID, DieuDuong, BacSi.


Xây dựng backend:

Tạo API cho các thao tác: thêm, sửa, xóa, xem lịch trực.
Kiểm tra phân quyền dựa trên khoa của người dùng.
Chặn sửa/xóa lịch trực của các ngày đã qua.


Xây dựng frontend:

Trang xem lịch trực với bộ lọc theo khoa hoặc ngày.
Form nhập/sửa lịch trực cho người dùng thuộc khoa.
Giao diện responsive với Material-UI.


Kiểm thử:

Kiểm tra trường hợp sửa/xóa lịch trực của ngày đã qua (phải bị chặn).
Kiểm tra quyền xem lịch trực của tất cả các khoa.



Lưu ý

Xử lý ngày giờ theo múi giờ Việt Nam (UTC+7).
Validate dữ liệu nhập vào để tránh lỗi.
Tối ưu hóa hiệu suất khi hiển thị lịch trực cho nhiều ngày/khoa.

