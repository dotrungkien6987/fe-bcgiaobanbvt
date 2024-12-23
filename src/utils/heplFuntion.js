import { useSelector } from "react-redux";

export function removeAndRenumber(benhnhans, n) {
  // Remove the element with Stt = n
  const filteredBenhnhans = benhnhans.filter((benhNhan) => benhNhan.Stt !== n);

  // Renumber the Stt for remaining elements
  return filteredBenhnhans.map((benhNhan, index) => {
    return { ...benhNhan, Stt: index + 1 }; // Stt starts from 1
  });
}
export function getTextFromNumber(number) {
  const mapping = {
    1: "tử vong",
    2: "chuyển viện",
    3: "nặng xin về",
    4: "nặng tại khoa",
    5: "phẫu thuật",
    6: "vào viện ngoài giờ",
    7: "can thiệp",
    8:"theo dõi",
  };
  return mapping[number] || "Invalid input";
}
// export function filterChiTietBenhNhans(baocaongays, LoaiBN, LoaiKhoa) {
//   return baocaongays
//     .filter(baocaongay => baocaongay.KhoaID.LoaiKhoa === LoaiKhoa)
//     .map(baocaongay => baocaongay.ChiTietBenhNhan)
//     .reduce((acc, chitietArray) => {
//       const filtered = chitietArray.filter(chitiet => chitiet.LoaiBN === LoaiBN);
//       return acc.concat(filtered);
//     }, []);
// }

export function filterChiTietBenhNhansNotExcludeTTCLC(
  baocaongays,
  LoaiBN,
  LoaiKhoa
) {
  // Mảng các MaKhoa không được phép
  // const excludedMaKhoa = ["NoiYC", "NgoaiYC", "HSCCYC"]; //tam ngung chuc nang nay

  const excludedMaKhoa = [""]; //tam ngung nen sua tam

  return baocaongays
    .filter((baocaongay) => {
      // Kiểm tra LoaiKhoa và MaKhoa không nằm trong mảng excludedMaKhoa
      return (
        baocaongay.KhoaID.LoaiKhoa === LoaiKhoa &&
        !excludedMaKhoa.includes(baocaongay.KhoaID.MaKhoa)
      );
    })
    .map((baocaongay) => {
      const tenKhoa = baocaongay.KhoaID.TenKhoa;
      return baocaongay.ChiTietBenhNhan.map((chitiet) => {
        // Thêm trường TenKhoa vào mỗi ChiTietBenhNhan
        return { ...chitiet, TenKhoa: tenKhoa };
      });
    })
    .reduce((acc, chitietArray) => {
      const filtered = chitietArray.filter(
        (chitiet) => chitiet.LoaiBN === LoaiBN
      );
      return acc.concat(filtered);
    }, []);
}
export function filterChiTietBenhNhansHasExcludeTTCLC(
  baocaongays,
  LoaiBN,
  LoaiKhoa
) {
  // Mảng các MaKhoa không được phép
  const excludedMaKhoa = ["NoiYC", "NgoaiYC", "HSCCYC"];
  return baocaongays
    .filter((baocaongay) => {
      // Kiểm tra LoaiKhoa và MaKhoa không nằm trong mảng excludedMaKhoa
      return (
        baocaongay.KhoaID.LoaiKhoa === LoaiKhoa &&
        !excludedMaKhoa.includes(baocaongay.KhoaID.MaKhoa)
      );
    })
    .map((baocaongay) => {
      const tenKhoa = baocaongay.KhoaID.TenKhoa;
      return baocaongay.ChiTietBenhNhan.map((chitiet) => {
        // Thêm trường TenKhoa vào mỗi ChiTietBenhNhan
        return { ...chitiet, TenKhoa: tenKhoa };
      });
    })
    .reduce((acc, chitietArray) => {
      const filtered = chitietArray.filter(
        (chitiet) => chitiet.LoaiBN === LoaiBN
      );
      return acc.concat(filtered);
    }, []);
}

export function filterChiTietBenhNhansCLC(baocaongays, LoaiBN, MaKhoas) {
  return baocaongays
    .filter((baocaongay) => {
      // Kiểm tra MaKhoa có nằm trong mảng MaKhoas hay không
      return MaKhoas.includes(baocaongay.KhoaID.MaKhoa);
    })
    .map((baocaongay) => {
      const tenKhoa = baocaongay.KhoaID.TenKhoa;
      return baocaongay.ChiTietBenhNhan.map((chitiet) => {
        // Thêm trường TenKhoa vào mỗi ChiTietBenhNhan
        return { ...chitiet, TenKhoa: tenKhoa };
      });
    })
    .reduce((acc, chitietArray) => {
      const filtered = chitietArray.filter(
        (chitiet) => chitiet.LoaiBN === LoaiBN
      );
      return acc.concat(filtered);
    }, []);
}

export function findKhoasInBaocaongays(baocaongays, khoas) {
  // Tạo một Set để lưu trữ các _id của khoa đã xuất hiện trong baocaongays
  const khoaGiaoBan = khoas.filter(
    (khoa) =>
      khoa.LoaiKhoa === "noi" ||
      khoa.LoaiKhoa === "ngoai" ||
      khoa.LoaiKhoa === "pkyc" ||
      khoa.LoaiKhoa === "xnhh" ||
      khoa.LoaiKhoa === "kkb" ||
      khoa.LoaiKhoa === "gmhs" ||
      khoa.LoaiKhoa === "xnhs" ||
      khoa.LoaiKhoa === "xnhh" ||
      khoa.LoaiKhoa === "xnvs" ||
      khoa.LoaiKhoa === "tdcn" ||
      khoa.LoaiKhoa === "clc" ||
      khoa.LoaiKhoa === "hhtm" ||
      khoa.LoaiKhoa === "kkb" 
  );
  
  const khoaIdsInBaocaongays = new Set(
    baocaongays.map((baocaongay) => baocaongay.KhoaID._id)
  );

  // Lọc ra các khoa có _id tồn tại trong baocaongays
  const KhoaDaGuis = khoaGiaoBan.filter((khoa) => khoaIdsInBaocaongays.has(khoa._id));

  // Lọc ra các khoa có _id không tồn tại trong baocaongays
  const KhoaChuaGuis = khoaGiaoBan.filter(
    (khoa) => !khoaIdsInBaocaongays.has(khoa._id)
  );

  return { KhoaDaGuis, KhoaChuaGuis };
}

//hàm gom giá trị các chỉ số vào object
export function extractChiSo(baocaongays, chisoCodes) {
  // Khởi tạo một đối tượng để lưu trữ SoLuong của từng chỉ số
  const chiso = {};

  // Đặt giá trị ban đầu là 0 cho tất cả các key trong chisoCodes
  chisoCodes.forEach((code) => {
    chiso[code] = 0;
  });

  // Duyệt qua tất cả các baocaongays để lấy SoLuong của các chỉ số
  baocaongays.forEach((baocaongay) => {
    baocaongay.ChiTietChiSo.forEach((chitiet) => {
      if (chiso.hasOwnProperty(chitiet.ChiSoCode)) {
        chiso[chitiet.ChiSoCode] = chitiet.SoLuong;
      }
    });
  });

  return chiso;
}

export function TinhTongTheoChiSo(baocaongays, chisoCodes) {
  // Khởi tạo một đối tượng để lưu trữ tổng của từng chỉ số
  const chiso = {};

  // Đặt giá trị ban đầu là 0 cho tất cả các key trong chisoCodes
  chisoCodes.forEach((code) => {
    chiso[code] = 0;
  });

  // Duyệt qua tất cả các baocaongays để tính tổng các chỉ số
  baocaongays.forEach((baocaongay) => {
    baocaongay.ChiTietChiSo.forEach((chitiet) => {
      if (chiso.hasOwnProperty(chitiet.ChiSoCode)) {
        chiso[chitiet.ChiSoCode] += chitiet.SoLuong;
      }
    });
  });

  return chiso;
}

export function CheckDisplayKhoa(
  phanquyen,
  trangthaiduyet,
  makhoaUser,
  makhoaCurent
) {
  // If trangthaiduyet is true, return false
  if (trangthaiduyet) {
    return false;
  }

  // If phanquyen is 'admin', return true
  if (phanquyen === "admin") {
    return true;
  }

  // Return whether makhoaUser matches makhoaCurent
  return makhoaUser === makhoaCurent;
}

export const commonStyle = {
  color: "#1939B7",
  fontWeight: "bold",
  fontSize: "1rem",
  textAlign: "center",
  whiteSpace: "normal",
  wordWrap: "break-word",
  border: "1px solid #1939B7",
};
export const commonStyleTitle = {
  color: "#1939B7",
  fontWeight: "bold",
  fontSize: "1.5rem",
  textAlign: "center",
  whiteSpace: "normal",
  wordWrap: "break-word",
};
export const commonStyleDark = {
  color: "#FFF",
  fontWeight: "bold",
  fontSize: "1rem",
  textAlign: "center",
  whiteSpace: "normal",
  wordWrap: "break-word",
  border: "1px solid #1939B7",
};
export const commonStyleLeft = {
  color: "#1939B7",
  fontWeight: "bold",
  fontSize: "1rem",

  whiteSpace: "normal",
  wordWrap: "break-word",
  border: "1px solid #1939B7",
};
export function getObjectByMaKhoa(arr, maKhoa) {
  return arr.filter((item) => item.KhoaID.MaKhoa === maKhoa);
}

export function addTenKhoaToUsers(users, khoas) {
  // Create a mapping from KhoaID to TenKhoa
  const khoaDict = {};
  khoas.forEach((khoa) => {
    khoaDict[khoa._id] = khoa.TenKhoa;
  });

  // Use map to create a new array of updated user objects
  const updatedUsers = users.map((user) => {
    const khoaID = user.KhoaID;
    if (khoaDict.hasOwnProperty(khoaID)) {
      return {
        ...user,
        TenKhoa: khoaDict[khoaID],
      };
    }
    return user;
  });

  return updatedUsers;
}

export function calculateTongChiSo(baocaongays) {
  let TongToanVien = 0;
  let BHYTToanVien = 0;
  let VienPhiToanVien = 0;

  let TongNoi = 0;
  let BHYTNoi = 0;
  let VienPhiNoi = 0;

  let TongNgoai = 0;
  let BHYTNgoai = 0;
  let VienPhiNgoai = 0;

  let TongCLC = 0;
  let BHYTCLC = 0;
  let VienPhiCLC = 0;

  for (const baocao of baocaongays) {
    for (const chiSo of baocao.ChiTietChiSo) {
      const isCLC = ["NoiYC", "NgoaiYC", "HSCCYC"].includes(
        baocao.KhoaID.MaKhoa
      );
      switch (chiSo.ChiSoCode) {
        case "ls-TongNB":
          if (baocao.KhoaID.LoaiKhoa === "noi") {
            TongNoi += chiSo.SoLuong;
          } else if (baocao.KhoaID.LoaiKhoa === "ngoai") {
            TongNgoai += chiSo.SoLuong;
          }
          if (isCLC) {
            TongCLC += chiSo.SoLuong;
          }
          TongToanVien += chiSo.SoLuong;
          break;
        case "ls-BaoHiem":
          if (baocao.KhoaID.LoaiKhoa === "noi") {
            BHYTNoi += chiSo.SoLuong;
          } else if (baocao.KhoaID.LoaiKhoa === "ngoai") {
            BHYTNgoai += chiSo.SoLuong;
          }
          if (isCLC) {
            BHYTCLC += chiSo.SoLuong;
          }
          BHYTToanVien += chiSo.SoLuong;
          break;
        case "ls-VienPhi":
          if (baocao.KhoaID.LoaiKhoa === "noi") {
            VienPhiNoi += chiSo.SoLuong;
          } else if (baocao.KhoaID.LoaiKhoa === "ngoai") {
            VienPhiNgoai += chiSo.SoLuong;
          }
          if (isCLC) {
            VienPhiCLC += chiSo.SoLuong;
          }
          VienPhiToanVien += chiSo.SoLuong;
          break;
        default:
          break;
      }
    }
  }

  return {
    TongToanVien: TongToanVien,
    BHYTToanVien: BHYTToanVien,
    VienPhiToanVien: VienPhiToanVien,
    TongNoi: TongNoi,
    BHYTNoi: BHYTNoi,
    VienPhiNoi: VienPhiNoi,
    TongNgoai: TongNgoai,
    BHYTNgoai: BHYTNgoai,
    VienPhiNgoai: VienPhiNgoai,
    TongCLC: TongCLC,
    BHYTCLC: BHYTCLC,
    VienPhiCLC: VienPhiCLC,
  };
}

export function getLoaiTonThuongNBfromChiTiet(TonThuongChiTiet) {
  const nhom1 = ["A"];

  const nhom2 = ["B", "C", "D"];
  const nhom3 = ["E", "F"];
  const nhom4 = ["G", "H", "I"];

  if (nhom1.includes(TonThuongChiTiet)) {
    return 1;
  } else if (nhom2.includes(TonThuongChiTiet)) {
    return 2;
  } else if (nhom3.includes(TonThuongChiTiet)) {
    return 3;
  } else if (nhom4.includes(TonThuongChiTiet)) {
    return 4;
  } else {
    return 0;
  }
}
export function getNhomNguyenNhanfromChiTiet(ChiTietNguyenNhan) {
  const nhom1 = [
    "Nhận thức (kiến thức, hiểu biết, quan niệm)",
    "Thực hành (kỹ năng thực hành không đúng quy định, hướng dẫn chuẩn hoặc thực hành theo quy định, hướng dẫn sai)",
    "Thái độ, hành vi, cảm xúc",
    "Giao tiếp",
    "Tâm sinh lý, thể chất, bệnh lý",
    "Các yếu tố xã hội",
  ];

  const nhom2 = [
    "Nhận thức (kiến thức, hiểu biết, quan niệm) ",
    "Thực hành (kỹ năng thực hành không đúng quy định, hướng dẫn chuẩn hoặc thực hành theo quy định, hướng dẫn sai) ",
    "Thái độ, hành vi, cảm xúc ",
    "Giao tiếp ",
    "Tâm sinh lý, thể chất, bệnh lý ",
    "Các yếu tố xã hội ",
  ];
  const nhom3 = [
    "Cơ sở vật chất, hạ tầng, trang thiết bị",
    "Khoảng cách đến nơi làm việc quá xa",
    "Đánh giá về độ an toàn, các nguy cơ rủi ro của môi trường làm việc",
    "Nội quy, quy định và đặc tính kỹ thuật",
  ];
  const nhom4 = [
    "Các chính sách, quy trình, hướng dẫn chuyên môn",
    "Tuân thủ quy trình thực hành chuẩn",
    "Văn hóa tổ chức ",
    "Làm việc nhóm",
  ];
  const nhom5 = [
    "Môi trường tự nhiên",
    "Sản phẩm, công nghệ và cơ sở hạ tầng",
    "Quy trình, hệ thống dịch vụ",
  ];
  const nhom6 = ["Các yếu tố không đề cập trong các mục từ 1 đến 5"];

  if (nhom1.includes(ChiTietNguyenNhan)) {
    return 1;
  } else if (nhom2.includes(ChiTietNguyenNhan)) {
    return 2;
  } else if (nhom3.includes(ChiTietNguyenNhan)) {
    return 3;
  } else if (nhom4.includes(ChiTietNguyenNhan)) {
    return 4;
  } else if (nhom5.includes(ChiTietNguyenNhan)) {
    return 5;
  } else if (nhom6.includes(ChiTietNguyenNhan)) {
    return 6;
  } else {
    return 0;
  }
}

export function getNhomSuCofromChiTiet(ChiTietNhomSuCo) {
  const nhom1 = [
    "Không có sự đồng ý của người bệnh/người nhà (đối với những kỹ thuật, thủ thuật quy định phải ký cam kết)",
    "Không thực hiện khi có chỉ định",
    "Thực hiện sai người bệnh",
    "Thực hiện sai thủ thuật/quy trình/ phương pháp điều trị",
    "Thực hiện sai vị trí phẫu thuật/thủ thuật",
    "Bỏ sót dụng cụ, vật tư tiêu hao trong quá trình phẫu thuật",
    "Tử vong trong thai kỳ",
    "Tử vong khi sinh",
    "Tử vong sơ sinh",
  ];

  const nhom2 = [
    "Nhiễm khuẩn huyết ",
    "Viêm phổi ",
    "Các loại nhiễm khuẩn khác",
    "Nhiễm khuẩn vết mổ",
    "Nhiễm khuẩn tiết niệu",
  ];
  const nhom3 = [
    "Cấp phát sai thuốc, dịch truyền",
    "Thiếu thuốc",
    "Sai liều, sai hàm lượng",
    "Sai thời gian",
    "Sai y lệnh",
    "Bỏ sót thuốc/liều thuốc",
    "Sai thuốc",
    "Sai người bệnh",
    "Sai đường dùng",
  ];
  const nhom4 = [
    "Phản ứng phụ, tai biến khi truyền máu",
    "Truyền nhầm máu, chế phẩm máu",
    "Truyền sai liều, sai thời điểm",
  ];
  const nhom5 = [
    "Thiếu thông tin hướng dẫn sử dụng",
    "Lỗi thiết bị",
    "Thiết bị thiếu hoặc không phù hợp",
  ];
  const nhom6 = [
    "Khuynh hướng tự gây hại tự tử",
    "Có hành động tự tử",
    "Quấy rối tình dục bởi nhân viên",
    "Trốn viện",
    "Quấy rối tình dục bởi người bệnh/ khách đến thăm",
    "Xâm hại cơ thể bởi người bệnh/khách đến thăm",
  ];
  const nhom7 = ["Té ngã"];
  const nhom8 = ["Bị hư hỏng, bị lỗi ", "Thiếu hoặc không phù hợp"];
  const nhom9 = [
    "Tính phù hợp, đầy đủ của dịch vụ khám bệnh, chữa bệnh",
    "Tính phù hợp, đầy đủ của nguồn lực",
    "Tính phù hợp, đầy đủ của chính sách, quy định, quy trình, hướng dẫn chuyên môn",
  ];
  const nhom10 = [
    "Tài liệu mất hoặc thiếu ",
    "Tài liệu không rõ ràng, không hoàn chỉnh ",
    "Thời gian chờ đợi kéo dài ",
    "Cung cấp hồ sơ tài liệu chậm",
    "Nhầm hồ sơ tài liệu",
    "Thủ tục hành chính phức tạp",
  ];
  const nhom11 = ["Các sự cố không đề cập trong các mục từ 1 đến 10"];

  if (nhom1.includes(ChiTietNhomSuCo)) {
    return 1;
  } else if (nhom2.includes(ChiTietNhomSuCo)) {
    return 2;
  } else if (nhom3.includes(ChiTietNhomSuCo)) {
    return 3;
  } else if (nhom4.includes(ChiTietNhomSuCo)) {
    return 4;
  } else if (nhom5.includes(ChiTietNhomSuCo)) {
    return 5;
  } else if (nhom6.includes(ChiTietNhomSuCo)) {
    return 6;
  } else if (nhom7.includes(ChiTietNhomSuCo)) {
    return 7;
  } else if (nhom8.includes(ChiTietNhomSuCo)) {
    return 8;
  } else if (nhom9.includes(ChiTietNhomSuCo)) {
    return 9;
  } else if (nhom10.includes(ChiTietNhomSuCo)) {
    return 10;
  } else if (nhom11.includes(ChiTietNhomSuCo)) {
    return 11;
  } else {
    return 0;
  }
}

export function addHospitalNameToPatients(patientsArray, hospitalsArray) {
  // Tạo một bản sao của mảng bệnh viện để tìm kiếm dễ dàng hơn
  const hospitalsMap = hospitalsArray.reduce((acc, hospital) => {
    acc[hospital.Ma] = hospital.Ten;
    return acc;
  }, {});

  // Duyệt qua mảng bnnoitruchuyenvien để thêm tên bệnh viện
  const patientsWithHospital = patientsArray.map((patient) => {
    const hospitalCode = patient.benhvienchuyentoi_code;
    const hospitalName = hospitalsMap[hospitalCode] || hospitalCode;
    return { ...patient, hospitalName };
  });

  return patientsWithHospital;
}

//mapping makhoa-departmentgroupid
const khoaToDepartmentGroupMapping = [
  {
    MaKhoa: "BND",
    departmentgroupid: 11,
  },
  {
    MaKhoa: "CanThiepTM",
    departmentgroupid: 126,
  },
  {
    MaKhoa: "KCC",
    departmentgroupid: 46,
  },
  {
    MaKhoa: "CT1",
    departmentgroupid: 57,
  },
  {
    MaKhoa: "CT2",
    departmentgroupid: 106,
  },
  {
    MaKhoa: "DaLieu",
    departmentgroupid: 63,
  },
  {
    MaKhoa: "GMHS",
    departmentgroupid: 25,
  },
  {
    MaKhoa: "HoaTri",
    departmentgroupid: 125,
  },
  {
    MaKhoa: "HSTC",
    departmentgroupid: 3,
  },
  {
    MaKhoa: "HHLS",
    departmentgroupid: 29,
  },
  {
    MaKhoa: "KKB",
    departmentgroupid: 24,
  },
  {
    MaKhoa: "Mat",
    departmentgroupid: 22,
  },
  {
    MaKhoa: "NgoaiTK",
    departmentgroupid: 15,
  },
  {
    MaKhoa: "NgoaiTTN",
    departmentgroupid: 14,
  },
  {
    MaKhoa: "NgoaiTH",
    departmentgroupid: 16,
  },
  {
    MaKhoa: "NoiHH",
    departmentgroupid: 131,
  },
  {
    MaKhoa: "NoiTK",
    departmentgroupid: 132,
  },
  {
    MaKhoa: "NoiTietDD",
    departmentgroupid: 8,
  },
  {
    MaKhoa: "NoiTM",
    departmentgroupid: 7,
  },
  {
    MaKhoa: "PhauThuatTMLN",
    departmentgroupid: 121,
  },
  {
    MaKhoa: "PhauThuatUB",
    departmentgroupid: 18,
  },
  {
    MaKhoa: "RHM",
    departmentgroupid: 21,
  },
  {
    MaKhoa: "TMH",
    departmentgroupid: 20,
  },
  {
    MaKhoa: "TDCN",
    departmentgroupid: 28,
  },
  {
    MaKhoa: "TuVan",
    departmentgroupid: 75,
  },
  {
    MaKhoa: "XaTri",
    departmentgroupid: 108,
  },
  {
    MaKhoa: "TTDotQuy",
    departmentgroupid: 124,
  },
  {
    MaKhoa: "CLC",
    departmentgroupid: 114,
  },
  {
    MaKhoa: "Than",
    departmentgroupid: 9,
  },
  {
    MaKhoa: "YDCT",
    departmentgroupid: 12,
  },
  {
    MaKhoa: "KBYC",
    departmentgroupid: 1005,
  },
  {
    MaKhoa: "NoiYC",
    departmentgroupid: 1001,
  },
  {
    MaKhoa: "NgoaiYC",
    departmentgroupid: 1002,
  },
  {
    MaKhoa: "HSCCYC",
    departmentgroupid: 1003,
  },
  {
    MaKhoa: "CDHA",
    departmentgroupid: 27,
  },
  {
    MaKhoa: "DQCT",
    departmentgroupid: 120,
  },

  // Thêm các mapping khác tùy theo cấu trúc và dữ liệu của bạn
];

export function Get_KhoaID_By_MaKhoa(makhoa) {
  const result = khoaToDepartmentGroupMapping.find(
    (item) => item.MaKhoa === makhoa
  );

  if (result) {
    return result.departmentgroupid;
  } else return 0;
}

export function calculateDoanhThuAdjusted(
  khuyencaokhoa,
  doanhthu_from_db,
  ngayhientai
) {
  const mapping = new Map(
    khoaToDepartmentGroupMapping.map((item) => [
      item.departmentgroupid,
      item.MaKhoa,
    ])
  );

  return doanhthu_from_db?.map((item, index) => {
    const MaKhoa = mapping.get(item.departmentgroupid);
    const khoaInfo = khuyencaokhoa.find((khoa) => khoa.MaKhoa === MaKhoa) || {};
    const KC_DoanhThu = khoaInfo.DoanhThu || 0;
    const TyLeBHYT = khoaInfo.TyLeBHYT || 0;
    const BHYT_KC = (KC_DoanhThu * TyLeBHYT) / 100;

    let TongThu, ThuTrucTiep, BHYT, MRI30;
    if (ngayhientai && ngayhientai === 1) {
      TongThu = 0;
      ThuTrucTiep = 0;
      BHYT = 0;
      MRI30 = 0;
    } else {
      TongThu = item.thutructiep + item.dongchitra + item.bhyt + item.tienmri30;
      ThuTrucTiep = item.thutructiep + item.dongchitra + item.tienmri30;
      BHYT = item.bhyt;
      MRI30 = item.tienmri30;
    }

    const TyLe_BHYT_KC =
      BHYT_KC !== 0 ? parseFloat(((BHYT / BHYT_KC) * 100).toFixed(1)) : 0;
    const TyLe_DoanhThu_KC =
      KC_DoanhThu !== 0
        ? parseFloat(((TongThu / KC_DoanhThu) * 100).toFixed(1))
        : 0;
    const ThuTrucTiep_KC = KC_DoanhThu - BHYT_KC;
    const TyLe_ThuTrucTiep_KC =
      ThuTrucTiep_KC !== 0
        ? parseFloat(((ThuTrucTiep / ThuTrucTiep_KC) * 100).toFixed(1))
        : 0;
    const KC_TyLe_TTT_DT = 100 - TyLeBHYT;
    const ThucTe_TyLe_TTT_DT =
      TongThu !== 0
        ? parseFloat(((ThuTrucTiep / TongThu) * 100).toFixed(1))
        : 0;
    const ThucTe_TyLe_BHYT_DT =
      TongThu !== 0 ? parseFloat(((BHYT / TongThu) * 100).toFixed(1)) : 0;

    return {
      STT: index + 1,
      TenKhoa: item.departmentgroupname,
      TongThu: TongThu,
      ThuTrucTiep: ThuTrucTiep,
      BHYT: BHYT,
      KC_DoanhThu: KC_DoanhThu,
      BHYT_KC: BHYT_KC,
      TyLe_BHYT_KC: TyLe_BHYT_KC,
      ThuTrucTiep_KC: ThuTrucTiep_KC,
      TyLe_ThuTrucTiep_KC: TyLe_ThuTrucTiep_KC,
      KC_TyLe_TTT_DT: KC_TyLe_TTT_DT,
      ThucTe_TyLe_TTT_DT: ThucTe_TyLe_TTT_DT,
      KC_TyLe_BHYT_DT: TyLeBHYT,
      ThucTe_TyLe_BHYT_DT: ThucTe_TyLe_BHYT_DT,
      TyLe_DoanhThu_KC: TyLe_DoanhThu_KC,
      MRI30: MRI30,
    };
  });
}

export function calculateTotalsAndAverages(results) {
  const summary = {
    TongThu: 0,
    ThuTrucTiep: 0,
    BHYT: 0,
    KC_DoanhThu: 0,
    BHYT_KC: 0,
    ThuTrucTiep_KC: 0,
    MRI30: 0,
    TyLe_BHYT_KC_Avg: 0,
    TyLe_ThuTrucTiep_KC_Avg: 0,
    KC_TyLe_TTT_DT_Avg: 0,
    ThucTe_TyLe_TTT_DT_Avg: 0,
    KC_TyLe_BHYT_DT_Avg: 0,
    ThucTe_TyLe_BHYT_DT_Avg: 0,
    TyLe_DoanhThu_KC_Avg: 0,
  };

  results.forEach((result) => {
    summary.TongThu += result.TongThu;
    summary.ThuTrucTiep += result.ThuTrucTiep;
    summary.BHYT += result.BHYT;
    summary.KC_DoanhThu += result.KC_DoanhThu;
    summary.BHYT_KC += result.BHYT_KC;
    summary.ThuTrucTiep_KC += result.ThuTrucTiep_KC;
    summary.MRI30 += result.MRI30;

    summary.TyLe_BHYT_KC_Avg += result.TyLe_BHYT_KC;
    summary.TyLe_ThuTrucTiep_KC_Avg += result.TyLe_ThuTrucTiep_KC;
    summary.KC_TyLe_TTT_DT_Avg += result.KC_TyLe_TTT_DT;
    summary.ThucTe_TyLe_TTT_DT_Avg += result.ThucTe_TyLe_TTT_DT;
    summary.KC_TyLe_BHYT_DT_Avg += result.KC_TyLe_BHYT_DT;
    summary.ThucTe_TyLe_BHYT_DT_Avg += result.ThucTe_TyLe_BHYT_DT;
    summary.TyLe_DoanhThu_KC_Avg += result.TyLe_DoanhThu_KC;
  });

  const numResults = results.length;
  // Chuyển các giá trị tỷ lệ sang trung bình
  summary.TyLe_BHYT_KC_Avg = parseFloat(
    (summary.TyLe_BHYT_KC_Avg / numResults).toFixed(1)
  );
  summary.TyLe_ThuTrucTiep_KC_Avg = parseFloat(
    (summary.TyLe_ThuTrucTiep_KC_Avg / numResults).toFixed(1)
  );
  summary.KC_TyLe_TTT_DT_Avg = parseFloat(
    (summary.KC_TyLe_TTT_DT_Avg / numResults).toFixed(1)
  );
  summary.ThucTe_TyLe_TTT_DT_Avg = parseFloat(
    (summary.ThucTe_TyLe_TTT_DT_Avg / numResults).toFixed(1)
  );
  summary.KC_TyLe_BHYT_DT_Avg = parseFloat(
    (summary.KC_TyLe_BHYT_DT_Avg / numResults).toFixed(1)
  );
  summary.ThucTe_TyLe_BHYT_DT_Avg = parseFloat(
    (summary.ThucTe_TyLe_BHYT_DT_Avg / numResults).toFixed(1)
  );
  summary.TyLe_DoanhThu_KC_Avg = parseFloat(
    (summary.TyLe_DoanhThu_KC_Avg / numResults).toFixed(1)
  );

  return summary;
}

export function calculateKPIWithDifferences(KPI, KPI_NgayChenhLech) {
  // Tạo map từ KPI_NgayChenhLech dựa trên TenKhoa
  const chenhLechMap = new Map(
    KPI_NgayChenhLech.map((item) => [item.TenKhoa, item])
  );

  // Lặp qua mảng KPI và tính toán chênh lệch
  const KPIWithDifferences = KPI.map((item) => {
    const matchingItem = chenhLechMap.get(item.TenKhoa);
    if (!matchingItem) {
      // Nếu không tìm thấy matching item, trả về item gốc
      return item;
    }

    // Tính toán chênh lệch cho mỗi chỉ số
    return {
      ...item, // Bảo toàn các giá trị gốc
      ChenhLech_TongThu: parseFloat(
        (item.TongThu - matchingItem.TongThu).toFixed(1)
      ),
      ChenhLech_ThuTrucTiep: parseFloat(
        (item.ThuTrucTiep - matchingItem.ThuTrucTiep).toFixed(1)
      ),
      ChenhLech_BHYT: parseFloat((item.BHYT - matchingItem.BHYT).toFixed(1)),
      ChenhLech_KC_DoanhThu: parseFloat(
        (item.KC_DoanhThu - matchingItem.KC_DoanhThu).toFixed(1)
      ),
      ChenhLech_BHYT_KC: parseFloat(
        (item.BHYT_KC - matchingItem.BHYT_KC).toFixed(1)
      ),
      ChenhLech_TyLe_BHYT_KC: parseFloat(
        (item.TyLe_BHYT_KC - matchingItem.TyLe_BHYT_KC).toFixed(1)
      ),
      ChenhLech_ThuTrucTiep_KC: parseFloat(
        (item.ThuTrucTiep_KC - matchingItem.ThuTrucTiep_KC).toFixed(1)
      ),
      ChenhLech_TyLe_ThuTrucTiep_KC: parseFloat(
        (item.TyLe_ThuTrucTiep_KC - matchingItem.TyLe_ThuTrucTiep_KC).toFixed(1)
      ),
      ChenhLech_KC_TyLe_TTT_DT: parseFloat(
        (item.KC_TyLe_TTT_DT - matchingItem.KC_TyLe_TTT_DT).toFixed(1)
      ),
      ChenhLech_ThucTe_TyLe_TTT_DT: parseFloat(
        (item.ThucTe_TyLe_TTT_DT - matchingItem.ThucTe_TyLe_TTT_DT).toFixed(1)
      ),
      ChenhLech_KC_TyLe_BHYT_DT: parseFloat(
        (item.KC_TyLe_BHYT_DT - matchingItem.KC_TyLe_BHYT_DT).toFixed(1)
      ),
      ChenhLech_ThucTe_TyLe_BHYT_DT: parseFloat(
        (item.ThucTe_TyLe_BHYT_DT - matchingItem.ThucTe_TyLe_BHYT_DT).toFixed(1)
      ),
      ChenhLech_TyLe_DoanhThu_KC: parseFloat(
        (item.TyLe_DoanhThu_KC - matchingItem.TyLe_DoanhThu_KC).toFixed(1)
      ),
      ChenhLech_MRI30: parseFloat((item.MRI30 - matchingItem.MRI30).toFixed(1)),
    };
  });

  return KPIWithDifferences;
}

export function ConvertDoanhThuCanLamSang(
  canlamsang,
  canlamsang_ngaychenhlech
) {
  const order = [
    "MRI30",
    "MRI15",
    "CLVT128",
    "CLVT32",
    "XQ",
    "XN",
    "SA",
    "NS",
    "DT",
    "DN",
    "MDLX",
    "CNHH",
   "XNHHnew",
   'SPECT',
    "khac",
  ];

  const nameMapping = {
    MRI30: "MRI 3.0",
    MRI15: "MRI 1.5",
    CLVT128: "CT 128 dãy",
    CLVT32: "CT 1-32 dãy",
    XQ: "XQuang",
    XN: "Xét nghiệm",
    SA: "Siêu âm",
    NS: "Nội soi",
    DT: "Điện tim",
    DN: "Điện não",
    MDLX: "Mật độ loãng xương",
    CNHH: "Chức năng hô hấp",
    XNHHnew: "Xét nghiệm HH mới",
    SPECT: "Dịch vụ SPECT",
    khac: "Khác",
  };

  // Chuẩn bị map dữ liệu để dễ dàng truy xuất và tính toán
  let mapCanLamSang = new Map();
  canlamsang?.forEach((item) => {
    mapCanLamSang.set(item.canlamsangtype, item);
  });

  let mapCanLamSangChenhlech = new Map();
  canlamsang_ngaychenhlech?.forEach((item) => {
    mapCanLamSangChenhlech.set(item.canlamsangtype, item);
  });

  const result = {
    soluong: [],
    dongchitra: [],
    bhyt: [],
    thutructiep: [],
    name: [],
    tongdoanhthu: [],
    soluong_chenhlech: [],
    dongchitra_chenhlech: [],
    bhyt_chenhlech: [],
    thutructiep_chenhlech: [],
    tongdoanhthu_chenhlech: [],
  };

  order.forEach((type) => {
    const item = mapCanLamSang.get(type) || {
      soluong: 0,
      dongchitra: 0,
      bhyt: 0,
      thutructiep: 0,
      tongdoanhthu: 0,
    };
    const itemChenhlech = mapCanLamSangChenhlech.get(type) || {
      soluong: 0,
      dongchitra: 0,
      bhyt: 0,
      thutructiep: 0,
      tongdoanhthu: 0,
    };

    result.soluong.push(item.soluong);
    result.dongchitra.push(item.dongchitra);
    result.bhyt.push(item.bhyt);
    result.thutructiep.push(item.thutructiep);
    result.name.push(nameMapping[type]);
    result.tongdoanhthu.push(item.dongchitra + item.bhyt + item.thutructiep);

    result.soluong_chenhlech.push(item.soluong - itemChenhlech.soluong);
    result.dongchitra_chenhlech.push(
      item.dongchitra - itemChenhlech.dongchitra
    );
    result.bhyt_chenhlech.push(item.bhyt - itemChenhlech.bhyt);
    result.thutructiep_chenhlech.push(
      item.thutructiep - itemChenhlech.thutructiep
    );
    result.tongdoanhthu_chenhlech.push(
      item.dongchitra +
        item.bhyt +
        item.thutructiep -
        (itemChenhlech.dongchitra +
          itemChenhlech.bhyt +
          itemChenhlech.thutructiep)
    );
  });

  return result;
}

export function TongHopSoLieuChoPieChartDoanhThu(doanhthu, canlamsang) {
  const tongtienMri30 = (
    canlamsang.find((obj) => obj.canlamsangtype === "MRI30") || { tongtien: 0 }
  ).tongtien;

  let thuTrucTiep = 0;
  let dongChiTra = 0;
  let tongBHYT = 0;

  doanhthu.forEach((obj) => {
    thuTrucTiep += obj.thutructiep;
    dongChiTra += obj.dongchitra;
    tongBHYT += obj.bhyt;
  });

  return [
    { label: "NB tự trả", value: thuTrucTiep },
    { label: "Đồng chi trả", value: dongChiTra },
    { label: "BHYT", value: tongBHYT },
    { label: "MRI 3.0", value: tongtienMri30 },
  ];
}

export function TongHopSoLieuChoPieChartDoanhThuChenhLech(
  doanhthu,
  doanhthu_ngaychenhlech,
  canlamsang,
  canlamsang_ngaychenhlech
) {
  // const tongtienMri30 = (canlamsang.find(obj => obj.canlamsangtype === "MRI30") || { tongtien: 0 }).tongtien;
  // const tongtienMri30_ngaychenhlech = (canlamsang_ngaychenhlech.find(obj => obj.canlamsangtype === "MRI30") || { tongtien: 0 }).tongtien;

  let thuTrucTiep = 0;
  let dongChiTra = 0;
  let tongBHYT = 0;
  let tongtienMri30 = 0;
  let tongtienMri30_ngaychenhlech = 0;

  let thuTrucTiep_ngaychenhlech = 0;
  let dongChiTra_ngaychenhlech = 0;
  let tongBHYT_ngaychenhlech = 0;

  doanhthu.forEach((obj) => {
    thuTrucTiep += obj.thutructiep;
    dongChiTra += obj.dongchitra;
    tongBHYT += obj.bhyt;
    tongtienMri30 += obj.tienmri30;
  });

  doanhthu_ngaychenhlech.forEach((obj) => {
    thuTrucTiep_ngaychenhlech += obj.thutructiep;
    dongChiTra_ngaychenhlech += obj.dongchitra;
    tongBHYT_ngaychenhlech += obj.bhyt;
    tongtienMri30_ngaychenhlech += obj.tienmri30;
  });

  return [
    { label: "NB tự trả", value: thuTrucTiep - thuTrucTiep_ngaychenhlech },
    { label: "Đồng chi trả", value: dongChiTra - dongChiTra_ngaychenhlech },
    { label: "BHYT", value: tongBHYT - tongBHYT_ngaychenhlech },
    { label: "MRI 3.0", value: tongtienMri30 - tongtienMri30_ngaychenhlech },
  ];
}
export function TongHopSoLieuChoRowTongDoanhThuKPI(
  doanhthu,
  doanhthu_ngaychenhlech,
  khuyencaotoanvien,
  ngayhientai = 0
) {
  let thuTrucTiep = 0;
  let dongChiTra = 0;
  let tongBHYT = 0;
  let tongtienMri30 = 0;
  let tongtienMri30_ngaychenhlech = 0;

  let thuTrucTiep_ngaychenhlech = 0;
  let dongChiTra_ngaychenhlech = 0;
  let tongBHYT_ngaychenhlech = 0;

  if (ngayhientai === 1) {
    // Nếu là ngày hiện tại
    doanhthu_ngaychenhlech = doanhthu_ngaychenhlech.map((obj) => ({
      ...obj,
      thutructiep: 0,
      dongchitra: 0,
      bhyt: 0,
      tienmri30: 0,
    }));
  }

  doanhthu?.forEach((obj) => {
    thuTrucTiep += obj.thutructiep;
    dongChiTra += obj.dongchitra;
    tongBHYT += obj.bhyt;
    tongtienMri30 += obj.tienmri30;
  });

  doanhthu_ngaychenhlech?.forEach((obj) => {
    thuTrucTiep_ngaychenhlech += obj.thutructiep;
    dongChiTra_ngaychenhlech += obj.dongchitra;
    tongBHYT_ngaychenhlech += obj.bhyt;
    tongtienMri30_ngaychenhlech += obj.tienmri30;
  });

  const TongTien = thuTrucTiep + dongChiTra + tongBHYT + tongtienMri30;
  const TongTien_NgayChenhLech =
    thuTrucTiep_ngaychenhlech +
    dongChiTra_ngaychenhlech +
    tongBHYT_ngaychenhlech +
    tongtienMri30_ngaychenhlech;

  const ThuTrucTiep = thuTrucTiep + dongChiTra + tongtienMri30;
  const ThuTrucTiep_NgayChenhLech =
    thuTrucTiep_ngaychenhlech +
    dongChiTra_ngaychenhlech +
    tongtienMri30_ngaychenhlech;

  const TyLe_ThucTe_DoanhThu_KhuyenCao = TongTien / khuyencaotoanvien.DoanhThu;
  const TyLe_ThucTe_DoanhThu_KhuyenCao_NgayChenhLech =
    TongTien_NgayChenhLech / khuyencaotoanvien.DoanhThu;

  const TyLe_ThucTe_BHYT_KhuyenCao = tongBHYT / khuyencaotoanvien.BHYT;
  const TyLe_ThucTe_BHYT_KhuyenCao_NgayChenhLech =
    tongBHYT_ngaychenhlech / khuyencaotoanvien.BHYT;

  const TyLe_ThucTe_ThuTrucTiep_KhuyenCao =
    ThuTrucTiep / khuyencaotoanvien.ThuTrucTiep;
  const TyLe_ThucTe_ThuTrucTiep_KhuyenCao_NgayChenhLech =
    ThuTrucTiep_NgayChenhLech / khuyencaotoanvien.ThuTrucTiep;

  return {
    TongTien: TongTien,
    BHYT: tongBHYT,
    MRI30: tongtienMri30,
    ThuTrucTiep: ThuTrucTiep,
    ChenhLech_TongTien: TongTien - TongTien_NgayChenhLech,
    ChenhLech_BHYT: tongBHYT - tongBHYT_ngaychenhlech,
    ChenhLech_ThuTrucTiep: ThuTrucTiep - ThuTrucTiep_NgayChenhLech,

    ChenhLech_MRI30: tongtienMri30 - tongtienMri30_ngaychenhlech,

    ThucTe_TyLe_BHYT_DT: parseFloat((tongBHYT / TongTien) * 100).toFixed(1),
    ChenhLech_ThucTe_TyLe_BHYT_DT: parseFloat(
      (tongBHYT / TongTien - tongBHYT_ngaychenhlech / TongTien_NgayChenhLech) *
        100
    ).toFixed(1),

    ThucTe_TyLe_ThuTrucTiep_DT: parseFloat(
      (ThuTrucTiep / TongTien) * 100
    ).toFixed(1),
    ChenhLech_ThucTe_TyLe_ThuTrucTiep_DT: parseFloat(
      (ThuTrucTiep / TongTien -
        ThuTrucTiep_NgayChenhLech / TongTien_NgayChenhLech) *
        100
    ).toFixed(1),

    TyLe_ThucTe_DoanhThu_KhuyenCao: parseFloat(
      TyLe_ThucTe_DoanhThu_KhuyenCao * 100
    ).toFixed(1),
    TyLe_ThucTe_DoanhThu_KhuyenCao_ChenhLech: parseFloat(
      (TyLe_ThucTe_DoanhThu_KhuyenCao -
        TyLe_ThucTe_DoanhThu_KhuyenCao_NgayChenhLech) *
        100
    ).toFixed(1),

    TyLe_ThucTe_BHYT_KhuyenCao: parseFloat(
      TyLe_ThucTe_BHYT_KhuyenCao * 100
    ).toFixed(1),
    TyLe_ThucTe_BHYT_KhuyenCao_ChenhLech: parseFloat(
      (TyLe_ThucTe_BHYT_KhuyenCao - TyLe_ThucTe_BHYT_KhuyenCao_NgayChenhLech) *
        100
    ).toFixed(1),

    TyLe_ThucTe_ThuTrucTiep_KhuyenCao: parseFloat(
      TyLe_ThucTe_ThuTrucTiep_KhuyenCao * 100
    ).toFixed(1),
    TyLe_ThucTe_ThuTrucTiep_KhuyenCao_ChenhLech: parseFloat(
      (TyLe_ThucTe_ThuTrucTiep_KhuyenCao -
        TyLe_ThucTe_ThuTrucTiep_KhuyenCao_NgayChenhLech) *
        100
    ).toFixed(1),
  };
}

export function groupByVipTypeId(BenhNhan_Vip) {
  // Sử dụng reduce để nhóm các bản ghi dựa trên dm_viptypeid
  const grouped = BenhNhan_Vip.reduce((acc, curr) => {
    // Kiểm tra nếu nhóm cho dm_viptypeid đã tồn tại trong accumulator
    // Nếu chưa, tạo nhóm mới
    if (!acc[curr.dm_viptypeid]) {
      acc[curr.dm_viptypeid] = [];
    }
    // Thêm đối tượng hiện tại vào nhóm tương ứng
    acc[curr.dm_viptypeid].push(curr);
    return acc;
  }, {});

  // Chuyển đổi đối tượng các nhóm thành một mảng của mảng
  return Object.keys(grouped).map((key) => grouped[key]);
}

export function calculateDifferencesTongKPI(TongKPI, TongKPI_NgayChenhLenh) {
  // Sao chép TongKPI vào đối tượng kết quả mới
  const result = { ...TongKPI };

  // Duyệt qua mỗi key trong TongKPI
  for (let key in TongKPI) {
    if (
      TongKPI.hasOwnProperty(key) &&
      TongKPI_NgayChenhLenh.hasOwnProperty(key)
    ) {
      // Tính hiệu, làm tròn đến 1 chữ số thập phân và thêm vào đối tượng kết quả với tiền tố 'ChenhLech_'
      const difference = TongKPI[key] - TongKPI_NgayChenhLenh[key];
      result[`ChenhLech_${key}`] = parseFloat(difference.toFixed(1));
    }
  }

  return result;
}

export function calculateKhuyenCaoToanVien(khuyencaokhoa) {
  let DoanhThuTong = 0;
  let BHYTTong = 0;

  // Tính tổng Doanh Thu và tổng BHYT
  khuyencaokhoa.forEach((khoa) => {
    DoanhThuTong += khoa.DoanhThu;
    BHYTTong += (khoa.DoanhThu * khoa.TyLeBHYT) / 100;
  });

  // Tính Thu Trực Tiếp và các tỷ lệ
  const ThuTrucTiep = DoanhThuTong - BHYTTong;
  const TyLe_BHYT_DoanhThu = (BHYTTong / DoanhThuTong) * 100;
  const TyLe_ThuTrucTiep_DoanhThu = 100 - TyLe_BHYT_DoanhThu;

  // Trả về đối tượng KhuyenCao_ToanVien
  return {
    DoanhThu: DoanhThuTong,
    BHYT: BHYTTong,
    ThuTrucTiep: ThuTrucTiep,
    TyLe_BHYT_DoanhThu: parseFloat(TyLe_BHYT_DoanhThu.toFixed(1)), // Làm tròn đến 2 chữ số thập phân
    TyLe_ThuTrucTiep_DoanhThu: parseFloat(TyLe_ThuTrucTiep_DoanhThu.toFixed(1)),
  };
}

const mappingLoaiBNVip = [
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 15, VipName: "Bí thư huyện" },
  { dm_viptypeid: 19, VipName: "Bí Thư Thành ủy" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
  { dm_viptypeid: 3, VipName: "Gây rối" },
];
export function themVipName(benhNhanVip) {
  // Tạo một object để tối ưu việc tra cứu VipName từ dm_viptypeid
  const vipNameMap = mappingLoaiBNVip.reduce((acc, cur) => {
    acc[cur.dm_viptypeid] = cur.VipName;
    return acc;
  }, {});

  // Lặp qua từng bệnh nhân và bổ sung VipName
  benhNhanVip.forEach((benhNhan) => {
    // Kiểm tra và bổ sung VipName dựa trên dm_viptypeid tương ứng
    if (benhNhan.dm_viptypeid in vipNameMap) {
      benhNhan.VipName = vipNameMap[benhNhan.dm_viptypeid];
    }
  });

  return benhNhanVip;
}

export function convertData_CanLamSang_PhongThucHien(dataArray) {
  const result = {};

  dataArray.forEach((item) => {
    const {
      phongthuchien,
      departmenttype,
      loaidoituong,
      maubenhphamstatus,
      soluong,
    } = item;

    if (!result[phongthuchien]) {
      result[phongthuchien] = { noitru: {}, ngoaitru: {} };
    }

    const deptKey = departmenttype === 2 ? "ngoaitru" : "noitru";

    if (!result[phongthuchien][deptKey][loaidoituong]) {
      result[phongthuchien][deptKey][loaidoituong] = {};
    }

    result[phongthuchien][deptKey][loaidoituong][maubenhphamstatus] = soluong;
  });

  return result;
}

function initializeStructure(deptKey, obj) {
  const statusKeys = ["ChiDinh", "DaThucHien", "DaTraKQ"];
  const doiTuongKeys = ["BHYT", "VP", "YC", "BHYTYC"];

  doiTuongKeys.forEach((doiTuong) => {
    obj[deptKey][doiTuong] = obj[deptKey][doiTuong] || {};
    statusKeys.forEach((status) => {
      obj[deptKey][doiTuong][status] = obj[deptKey][doiTuong][status] || 0;
    });
  });
}

export function convertDataWithTextKeys_CanLamSang_PhongThucHien(dataArray) {
  const departmentTypeMapping = {
    2: "ngoaitru",
    3: "noitru",
  };

  const doiTuongMapping = {
    0: "BHYT",
    1: "VP",
    3: "YC",
    4: "BHYTYC",
  };

  const statusMapping = {
    0: "ChiDinh",
    1: "ChiDinh", // Assuming both 0 and 1 map to 'ChiDinh'
    16: "DaThucHien",
    2: "DaTraKQ",
  };

  const result = [];

  dataArray.forEach((item) => {
    const {
      phongthuchien,
      departmenttype,
      loaidoituong,
      maubenhphamstatus,
      soluong,
    } = item;
    let roomObj = result.find((room) => room.phongthuchien === phongthuchien);

    if (!roomObj) {
      roomObj = { phongthuchien, noitru: {}, ngoaitru: {} };
      initializeStructure("noitru", roomObj);
      initializeStructure("ngoaitru", roomObj);
      result.push(roomObj);
    }

    const deptKey = departmentTypeMapping[departmenttype] || "unknown";
    const doiTuongKey = doiTuongMapping[loaidoituong] || "unknown";
    const statusKey = statusMapping[maubenhphamstatus] || "unknown";

    if (
      deptKey !== "unknown" &&
      doiTuongKey !== "unknown" &&
      statusKey !== "unknown"
    ) {
      roomObj[deptKey][doiTuongKey][statusKey] += soluong;
    }
  });

  return result;
}

export function calculateTotalForType(type, dataArray) {
  let total = 0;

  // Duyệt qua mỗi phần tử trong mảng
  dataArray?.forEach((item) => {
    if (item.canlamsangtype === type) {
      // Cộng dồn tổng của dongchitra, bhyt, và thutructiep nếu khớp với type
      total += item.dongchitra + item.bhyt + item.thutructiep;
    }
  });

  // Trả về tổng tương ứng với canlamsangtype cần tìm
  return total;
}

export function ConvertDoanhThuBacSiKhoa(doanhThu) {
  if (!Array.isArray(doanhThu)) {
    console.error("Lỗi: Đầu vào phải là một mảng");
    return []; // Trả về một mảng rỗng hoặc có thể là null tùy theo yêu cầu xử lý lỗi
  }
  let doanhthuBacSiKhoa = doanhThu.map((item) => ({ ...item }));

  // Khởi tạo đối tượng tổng cộng
  let tongCong = {
    username: "Tổng cộng",
    dongchitra: 0,
    bhyt: 0,
    thutructiep: 0,
    tongdoanhthu: 0,
    tienmri30: 0,
  };

  // Duyệt qua mỗi đối tượng trong mảng để thêm tongdoanhthu và tính tổng
  doanhthuBacSiKhoa.forEach((item) => {
    item.tongdoanhthu =
      (item.bhyt || 0) +
      (item.dongchitra || 0) +
      (item.thutructiep || 0) +
      (item.tienmri30 || 0);
    tongCong.dongchitra += item.dongchitra || 0;
    tongCong.bhyt += item.bhyt || 0;
    tongCong.thutructiep += item.thutructiep || 0;
    tongCong.tongdoanhthu += item.tongdoanhthu;
    tongCong.tienmri30 += item.tienmri30;
  });

  // Thêm đối tượng tổng cộng vào đầu mảng
  doanhthuBacSiKhoa.unshift(tongCong);

  return doanhthuBacSiKhoa;
}
export function tinhChenhLech_DoanhThu_BacSi(doanhThu, doanhThuNgayChenhLech) {
  // Tạo một đối tượng map để lưu trữ dữ liệu theo username từ doanhThu
  const mapDoanhThu = new Map();
  doanhThu.forEach((item) => mapDoanhThu.set(item.username, item));

  // Mảng kết quả chứa chênh lệch
  const ketQuaChenhLech = [];

  // Duyệt qua mảng doanhThuNgayChenhLech và tính chênh lệch
  doanhThuNgayChenhLech.forEach((item) => {
    const doanhThuCu = mapDoanhThu.get(item.username);

    // Kiểm tra xem có dữ liệu tương ứng trong doanhThu không
    if (doanhThuCu) {
      const chenhLech = {
        username: item.username,
        dongchitra: item.dongchitra - doanhThuCu.dongchitra,
        bhyt: item.bhyt - doanhThuCu.bhyt,
        thutructiep: item.thutructiep - doanhThuCu.thutructiep,
        tongdoanhthu: item.tongdoanhthu - doanhThuCu.tongdoanhthu,
        tienmri30: item.tienmri30 - doanhThuCu.tienmri30,
      };
      ketQuaChenhLech.push(chenhLech);
    } else {
      // Nếu không có dữ liệu tương ứng, tạo đối tượng chênh lệch với các giá trị từ doanhThuNgayChenhLech
      const chenhLech = {
        username: item.username,
        dongchitra: item.dongchitra,
        bhyt: item.bhyt,
        thutructiep: item.thutructiep,
        tongdoanhthu: item.tongdoanhthu,
        tienmri30: item.tienmri30,
      };
      ketQuaChenhLech.push(chenhLech);
    }
  });

  // Trả về mảng kết quả chênh lệch
  return ketQuaChenhLech;
}

export function LocKhoaHienThiTheoUser(khoas, user) {
  // Mảng để lưu các khoa thỏa mãn điều kiện
  let filteredKhoas = [];
  console.log("user", user);
  // Duyệt qua từng khoa trong khoas
  khoas.forEach((khoa) => {
    // Kiểm tra nếu KhoaID của khoa bằng _id của user
    if (khoa._id === user.KhoaID._id) {
      filteredKhoas.push(khoa);
    } else {
      // Kiểm tra nếu MaKhoa của khoa có trong mảng KhoaTaiChinh của user
      if (user.KhoaTaiChinh.includes(khoa.MaKhoa)) {
        filteredKhoas.push(khoa);
      }
    }
  });

  return filteredKhoas;
}

export function ConvertDoanhThuKhoaThemTong(doanhThu, soluong) {
  if (!Array.isArray(doanhThu)) {
    console.error("Lỗi: Đầu vào phải là một mảng");
    return []; // Trả về một mảng rỗng hoặc có thể là null tùy theo yêu cầu xử lý lỗi
  }
  let doanhthuBacSiKhoa = doanhThu.map((item) => ({ ...item }));

  // Khởi tạo đối tượng tổng cộng
  let tongCong = {
    tenkhoa: "Tổng cộng",
    dongchitra: 0,
    bhyt: 0,
    thutructiep: 0,
    tongtien: 0,
    tienmri30: 0,
    soluong: soluong,
  };

  // Duyệt qua mỗi đối tượng trong mảng để thêm tongdoanhthu và tính tổng
  doanhthuBacSiKhoa.forEach((item) => {
    tongCong.dongchitra += item.dongchitra || 0;
    tongCong.bhyt += item.bhyt || 0;
    tongCong.thutructiep += item.thutructiep || 0;
    tongCong.tongtien += item.tongtien;
    tongCong.tienmri30 += item.tienmri30;
  });

  // Thêm đối tượng tổng cộng vào đầu mảng
  doanhthuBacSiKhoa.unshift(tongCong);

  return doanhthuBacSiKhoa;
}

export function ConvertMangVienPhiThemTong(doanhThu) {
  if (!Array.isArray(doanhThu)) {
    console.error("Lỗi: Đầu vào phải là một mảng");
    return []; // Trả về một mảng rỗng hoặc có thể là null tùy theo yêu cầu xử lý lỗi
  }

  let doanhthutheovienphi = doanhThu?.map((item) => ({ ...item }));

  // Khởi tạo đối tượng tổng cộng
  let tongCong = {
    patientname: "Tổng cộng",
    dongchitra: 0,
    bhyt: 0,
    thutructiep: 0,
    tongtien: 0,
    tienmri30: 0,
  };

  // Duyệt qua mỗi đối tượng trong mảng để thêm tongdoanhthu và tính tổng
  doanhthutheovienphi.forEach((item) => {
    tongCong.dongchitra += item.dongchitra || 0;
    tongCong.bhyt += item.bhyt || 0;
    tongCong.thutructiep += item.thutructiep || 0;
    tongCong.tongtien += item.tongtien;
    tongCong.tienmri30 += item.tienmri30;
  });

  // Thêm đối tượng tổng cộng vào đầu mảng
  doanhthutheovienphi.unshift(tongCong);

  return doanhthutheovienphi;
}

export function chiaNhomDaoTao(arr) {
  // Mảng 1: Saudaihoc - Lọc ra các đối tượng có MaHinhThucCapNhat có 4 ký tự đầu là 'ĐT06' và lopDaoTaoCount > 0
  const saudaihoc = arr.filter(item => item.lopDaoTaoCount > 0 && item.MaHinhThucCapNhat.startsWith('ĐT06'));

  // Mảng 2: Đối tượng có 2 ký tự đầu là 'ĐT' nhưng khác 'ĐT06' và lopDaoTaoCount > 0
  const dtKhac = arr.filter(item => 
    item.lopDaoTaoCount > 0 && 
    item.MaHinhThucCapNhat.startsWith('ĐT') && 
    !item.MaHinhThucCapNhat.startsWith('ĐT06')
  );

  // Mảng 3: Đối tượng có 4 ký tự đầu là 'NCKH' và lopDaoTaoCount > 0
  const nckh = arr.filter(item => item.lopDaoTaoCount > 0 && item.MaHinhThucCapNhat.startsWith('NCKH'));

  return { saudaihoc, dtKhac, nckh };
}

export function isNullOrEmptyObject(obj) {
  return obj === null || (typeof obj === 'object' && Object.keys(obj).length === 0);
}

export function summarizeMedicineStore(data) {
  // Tạo một Map để lưu thông tin duy nhất cho mỗi medicinestoreid
  console.log('summarizeMedicineStore',data);
  const storeMap = new Map();

  data.forEach(item => {
      const { medicinestoretype, medicinestoreid, medicinestorename, giaban, soluong } = item;

      // Tính tổng tiền cho item hiện tại
      const tongTien = giaban * soluong;

      // Nếu medicinestoreid đã tồn tại trong Map, cập nhật tongtien
      if (storeMap.has(medicinestoreid)) {
          const existing = storeMap.get(medicinestoreid);
          existing.tongtien += tongTien;
      } else {
          // Nếu chưa tồn tại, thêm mới vào Map
          storeMap.set(medicinestoreid, {
            medicinestoretype,
              medicinestoreid,
              medicinestorename,
              tongtien: tongTien
          });
      }
  });

  // Trả kết quả dưới dạng mảng
  return Array.from(storeMap.values());
}

export function getUniqueMedicineStores(data) {
  // Tạo Map để lưu các cặp medicinestoreid và thông tin tương ứng duy nhất
  const storeMap = new Map();

  data.forEach(item => {
      const { medicinestoreid, medicinestorename, medicinestoretype } = item;

      // Chỉ thêm vào Map nếu medicinestoreid chưa tồn tại
      if (!storeMap.has(medicinestoreid)) {
          storeMap.set(medicinestoreid, {
              medicinestoreid,
              medicinestorename,
              medicinestoretype
          });
      }
  });

  // Chuyển Map thành mảng các đối tượng
  return Array.from(storeMap.values());
}