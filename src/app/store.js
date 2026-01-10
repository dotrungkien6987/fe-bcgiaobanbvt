import { configureStore } from "@reduxjs/toolkit";
import baocaongaySlice from "../features/BaoCaoNgay/baocaongaySlice";
import baocaongay_riengtheokhoaSlice from "../features/BaoCaoNgay/baocaongay_riengtheokhoaSlice";
import bcgiaobanSlice from "../features/BCGiaoBan/bcgiaobanSlice";
import userSlice from "../features/User/userSlice";
import baocaosucoSlice from "../features/BaoCaoSuCo/baocaosucoSlice";
import dashboardSlice from "../features/DashBoard/dashboardSlice";
import workDashboardSlice from "../features/QuanLyCongViec/Dashboard/dashboardSlice";
import dashboardkhoaSlice from "../features/DashBoard/DashBoardKhoa/dashboardkhoaSlice";
import themeslice from "../features/Theme/themeslice";
import daotaoSlice from "../features/Daotao/daotaoSlice";
import nhanvienSlice from "features/NhanVien/nhanvienSlice";
import menuSlice from "features/Menu/menuSlice";
import hinhthuccapnhatSlice from "../features/NhanVien/hinhthuccapnhatSlice";
import fileSlice from "../features/File/fileSlice";
import hisSlice from "../features/Slice/hisSlice";
import khoaSlice from "../features/Daotao/Khoa/khoaSlice";
import lichtrucSlice from "../features/Slice/lichtrucSlice";
import soThuTuSlice from "../features/Slice/soThuTuSlice";
import nhomKhoaSoThuTuSlice from "../features/Slice/nhomkhoasothutuSlice";
import doanraSlice from "../features/NghienCuuKhoaHoc/DoanRa/doanraSlice";
import nhomViecUserSlice from "../features/QuanLyCongViec/NhomViecUser/nhomViecUserSlice";
import nhiemvuThuongQuySlice from "../features/QuanLyCongViec/NhiemVuThuongQuy/nhiemvuThuongQuySlice";
import quanLyNhanVienSlice from "../features/QuanLyCongViec/QuanLyNhanVien/quanLyNhanVienSlice";
// import giaoNhiemVuSlice from "../features/QuanLyCongViec/GiaoNhiemVu/giaoNhiemVuSlice"; // ❌ ARCHIVED 2025-11-25 (legacy system)
import cycleAssignmentSlice from "../features/QuanLyCongViec/GiaoNhiemVu/cycleAssignmentSlice";
import congViecSlice from "../features/QuanLyCongViec/CongViec/congViecSlice";
import nhanvienManagementSlice from "../features/QuanLyCongViec/NhanVien/nhanvienManagementSlice";
import quanLyTepTinSlice from "../features/QuanLyCongViec/CongViec/QuanLyTepTin/quanLyTepTinSlice";
import colorConfigSlice from "../features/QuanLyCongViec/CongViec/colorConfigSlice";
import congViecTreeReducer from "../features/QuanLyCongViec/TreeView/congViecTreeSlice";
import backupSlice from "../features/Backup/backupSlice";
import loaichuyenmonReducer from "features/Daotao/LoaiChuyenMon/loaiChuyenMonSlice";
import baiBaoReducer from "../features/NghienCuuKhoaHoc/TapSan/slices/baiBaoSlice";
import tapSanReducer from "../features/NghienCuuKhoaHoc/TapSan/slices/tapSanSlice";
import doanvaoReducer from "../features/NghienCuuKhoaHoc/DoanVao/doanvaoSlice";
import { doanRaMembersReducer } from "features/NghienCuuKhoaHoc/DoanRa/doanRaMembersSlice";
import { doanVaoMembersReducer } from "features/NghienCuuKhoaHoc/DoanVao/doanVaoMembersSlice";
import tepTinAdminReducer from "features/QuanLyFile/tepTinAdminSlice";
import kpiSlice from "features/QuanLyCongViec/KPI/kpiSlice";
import kpiEvaluationSlice from "features/QuanLyCongViec/KPI/kpiEvaluationSlice";
import khuyenCaoKhoaBQBAReducer from "../features/DashBoard/BinhQuanBenhAn/khuyenCaoKhoaBQBASlice";
import baoCaoKPIReducer from "features/QuanLyCongViec/BaoCaoThongKeKPI/baoCaoKPISlice";
import dichvutrungReducer from "../features/DashBoard/DichVuTrung/dichvutrungSlice";
import { notificationReducer } from "features/Notification";
import {
  notificationTemplateReducer,
  notificationTypeReducer,
} from "features/Notification/Admin";
// YeuCau (Ticket System)
import {
  yeuCauReducer,
  danhMucYeuCauReducer,
  cauHinhKhoaReducer,
  lyDoTuChoiAdminReducer,
} from "features/QuanLyCongViec/Ticket";
// import baocaosucoSlice from "../features/User/baocaosucoSlice";

const rootReducer = {
  baocaongay: baocaongaySlice,
  baocaongay_riengtheokhoa: baocaongay_riengtheokhoaSlice,
  bcgiaoban: bcgiaobanSlice,
  user: userSlice,
  baocaosuco: baocaosucoSlice,
  dashboard: dashboardSlice,
  workDashboard: workDashboardSlice, // QuanLyCongViec dashboard
  dashboardkhoa: dashboardkhoaSlice,
  mytheme: themeslice,
  daotao: daotaoSlice,
  nhanvien: nhanvienSlice,
  hinhthuccapnhat: hinhthuccapnhatSlice,
  menu: menuSlice,
  file: fileSlice,
  his: hisSlice,
  khoa: khoaSlice,
  lichtruc: lichtrucSlice,
  soThuTu: soThuTuSlice,
  nhomKhoaSoThuTu: nhomKhoaSoThuTuSlice,
  doanra: doanraSlice,
  nhomViecUser: nhomViecUserSlice,
  nhiemvuThuongQuy: nhiemvuThuongQuySlice,
  quanLyNhanVien: quanLyNhanVienSlice,
  // giaoNhiemVu: giaoNhiemVuSlice, // ❌ ARCHIVED 2025-11-25 (legacy system - not used by active routes)
  cycleAssignment: cycleAssignmentSlice,
  congViec: congViecSlice,
  nhanvienManagement: nhanvienManagementSlice,
  quanLyTepTin: quanLyTepTinSlice,
  colorConfig: colorConfigSlice,
  congViecTree: congViecTreeReducer,
  backup: backupSlice,
  loaichuyenmon: loaichuyenmonReducer,
  baiBao: baiBaoReducer,
  tapSan: tapSanReducer,
  doanvao: doanvaoReducer,
  doanRaMembers: doanRaMembersReducer,
  doanVaoMembers: doanVaoMembersReducer,
  tepTinAdmin: tepTinAdminReducer,
  kpi: kpiSlice,
  kpiEvaluation: kpiEvaluationSlice,
  khuyenCaoKhoaBQBA: khuyenCaoKhoaBQBAReducer,
  dichvutrung: dichvutrungReducer,
  baoCaoKPI: baoCaoKPIReducer,
  notification: notificationReducer,
  notificationTemplate: notificationTemplateReducer,
  notificationType: notificationTypeReducer,
  // YeuCau (Ticket System)
  yeuCau: yeuCauReducer,
  danhMucYeuCau: danhMucYeuCauReducer,
  cauHinhKhoa: cauHinhKhoaReducer,
  lyDoTuChoiAdmin: lyDoTuChoiAdminReducer,
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
