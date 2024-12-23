import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";
import {
  calculateTongChiSo,
  extractChiSo,
  filterChiTietBenhNhansCLC,
  filterChiTietBenhNhansHasExcludeTTCLC,
  filterChiTietBenhNhansNotExcludeTTCLC,
  findKhoasInBaocaongays,
} from "../../utils/heplFuntion";

const initialState = {
  isLoading: false,
  error: null,
  bcGiaoBans: [],
  bcGiaoBanCurent: {},
  baocaongays: [],

  noiBNTuvongs: [],
  noiBNChuyenViens: [],
  noiBNXinVes: [],
  noiBNNangs: [],
  noiBNCanThieps: [],
  noiBNTheoDois: [],
  noiBNNgoaiGios: [],
  noiBNNgoaiGiosKhongGomCLC: [],

  ngoaiBNTuvongs: [],
  ngoaiBNChuyenViens: [],
  ngoaiBNXinVes: [],
  ngoaiBNNangs: [],
  ngoaiBNPhauThuats: [],
  ngoaiBNNgoaiGios: [],
  ngoaiBNTheoDois: [],
  ngoaiBNNgoaiGiosKhongGomCLC: [],

  clcBNTuvongs: [],
  clcBNChuyenViens: [],
  clcBNXinVes: [],
  clcBNNangs: [],
  clcBNCanThieps: [],
  clcBNTheoDois: [],

  hsccycBNNgoaiGios: [],
  noiycBNNgoaiGios: [],
  ngoaiycBNPhauThuats: [],
  ngoaiycBNNgoaiGios: [],

  khoas: [],
  khoaDaGuis: [],
  khoaChuaGuis: [],

  chiso: {},
  chisoTong: {},

  pkycs: [],
};

const slice = createSlice({
  name: "bcgiaoban",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getDataBCNgaysForGiaoBanSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.baocaongays = action.payload.baocaongays.sort(
        (a, b) => a.KhoaID.STT - b.KhoaID.STT
      );

      state.noiBNTuvongs = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        1,
        "noi"
      );
      state.noiBNChuyenViens = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        2,
        "noi"
      );
      state.noiBNXinVes = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        3,
        "noi"
      );
      state.noiBNNangs = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        4,
        "noi"
      );
      state.noiBNCanThieps = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        7,
        "noi"
      );

      state.noiBNTheoDois = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        8,
        "noi"
      );

      state.noiBNNgoaiGios = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        6,
        "noi"
      );
      state.noiBNNgoaiGiosKhongGomCLC = filterChiTietBenhNhansHasExcludeTTCLC(
        state.baocaongays,
        6,
        "noi"
      );

      state.ngoaiBNTuvongs = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        1,
        "ngoai"
      );
      state.ngoaiBNChuyenViens = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        2,
        "ngoai"
      );
      state.ngoaiBNXinVes = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        3,
        "ngoai"
      );
      state.ngoaiBNNangs = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        4,
        "ngoai"
      );
      state.ngoaiBNPhauThuats = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        5,
        "ngoai"
      );
      state.ngoaiBNNgoaiGios = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        6,
        "ngoai"
      );
      state.ngoaiBNTheoDois = filterChiTietBenhNhansNotExcludeTTCLC(
        state.baocaongays,
        8,
        "ngoai"
      );
      state.ngoaiBNNgoaiGiosKhongGomCLC = filterChiTietBenhNhansHasExcludeTTCLC(
        state.baocaongays,
        6,
        "ngoai"
      );

      state.clcBNTuvongs = filterChiTietBenhNhansCLC(state.baocaongays, 1, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNChuyenViens = filterChiTietBenhNhansCLC(state.baocaongays, 2, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNXinVes = filterChiTietBenhNhansCLC(state.baocaongays, 3, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNNangs = filterChiTietBenhNhansCLC(state.baocaongays, 4, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNCanThieps = filterChiTietBenhNhansCLC(state.baocaongays, 7, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNTheoDois = filterChiTietBenhNhansCLC(state.baocaongays, 8, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);

      state.hsccycBNNgoaiGios = filterChiTietBenhNhansCLC(
        state.baocaongays,
        6,
        ["HSCCYC"]
      );
      state.noiycBNNgoaiGios = filterChiTietBenhNhansCLC(state.baocaongays, 6, [
        "NoiYC",
      ]);
      state.ngoaiycBNNgoaiGios = filterChiTietBenhNhansCLC(
        state.baocaongays,
        6,
        ["NgoaiYC"]
      );
      state.ngoaiycBNPhauThuats = filterChiTietBenhNhansCLC(
        state.baocaongays,
        5,
        ["NgoaiYC"]
      );

      state.khoaDaGuis = findKhoasInBaocaongays(
        state.baocaongays,
        state.khoas
      ).KhoaDaGuis;
      state.khoaChuaGuis = findKhoasInBaocaongays(
        state.baocaongays,
        state.khoas
      ).KhoaChuaGuis;

      //set gía trị cho chiso:
      const chisoCode = [
        "kkb-TongKham",
        "kkb-BaoHiem",
        "kkb-VienPhi",
        "kkb-YeuCau",
        "kkb-NBVaoVien",
        "kkb-CVNoiTru",
        "kkb-CVNgoaiTru",
        "kkb-NgoaiTinhNgoaiTruBH",
        "kkb-NgoaiTinhNgoaiTruVP",
        "kkb-NgoaiTinhNoiTruBH",
        "kkb-NgoaiTinhNoiTruVP",
        "gmhs-TongMo",
        "gmhs-TrongGio",
        "gmhs-NgoaiGio",
        "xn-HuyetHoc",
        "xn-HoaSinh",
        "xn-ViSinh",
        "cdha-Xquang",
        "cdha-CT16",
        "cdha-CT128",
        "cdha-MRI",
        "tdcn-SieuAm",
        "tdcn-NoiSoi",
        "hhtm-TongXN",
        "hhtm-HongCau",
        "hhtm-HuyetTuong",
        "hhtm-TieuCau",
        "hhtm-Cryo",
        "kcc-TongKham",
        "kcc-VaoVien",
        "clc-TongNB",
        "clc-VaoThang",
        "clc-ChuyenSang",
        "clc-GiuongTrong",
      ];
      state.chiso = extractChiSo(state.baocaongays, chisoCode);

      state.chisoTong = calculateTongChiSo(state.baocaongays);

      state.pkycs = state.baocaongays.filter((baocaongay) => {
        return baocaongay.KhoaID.LoaiKhoa === "pkyc";
      });
    },

    getKhoasInBCGiaoBanSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("khoas", action.payload);
      state.khoas = [...action.payload];
      // state.khoaDaGuis = findKhoasInBaocaongays(
      //   state.baocaongays,
      //   state.khoas
      // ).KhoaDaGuis;
      // state.khoaChuaGuis = findKhoasInBaocaongays(
      //   state.baocaongays,
      //   state.khoas
      // ).KhoaChuaGuis;
    },

    getDataBCGiaoBanByFromDateToDateSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.bcGiaoBans = action.payload;
    },

    getDataBCGiaoBanCurentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      if (action.payload.length > 0) {
        state.bcGiaoBanCurent = action.payload[0];
      }
    },

    InsertOrUpdateBCGiaoBanByFromDateToDateSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.bcGiaoBans = action.payload;
    },

    InsertOrUpdateTrangThaiForBCGiaoBanSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.bcGiaoBanCurent = action.payload;
    },
  },
});
export default slice.reducer;
//get Baocaongays theo ngay
export const getDataBCNgaysForGiaoBan = (date) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const params = {
      Ngay: date,
    };
    const response = await apiService.get(`/baocaongay/all`, { params });

    dispatch(slice.actions.getDataBCNgaysForGiaoBanSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};

export const getDataBCGiaoBanByFromDateToDate =
  (fromDate, toDate) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const params = {
        fromDate: fromDate,
        toDate: toDate,
      };
      const response = await apiService.get(`/bcgiaoban/allbyngay`, { params });
      console.log("bc giao ban by fromDate toDate", response.data.data);
      dispatch(
        slice.actions.getDataBCGiaoBanByFromDateToDateSuccess(
          response.data.data
        )
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
export const getDataBCGiaoBanCurent = (date) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const params = {
      fromDate: date,
      toDate: date,
    };
    const response = await apiService.get(`/bcgiaoban/allbyngay`, { params });
    console.log("response in getDataBCGiaoBanCurent", response.data.data);
    dispatch(slice.actions.getDataBCGiaoBanCurentSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const InsertOrUpdateBCGiaoBanByFromDateToDate =
  (bcGiaoBanUpdateOrInsert) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.post(
        `/bcgiaoban/allbyngay`,
        bcGiaoBanUpdateOrInsert
      );
      console.log(
        "bc giao ban after update and insert by fromDate toDate",
        response.data.data
      );
      dispatch(
        slice.actions.InsertOrUpdateBCGiaoBanByFromDateToDateSuccess(
          response.data.data
        )
      );
      toast.success("Cập nhật  thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const InsertOrUpdateTrangThaiForBCGiaoBan =
  (ngay, trangthai) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.post(`/bcgiaoban/trangthai`, {
        ngay,
        trangthai,
      });
      console.log(
        "bc giao ban after update and insert trang thai",
        response.data.data
      );
      dispatch(
        slice.actions.InsertOrUpdateTrangThaiForBCGiaoBanSuccess(
          response.data.data
        )
      );
      dispatch(getDataBCNgaysForGiaoBan(ngay));
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const getKhoasInBCGiaoBan = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/khoa");
    dispatch(
      slice.actions.getKhoasInBCGiaoBanSuccess(response.data.data.khoas)
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
