import apiService from "app/apiService";

export async function fetchDoanRaMembers(params) {
  const res = await apiService.get("/doanra/members", { params });
  return (
    res.data?.data || {
      items: [],
      total: 0,
      page: 1,
      limit: params?.limit || 20,
    }
  );
}

export async function fetchDoanVaoMembers(params) {
  const res = await apiService.get("/doanvao/members", { params });
  return (
    res.data?.data || {
      items: [],
      total: 0,
      page: 1,
      limit: params?.limit || 20,
    }
  );
}
