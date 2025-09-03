import { toast } from "react-toastify";

export function nodesToMap(nodes) {
  return nodes.reduce((acc, n) => {
    acc[n._id] = n;
    return acc;
  }, {});
}

export function checkNodeViewPermission(nhanVienId, node, allMap) {
  if (!nhanVienId || !node) return false;
  // 1. Người giao việc của chính node
  if (node.NguoiGiaoViecID === nhanVienId) return true;
  // 2. Người giao việc của bất kỳ ancestor
  let cur = node;
  while (cur && cur.ParentID && allMap[cur.ParentID]) {
    const parent = allMap[cur.ParentID];
    if (!parent) break;
    if (parent.NguoiGiaoViecID === nhanVienId) return true;
    cur = parent;
  }
  // 3. Người tham gia của chính node
  if (Array.isArray(node.NguoiThamGiaIds)) {
    if (node.NguoiThamGiaIds.includes(nhanVienId)) return true;
  }
  return false;
}

export function checkNodeViewPermissionWithToast(nhanVienId, node, allMap) {
  const ok = checkNodeViewPermission(nhanVienId, node, allMap);
  if (!ok) toast.warning("Bạn không có quyền hạn trong công việc này!");
  return ok;
}
