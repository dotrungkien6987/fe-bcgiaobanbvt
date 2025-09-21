// Group-based dynamic table configuration.
// Thay vì cấu hình lặp lại theo từng mã (NCKH01, NCKH02...), ta gom nhóm để dễ bảo trì.
// Quy tắc:
//  - "codes": danh sách mã cụ thể thuộc nhóm.
//  - "prefix": áp dụng cho mọi mã bắt đầu với tiền tố (nếu muốn mở rộng tự động theo chuẩn mã).
//  - Ưu tiên tìm theo codes trước, nếu không khớp sẽ xét prefix.
//  - Các thuộc tính cấu hình cột giữ nguyên ý nghĩa như bản cũ.

export const lopDaoTaoGroupConfig = {
  NCKH_DE_TAI: {
    title: "Quản lý nghiên cứu khoa học (Đề tài)",
    // Hỗ trợ string hoặc object { code, title }
    codes: [
      { code: "NCKH011", title: "Đề tài khoa học cấp cơ sở" },
      { code: "NCKH012", title: "Đề tài khoa học cấp tỉnh" },
      { code: "NCKH013", title: "Đề tài khoa học cấp bộ" },
      { code: "NCKH014", title: "Đề tài khoa học cấp quốc gia" },
    ],
    overrideColumns: { Ten: { Header: "Tên đề tài" } },
    addAfter: { Ten: [{ accessor: "XepLoai", Header: "Xếp loại" }] },
    remove: ["HinhThucDaoTao", "TenTapChi", "SoTapChi", "CanBoThamGia"],
  },
  NCKH_SANG_KIEN: {
    title: "Quản lý Sáng kiến",
    // Hỗ trợ string hoặc object { code, title }
    codes: [
      { code: "NCKH015", title: "Sáng kiến cấp cơ sở" },
      { code: "NCKH016", title: "Sáng kiến cấp tỉnh" },
      { code: "NCKH017", title: "Sáng kiến cấp bộ" },
      { code: "NCKH018", title: "Sáng kiến cấp nhà nước" },
    ],
    overrideColumns: { Ten: { Header: "Tên sáng kiến" } },
    addAfter: { Ten: [{ accessor: "XepLoai", Header: "Xếp loại" }] },
    remove: ["HinhThucDaoTao", "TenTapChi", "SoTapChi", "CanBoThamGia"],
  },
  NCKH_BAI_BAO: {
    title: "Quản lý bài báo khoa học",
    codes: [
      { code: "NCKH02", title: "Đăng báo quốc tế" },
      { code: "NCKH03", title: "Đăng báo trong nước" },
    ],
    overrideColumns: { Ten: { Header: "Tên bài báo" } },
    addAfter: {
      Ten: [
        { accessor: "TenTapChi", Header: "Tên tạp chí" },
        { accessor: "SoTapChi", Header: "Số tạp chí" },
      ],
    },
    remove: ["QuyetDinh", "HinhThucDaoTao", "XepLoai"],
  },
  DAO_TAO: {
    title: "Quản lý lớp đào tạo",
    prefix: "ĐT", // áp dụng cho mọi mã bắt đầu bằng ĐT
    overrideColumns: { Ten: { Header: "Tên / Nội dung lớp" } },
  },
};

// Backward compatible export name (nếu nơi khác vẫn import lopDaoTaoTableConfig)
export const lopDaoTaoTableConfig = lopDaoTaoGroupConfig;

// Resolve group key từ mã cụ thể
export function resolveGroupKey(code) {
  if (!code) return null;
  for (const key of Object.keys(lopDaoTaoGroupConfig)) {
    const g = lopDaoTaoGroupConfig[key];
    if (!g.codes) continue;
    for (const item of g.codes) {
      if (typeof item === "string" && item === code) return key;
      if (typeof item === "object" && item.code === code) return key;
    }
  }
  for (const key of Object.keys(lopDaoTaoGroupConfig)) {
    const g = lopDaoTaoGroupConfig[key];
    if (g.prefix && code.startsWith(g.prefix)) return key;
  }
  return null;
}

export function getGroupConfigByCode(code) {
  const key = resolveGroupKey(code);
  return key ? lopDaoTaoGroupConfig[key] : null;
}

// Trả về title cho 1 code: ưu tiên title gán cho mã cụ thể, sau đó title của group, cuối cùng fallback
export function getTitleForCode(
  code,
  fallback = "Quản lý lớp / hoạt động cập nhật"
) {
  if (!code) return fallback;
  // tìm mã cụ thể trong codes
  for (const key of Object.keys(lopDaoTaoGroupConfig)) {
    const g = lopDaoTaoGroupConfig[key];
    if (!g.codes) continue;
    for (const item of g.codes) {
      if (typeof item === "object" && item.code === code && item.title)
        return item.title;
      if (typeof item === "string" && item === code && g.title) return g.title;
    }
  }
  // nếu không có mã cụ thể, lấy title của group theo prefix/codes
  const cfg = getGroupConfigByCode(code);
  if (cfg?.title) return cfg.title;
  return fallback;
}

// Build columns theo group (thay vì mã lẻ)
export function buildLopDaoTaoColumnsByGroup({ baseColumns, code }) {
  const cfg = getGroupConfigByCode(code);
  if (!cfg) return baseColumns;
  let cols = baseColumns.map((c) => ({ ...c }));
  if (cfg.remove?.length) {
    cols = cols.filter((c) => !cfg.remove.includes(c.accessor));
  }
  if (cfg.overrideColumns) {
    cols = cols.map((c) =>
      cfg.overrideColumns[c.accessor]
        ? { ...c, ...cfg.overrideColumns[c.accessor] }
        : c
    );
  }
  if (cfg.addAfter) {
    const withInserted = [];
    cols.forEach((c) => {
      withInserted.push(c);
      const inserts = cfg.addAfter[c.accessor];
      if (inserts) {
        inserts.forEach((nc) =>
          withInserted.push({
            Header: nc.Header,
            Footer: nc.Footer || nc.Header,
            accessor: nc.accessor,
            disableGroupBy: true,
          })
        );
      }
    });
    cols = withInserted;
  }
  return cols;
}

export function resolveLopDaoTaoTitleByCode(
  code,
  fallback = "Quản lý lớp / hoạt động cập nhật"
) {
  return getTitleForCode(code, fallback);
}

// Helper: chèn cột "# Tệp" vào sau accessor chỉ định
export function insertAttachmentsColumn({
  columns,
  positionAfterAccessor = "SoThanhVien",
  cellRenderer,
  width = 90,
}) {
  const out = [];
  let inserted = false;
  for (const c of columns) {
    out.push(c);
    if (!inserted && c.accessor === positionAfterAccessor) {
      out.push({
        Header: "# Tệp",
        id: "AttachmentsCount",
        accessor: (row) => row._id,
        width,
        disableGroupBy: true,
        Cell: cellRenderer,
      });
      inserted = true;
    }
  }
  if (!inserted) {
    out.push({
      Header: "# Tệp",
      id: "AttachmentsCount",
      accessor: (row) => row._id,
      width,
      disableGroupBy: true,
      Cell: cellRenderer,
    });
  }
  return out;
}
