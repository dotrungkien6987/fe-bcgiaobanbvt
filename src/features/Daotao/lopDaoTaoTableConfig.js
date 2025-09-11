// Dynamic table configuration for LopDaoTao related types.
// Add or adjust entries here to customize columns per MaHinhThucCapNhat without touching backend.

export const lopDaoTaoTableConfig = {
  NCKH01: {
    title: "Quản lý nghiên cứu khoa học loại 1",
    overrideColumns: {
      Ten: { Header: "Tên đề tài" },
    },
    addAfter: {
      Ten: [{ accessor: "XepLoai", Header: "Xếp loại" }],
    },
    remove: ["QuyetDinh", "HinhThucDaoTao", "TenTapChi", "SoTapChi"],
  },
  NCKH02: {
    title: "Quản lý bài báo khoa học (Trong nước)",
    overrideColumns: { Ten: { Header: "Tên bài báo" } },
    addAfter: {
      Ten: [
        { accessor: "TenTapChi", Header: "Tên tạp chí" },
        { accessor: "SoTapChi", Header: "Số tạp chí" },
      ],
    },
    remove: ["QuyetDinh", "HinhThucDaoTao", "XepLoai"],
  },
  NCKH03: {
    title: "Quản lý bài báo khoa học (Quốc tế)",
    overrideColumns: { Ten: { Header: "Tên bài báo" } },
    addAfter: {
      Ten: [
        { accessor: "TenTapChi", Header: "Tên tạp chí" },
        { accessor: "SoTapChi", Header: "Số tạp chí" },
      ],
    },
    remove: ["QuyetDinh", "HinhThucDaoTao", "XepLoai"],
  },
  ĐT01: {
    title: "Quản lý lớp đào tạo",
    overrideColumns: { Ten: { Header: "Tên / Nội dung lớp" } },
  },
};

// Build columns based on base + config for a specific type.
export function buildLopDaoTaoColumns({ baseColumns, type }) {
  const cfg = lopDaoTaoTableConfig[type];
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

export function resolveLopDaoTaoTitle(
  type,
  fallback = "Quản lý lớp / hoạt động cập nhật"
) {
  return lopDaoTaoTableConfig[type]?.title || fallback;
}
