import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  uploadedFile: null,
  fileName:'',
  fileBlob: null,
  fileURL: null,
};

const slice = createSlice({
  name: "file",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    uploadFileSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      console.log("action.payload trong upload success",action.payload);
      state.uploadedFile = action.payload;
      state.fileName = action.payload.data.filename;
    },
    fetchFileSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.fileURL = action.payload;
      
    },
  },
});

export default slice.reducer;

export const uploadFile = (file) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiService.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    dispatch(slice.actions.uploadFileSuccess(response.data));
    toast.success("Upload file successfully");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error("Upload file failed");
  }
};

export const fetchFile = (filename) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(`/file/view/${filename}`, { responseType: "blob" });
    const fileUrl = URL.createObjectURL(response.data);
    dispatch(slice.actions.fetchFileSuccess(fileUrl));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error("Fetch file failed");
  }
};