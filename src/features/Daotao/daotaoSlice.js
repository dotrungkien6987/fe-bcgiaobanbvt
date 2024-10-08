import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { uploadImagesToCloudinary } from "utils/cloudinary";
import { formatDate_getDate } from "utils/formatTime";
import { data } from "data/org-chart";

const initialState = {
  openUploadLopDaoTaoNhanVien: false,

  isLoading: false,
  error: null,
  LopDaoTaos: [],
  lopdaotaoCurrent: {},
  vaitroquydoiCurents: [],
  hocvienCurrents: [],
  vaitroCurrent: {},

  lopdaotaonhanvienCurrent: {},
  hocvientamCurrents: [],

  //Qua trinh tich luy DT06
  quatrinhdt06: [],
  hocviendt06Current: {},

  //data Export
  dataExport: [],

  //type HinhThucCapNhat
  typeHinhThucCapNhat: "All",

  hoidongCurrent: "0",
};

const slice = createSlice({
  name: "daotao",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    setTypeHinhThucCapNhatSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.typeHinhThucCapNhat = action.payload;
    },

    insertOneLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos.unshift({
        ...action.payload.data,
        NgayBatDauFormat: formatDate_getDate(action.payload.data.NgayBatDau),
        NgayKetThucFormat: formatDate_getDate(action.payload.data.NgayKetThuc),
      });
      state.lopdaotaoCurrent = action.payload.data;
      state.vaitroquydoiCurents = action.payload.vaitroquydoi;
      state.vaitroCurrent = state.vaitroquydoiCurents[0]?.VaiTro || {};
    },
    updateOneLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = state.LopDaoTaos.map((item) =>
        item._id === action.payload.data._id
          ? {
              ...action.payload.data,
              NgayBatDauFormat: formatDate_getDate(
                action.payload.data.NgayBatDau
              ),
              NgayKetThucFormat: formatDate_getDate(
                action.payload.data.NgayKetThuc
              ),
            }
          : item
      );
      state.lopdaotaoCurrent = action.payload.data;
      state.vaitroquydoiCurents = action.payload.vaitroquydoi;
      state.vaitroCurrent = state.vaitroquydoiCurents[0]?.VaiTro || {};
    },
    updateTrangThaiLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = state.LopDaoTaos.map((item) =>
        item._id === action.payload.lopdaotaoID
          ? {
              ...item,
              TrangThai: action.payload.TrangThai,
            }
          : item
      );
      state.lopdaotaoCurrent.TrangThai = action.payload.TrangThai;
    },
    updateHoiDongForLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = state.LopDaoTaos.map((item) =>
        item._id === action.payload.lopdaotaoID
          ? {
              ...item,
              HoiDongID: action.payload.hoidongID,
            }
          : item
      );
      state.lopdaotaoCurrent.HoiDongID = action.payload.hoidongID;
    },
    deleteOneLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = state.LopDaoTaos.filter(
        (item) => item._id !== action.payload
      );
    },

    getAllLopDaoTaoSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.LopDaoTaos = action.payload.map((item) => ({
        ...item,
        NgayBatDauFormat: formatDate_getDate(item.NgayBatDau),
        NgayKetThucFormat: formatDate_getDate(item.NgayKetThuc),
        NguoiTao: item.UserIDCreated?.UserName || "",
      }));
    },

    getOneLopDaoTaoNhanVienByIDSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lopdaotaonhanvienCurrent = action.payload;
    },
    setOpenUploadLopDaoTaoNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.openUploadLopDaoTaoNhanVien = action.payload;
    },
    uploadImagesForOneLopDaoTaoNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.lopdaotaonhanvienCurrent = action.payload;
      state.hocvienCurrents = state.hocvienCurrents.map((item) =>
        item._id === action.payload._id
          ? { ...item, Images: action.payload.Images }
          : item
      );
    },

    resetLopDaoTaoCurrentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("resetLopDaoTaoCurrentSuccess");
      state.lopdaotaoCurrent = {};
      state.hocvienCurrents = [];
      state.vaitroquydoiCurents = [];

      state.vaitroCurrent = {};
    },
    getOneLopDaoTaoByIDSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      state.lopdaotaoCurrent = action.payload.lopdaotao;
console.log("action.payload getOneLopDaoTaoByIDSuccess", action.payload);
      state.vaitroquydoiCurents =
        action.payload.HinhThucCapNhat.find(
          (item) => item.Ma === state.lopdaotaoCurrent.MaHinhThucCapNhat
        )?.VaiTroQuyDoi || [];
      state.vaitroCurrent = state.vaitroquydoiCurents[0]?.VaiTro || {};

      //set dư lieu cho lopdao tao DT06
      state.quatrinhdt06 = action.payload.lopdaotaonhanvienDT06.map((item) => {
        return {
          ...item,
          TuNgayFormat: formatDate_getDate(item.TuNgay),
          DenNgayFormat: formatDate_getDate(item.DenNgay),
        };
      });

      state.hocviendt06Current =
        action.payload.lopdaotaonhanvien[0]?.NhanVienID || {};
      //load dữ liệu cho hocvienCurrents từ lopdaotaonhanvien khi tam=false, từ lopdaotaonhanvientam khi tam=true
      if (!action.payload.tam) {
        state.hocvienCurrents = action.payload.lopdaotaonhanvien.map((item) => {
          const diemdanhSections = item.DiemDanh.reduce(
            (acc, diemdanh, index) => {
              acc[`section ${index + 1}`] = diemdanh;
              return acc;
            },
            {}
          );
          const vaitroquydoi = state.vaitroquydoiCurents.find(
            (vtqd) => vtqd.VaiTro === item.VaiTro
          );
          const soluong = item.DiemDanh.filter((item) => item === true).length;
          const tinhtudong = vaitroquydoi.QuyDoi * soluong;
          return {
            ...item.NhanVienID,

            ...item,
            NhanVienID: item.NhanVienID._id,
            TenKhoa: item.NhanVienID.KhoaID.TenKhoa,
            Sex: item.NhanVienID.GioiTinh === 0 ? "Nam" : "Nữ",
            DonVi: vaitroquydoi.DonVi,
            QuyDoi: vaitroquydoi.QuyDoi,
            SoLuong: soluong,
            TuDong: tinhtudong,
            ...diemdanhSections,
          };
        });
      } else {
        state.hocvienCurrents = action.payload.lopdaotaonhanvien.map((item) => {
          return {
            ...item.NhanVienID,

            ...item,
            NhanVienID: item.NhanVienID._id,
            TenKhoa: item.NhanVienID.KhoaID.TenKhoa,
            Sex: item.NhanVienID.GioiTinh === 0 ? "Nam" : "Nữ",
          };
        });
      }
    },
    setVaiTroCurrentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.vaitroCurrent = action.payload;
    },
    setVaiTroQuyDoiCurrentsWithCaseIsHoiDongSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.vaitroquydoiCurents = action.payload;
    },
    addselectedHocVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const hocviens = action.payload.map((item) => ({
        ...item,
        NhanVienID: item._id,
        VaiTro: state.vaitroCurrent ? state.vaitroCurrent : "",
      }));
      state.hocvienCurrents = state.hocvienCurrents.concat(hocviens);
    },
    removeHocVienFromHocVienCurrentsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.hocvienCurrents = state.hocvienCurrents.filter(
        (item) => item._id !== action.payload
      );
    },
    insertOrUpdateLopDaoTaoNhanVienSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    },
    updateLopDaoTaoNhanVienDiemDanhSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    },
    dongboThanhVienTamByLopDaoTaoIDSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.hocvienCurrents = action.payload.map((item) => ({
        ...item.NhanVienID,
        ...item,
        NhanVienID: item.NhanVienID._id,
        TenKhoa: item.NhanVienID.KhoaID.TenKhoa,
        Sex: item.NhanVienID.GioiTinh === 0 ? "Nam" : "Nữ",
      }));
    },

    //them moi qua trinh tich luy DT06
    insertOneQuaTrinhDT06Success(state, action) {
      state.isLoading = false;
      state.error = null;
      state.quatrinhdt06.unshift({
        ...action.payload,
        TuNgayFormat: formatDate_getDate(action.payload.TuNgay),
        DenNgayFormat: formatDate_getDate(action.payload.DenNgay),
      });
    },
    //Update qua trinh tich luy DT06
    updateOneQuaTrinhDT06Success(state, action) {
      state.isLoading = false;
      state.error = null;
      state.quatrinhdt06 = state.quatrinhdt06.map((item) =>
        item._id === action.payload._id
          ? {
              ...action.payload,
              TuNgayFormat: formatDate_getDate(action.payload.TuNgay),
              DenNgayFormat: formatDate_getDate(action.payload.DenNgay),
            }
          : item
      );
    },
    //delete quatrinh dt06
    deleteOneQuaTrinhDT06Success(state, action) {
      state.isLoading = false;
      state.error = null;
      state.quatrinhdt06 = state.quatrinhdt06.filter(
        (item) => item._id !== action.payload
      );
    },

    //reset hocvienCurrents

    setHocVienCurrentsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      state.hocvienCurrents = action.payload;
    },
    //reset hocvienCurrents

    setDataExportSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      state.dataExport = action.payload;
    },

    // xử lý khi thay đổi hội đồng current
    setHoiDongCurrentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.hoidongCurrent = action.payload;
      
    },
    updateHocVienCurrentsWhenHoiDongChangedSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    
      state.hocvienCurrents = updateHocVienCurrents(
        state.hocvienCurrents,
        action.payload.thanhvienOld,
        action.payload.thanhvienNew
      );
    },
  },
});
export default slice.reducer;

export const insertOneLopDaoTao =
  ({ lopdaotaoData, vaitroquydoi }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.post(`/lopdaotao`, { lopdaotaoData });

      dispatch(
        slice.actions.insertOneLopDaoTaoSuccess({
          data: response.data.data,
          vaitroquydoi,
        })
      );
      toast.success("Thêm mới thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const updateOneLopDaoTao =
  ({ lopdaotaoData, vaitroquydoi }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.put(`/lopdaotao`, lopdaotaoData);
      dispatch(
        slice.actions.updateOneLopDaoTaoSuccess({
          data: response.data.data,
          vaitroquydoi,
        })
      );
      toast.success("Cập nhật thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const updateHoiDongForLopDaoTao =
  ({ hoidongID, lopdaotaoID }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.put(`/lopdaotao/updatehoidong`, {
        hoidongID,
        lopdaotaoID,
      });
      dispatch(
        slice.actions.updateHoiDongForLopDaoTaoSuccess({
          hoidongID,
          lopdaotaoID,
        })
      );
      toast.success("Cập nhật hội đồng thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
export const updateTrangThaiLopDaoTao =
  ({ TrangThai, lopdaotaoID }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.put(`/lopdaotao/trangthai`, {
        TrangThai,
        lopdaotaoID,
      });
      dispatch(
        slice.actions.updateTrangThaiLopDaoTaoSuccess({
          TrangThai,
          lopdaotaoID,
        })
      );
      toast.success("Cập nhật thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const deleteOneLopDaoTao = (lopdaotaoID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.delete(`/lopdaotao/${lopdaotaoID}`);
    dispatch(slice.actions.deleteOneLopDaoTaoSuccess(lopdaotaoID));
    toast.success("Xóa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getOneLopDaoTaoByID =
  ({ lopdaotaoID, tam, userID }) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading);
    const params = { lopdaotaoID, tam, userID };
    try {
      const [_, response] = await Promise.all([
        dispatch(getAllHinhThucCapNhat()), // Gọi hành động để lấy tất cả HinhThucCapNhat
        apiService.get(`/lopdaotao/getextra`, { params }), // Gọi API để lấy thông tin LopDaoTao
      ]);
      console.log("response getbylopdaotaoid", response.data.data);
      const HinhThucCapNhat = await getState().hinhthuccapnhat.HinhThucCapNhat;
      console.log("tam", tam);
      dispatch(
        slice.actions.getOneLopDaoTaoByIDSuccess({
          lopdaotao: response.data.data.lopdaotao,
          lopdaotaonhanvien: response.data.data.lopdaotaonhanvien,
          lopdaotaonhanvienDT06: response.data.data.lopdaotaonhanvienDT06,
          HinhThucCapNhat,
          tam,
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const resetLopDaoTaoCurrent = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.resetLopDaoTaoCurrentSuccess());
    return Promise.resolve(); // Đảm bảo trả về một Promise
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    return Promise.reject(error);
  }
};

export const getAllLopDaoTao = () => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.get("/lopdaotao");

    dispatch(
      slice.actions.getAllLopDaoTaoSuccess(response.data.data.lopdaotaos)
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const setVaiTroCurrent = (vaitro) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setVaiTroCurrentSuccess(vaitro));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const addselectedHocVien = (hocviens) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.addselectedHocVienSuccess(hocviens));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const removeHocVienFromHocVienCurrents = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.removeHocVienFromHocVienCurrentsSuccess(id));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const insertOrUpdateLopDaoTaoNhanVien =
  ({ lopdaotaonhanvienData, lopdaotaoID, tam = false, userID }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading);
    let response;
    try {
      if (!tam) {
        response = await apiService.post(`/lopdaotaonhanvien`, {
          lopdaotaonhanvienData,
          lopdaotaoID,
        });
      } else {
        response = await apiService.post(`/lopdaotaonhanvientam`, {
          lopdaotaonhanvienData,
          lopdaotaoID,
          userID,
        });
      }
      dispatch(
        slice.actions.insertOrUpdateLopDaoTaoNhanVienSuccess({
          data: response.data.data,
        })
      );
      toast.success("Cập nhật thành viên thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const updateLopDaoTaoNhanVienDiemDanh =
  (lopdaotaonhanvienDiemDanhData) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.put(`/lopdaotaonhanvien`, {
        lopdaotaonhanvienDiemDanhData,
      });

      dispatch(
        slice.actions.updateLopDaoTaoNhanVienDiemDanhSuccess({
          data: response.data.data,
        })
      );
      toast.success("Cập nhật thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const dongboThanhVienTamByLopDaoTaoID =
  ({ lopdaotaoID }) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading);

    try {
      const response = await apiService.get(
        `/lopdaotao/dongbothanhvientam/${lopdaotaoID}`
      );

      dispatch(
        slice.actions.dongboThanhVienTamByLopDaoTaoIDSuccess(response.data.data)
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const getOneLopDaoTaoNhanVienByID =
  (lopdaotaonhanvienID) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.get(
        `/lopdaotaonhanvien/${lopdaotaonhanvienID}`
      );
      console.log("data lopdaotaotaonhanvie get one", response.data.data);
      dispatch(
        slice.actions.getOneLopDaoTaoNhanVienByIDSuccess(response.data.data)
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
export const setOpenUploadLopDaoTaoNhanVien = (open) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setOpenUploadLopDaoTaoNhanVienSuccess(open));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
export const uploadImagesForOneLopDaoTaoNhanVien =
  (lopdaotaonhanvien, images) => async (dispatch) => {
    try {
      //Nếu có ảnh mới thì upload lên cloudinary
      if (images.length > 0) {
        const newImages = await uploadImagesToCloudinary(images);
        // console.log("newImages upload", newImages);
        lopdaotaonhanvien.Images = [...lopdaotaonhanvien.Images, ...newImages];
      }
      const response = await apiService.put(`/lopdaotaonhanvien/upload`, {
        lopdaotaonhanvienID: lopdaotaonhanvien._id,
        Images: lopdaotaonhanvien.Images,
      });
      console.log("response upload images", response.data.data);
      dispatch(
        slice.actions.uploadImagesForOneLopDaoTaoNhanVienSuccess(
          response.data.data
        )
      );

      toast.success("Cập nhật thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const insertOneQuaTrinhDT06 =
  (lopdaotaonhanvienDT06Data) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.post(
        `/lopdaotaonhanviendt06`,
        lopdaotaonhanvienDT06Data
      );
      dispatch(slice.actions.insertOneQuaTrinhDT06Success(response.data.data));
      toast.success("Thêm mới thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const updateOneQuaTrinhDT06 =
  (lopdaotaonhanvienDT06Data) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      const response = await apiService.put(
        `/lopdaotaonhanviendt06`,
        lopdaotaonhanvienDT06Data
      );
      dispatch(slice.actions.updateOneQuaTrinhDT06Success(response.data.data));
      toast.success("Cập nhật thành công");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const deleteOneQuaTrinhDT06 = (quatrinhdt06ID) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    const response = await apiService.delete(
      `/lopdaotaonhanviendt06/${quatrinhdt06ID}`
    );
    dispatch(slice.actions.deleteOneQuaTrinhDT06Success(quatrinhdt06ID));
    toast.success("Xóa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const setVaiTroQuyDoiCurrentsWithCaseIsHoiDong =
  (vaitro) => async (dispatch) => {
    dispatch(slice.actions.startLoading);
    try {
      dispatch(
        slice.actions.setVaiTroQuyDoiCurrentsWithCaseIsHoiDongSuccess(vaitro)
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

export const setHocVienCurrents = (thanhvien) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setHocVienCurrentsSuccess(thanhvien));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const setDataExport = (dataExport) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setDataExportSuccess(dataExport));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const setTypeHinhThucCapNhat = (type) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
    dispatch(slice.actions.setTypeHinhThucCapNhatSuccess(type));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const setHoiDongCurrent = (hoidong) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
 
    dispatch(slice.actions.setHoiDongCurrentSuccess(hoidong));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateHocVienCurrentsWhenHoiDongChanged = (thanhvien) => async (dispatch) => {
  dispatch(slice.actions.startLoading);
  try {
 
    dispatch(slice.actions.updateHocVienCurrentsWhenHoiDongChangedSuccess(thanhvien));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

function updateHocVienCurrents(hocvienCurrents, thanhvienOld, thanhvienNew) {
  
  // Bước 1: Xóa các phần tử trong hocvienCurrents mà có NhanVienID và VaiTro trùng với thanhvienOld
  hocvienCurrents = hocvienCurrents.filter((hocvien) => {
    return !thanhvienOld.some(
      (thanhvien) =>
        hocvien.NhanVienID === thanhvien.NhanVienID &&
        hocvien.VaiTro === thanhvien.VaiTro
    );
  });

  // Bước 2: Thêm các phần tử trong thanhvienNew vào hocvienCurrents
  hocvienCurrents.push(...thanhvienNew);

  return hocvienCurrents;
}
