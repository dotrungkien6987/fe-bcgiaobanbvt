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

const hasResolvedKhoaRef = (baocaongay) => {
  const khoa = baocaongay?.KhoaID;

  return !!(
    khoa &&
    typeof khoa === "object" &&
    khoa._id &&
    khoa.MaKhoa &&
    khoa.LoaiKhoa
  );
};

const createSelectedDateState = () => ({
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
  ngoaiBNMoCCs: [],
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
  ngoaiycBNMoCCs: [],
  ngoaiycBNPhauThuats: [],
  ngoaiycBNNgoaiGios: [],
  khoaDaGuis: [],
  khoaChuaGuis: [],
  chiso: extractChiSo([], chisoCode),
  chisoTong: calculateTongChiSo([]),
  pkycs: [],
});

const initialState = {
  isLoading: false,
  error: null,
  bcGiaoBans: [],
  activeDateRequestKey: 0,
  khoas: [],
  ...createSelectedDateState(),
};

const slice = createSlice({
  name: "bcgiaoban",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      if (
        typeof action.payload?.requestKey === "number" &&
        action.payload.requestKey !== state.activeDateRequestKey
      ) {
        return;
      }

      state.isLoading = false;
      state.error = action.payload?.message ?? action.payload;
    },
    setActiveDateRequestKey(state, action) {
      state.activeDateRequestKey = action.payload;
    },
    resetSelectedDateData(state) {
      state.isLoading = false;
      state.error = null;
      Object.assign(state, createSelectedDateState());
    },
    getDataBCNgaysForGiaoBanSuccess(state, action) {
      if (
        typeof action.payload?.requestKey === "number" &&
        action.payload.requestKey !== state.activeDateRequestKey
      ) {
        return;
      }

      state.isLoading = false;
      state.error = null;
      const baocaongays = Array.isArray(action.payload?.data?.baocaongays)
        ? action.payload.data.baocaongays
            // Bỏ record có ref khoa mồ côi để không làm vỡ toàn bộ summary ngày.
            .filter(hasResolvedKhoaRef)
            .slice()
            .sort((a, b) => (a.KhoaID.STT ?? 0) - (b.KhoaID.STT ?? 0))
        : [];

      state.baocaongays = baocaongays;

      state.noiBNTuvongs = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        1,
        "noi",
      );
      state.noiBNChuyenViens = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        2,
        "noi",
      );
      state.noiBNXinVes = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        3,
        "noi",
      );
      state.noiBNNangs = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        4,
        "noi",
      );
      state.noiBNCanThieps = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        7,
        "noi",
      );

      state.noiBNTheoDois = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        8,
        "noi",
      );

      state.noiBNNgoaiGios = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        6,
        "noi",
      );
      state.noiBNNgoaiGiosKhongGomCLC = filterChiTietBenhNhansHasExcludeTTCLC(
        baocaongays,
        6,
        "noi",
      );

      state.ngoaiBNTuvongs = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        1,
        "ngoai",
      );
      state.ngoaiBNChuyenViens = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        2,
        "ngoai",
      );
      state.ngoaiBNXinVes = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        3,
        "ngoai",
      );
      state.ngoaiBNNangs = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        4,
        "ngoai",
      );
      state.ngoaiBNMoCCs = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        9,
        "ngoai",
      );
      state.ngoaiBNPhauThuats = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        5,
        "ngoai",
      );
      state.ngoaiBNNgoaiGios = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        6,
        "ngoai",
      );
      state.ngoaiBNTheoDois = filterChiTietBenhNhansNotExcludeTTCLC(
        baocaongays,
        8,
        "ngoai",
      );
      state.ngoaiBNNgoaiGiosKhongGomCLC = filterChiTietBenhNhansHasExcludeTTCLC(
        baocaongays,
        6,
        "ngoai",
      );

      state.clcBNTuvongs = filterChiTietBenhNhansCLC(baocaongays, 1, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNChuyenViens = filterChiTietBenhNhansCLC(baocaongays, 2, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNXinVes = filterChiTietBenhNhansCLC(baocaongays, 3, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNNangs = filterChiTietBenhNhansCLC(baocaongays, 4, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNCanThieps = filterChiTietBenhNhansCLC(baocaongays, 7, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);
      state.clcBNTheoDois = filterChiTietBenhNhansCLC(baocaongays, 8, [
        "NoiYC",
        "NgoaiYC",
        "HSCCYC",
      ]);

      state.hsccycBNNgoaiGios = filterChiTietBenhNhansCLC(baocaongays, 6, [
        "HSCCYC",
      ]);
      state.noiycBNNgoaiGios = filterChiTietBenhNhansCLC(baocaongays, 6, [
        "NoiYC",
      ]);
      state.ngoaiycBNNgoaiGios = filterChiTietBenhNhansCLC(baocaongays, 6, [
        "NgoaiYC",
      ]);
      state.ngoaiycBNMoCCs = filterChiTietBenhNhansCLC(baocaongays, 9, [
        "NgoaiYC",
      ]);
      state.ngoaiycBNPhauThuats = filterChiTietBenhNhansCLC(baocaongays, 5, [
        "NgoaiYC",
      ]);

      const { KhoaDaGuis, KhoaChuaGuis } = findKhoasInBaocaongays(
        baocaongays,
        state.khoas,
      );
      state.khoaDaGuis = KhoaDaGuis;
      state.khoaChuaGuis = KhoaChuaGuis;
      state.chiso = extractChiSo(baocaongays, chisoCode);

      state.chisoTong = calculateTongChiSo(baocaongays);

      state.pkycs = baocaongays.filter((baocaongay) => {
        return baocaongay.KhoaID.LoaiKhoa === "pkyc";
      });
    },

    getKhoasInBCGiaoBanSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("khoas", action.payload);
      state.khoas = [...action.payload];
      const { KhoaDaGuis, KhoaChuaGuis } = findKhoasInBaocaongays(
        state.baocaongays,
        state.khoas,
      );
      state.khoaDaGuis = KhoaDaGuis;
      state.khoaChuaGuis = KhoaChuaGuis;
    },

    getDataBCGiaoBanByFromDateToDateSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.bcGiaoBans = action.payload;
    },

    getDataBCGiaoBanCurentSuccess(state, action) {
      if (
        typeof action.payload?.requestKey === "number" &&
        action.payload.requestKey !== state.activeDateRequestKey
      ) {
        return;
      }

      state.isLoading = false;
      state.error = null;
      if (
        Array.isArray(action.payload?.data) &&
        action.payload.data.length > 0
      ) {
        state.bcGiaoBanCurent = action.payload.data[0];
      } else {
        state.bcGiaoBanCurent = {};
      }
    },

    InsertOrUpdateBCGiaoBanByFromDateToDateSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.bcGiaoBans = action.payload;
    },

    InsertOrUpdateTrangThaiForBCGiaoBanSuccess(state, action) {
      if (
        typeof action.payload?.requestKey === "number" &&
        action.payload.requestKey !== state.activeDateRequestKey
      ) {
        return;
      }

      state.isLoading = false;
      state.error = null;
      state.bcGiaoBanCurent = action.payload?.data ?? action.payload;
    },
  },
});
export const { resetSelectedDateData, setActiveDateRequestKey } = slice.actions;
export default slice.reducer;
//get Baocaongays theo ngay
export const getDataBCNgaysForGiaoBan =
  (date, requestKey) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = {
        Ngay: date,
      };
      const response = await apiService.get(`/baocaongay/all`, { params });

      dispatch(
        slice.actions.getDataBCNgaysForGiaoBanSuccess({
          requestKey,
          data: response.data.data,
        }),
      );
    } catch (error) {
      dispatch(
        slice.actions.hasError({
          message: error.message,
          requestKey,
        }),
      );
    }
  };

export const getDataBCGiaoBanByFromDateToDate =
  (fromDate, toDate) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = {
        fromDate: fromDate,
        toDate: toDate,
      };
      const response = await apiService.get(`/bcgiaoban/allbyngay`, { params });
      console.log("bc giao ban by fromDate toDate", response.data.data);
      dispatch(
        slice.actions.getDataBCGiaoBanByFromDateToDateSuccess(
          response.data.data,
        ),
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
export const getDataBCGiaoBanCurent =
  (date, requestKey) => async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = {
        fromDate: date,
        toDate: date,
      };
      const response = await apiService.get(`/bcgiaoban/allbyngay`, { params });
      console.log("response in getDataBCGiaoBanCurent", response.data.data);
      dispatch(
        slice.actions.getDataBCGiaoBanCurentSuccess({
          requestKey,
          data: response.data.data,
        }),
      );
    } catch (error) {
      dispatch(
        slice.actions.hasError({
          message: error.message,
          requestKey,
        }),
      );

      if (
        typeof requestKey !== "number" ||
        getState().bcgiaoban.activeDateRequestKey === requestKey
      ) {
        toast.error(error.message);
      }
    }
  };

export const InsertOrUpdateBCGiaoBanByFromDateToDate =
  (bcGiaoBanUpdateOrInsert) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(
        `/bcgiaoban/allbyngay`,
        bcGiaoBanUpdateOrInsert,
      );
      console.log(
        "bc giao ban after update and insert by fromDate toDate",
        response.data.data,
      );
      dispatch(
        slice.actions.InsertOrUpdateBCGiaoBanByFromDateToDateSuccess(
          response.data.data,
        ),
      );
      toast.success("Cập nhật  thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const InsertOrUpdateTrangThaiForBCGiaoBan =
  (ngay, trangthai, requestKey) => async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(`/bcgiaoban/trangthai`, {
        ngay,
        trangthai,
      });
      console.log(
        "bc giao ban after update and insert trang thai",
        response.data.data,
      );
      dispatch(
        slice.actions.InsertOrUpdateTrangThaiForBCGiaoBanSuccess({
          requestKey,
          data: response.data.data,
        }),
      );

      if (
        typeof requestKey !== "number" ||
        getState().bcgiaoban.activeDateRequestKey === requestKey
      ) {
        dispatch(getDataBCNgaysForGiaoBan(ngay, requestKey));
      }

      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      dispatch(
        slice.actions.hasError({
          message: error.message,
          requestKey,
        }),
      );

      if (
        typeof requestKey !== "number" ||
        getState().bcgiaoban.activeDateRequestKey === requestKey
      ) {
        toast.error(error.message);
      }
    }
  };

export const getKhoasInBCGiaoBan = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/khoa");
    dispatch(
      slice.actions.getKhoasInBCGiaoBanSuccess(response.data.data.khoas),
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
