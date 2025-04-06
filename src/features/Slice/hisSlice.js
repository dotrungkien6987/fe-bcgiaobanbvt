import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  bnNgoaiTinhs: [],
  bnTheoTinh:[]
};

const slice = createSlice({
  name: "his",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getLogEventsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.bnNgoaiTinhs = action.payload;

      // Tổng hợp số bệnh nhân theo tỉnh
      const provinceMap = {};
      
      action.payload.forEach(bn => {
        if (!bn) return; // Bỏ qua nếu phần tử không tồn tại
        const tinhCode = bn.hc_tinhcode;
        const tinhName = bn.hc_tinhname;
        const soBN = parseInt(bn.sobenhnhan) || 0;
        
        if (provinceMap[tinhCode]) {
          provinceMap[tinhCode].tongBenhNhan += soBN;
        } else {
          provinceMap[tinhCode] = {
            maTinh: tinhCode,
            tenTinh: tinhName,
            tongBenhNhan: soBN
          };
        }
      });
      
      // Chuyển đổi từ object sang array và sắp xếp giảm dần theo số bệnh nhân
      state.bnTheoTinh = Object.values(provinceMap).sort(
        (a, b) => b.tongBenhNhan - a.tongBenhNhan
      );
      
    },
  },
});

export default slice.reducer;

export const getLogEvents = (fromdate, todate) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const params = { fromdate, todate };
    const response = await apiService.get("/logevent", { params });
    dispatch(slice.actions.getLogEventsSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};