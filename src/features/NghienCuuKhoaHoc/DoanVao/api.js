import apiService from "../../../app/apiService";

export const getAllDoanVao = (params) => apiService.get("/doanvao", { params });
export const getDoanVaoById = (id) => apiService.get(`/doanvao/${id}`);
export const createDoanVao = (data) => apiService.post("/doanvao", data);
export const updateDoanVao = (id, data) =>
  apiService.put(`/doanvao/${id}`, data);
export const deleteDoanVao = (id) => apiService.delete(`/doanvao/${id}`);
