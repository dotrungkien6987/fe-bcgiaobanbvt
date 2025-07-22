import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { removeAndRenumber } from "../../utils/heplFuntion";
import { uploadImagesToCloudinary } from "../../utils/cloudinary";
import { toast } from "react-toastify";
import { remove, update } from "lodash";
import { ca } from "date-fns/locale";

const initialState = {
  isLoading: false,
  error: null,
  bcGiaoBanTheoNgay: {},
  bnTuVongs: [],
  bnChuyenViens: [],
  bnXinVes: [],
  bnNangs: [],
  bnPhauThuats: [],
  bnNgoaiGios: [],
  bnCanThieps: [],
  bnTheoDois: [],
  bnMoCCs: [],
  ctChiSos: [],
  khoas: [],
};

const slice = createSlice({
  name: "baocaongay",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    //Xử lý khi add 1 Bn vào trong các list BN
    addTuVongSuccess(state, action) {
      const benhnhan = { ...action.payload, Stt: state.bnTuVongs.length + 1 };
      state.bnTuVongs.push(benhnhan);
    },
    addChuyenVienSuccess(state, action) {
      const benhnhan = {
        ...action.payload,
        Stt: state.bnChuyenViens.length + 1,
      };
      state.bnChuyenViens.push(benhnhan);
    },
    addXinVeSuccess(state, action) {
      const benhnhan = { ...action.payload, Stt: state.bnXinVes.length + 1 };
      state.bnXinVes.push(benhnhan);
    },
    addNangSuccess(state, action) {
      const benhnhan = { ...action.payload, Stt: state.bnNangs.length + 1 };
      state.bnNangs.push(benhnhan);
    },
    addPhauThuatSuccess(state, action) {
      const benhnhan = {
        ...action.payload,
        Stt: state.bnPhauThuats.length + 1,
      };
      state.bnPhauThuats.push(benhnhan);
    },
    addNgoaiGioSuccess(state, action) {
      const benhnhan = { ...action.payload, Stt: state.bnNgoaiGios.length + 1 };
      state.bnNgoaiGios.push(benhnhan);
    },
    addCanThiepSuccess(state, action) {
      const benhnhan = { ...action.payload, Stt: state.bnCanThieps.length + 1 };
      state.bnCanThieps.push(benhnhan);
    },
    addTheoDoiSuccess(state, action) {
      const benhnhan = { ...action.payload, Stt: state.bnTheoDois.length + 1 };
      state.bnTheoDois.push(benhnhan);
    },
    addMoCCSuccess(state, action) {
      const benhnhan = { ...action.payload, Stt: state.bnMoCCs.length + 1 };
      state.bnMoCCs.push(benhnhan);
    },
    //Xử lý khi update 1 Bn vào trong các list BN
    updateTuVongSuccess(state, action) {
      state.bnTuVongs[action.payload.Stt - 1] = action.payload;
    },
    updateChuyenVienSuccess(state, action) {
      state.bnChuyenViens[action.payload.Stt - 1] = action.payload;
    },
    updateXinVeSuccess(state, action) {
      state.bnXinVes[action.payload.Stt - 1] = action.payload;
    },
    updateNangSuccess(state, action) {
      state.bnNangs[action.payload.Stt - 1] = action.payload;
    },
    updatePhauThuatSuccess(state, action) {
      state.bnPhauThuats[action.payload.Stt - 1] = action.payload;
    },
    updateNgoaiGioSuccess(state, action) {
      state.bnNgoaiGios[action.payload.Stt - 1] = action.payload;
    },
    updateCanThiepSuccess(state, action) {
      state.bnCanThieps[action.payload.Stt - 1] = action.payload;
    },
    updateTheoDoiSuccess(state, action) {
      state.bnTheoDois[action.payload.Stt - 1] = action.payload;
    },
    updateMoCCSuccess(state, action) {
      state.bnMoCCs[action.payload.Stt - 1] = action.payload;
    },
    //Xử lý khi xóa 1 BN trong list BN
    removeBenhNhanInTuVongSuccess(state, action) {
      const stt = action.payload.Stt;
      state.bnTuVongs = removeAndRenumber(state.bnTuVongs, stt);
    },

    removeBenhNhanInChuyenVienSuccess(state, action) {
      const stt = action.payload.Stt;
      state.bnChuyenViens = removeAndRenumber(state.bnChuyenViens, stt);
    },
    removeBenhNhanInXinVeSuccess(state, action) {
      const stt = action.payload.Stt;
      state.bnXinVes = removeAndRenumber(state.bnXinVes, stt);
    },
    removeBenhNhanInNangSuccess(state, action) {
      const stt = action.payload.Stt;
      state.bnNangs = removeAndRenumber(state.bnNangs, stt);
    },
    removeBenhNhanInPhauThuatSuccess(state, action) {
      const stt = action.payload.Stt;
      state.bnPhauThuats = removeAndRenumber(state.bnPhauThuats, stt);
    },
    removeBenhNhanInNgoaiGioSuccess(state, action) {
      const stt = action.payload.Stt;
      state.bnNgoaiGios = removeAndRenumber(state.bnNgoaiGios, stt);
    },
    removeBenhNhanInCanThiepSuccess(state, action) {
      const stt = action.payload.Stt;
      state.bnCanThieps = removeAndRenumber(state.bnCanThieps, stt);
    },
    removeBenhNhanInTheoDoiSuccess(state, action) {
      const stt = action.payload.Stt;
      state.bnTheoDois = removeAndRenumber(state.bnTheoDois, stt);
    },
    removeBenhNhanInMoCCSuccess(state, action) {
      const stt = action.payload.Stt;
      state.bnMoCCs = removeAndRenumber(state.bnMoCCs, stt);
    },
    getDataBCNgaySuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      if (action.payload.baocaongay._id) {
        console.log("get bcngay update ", action.payload);
        const { baocaongay } = { ...action.payload };
        console.log("baocaongay ", baocaongay.ChiTietChiSo);
        state.bcGiaoBanTheoNgay = {
          Ngay: baocaongay.Ngay,
          KhoaID: baocaongay.KhoaID,
          BSTruc: baocaongay.BSTruc,
          DDTruc: baocaongay.DDTruc,
          CBThemGio: baocaongay.CBThemGio,
          IsForKhoa: baocaongay.IsForKhoa,
        };
        state.ctChiSos = baocaongay.ChiTietChiSo;

        state.bnTuVongs = baocaongay.ChiTietBenhNhan.filter(
          (BN) => BN.LoaiBN === 1
        );
        state.bnChuyenViens = baocaongay.ChiTietBenhNhan.filter(
          (BN) => BN.LoaiBN === 2
        );
        state.bnXinVes = baocaongay.ChiTietBenhNhan.filter(
          (BN) => BN.LoaiBN === 3
        );
        state.bnNangs = baocaongay.ChiTietBenhNhan.filter(
          (BN) => BN.LoaiBN === 4
        );
        state.bnPhauThuats = baocaongay.ChiTietBenhNhan.filter(
          (BN) => BN.LoaiBN === 5
        );
        state.bnNgoaiGios = baocaongay.ChiTietBenhNhan.filter(
          (BN) => BN.LoaiBN === 6
        );
        state.bnCanThieps = baocaongay.ChiTietBenhNhan.filter(
          (BN) => BN.LoaiBN === 7
        );
        state.bnTheoDois = baocaongay.ChiTietBenhNhan.filter(
          (BN) => BN.LoaiBN === 8
        );
        state.bnMoCCs = baocaongay.ChiTietBenhNhan.filter(
          (BN) => BN.LoaiBN === 9
        );
      } else {
        console.log("get BCngay insert", action.payload);
        state.bcGiaoBanTheoNgay = {
          Ngay: action.payload.baocaongay.Ngay,
          KhoaID: action.payload.baocaongay.KhoaID,
        };
        state.bnTuVongs = [];
        state.bnChuyenViens = [];
        state.bnXinVes = [];
        state.bnNangs = [];
        state.bnPhauThuats = [];
        state.bnNgoaiGios = [];
        state.bnCanThieps = [];
        state.bnTheoDois = [];
        state.bnMoCCs = [];
        state.ctChiSos = [];
      }
    },

    getKhoasSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("khoas", action.payload);
      state.khoas = [...action.payload];
    },

    insertOrUpdateBaoCaoNgaySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("playload capnhat thanh cong", action.payload);
      const { baocaongay } = { ...action.payload };
      state.ctChiSos = baocaongay.ChiTietChiSo;
      state.bcGiaoBanTheoNgay.UserID = baocaongay.UserID;
      state.bcGiaoBanTheoNgay.BSTruc = baocaongay.BSTruc;
      state.bcGiaoBanTheoNgay.DDTruc = baocaongay.DDTruc;
      state.bcGiaoBanTheoNgay.CBThemGio = baocaongay.CBThemGio;
    },

    createCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    },
    deleteCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("payload in del comment", action.payload);
    },
  },
});
export default slice.reducer;

export const addBenhNhanToList = (benhnhan, images) => async (dispatch) => {
  try {
    if (images.length > 0)
      try {
        console.log("images truyen", images);
        const newImages = await uploadImagesToCloudinary(images);
        console.log("newImages upload", newImages);
        benhnhan.Images = [...benhnhan.Images, ...newImages];
      } catch (error) {
        throw error;
      }
    switch (benhnhan.LoaiBN) {
      case 1:
        dispatch(slice.actions.addTuVongSuccess(benhnhan));
        break;
      case 2:
        dispatch(slice.actions.addChuyenVienSuccess(benhnhan));
        break;
      case 3:
        dispatch(slice.actions.addXinVeSuccess(benhnhan));
        break;
      case 4:
        dispatch(slice.actions.addNangSuccess(benhnhan));
        break;
      case 5:
        dispatch(slice.actions.addPhauThuatSuccess(benhnhan));
        break;
      case 6:
        dispatch(slice.actions.addNgoaiGioSuccess(benhnhan));
        break;
      case 7:
        dispatch(slice.actions.addCanThiepSuccess(benhnhan));
        break;
      case 8:
        dispatch(slice.actions.addTheoDoiSuccess(benhnhan));
        break;
      case 9:
        dispatch(slice.actions.addMoCCSuccess(benhnhan));
        break;
      default:
        break;
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};
export const updateBenhNhanToList = (benhnhan, images) => async (dispatch) => {
  try {
    if (images.length > 0)
      try {
        console.log("images truyen", images);
        const newImages = await uploadImagesToCloudinary(images);
        console.log("newImages upload", newImages);
        benhnhan.Images = [...benhnhan.Images, ...newImages];
        console.log("Images sau khi update", benhnhan.Images);
      } catch (error) {
        dispatch(slice.actions.hasError(error.message));
      }
    switch (benhnhan.LoaiBN) {
      case 1:
        console.log("kkk");

        dispatch(slice.actions.updateTuVongSuccess(benhnhan));
        break;
      case 2:
        dispatch(slice.actions.updateChuyenVienSuccess(benhnhan));
        break;
      case 3:
        dispatch(slice.actions.updateXinVeSuccess(benhnhan));
        break;
      case 4:
        dispatch(slice.actions.updateNangSuccess(benhnhan));
        break;
      case 5:
        dispatch(slice.actions.updatePhauThuatSuccess(benhnhan));
        break;
      case 6:
        dispatch(slice.actions.updateNgoaiGioSuccess(benhnhan));
        break;
      case 7:
        dispatch(slice.actions.updateCanThiepSuccess(benhnhan));
        break;
      case 8:
        dispatch(slice.actions.updateTheoDoiSuccess(benhnhan));
        break;
      case 9:
        dispatch(slice.actions.updateMoCCSuccess(benhnhan));
        break;
      default:
        break;
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};
export const removeBenhNhanInList = (benhnhan) => (dispatch) => {
  switch (benhnhan.LoaiBN) {
    case 1:
      dispatch(slice.actions.removeBenhNhanInTuVongSuccess(benhnhan));
      break;
    case 2:
      dispatch(slice.actions.removeBenhNhanInChuyenVienSuccess(benhnhan));
      break;
    case 3:
      dispatch(slice.actions.removeBenhNhanInXinVeSuccess(benhnhan));
      break;
    case 4:
      dispatch(slice.actions.removeBenhNhanInNangSuccess(benhnhan));
      break;
    case 5:
      dispatch(slice.actions.removeBenhNhanInPhauThuatSuccess(benhnhan));
      break;
    case 6:
      dispatch(slice.actions.removeBenhNhanInNgoaiGioSuccess(benhnhan));
      break;
    case 7:
      dispatch(slice.actions.removeBenhNhanInCanThiepSuccess(benhnhan));
      break;
    case 8:
      dispatch(slice.actions.removeBenhNhanInTheoDoiSuccess(benhnhan));
      break;
    case 9:
      dispatch(slice.actions.removeBenhNhanInMoCCSuccess(benhnhan));
      break;
    default:
      break;
  }
};

export const insertOrUpdateBaoCaoNgay = (bcngayKhoa) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const body = {
      KhoaID: bcngayKhoa.KhoaID,
      Ngay: bcngayKhoa.Ngay,
      bcGiaoBanTheoNgay: bcngayKhoa,
    };
    const response = await apiService.post("/baocaongay", body);
    dispatch(slice.actions.insertOrUpdateBaoCaoNgaySuccess(response.data.data));
    toast.success("Cập nhật thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};
export const getDataBCNgay = (date, khoaId) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const params = {
      KhoaID: khoaId,
      Ngay: date,
    };
    const response = await apiService.get(`/baocaongay`, { params });

    dispatch(slice.actions.getDataBCNgaySuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getKhoas = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/khoa");
    dispatch(slice.actions.getKhoasSuccess(response.data.data.khoas));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Thêm action chuyển bệnh nhân từ slice riêng sang slice chung
export const transferBenhNhanFromRieng = (benhnhan) => (dispatch) => {
  try {
    // Thêm vào slice chung với cùng LoaiBN
    dispatch(addBenhNhanToList(benhnhan, []));
    toast.success(
      `Đã chuyển bệnh nhân "${benhnhan.TenBenhNhan}" lên báo cáo toàn viện`
    );
  } catch (error) {
    toast.error("Có lỗi xảy ra khi chuyển bệnh nhân");
    dispatch(slice.actions.hasError(error.message));
  }
};
