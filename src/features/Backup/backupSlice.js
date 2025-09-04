import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  files: [],
};

const slice = createSlice({
  name: "backup",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getListSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.files = action.payload;
    },
  },
});

export default slice.reducer;

export const listBackups = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get("/backup/list");
    dispatch(slice.actions.getListSuccess(res.data.data.files));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const downloadBackup = () => async () => {
  try {
    const res = await apiService.get("/backup/download", {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${Date.now()}.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Tải backup thành công");
  } catch (error) {
    toast.error(error.message);
  }
};

export const restoreBackup = (file) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const fd = new FormData();
    fd.append("file", file);
    await apiService.post("/backup/restore", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Phục hồi dữ liệu yêu cầu thành công (kiểm tra server)");
    dispatch(listBackups());
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
