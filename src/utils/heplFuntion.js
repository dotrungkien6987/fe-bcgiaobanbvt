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
  console.log("bcngay in find", baocaongays);
  console.log("khoas in find", khoas);
  const khoaIdsInBaocaongays = new Set(
    baocaongays.map((baocaongay) => baocaongay.KhoaID._id)
  );
  console.log("set", khoaIdsInBaocaongays);
  // Lọc ra các khoa có _id tồn tại trong baocaongays
  const KhoaDaGuis = khoas.filter((khoa) => khoaIdsInBaocaongays.has(khoa._id));

  // Lọc ra các khoa có _id không tồn tại trong baocaongays
  const KhoaChuaGuis = khoas.filter(
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
  const nhom1 = [
    "A"
  ];

  const nhom2 = [
    "B", "C", "D"
  ];
  const nhom3 = [
    "E", "F"
  ];
  const nhom4 = [
    "G", "H", "I"
  ];
 
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
  const nhom6 = [
    "Các yếu tố không đề cập trong các mục từ 1 đến 5"
  ];
 
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
  const patientsWithHospital = patientsArray.map(patient => {
      const hospitalCode = patient.benhvienchuyentoi_code;
      const hospitalName = hospitalsMap[hospitalCode] || hospitalCode;
      return { ...patient, hospitalName };
  });

  return patientsWithHospital;
}