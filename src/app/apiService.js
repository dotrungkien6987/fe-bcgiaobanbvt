import axios from "axios";
import { BASE_URL } from "./config";

const apiService = axios.create({
  baseURL: BASE_URL,
});

console.log(BASE_URL);
apiService.interceptors.request.use(
  (request) => {
    console.log("Start Request", request);
    try {
      const token = localStorage.getItem("accessToken");
      if (token && !request.headers.Authorization) {
        request.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
    return request;
  },
  function (error) {
    console.log("REQUEST ERROR", { error });
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => {
    console.log("Response", response);
    return response;
  },
  function (error) {
    console.log("RESPONSE ERROR", { error });
    const message =
      error.response?.data?.message || // Backend AppError message
      error.response?.data?.errors?.message || // Nested error format
      error.message || // Axios error message
      "Đã có lỗi xảy ra"; // Fallback message
    return Promise.reject({ message });
  }
);

export default apiService;
