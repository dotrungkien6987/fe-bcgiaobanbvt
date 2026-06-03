export const cc115ChiSoGroups = [
  {
    title: "Thống kê cấp cứu",
    fields: [
      {
        label: "Tổng số ca cấp cứu",
        code: "cc115-TongSoCaCapCuu",
        qtyName: "TongSoCaCapCuu_SoLuong",
        noteName: "TongSoCaCapCuu_GhiChu",
      },
      {
        label: "Số ca chuyển về BV điều trị",
        code: "cc115-ChuyenVeBVDieuTri",
        qtyName: "ChuyenVeBVDieuTri_SoLuong",
        noteName: "ChuyenVeBVDieuTri_GhiChu",
      },
      {
        label: "Số ca tử vong",
        code: "cc115-TuVong",
        qtyName: "TuVong_SoLuong",
        noteName: "TuVong_GhiChu",
      },
    ],
  },
  {
    title: "Thống kê vận chuyển",
    fields: [
      {
        label: "Tổng số ca vận chuyển",
        code: "cc115-TongSoCaVanChuyen",
        qtyName: "TongSoCaVanChuyen_SoLuong",
        noteName: "TongSoCaVanChuyen_GhiChu",
      },
      {
        label: "Chuyển viện",
        code: "cc115-ChuyenVien",
        qtyName: "ChuyenVien_SoLuong",
        noteName: "ChuyenVien_GhiChu",
      },
      {
        label: "Chuyển về gia đình",
        code: "cc115-VeGiaDinh",
        qtyName: "VeGiaDinh_SoLuong",
        noteName: "VeGiaDinh_GhiChu",
      },
    ],
  },
];

export const cc115ChiSoFields = cc115ChiSoGroups.flatMap(
  (group) => group.fields,
);

export const cc115PatientTypes = {
  tuVong: 10,
  capCuu: 11,
};
