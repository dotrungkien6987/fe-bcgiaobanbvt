// src/data/mockData.js
export const mockData = {
  dutyDoctors: [
    { position: 'Trực lãnh đạo', name: 'Bs. Nguyễn Văn A' },
    { position: 'Tổng trực hệ nội', name: 'Bs. Trần Thị B' },
    { position: 'Tổng trực hệ ngoại', name: 'Bs. Lê Văn C' },
  ],
  
  outpatientClinicA: [
    { name: 'Phòng khám 01', doctor: 'Bs. Phạm Văn D', nurse: 'Đd. Hoàng Thị E', waiting: 5, examined: 20, admitted: 2 },
    { name: 'Phòng khám 02', doctor: 'Bs. Vũ Thị F', nurse: 'Đd. Đặng Văn G', waiting: 3, examined: 15, admitted: 1 },
    { name: 'Phòng khám 03', doctor: 'Bs. Đỗ Văn H', nurse: 'Đd. Bùi Thị I', waiting: 8, examined: 12, admitted: 0 },
    { name: 'Phòng khám 04', doctor: 'Bs. Mai Thị J', nurse: 'Đd. Ngô Văn K', waiting: 2, examined: 18, admitted: 3 },
    { name: 'Phòng khám 05', doctor: 'Bs. Hồ Văn L', nurse: 'Đd. Lý Thị M', waiting: 6, examined: 22, admitted: 2 },
    { name: 'Phòng khám 06', doctor: 'Bs. Trương Thị N', nurse: 'Đd. Đinh Văn O', waiting: 4, examined: 16, admitted: 1 },
    { name: 'Phòng khám 07', doctor: 'Bs. Lương Văn P', nurse: 'Đd. Triệu Thị Q', waiting: 7, examined: 14, admitted: 2 },
    { name: 'Phòng khám 08', doctor: 'Bs. Dương Thị R', nurse: 'Đd. Võ Văn S', waiting: 3, examined: 19, admitted: 0 },
    // Thêm các phòng khám còn lại...
  ],
  
  vipOutpatientClinic: [
    { name: 'VIP 01', doctor: 'Bs. CK2. Trần T', nurse: 'Đd. Cao U', waiting: 2, examined: 12, admitted: 1 },
    { name: 'VIP 02', doctor: 'Bs. CK2. Nguyễn V', nurse: 'Đd. Hà X', waiting: 1, examined: 8, admitted: 0 },
    { name: 'VIP 03', doctor: 'Bs. CK2. Lê Y', nurse: 'Đd. Mai Z', waiting: 3, examined: 10, admitted: 2 },
    // Thêm các phòng khám VIP còn lại...
  ],
  
  inpatientWards: [
    { ward: 'Khoa Nội Tim mạch', doctor: 'Bs. Đặng AA', nurse: 'Đd. Thái BB', waiting: 3, treating: 45, discharged: 5 },
    { ward: 'Khoa Ngoại Tổng hợp', doctor: 'Bs. Trịnh CC', nurse: 'Đd. Chu DD', waiting: 2, treating: 38, discharged: 7 },
    { ward: 'Khoa Sản', doctor: 'Bs. Tống EE', nurse: 'Đd. Hồng FF', waiting: 4, treating: 28// src/data/mockData.js
export const mockData = {
  dutyDoctors: [
    { position: 'Trực lãnh đạo', name: 'Bs. Nguyễn Văn A' },
    { position: 'Tổng trực hệ nội', name: 'Bs. Trần Thị B' },
    { position: 'Tổng trực hệ ngoại', name: 'Bs. Lê Văn C' },
  ],
  
  outpatientClinicA: [
    { name: 'Phòng khám 01', doctor: 'Bs. Phạm Văn D', nurse: 'Đd. Hoàng Thị E', waiting: 5, examined: 20, admitted: 2 },
    { name: 'Phòng khám 02', doctor: 'Bs. Vũ Thị F', nurse: 'Đd. Đặng Văn G', waiting: 3, examined: 15, admitted: 1 },
    { name: 'Phòng khám 03', doctor: 'Bs. Đỗ Văn H', nurse: 'Đd. Bùi Thị I', waiting: 8, examined: 12, admitted: 0 },
    { name: 'Phòng khám 04', doctor: 'Bs. Mai Thị J', nurse: 'Đd. Ngô Văn K', waiting: 2, examined: 18, admitted: 3 },
    { name: 'Phòng khám 05', doctor: 'Bs. Hồ Văn L', nurse: 'Đd. Lý Thị M', waiting: 6, examined: 22, admitted: 2 },
    { name: 'Phòng khám 06', doctor: 'Bs. Trương Thị N', nurse: 'Đd. Đinh Văn O', waiting: 4, examined: 16, admitted: 1 },
    { name: 'Phòng khám 07', doctor: 'Bs. Lương Văn P', nurse: 'Đd. Triệu Thị Q', waiting: 7, examined: 14, admitted: 2 },
    { name: 'Phòng khám 08', doctor: 'Bs. Dương Thị R', nurse: 'Đd. Võ Văn S', waiting: 3, examined: 19, admitted: 0 },
    // Thêm các phòng khám còn lại...
  ],
  
  vipOutpatientClinic: [
    { name: 'VIP 01', doctor: 'Bs. CK2. Trần T', nurse: 'Đd. Cao U', waiting: 2, examined: 12, admitted: 1 },
    { name: 'VIP 02', doctor: 'Bs. CK2. Nguyễn V', nurse: 'Đd. Hà X', waiting: 1, examined: 8, admitted: 0 },
    { name: 'VIP 03', doctor: 'Bs. CK2. Lê Y', nurse: 'Đd. Mai Z', waiting: 3, examined: 10, admitted: 2 },
    // Thêm các phòng khám VIP còn lại...
  ],
  
  inpatientWards: [
    { ward: 'Khoa Nội Tim mạch', doctor: 'Bs. Đặng AA', nurse: 'Đd. Thái BB', waiting: 3, treating: 45, discharged: 5 },
    { ward: 'Khoa Ngoại Tổng hợp', doctor: 'Bs. Trịnh CC', nurse: 'Đd. Chu DD', waiting: 2, treating: 38, discharged: 7 },
    { ward: 'Khoa Sản', doctor: 'Bs. Tống EE', nurse: 'Đd. Hồng FF', waiting: 4, treating: 28