import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";
import { PieChart } from "@mui/icons-material";
import { tongHopBenhNhanTheoHuyenLabelValue, tongHopBenhNhanTheoTinhLabelValue, tongHopBenhNhanTheoXaLabelValue } from "./helpHisSliceFunction";

const initialState = {
  isLoading: false,
  error: null,
  bnNgoaiTinhs: [],
  bnTheoTinh:[],
  PieChartBenhNhanNgoaiTinhNgoaiTru: [],
  PieChartBenhNhanNgoaiTinhNoiTru: [],

  PieChartVinhPhucNgoaiTru: [],
  PieChartVinhPhucNoiTru: [],
  PieChartHoaBinhNgoaiTru: [],
  PieChartHoaBinhNoiTru: [],
  PieChartTuyenQuangNgoaiTru: [],
  PieChartTuyenQuangNoiTru: [],
  PieChartYenBaiNgoaiTru: [],
  PieChartYenBaiNoiTru: [],
  PieChartBaViNgoaiTru: [],
  PieChartBaViNoiTru: [],
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

      state.PieChartBenhNhanNgoaiTinhNgoaiTru = tongHopBenhNhanTheoTinhLabelValue(
        action.payload,
        0 // Hình thức ngoại trú
      );
      state.PieChartBenhNhanNgoaiTinhNoiTru = tongHopBenhNhanTheoTinhLabelValue(
        action.payload,
        2 // Hình thức nội trú
      );

state.PieChartVinhPhucNgoaiTru = tongHopBenhNhanTheoHuyenLabelValue(
        action.payload,
        "26",
        0 // Hình thức ngoại trú
      );
state.PieChartVinhPhucNoiTru = tongHopBenhNhanTheoHuyenLabelValue(
        action.payload,
        "26",
        2 // Hình thức nội trú
      );
state.PieChartHoaBinhNgoaiTru = tongHopBenhNhanTheoHuyenLabelValue(
        action.payload,
        "17",
        0 // Hình thức ngoại trú
      );
state.PieChartHoaBinhNoiTru = tongHopBenhNhanTheoHuyenLabelValue(
        action.payload,
        "17",
        2 // Hình thức nội trú
      );
state.PieChartTuyenQuangNgoaiTru = tongHopBenhNhanTheoHuyenLabelValue(
        action.payload,
        "08",
        0 // Hình thức ngoại trú
      );
state.PieChartTuyenQuangNoiTru = tongHopBenhNhanTheoHuyenLabelValue(
        action.payload,
        "08",
        2 // Hình thức nội trú
      );
state.PieChartYenBaiNgoaiTru = tongHopBenhNhanTheoHuyenLabelValue(
        action.payload,
        "15",
        0 // Hình thức ngoại trú
      );
state.PieChartYenBaiNoiTru = tongHopBenhNhanTheoHuyenLabelValue(
        action.payload,
        "15",
        2 // Hình thức nội trú
      );

      state.PieChartBaViNgoaiTru = tongHopBenhNhanTheoXaLabelValue(
        action.payload,
        "01",
        "17",
        0 // Hình thức ngoại trú
      )
      state.PieChartBaViNoiTru = tongHopBenhNhanTheoXaLabelValue(
        action.payload,
        "01",
        "17",
        2 // Hình thức nội trú
      );
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
            MaTinh: tinhCode,
            TenTinh: tinhName,
            TongBenhNhan: soBN
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