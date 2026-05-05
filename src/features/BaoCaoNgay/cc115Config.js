export const cc115ChiSoGroups = [
  {
    title: "Thống kê ngoại viện",
    fields: [
      {
        label: "Tổng số ca ngoại viện",
        trongGioName: "NgoaiVienTongTrongGio",
        ngoaiGioName: "NgoaiVienTongNgoaiGio",
        trongGioCode: "cc115-NgoaiVienTongTrongGio",
        ngoaiGioCode: "cc115-NgoaiVienTongNgoaiGio",
      },
      {
        label: "Số ca cấp cứu",
        trongGioName: "NgoaiVienCapCuuTrongGio",
        ngoaiGioName: "NgoaiVienCapCuuNgoaiGio",
        trongGioCode: "cc115-NgoaiVienCapCuuTrongGio",
        ngoaiGioCode: "cc115-NgoaiVienCapCuuNgoaiGio",
      },
      {
        label: "Số ca không phải cấp cứu",
        trongGioName: "NgoaiVienKhongCapCuuTrongGio",
        ngoaiGioName: "NgoaiVienKhongCapCuuNgoaiGio",
        trongGioCode: "cc115-NgoaiVienKhongCapCuuTrongGio",
        ngoaiGioCode: "cc115-NgoaiVienKhongCapCuuNgoaiGio",
      },
      {
        label: "Số ca chuyển về bệnh viện điều trị",
        trongGioName: "NgoaiVienChuyenBenhVienTrongGio",
        ngoaiGioName: "NgoaiVienChuyenBenhVienNgoaiGio",
        trongGioCode: "cc115-NgoaiVienChuyenBenhVienTrongGio",
        ngoaiGioCode: "cc115-NgoaiVienChuyenBenhVienNgoaiGio",
      },
      {
        label: "Số ca tử vong",
        trongGioName: "NgoaiVienTuVongTrongGio",
        ngoaiGioName: "NgoaiVienTuVongNgoaiGio",
        trongGioCode: "cc115-NgoaiVienTuVongTrongGio",
        ngoaiGioCode: "cc115-NgoaiVienTuVongNgoaiGio",
      },
    ],
  },
  {
    title: "Thống kê vận chuyển",
    fields: [
      {
        label: "Tổng số ca vận chuyển",
        trongGioName: "VanChuyenTongTrongGio",
        ngoaiGioName: "VanChuyenTongNgoaiGio",
        trongGioCode: "cc115-VanChuyenTongTrongGio",
        ngoaiGioCode: "cc115-VanChuyenTongNgoaiGio",
      },
      {
        label: "Chuyển viện",
        trongGioName: "VanChuyenChuyenVienTrongGio",
        ngoaiGioName: "VanChuyenChuyenVienNgoaiGio",
        trongGioCode: "cc115-VanChuyenChuyenVienTrongGio",
        ngoaiGioCode: "cc115-VanChuyenChuyenVienNgoaiGio",
      },
      {
        label: "Chuyển về gia đình",
        trongGioName: "VanChuyenVeGiaDinhTrongGio",
        ngoaiGioName: "VanChuyenVeGiaDinhNgoaiGio",
        trongGioCode: "cc115-VanChuyenVeGiaDinhTrongGio",
        ngoaiGioCode: "cc115-VanChuyenVeGiaDinhNgoaiGio",
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
