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
import doanraSlice from "../features/Slice/doanraSlice";
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
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
