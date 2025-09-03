// API service for hierarchical task tree (cây công việc)
// Sử dụng endpoint backend thật. Có fallback mock khi cần (DEV_MOCK_TREE=true)
import apiService from "../../../app/apiService";

// Example task shape reference:
// {
//   _id: 'task1',
//   TenCongViec: 'Tên công việc',
//   MaCongViec: 'CV001',
//   ParentID: null,
//   ChildrenCount: 3,
//   TrangThai: 2,
//   DoUuTien: 1,
//   PhanTramTienDoTong: 45,
//   HanHoanThanh: '2024-12-31',
//   PhuTrach: [{ _id: 'nv1', TenNhanVien: 'Nguyễn A' }]
// }

// Util to simulate latency
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// Generate deterministic mock children from a parent id for now
function mockChildren(parentId, level, maxLevel) {
  if (level > maxLevel) return [];
  const count = Math.max(0, 3 - level); // fewer deeper
  return Array.from({ length: count }).map((_, idx) => {
    const id = `${parentId}-${idx + 1}`;
    return {
      _id: id,
      TenCongViec: `Công việc ${id}`,
      MaCongViec: `CV-${id}`,
      ParentID: parentId === "root" ? null : parentId,
      ChildrenCount: level < maxLevel ? Math.max(0, 3 - level - 1) : 0,
      TrangThai: (idx % 4) + 1,
      DoUuTien: (idx % 3) + 1,
      PhanTramTienDoTong: (idx * 17 + level * 11) % 100,
      HanHoanThanh: "2025-12-31",
      PhuTrach: [
        { _id: "nv1", TenNhanVien: "Nguyễn Văn A" },
        { _id: "nv2", TenNhanVien: "Trần Thị B" },
      ].slice(0, (idx % 2) + 1),
    };
  });
}

export async function getRootTree(congViecId) {
  const useMock = process.env.REACT_APP_DEV_MOCK_TREE === "true";
  if (useMock) {
    await wait(200);
    const root = {
      _id: congViecId || "root",
      TenCongViec: "Công việc gốc (MOCK)",
      MaCongViec: "CV-ROOT",
      ParentID: null,
      ChildrenCount: 2,
      TrangThai: "DANG_THUC_HIEN",
      DoUuTien: 2,
      PhanTramTienDoTong: 60,
      HanHoanThanh: "2025-06-30",
      PhuTrach: [{ _id: "nv1", TenNhanVien: "Nguyễn Văn A" }],
    };
    const children = mockChildren(root._id, 1, 3);
    return { root, children };
  }
  const id = congViecId;
  const res = await apiService.get(`/workmanagement/congviec/${id}/tree-root`);
  // Backend returns {root, children}
  return res.data?.data || { root: null, children: [] };
}

export async function getFullTree(congViecId) {
  const res = await apiService.get(
    `/workmanagement/congviec/${congViecId}/full-tree`
  );
  return res.data?.data || { root: null, children: [] };
}

export async function getChildren(parentId) {
  const useMock = process.env.REACT_APP_DEV_MOCK_TREE === "true";
  if (useMock) {
    await wait(150);
    const level = (parentId.match(/-/g) || []).length + 1;
    const children = mockChildren(parentId, level, 3);
    return { parentId, children };
  }
  const res = await apiService.get(
    `/workmanagement/congviec/${parentId}/tree-children`
  );
  return res.data?.data || { parentId, children: [] };
}
