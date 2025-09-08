import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";
import { chiaNhomDaoTao } from "utils/heplFuntion";

const initialState = {
  isLoading: false,
  error: null,
  isOpenDeleteNhanVien: false,
  isOpenUpdateNhanVien: false,

  nhanvienCurrent: {},
  lopdaotaotheoNhanVienCurrents: [],
  nghiencuukhoahoctheoNhanVienCurrents: [],
  tinchitichluyCurrents: [],
  tonghopHinhThucTheoNhanVienCurrent: [],

  //tổng hợp tín chỉ tích lũy
  tonghoptinchitichluys: [],
  typeTongHop: 0,

  //tổng hợp số lương hình thức cap nhat
  tonghopsoluong: [],
  tonghopsoluongtheokhoa: [],
  pieChartDatKhuyenCao: [],
  phannhomTongHopSoLuongDaoTao: {},

  //Cơ cấu nguồn nhân lực
  CoCauNguonNhanLuc: {},

  nhanviens: [],
  datafix: {},
  VaiTro: [],
  ChucDanh: [],
  ChucVu: [],
  TrinhDoChuyenMon: [],
  NguonKinhPhi: [],
  NoiDaoTao: [],
  DonVi: [],
  NhomHinhThucCapNhat: [],
  HinhThucDaoTao: [],
  DanToc: [],
  PhamViHanhNghe: [],

  Tinh: [],
  Huyen: [],
  Xa: [],
  QuocGia: [],
};

const slice = createSlice({
  name: "nhanvien",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setNhanVienCurentSuccess(state, action) {
      console.log("nhanvien action payload", action.payload);
      state.isLoading = false;
      state.error = null;
      state.nhanvienCurrent = action.payload;
    },
    getOneNhanVienByIDSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhanvienCurrent = action.payload.nhanvien;
      state.lopdaotaotheoNhanVienCurrents = action.payload.daotaos;
      state.nghiencuukhoahoctheoNhanVienCurrents =
        action.payload.nghiencuukhoahocs;
      state.tinchitichluyCurrents = action.payload.TinChiTichLuys;
      state.tonghopHinhThucTheoNhanVienCurrent =
        action.payload.hinhthuccapnhats;
    },
    setIsOpenUpdateNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.isOpenUpdateNhanVien = action.payload;
    },
    setTypeTongHopSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.typeTongHop = action.payload;
    },
    getAllNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhanviens = action.payload.map((nhanvien) => ({
        ...nhanvien,
        TenKhoa: nhanvien.KhoaID.TenKhoa,
        Sex: nhanvien.GioiTinh === 0 ? "Nam" : "Nữ",
      }));
    },
    insertOneNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const nhanvien = {
        ...action.payload,
        TenKhoa: action.payload.KhoaID.TenKhoa,
        Sex: action.payload.GioiTinh === 0 ? "Nam" : "Nữ",
      };
      state.nhanviens.unshift(nhanvien);
    },
    deleteOneNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhanviens = state.nhanviens.filter(
        (nhanvien) => nhanvien._id !== action.payload
      );
    },
    updateOneNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log('Update Nhan Vien:', action.payload);
      state.nhanviens = state.nhanviens.map((nhanvien) =>
        nhanvien._id === action.payload._id
          ? {
              ...action.payload,
              TenKhoa: action.payload.KhoaID.TenKhoa,
              Sex: action.payload.GioiTinh === 0 ? "Nam" : "Nữ",
            }
          : nhanvien
      );
    },
    getDataFixSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.datafix = action.payload;
      state.VaiTro = action.payload.VaiTro;
      state.DonVi = action.payload.DonVi;
      state.ChucDanh = action.payload.ChucDanh;
      state.ChucVu = action.payload.ChucVu;
      state.TrinhDoChuyenMon = action.payload.TrinhDoChuyenMon;
      state.NguonKinhPhi = action.payload.NguonKinhPhi;
      state.NoiDaoTao = action.payload.NoiDaoTao;
      state.NhomHinhThucCapNhat = action.payload.NhomHinhThucCapNhat;
      state.HinhThucDaoTao = action.payload.HinhThucDaoTao;
      state.DanToc = action.payload.DanToc;
      state.PhamViHanhNghe = action.payload.PhamViHanhNghe;

      state.Tinh = action.payload.Tinh;
      state.Huyen = action.payload.Huyen;
      state.Xa = action.payload.Xa;
      state.QuocGia = action.payload.QuocGia;
    },
    updateOrInsertDatafixSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.datafix = action.payload;
      state.VaiTro = action.payload.VaiTro;
      state.DonVi = action.payload.DonVi;
      state.ChucDanh = action.payload.ChucDanh;
      state.ChucVu = action.payload.ChucVu;
      state.TrinhDoChuyenMon = action.payload.TrinhDoChuyenMon;
      state.NguonKinhPhi = action.payload.NguonKinhPhi;
      state.NoiDaoTao = action.payload.NoiDaoTao;
      state.NhomHinhThucCapNhat = action.payload.NhomHinhThucCapNhat;
      state.HinhThucDaoTao = action.payload.HinhThucDaoTao;
      state.DanToc = action.payload.DanToc;
      state.PhamViHanhNghe = action.payload.PhamViHanhNghe;

      state.Tinh = action.payload.Tinh;
      state.Huyen = action.payload.Huyen;
      state.Xa = action.payload.Xa;
      state.QuocGia = action.payload.QuocGia;
    },
    importNhanViensSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    },
    getTongHopSoLuongHinhThucCapNhatThucHienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.tonghopsoluong = action.payload;
      state.phannhomTongHopSoLuongDaoTao = chiaNhomDaoTao(action.payload);
    },
    getTongHopSoLuongTheoKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("Tong hop so luong theo khoa", action.payload);
      state.tonghopsoluongtheokhoa = action.payload;
      state.pieChartDatKhuyenCao = [];
      state.pieChartDatKhuyenCao.push({
        label: "Đạt",
        value: action.payload[0].countDatTrue,
      });
      state.pieChartDatKhuyenCao.push({
        label: "Chưa đạt",
        value: action.payload[0].countDatFalse,
      });
    },

    getCoCauNguonNhanLucToanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.CoCauNguonNhanLuc = action.payload;
    },

    getTongHopTinChiTichLuySuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.tonghoptinchitichluys = action.payload.map((item) => ({
        ...item,
        ...item.nhanVien,
        TenKhoa: item.nhanVien.KhoaID.TenKhoa,
      }));
    },
    getTongHopTinChiTichLuyByKhoaSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      //danh sach can bo theo khoa
      state.tonghoptinchitichluys = action.payload.map((item) => ({
        ...item,
        ...item.nhanVien,
        TenKhoa: item.nhanVien.KhoaID.TenKhoa,
      }));

      //Xử lý chart tỷ lệ đạt khuyến cáo chỉ tính với nhân viên có số CCHN
      state.pieChartDatKhuyenCao = [];
      const dat = state.tonghoptinchitichluys.filter(
        (item) => item.Dat === true && item.SoCCHN !== ""
      ).length;
      const chuadat = state.tonghoptinchitichluys.filter(
        (item) => item.Dat === false && item.SoCCHN !== ""
      ).length;

      state.pieChartDatKhuyenCao.push({
        label: "Đạt",
        value: dat,
      });

      state.pieChartDatKhuyenCao.push({
        label: "Chưa đạt",
        value: chuadat,
      });
    },
  },
});

export default slice.reducer;

export const getAllNhanVien = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/nhanvien");
    console.log("nhanviens", response.data);
    dispatch(slice.actions.getAllNhanVienSuccess(response.data.data.nhanviens));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const getOneNhanVienByID = (nhanvienID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get(`/nhanvien/${nhanvienID}`);
    console.log("data nhanvien get one", response.data.data);
    dispatch(slice.actions.getOneNhanVienByIDSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const insertOneNhanVien = (nhanvien) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/nhanvien`, nhanvien);
    dispatch(slice.actions.insertOneNhanVienSuccess(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const deleteOneNhanVien = (nhanvienID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.delete(`/nhanvien/${nhanvienID}`);
    dispatch(slice.actions.deleteOneNhanVienSuccess(nhanvienID));
    toast.success("Xoá thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const updateOneNhanVien = (nhanvien) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.put(`/nhanvien`, { nhanvien });
    console.log("nhanvien in update", response.data);
    dispatch(slice.actions.updateOneNhanVienSuccess(response.data.data));
    toast.success("Cập nhật  thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const setNhanVienCurent = (nhanvien) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setNhanVienCurentSuccess(nhanvien));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const setIsOpenUpdateNhanVien = (open) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setIsOpenUpdateNhanVienSuccess(open));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const getDataFix = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/datafix/getAll");

    dispatch(slice.actions.getDataFixSuccess(response.data.data.datafix[0]));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const importNhanViens = (jsonData) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`/nhanvien/import`, { jsonData });
    dispatch(slice.actions.importNhanViensSuccess(response.data.data));
    dispatch(getAllNhanVien());
    toast.success("Import thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOrInsertDatafix = (datafix) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.post(`datafix/insertOrUpdate`, {
      datafix,
    });
    // console.log('datafix in update',response.data.data.datafixUpdate)
    dispatch(
      slice.actions.updateOrInsertDatafixSuccess(
        response.data.data.datafixUpdate
      )
    );
    toast.success("Cập nhật  thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// API tổng hợp số liệu
export const getTongHopTinChiTichLuy =
  (fromdate, todate, KhuyenCao, MaHinhThucCapNhatList) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const params = {
        FromDate: fromdate,
        ToDate: todate,
        KhuyenCao,
        MaHinhThucCapNhatList,
      };

      const response = await apiService.get(`/nhanvien/tichluytinchi`, {
        params,
      });

      dispatch(
        slice.actions.getTongHopTinChiTichLuySuccess(response.data.data)
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      toast.error(error.message);
    }
  };
export const getTongHopTinChiTichLuyByKhoa =
  (fromdate, todate, KhuyenCao, khoaID) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const params = { FromDate: fromdate, ToDate: todate, KhuyenCao, khoaID };

      const response = await apiService.get(`/nhanvien/tichluytinchitheokhoa`, {
        params,
      });

      dispatch(
        slice.actions.getTongHopTinChiTichLuyByKhoaSuccess(response.data.data)
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      toast.error(error.message);
    }
  };

export const getTongHopSoLuongHinhThucCapNhatThucHien =
  (fromdate, todate) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const params = { FromDate: fromdate, ToDate: todate };

      const response = await apiService.get(`/nhanvien/soluongthuchien`, {
        params,
      });
      console.log("response for get tong hop theo khoa", response.data.data);
      dispatch(
        slice.actions.getTongHopSoLuongHinhThucCapNhatThucHienSuccess(
          response.data.data
        )
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      toast.error(error.message);
    }
  };
export const getTongHopSoLuongTheoKhoa =
  (fromdate, todate, KhuyenCao) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const params = { FromDate: fromdate, ToDate: todate, KhuyenCao };

      const response = await apiService.get(`/nhanvien/soluongtheokhoa`, {
        params,
      });
      console.log("response for get tong hop theo khoa", response.data.data);
      dispatch(
        slice.actions.getTongHopSoLuongTheoKhoaSuccess(response.data.data)
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      toast.error(error.message);
    }
  };
export const getCoCauNguonNhanLucToanVien = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get(`/nhanvien/cocaunhanluc`);
    console.log("response for get tong hop theo khoa", response.data.data);
    dispatch(
      slice.actions.getCoCauNguonNhanLucToanVienSuccess(response.data.data)
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error));
    toast.error(error.message);
  }
};
export const getCoCauNguonNhanLucByKhoa = (khoaID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get(
      `/nhanvien/cocaunhanluctheokhoa/${khoaID}`
    );
    console.log("response for get tong hop theo khoa", response.data.data);
    dispatch(
      slice.actions.getCoCauNguonNhanLucToanVienSuccess(response.data.data)
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error));
    toast.error(error.message);
  }
};

export const setTypeTongHop = (type) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setTypeTongHopSuccess(type));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
