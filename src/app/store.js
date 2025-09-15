import { configureStore } from "@reduxjs/toolkit";
import baocaongaySlice from "../features/BaoCaoNgay/baocaongaySlice";
import baocaongay_riengtheokhoaSlice from "../features/BaoCaoNgay/baocaongay_riengtheokhoaSlice";
import bcgiaobanSlice from "../features/BCGiaoBan/bcgiaobanSlice";
import userSlice from "../features/User/userSlice";
import baocaosucoSlice from "../features/BaoCaoSuCo/baocaosucoSlice";
import dashboardSlice from "../features/DashBoard/dashboardSlice";
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
import giaoNhiemVuSlice from "../features/QuanLyCongViec/GiaoNhiemVu/giaoNhiemVuSlice";
import congViecSlice from "../features/QuanLyCongViec/CongViec/congViecSlice";
import nhanvienManagementSlice from "../features/QuanLyCongViec/NhanVien/nhanvienManagementSlice";
import quanLyTepTinSlice from "../features/QuanLyCongViec/CongViec/QuanLyTepTin/quanLyTepTinSlice";
import colorConfigSlice from "../features/QuanLyCongViec/CongViec/colorConfigSlice";
import congViecTreeReducer from "../features/QuanLyCongViec/TreeView/congViecTreeSlice";
import backupSlice from "../features/Backup/backupSlice";
import loaichuyenmonReducer from "features/Daotao/LoaiChuyenMon/loaiChuyenMonSlice";
import baiBaoReducer from "../features/NghienCuuKhoaHoc/TapSan/slices/baiBaoSlice";
import tapSanReducer from "../features/NghienCuuKhoaHoc/TapSan/slices/tapSanSlice";
// import baocaosucoSlice from "../features/User/baocaosucoSlice";

const rootReducer = {
  baocaongay: baocaongaySlice,
  baocaongay_riengtheokhoa: baocaongay_riengtheokhoaSlice,
  bcgiaoban: bcgiaobanSlice,
  user: userSlice,
  baocaosuco: baocaosucoSlice,
  dashboard: dashboardSlice,
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
  giaoNhiemVu: giaoNhiemVuSlice,
  congViec: congViecSlice,
  nhanvienManagement: nhanvienManagementSlice,
  quanLyTepTin: quanLyTepTinSlice,
  colorConfig: colorConfigSlice,
  congViecTree: congViecTreeReducer,
  backup: backupSlice,
  loaichuyenmon: loaichuyenmonReducer,
  baiBao: baiBaoReducer,
  tapSan: tapSanReducer,
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
