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

  baocaosucoCurent: {},
  baocaosucos: [],

  tonghopHinhThuc: [],
  tonghopLoaiSuCo: [],
  tonghopMucDo: [],
  tonghopNhomNguyenNhan: [],
  tonghopNhomSuCo: [],
  tonghopTonThuongNB: [],
  tonghopTonThuongTC:[],
tonghopSuCoTheoKhoa:[],

  totalSuCo: 0,
  totalPages: 1,
};

const slice = createSlice({
  name: "baocaosuco",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    deleteOneSuCoSuccess(state, action) {
      state.isLoading = false;
      state.error = action.null;
      state.baocaosucos = state.baocaosucos.filter(
        (suco) => suco._id !== action.payload._id
      );
    },

    InsertOneSuccess(state, action) {
      state.isLoading = false;
      console.log("loading",state.isLoading)
      state.error = null;
      state.baocaosucoCurent = action.payload;
    },
    resetBaoCaoSuCoCurentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.baocaosucoCurent = {}
    },

    getBaoCaoSuCosSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.baocaosucos = action.payload.baocaosucos;
      state.totalSuCo = action.payload.count;
      state.totalPages = action.payload.totalPages;
    },

    getBaoCaoSuCoForDataGridSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.baocaosucos = action.payload.baocaosucos;
      state.totalSuCo = action.payload.count;
      state.totalPages = action.payload.totalPages;
    },

    getOneByIdSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.baocaosucoCurent = action.payload;
    },
    getTongHopSuCoTheoKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.tonghopSuCoTheoKhoa = action.payload;
    },

    getTongHopSuCoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const tonghop = action.payload;

      state.tonghopHinhThuc = [];
      state.tonghopHinhThuc.push({
        label: "Tự nguyện",
        value: tonghop.TuNguyen,
      });
      state.tonghopHinhThuc.push({ label: "Bắt buộc", value: tonghop.BatBuoc });

      state.tonghopLoaiSuCo = [];
      state.tonghopLoaiSuCo.push({
        label: "Chưa xảy ra",
        value: tonghop.ChuaXayRa,
      });
      state.tonghopLoaiSuCo.push({ label: "Đã xảy ra", value: tonghop.DaXayRa });

      state.tonghopMucDo = [];
      state.tonghopMucDo.push({
        label: "Nặng",
        value: tonghop.Nang,
      });
      state.tonghopMucDo.push({ label: "Trung bình", value: tonghop.TrungBinh });
      state.tonghopMucDo.push({ label: "Nhẹ", value: tonghop.Nhe });

      
      state.tonghopNhomNguyenNhan = [];
      state.tonghopNhomNguyenNhan.push({
        label: "Nhân viên",
        value: tonghop.NhomNguyenNhan1,
      });
      state.tonghopNhomNguyenNhan.push({ label: "Người bệnh", value: tonghop.NhomNguyenNhan2 });
      state.tonghopNhomNguyenNhan.push({ label: "Môi trường làm việc", value: tonghop.NhomNguyenNhan3 });
      state.tonghopNhomNguyenNhan.push({ label: "Tổ chức/ dịch vụ", value: tonghop.NhomNguyenNhan4 });
      state.tonghopNhomNguyenNhan.push({ label: "Yếu tố bên ngoài", value: tonghop.NhomNguyenNhan5 });
      state.tonghopNhomNguyenNhan.push({ label: "Khác", value: tonghop.NhomNguyenNhan6 });

      
      state.tonghopNhomSuCo = [];
      state.tonghopNhomSuCo.push({
        label: "Quy trình kỹ thuật, thủ thuật",
        value: tonghop.NhomSuCo1,
      });
      state.tonghopNhomSuCo.push({ label: "Nhiễm khuẩn bệnh viện", value: tonghop.NhomSuCo2 });
      state.tonghopNhomSuCo.push({ label: "Thuốc và dịch truyền", value: tonghop.NhomSuCo3 });
      state.tonghopNhomSuCo.push({ label: "Máu và các chế phẩm máu", value: tonghop.NhomSuCo4 });
      state.tonghopNhomSuCo.push({ label: "Thiết bị y tế", value: tonghop.NhomSuCo5 });
      state.tonghopNhomSuCo.push({ label: "Hành vi", value: tonghop.NhomSuCo6 });
      state.tonghopNhomSuCo.push({ label: "Tai nạn với NB", value: tonghop.NhomSuCo7 });
      state.tonghopNhomSuCo.push({ label: "Hạ tầng cơ sở", value: tonghop.NhomSuCo8 });
      state.tonghopNhomSuCo.push({ label: "Quản lý nguồn lực, tổ chức", value: tonghop.NhomSuCo9 });
      state.tonghopNhomSuCo.push({ label: "Hồ sơ, tài liệu, thủ tục HC", value: tonghop.NhomSuCo10 });
      state.tonghopNhomSuCo.push({ label: "Khác", value: tonghop.NhomSuCo11 });

      
      state.tonghopTonThuongNB = [];
      state.tonghopTonThuongNB.push({
        label: "A. Có nguy cơ xảy ra",
        value: tonghop.TonThuongA,
      });
      state.tonghopTonThuongNB.push({ label: "B. Chưa tác động trực tiếp", value: tonghop.TonThuongB });
      state.tonghopTonThuongNB.push({ label: "C. Tác động trực tiếp, chưa nguy hại", value: tonghop.TonThuongC });
      state.tonghopTonThuongNB.push({ label: "D. Theo dõi điều trị kịp thời nên không gây nguy hại", value: tonghop.TonThuongD });
      state.tonghopTonThuongNB.push({ label: "E. Gây nguy hại tạm thời cần điều trị", value: tonghop.TonThuongE });
      state.tonghopTonThuongNB.push({ label: "F. Cần can thiệp và kéo dài thời gian điều trị", value: tonghop.TonThuongF });
      state.tonghopTonThuongNB.push({ label: "G. Gây nguy hại kéo dài, để lại di chứng", value: tonghop.TonThuongG });
      state.tonghopTonThuongNB.push({ label: "H. Cần phải hồi sức tích cực", value: tonghop.TonThuongH });
      state.tonghopTonThuongNB.push({ label: "I. Có ảnh hưởng hoặc trực tiếp gây tử vong", value: tonghop.TonThuongI });
      
      state.tonghopTonThuongTC = [];
      state.tonghopTonThuongTC.push({
        label: "Tổn hại tài sản",
        value: tonghop.TonHaiTaiSan,
      });
      state.tonghopTonThuongTC.push({ label: "Tăng nguồn lực phục vụ", value: tonghop.TangNguonLuc });
      state.tonghopTonThuongTC.push({ label: "Quan tâm của truyền thông", value: tonghop.QuanTamTruyenThong });
      state.tonghopTonThuongTC.push({ label: "Tổn hại danh tiếng", value: tonghop.TonHaiDanhTieng });
      state.tonghopTonThuongTC.push({ label: "Can thiệp của pháp luật", value: tonghop.CanThiepPhapLuat });
      state.tonghopTonThuongTC.push({ label: "Khác", value: tonghop.Khac });
      
      
    },


    UpdateOneSuCoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.baocaosucoCurent = action.payload;
    },

    UpdateTrangThaiSuCoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.baocaosucos = state.baocaosucos.map((baocaosuco) => {
        if (baocaosuco._id === action.payload._id) return action.payload;
        return baocaosuco;
      });
    },

    getKhoasInBCGiaoBanSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("khoas", action.payload);
      state.khoas = [...action.payload];
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

  
  },
});
export default slice.reducer;

export const getBaoCaoSuCos =
  ({ filterName, page = 1, limit = 12 }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const params = { page, limit };
      if (filterName) params.UserName = filterName;
      const response = await apiService.get(`/baocaosuco`, { params });
    
      dispatch(slice.actions.getBaoCaoSuCosSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      toast.error(error.message);
    }
  };
export const getBaoCaoSuCoForDataGrid =
  (fromdate,todate,trangthai) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const params = { fromdate, todate,trangthai };
      
      const response = await apiService.get(`/baocaosuco/danhsach`, { params });
      console.log("response data grid", response.data.data);
      dispatch(slice.actions.getBaoCaoSuCoForDataGridSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      toast.error(error.message);
    }
  };

export const getTongHopSuCo = (fromdate, todate) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const params = { fromdate, todate };

    const response = await apiService.get(`/baocaosuco/tonghop`, { params });
    console.log("response for get tong hop", response.data.data);
    dispatch(slice.actions.getTongHopSuCoSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error));
    toast.error(error.message);
  }
};

export const getTongHopSuCoTheoKhoa = (fromdate, todate) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const params = { fromdate, todate };

    const response = await apiService.get(`/baocaosuco/tonghoptheokhoa`, { params });
    console.log("response for get tong hop theo khoa", response.data.data);
    dispatch(slice.actions.getTongHopSuCoTheoKhoaSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error));
    toast.error(error.message);
  }
};


export const getOneById = (sucoId) => async (dispatch) => {
  if (sucoId) {
    dispatch(slice.actions.startLoading);
    try {
      console.log("sucoid in getonebyId in redux", sucoId);
      const response = await apiService.get(`/baocaosuco/${sucoId}`);

      dispatch(slice.actions.getOneByIdSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      toast.error(error.message);
    }
  }
};

export const InsertOne = (baocaosuco) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/baocaosuco`, baocaosuco);
    console.log("loading",)
    dispatch(slice.actions.InsertOneSuccess(response.data.data));
    toast.success("Cập nhật  thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const UpdateOneSuCo = (baocaosuco) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.put(`/baocaosuco/update`, { baocaosuco });
    console.log("update baocaosuco thanhcong", response.data.data);
    dispatch(slice.actions.UpdateOneSuCoSuccess(response.data.data));
    toast.success("Cập nhật  thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const UpdateTrangThaiSuCo = (sucoId, trangthai) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.put(`/baocaosuco/updatetrangthai`, {
      sucoId,
      trangthai,
    });
    console.log("update baocaosuco thanhcong", response.data.data);
    dispatch(slice.actions.UpdateTrangThaiSuCoSuccess(response.data.data));
    toast.success("Cập nhật  trạng thái thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteOneSuCo = (sucoId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.delete(`/baocaosuco/${sucoId}`);
    dispatch(slice.actions.deleteOneSuCoSuccess(response.data.data));

    toast.success("Xóa sự cố thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const resetBaoCaoSuCoCurent = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    
    dispatch(slice.actions.resetBaoCaoSuCoCurentSuccess());

    
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

