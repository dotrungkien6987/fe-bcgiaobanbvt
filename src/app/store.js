import { configureStore } from "@reduxjs/toolkit";
import baocaongaySlice from "../features/BaoCaoNgay/baocaongaySlice";
import bcgiaobanSlice from "../features/BCGiaoBan/bcgiaobanSlice";
import userSlice from "../features/User/userSlice";
import baocaosucoSlice from "../features/BaoCaoSuCo/baocaosucoSlice";
import dashboardSlice from "../features/DashBoard/dashboardSlice";
import themeslice from "../features/Theme/themeslice";
// import baocaosucoSlice from "../features/User/baocaosucoSlice";

const rootReducer = {
 baocaongay:baocaongaySlice,
 bcgiaoban: bcgiaobanSlice,
 user:userSlice,
 baocaosuco:baocaosucoSlice,
 dashboard:dashboardSlice,
 mytheme:themeslice,
};

const store = configureStore({
  reducer:rootReducer
})

export default store;