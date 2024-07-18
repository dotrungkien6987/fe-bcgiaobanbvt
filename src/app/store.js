import { configureStore } from "@reduxjs/toolkit";
import baocaongaySlice from "../features/BaoCaoNgay/baocaongaySlice";
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
// import baocaosucoSlice from "../features/User/baocaosucoSlice";

const rootReducer = {
  baocaongay: baocaongaySlice,
  bcgiaoban: bcgiaobanSlice,
  user: userSlice,
  baocaosuco: baocaosucoSlice,
  dashboard: dashboardSlice,
  dashboardkhoa: dashboardkhoaSlice,
  mytheme: themeslice,
  daotao: daotaoSlice,
  nhanvien:nhanvienSlice,
  hinhthuccapnhat:hinhthuccapnhatSlice,
  menu:menuSlice,
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
