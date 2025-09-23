import apiService from "../../../app/apiService";

export async function fetchLopDaoTaoByYear(params = {}) {
  const resp = await apiService.get("/dashboard/lopdaotao-by-year", {
    params: {
      fromYear: params.fromYear ?? "",
      toYear: params.toYear ?? "",
      onlyCompleted: params.onlyCompleted ?? "false",
      tz: params.tz || "Asia/Ho_Chi_Minh",
      includeMeta: "true",
    },
  });
  // Axios shape: resp.data = { success?, data: { data: [...], filters... }, message? }
  return resp.data?.data;
}

// Fetch map of { Ma: TenBenhVien } for labeling, large page size to cover all
export async function fetchHinhThucCapNhatMap() {
  const resp = await apiService.get("/hinhthuccapnhat", {
    params: { page: 1, limit: 1000 },
  });
  const list = resp.data?.data?.hinhthuccapnhat || [];
  const map = {};
  for (const item of list) {
    if (item?.Ma) map[item.Ma] = item.TenBenhVien || item.Ten || item.Ma;
  }
  return map;
}

// New: Dashboard datasets by year for DoanRa, DoanVao, TapSan, TapSanBaiBao
export async function fetchDoanRaByYear(params = {}) {
  const resp = await apiService.get("/dashboard/doanra-by-year", {
    params: {
      fromYear: params.fromYear ?? "",
      toYear: params.toYear ?? "",
      tz: params.tz || "Asia/Ho_Chi_Minh",
    },
  });
  return resp.data?.data?.data || resp.data?.data || [];
}

export async function fetchDoanVaoByYear(params = {}) {
  const resp = await apiService.get("/dashboard/doanvao-by-year", {
    params: {
      fromYear: params.fromYear ?? "",
      toYear: params.toYear ?? "",
      tz: params.tz || "Asia/Ho_Chi_Minh",
    },
  });
  return resp.data?.data?.data || resp.data?.data || [];
}

export async function fetchTapSanByYear(params = {}) {
  const resp = await apiService.get("/dashboard/tapsan-by-year", {
    params: {
      fromYear: params.fromYear ?? "",
      toYear: params.toYear ?? "",
    },
  });
  return resp.data?.data?.data || resp.data?.data || [];
}

export async function fetchTapSanBaiBaoByYear(params = {}) {
  const resp = await apiService.get("/dashboard/tapsan-baibao-by-year", {
    params: {
      fromYear: params.fromYear ?? "",
      toYear: params.toYear ?? "",
    },
  });
  return resp.data?.data?.data || resp.data?.data || [];
}
