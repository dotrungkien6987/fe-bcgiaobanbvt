import apiService from "../../../app/apiService";

export const getAllDoanRa = () => apiService.get("/doanra");
export const getDoanRaById = (id) => apiService.get(`/doanra/${id}`);
export const createDoanRa = (data) => apiService.post("/doanra", data);
export const updateDoanRa = (id, data) => apiService.put(`/doanra/${id}`, data);
export const deleteDoanRa = (id) => apiService.delete(`/doanra/${id}`);
