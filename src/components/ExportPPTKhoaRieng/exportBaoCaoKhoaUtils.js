import pptxgen from "pptxgenjs";
import { fDate } from "../../utils/formatTime";

// Style definitions - tái sử dụng từ Sumary.js
const styleTitle = {
  x: 0,
  y: 0,
  fontSize: 30,
  fontFace: "Times New Roman",
  color: "FFFFFF",
  fill: { color: "1939B7" },
  bold: true,
  align: "left",
  w: 10,
  h: 1,
};

const styleTextChuyenForm = {
  x: 0.7,
  y: 2,
  fontSize: 40,
  color: "bb1515",
  fontFace: "Times New Roman",
  align: "center",
  bold: true,
  w: 8,
  h: 2,
};

// Reserved for future use
// eslint-disable-next-line no-unused-vars
const styleCenterCell = {
  fontFace: "Times New Roman",
  fontSize: 16,
  align: "center",
  color: "1939B7",
  bold: true,
  valign: "middle",
};

// eslint-disable-next-line no-unused-vars
const styleLeftCell = {
  fontFace: "Times New Roman",
  fontSize: 16,
  align: "left",
  color: "1939B7",
  bold: true,
  valign: "middle",
};

// Constants for text processing
const MAX_CHARS_PER_LINE = 65;
const MAX_LINES_PER_SLIDE = 12;

/**
 * Xử lý text dài thành nhiều dòng
 * @param {string} text - Text cần xử lý
 * @returns {Array} Mảng các dòng đã được chia
 */
const processTextToLines = (text) => {
  const paragraphs = text.split("\n");
  const lines = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(" ");
    let currentLine = "";

    words.forEach((word) => {
      if (currentLine.length + word.length < MAX_CHARS_PER_LINE) {
        if (currentLine.length > 0) {
          currentLine += " ";
        }
        currentLine += word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
  });

  return lines;
};

/**
 * Tạo text thông tin bệnh nhân
 * @param {Object} benhnhan - Thông tin bệnh nhân
 * @returns {string} Text đã format
 */
const createPatientText = (benhnhan) => {
  let text = `${benhnhan.Stt}. ${benhnhan.TenBenhNhan} - ${benhnhan.Tuoi} tuổi - ${benhnhan.GioiTinh}`;

  if (benhnhan.DiaChi && benhnhan.DiaChi.trim().length > 0) {
    text += `\n- Địa chỉ: ${benhnhan.DiaChi.trim()}`;
  }

  if (benhnhan.VaoVien && benhnhan.VaoVien.trim().length > 0) {
    text += `\n- Vào viện: ${benhnhan.VaoVien.trim()}`;
  }

  if (benhnhan.LyDoVV && benhnhan.LyDoVV.trim().length > 0) {
    text += `\n- Lý do vv: ${benhnhan.LyDoVV.trim()}`;
  }

  if (benhnhan.DienBien && benhnhan.DienBien.trim().length > 0) {
    text += `\n- Diễn biến: ${benhnhan.DienBien.trim()}`;
  }

  if (benhnhan.ChanDoan && benhnhan.ChanDoan.trim().length > 0) {
    text += `\n- Chẩn đoán: ${benhnhan.ChanDoan.trim()}`;
  }

  if (benhnhan.XuTri && benhnhan.XuTri.trim().length > 0) {
    text += `\n- Xử trí: ${benhnhan.XuTri.trim()}`;
  }

  if (benhnhan.HienTai && benhnhan.HienTai.trim().length > 0) {
    text += `\n- Hiện tại: ${benhnhan.HienTai.trim()}`;
  }

  if (benhnhan.GhiChu && benhnhan.GhiChu.trim().length > 0) {
    text += `\n- ${benhnhan.GhiChu.trim()}`;
  }

  return text;
};

/**
 * Tạo slide tiêu đề cho từng loại bệnh nhân
 * @param {Object} pres - PowerPoint presentation object
 * @param {string} titleSlide - Tiêu đề slide
 * @param {number} soBenhNhan - Số lượng bệnh nhân
 * @param {string} tenKhoa - Tên khoa
 * @returns {Object} Slide object
 */
const createTitleSlide = (pres, titleSlide, soBenhNhan, tenKhoa) => {
  const slide = pres.addSlide();

//   slide.addText("BÁO CÁO KHOA", {
//     ...styleTitle,
//     align: "center",
//     fontSize: 24,
//     h: 0.5,
//   });

  slide.addText(tenKhoa.toUpperCase(), {
    ...styleTitle,
    align: "left",
    fontSize: 28,
    x: 0,
    y: 0,
    h: 1,
  });

  slide.addImage({
    path: "/logo.png",
    x: 9,
    y: 0,
    w: 1,
    h: 1,
  });

  slide.addText(titleSlide, {
    ...styleTextChuyenForm,
    fontSize: 36,
  });

  return slide;
};

/**
 * Tạo slides cho thông tin bệnh nhân
 * @param {Object} pres - PowerPoint presentation object
 * @param {Object} benhnhan - Thông tin bệnh nhân
 * @param {string} titleText - Tiêu đề slide
 * @param {string} tenKhoa - Tên khoa
 */
const createPatientSlides = (pres, benhnhan, titleText, tenKhoa) => {
  let slide = pres.addSlide();

  // Header
  slide.addText(titleText, {
    ...styleTitle,
    h: 1,
    fontSize: 24,
  });

  slide.addImage({
    path: "/logo.png",
    x: 9,
    y: 0,
    w: 1,
    h: 1,
  });

  // Cột 1: Tên khoa
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 1,
    w: 1.6,
    h: 4.6,
    fill: { color: "FFFFFF" },
    line: { color: "1939B7", width: 1 },
  });

  slide.addText(tenKhoa, {
    x: 0,
    y: 1,
    w: 1.6,
    h: 4.6,
    fontSize: 28,
    color: "bb1515",
    fontFace: "Times New Roman",
    valign: "center",
    align: "center",
    bold: true,
  });

  // Cột 2: Thông tin bệnh nhân
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.6,
    y: 1,
    w: 8.4,
    h: 4.6,
    fill: { color: "FFFFFF" },
    line: { color: "1939B7", width: 1 },
  });

  // Xử lý text
  const patientText = createPatientText(benhnhan);
  const lines = processTextToLines(patientText);

  // Chia text thành nhiều slide nếu cần
  for (let i = 0; i < lines.length; i += MAX_LINES_PER_SLIDE) {
    const textToInclude = lines.slice(i, i + MAX_LINES_PER_SLIDE).join("\n");

    slide.addText(textToInclude, {
      x: 1.6,
      y: 1,
      w: 8.4,
      h: 4.5,
      fontFace: "Times New Roman",
      fontSize: 20,
      color: "1939B7",
    });

    // Tạo slide mới nếu còn text
    if (i + MAX_LINES_PER_SLIDE < lines.length) {
      slide = pres.addSlide();

      // Header cho slide mới
      slide.addText(titleText, {
        ...styleTitle,
        h: 1,
        fontSize: 24,
      });

      slide.addImage({
        path: "/logo.png",
        x: 9,
        y: 0,
        w: 1,
        h: 1,
      });

      // Cột 1 cho slide mới
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0,
        y: 1,
        w: 1.6,
        h: 4.6,
        fill: { color: "FFFFFF" },
        line: { color: "1939B7", width: 1 },
      });

      slide.addText(tenKhoa, {
        x: 0,
        y: 1,
        w: 1.6,
        h: 4.6,
        fontSize: 28,
        color: "bb1515",
        fontFace: "Times New Roman",
        valign: "center",
        align: "center",
        bold: true,
      });

      // Cột 2 cho slide mới
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 1.6,
        y: 1,
        w: 8.4,
        h: 4.6,
        fill: { color: "FFFFFF" },
        line: { color: "1939B7", width: 1 },
      });
    }
  }

  // Tạo slides cho hình ảnh
  if (benhnhan.Images && benhnhan.Images.length > 0) {
    benhnhan.Images.forEach((img) => {
      const imgSlide = pres.addSlide();

      imgSlide.addText(titleText, {
        ...styleTitle,
        h: 1,
        fontSize: 24,
      });

      imgSlide.addImage({
        path: "/logo.png",
        x: 9,
        y: 0,
        w: 1,
        h: 1,
      });

      imgSlide.addShape(pres.shapes.RECTANGLE, {
        x: 0,
        y: 1,
        w: 1.6,
        h: 4.6,
        fill: { color: "FFFFFF" },
        line: { color: "1939B7", width: 1 },
      });

      imgSlide.addText(tenKhoa, {
        x: 0,
        y: 1,
        w: 1.6,
        h: 4.6,
        fontSize: 28,
        color: "bb1515",
        fontFace: "Times New Roman",
        valign: "center",
        align: "center",
        bold: true,
      });

      imgSlide.addImage({
        path: img,
        x: 3.5,
        y: 1.1,
        w: 4.5,
        h: 4.5,
      });
    });
  }
};

/**
 * Hàm chính để xuất báo cáo PowerPoint
 * @param {Object} params - Tham số đầu vào
 * @param {string} params.tenKhoa - Tên khoa
 * @param {string} params.date - Ngày báo cáo
 * @param {Object} params.bcGiaoBanTheoNgay - Thông tin báo cáo giao ban
 * @param {Array} params.danhSachBenhNhan - Danh sách các loại bệnh nhân
 * @param {number} params.tongSoBenhNhan - Tổng số bệnh nhân
 */
export const exportBaoCaoKhoa = async ({
  tenKhoa,
  date,
  bcGiaoBanTheoNgay,
  bcGiaoBanTheoNgay_ToanVien,
  danhSachBenhNhan,
  tongSoBenhNhan,
}) => {
  try {
    const pres = new pptxgen();

    // Slide 1: Cover
    
    const startSlide = pres.addSlide();
    startSlide.addImage({
      path: "/backgroundSlide.png",
      x: 0,
      y: 0,
      w: 10,
      h: 5.65,
    });

    // Slide 2: Giới thiệu khoa
    const introSlide = pres.addSlide();
    introSlide.addText(`${tenKhoa.toUpperCase()}`, {
      ...styleTitle,
      align: "left",
      fontSize: 26,
      h: 0.6,
    });

    introSlide.addText(`Ngày: ${fDate(date)}`, {
      ...styleTitle,
      align: "left",
      fontSize: 20,
      y: 0.6,
      h: 0.4,
    //   color: "1939B7",
    //   fill: { color: "FFFFFF" },
    });

    introSlide.addImage({
      path: "/logo.png",
      x: 9,
      y: 0,
      w: 1,
      h: 1,
    });

    // Thông tin trực (nếu có)
    if (bcGiaoBanTheoNgay_ToanVien) {
      let yPos = 1.2;

      if (bcGiaoBanTheoNgay_ToanVien.BSTruc) {
        introSlide.addText(`Bác sĩ trực: ${bcGiaoBanTheoNgay_ToanVien.BSTruc}`, {
          x: 0.5,
          y: yPos,
          w: 9,
          h: 0.3,
          fontSize: 18,
          fontFace: "Times New Roman",
          color: "1939B7",
          bold: true,
        });
        yPos += 0.3;
      }

      if (bcGiaoBanTheoNgay_ToanVien.DDTruc) {
        introSlide.addText(`Điều dưỡng trực: ${bcGiaoBanTheoNgay_ToanVien.DDTruc}`, {
          x: 0.5,
          y: yPos,
          w: 9,
          h: 0.3,
          fontSize: 18,
          fontFace: "Times New Roman",
          color: "1939B7",
          bold: true,
        });
        yPos += 0.3;
      }

      if (bcGiaoBanTheoNgay_ToanVien.CBThemGio) {
        introSlide.addText(`Cán bộ thêm giờ: ${bcGiaoBanTheoNgay_ToanVien.CBThemGio}`, {
          x: 0.5,
          y: yPos,
          w: 9,
          h: 0.3,
          fontSize: 18,
          fontFace: "Times New Roman",
          color: "1939B7",
          bold: true,
        });
        yPos += 0.3;
      }
    }

    // Bảng tổng quan
    const summaryData = [
      ["Loại bệnh nhân", "Số lượng"],
      ...danhSachBenhNhan.map((loai) => [loai.title, loai.data.length]),
      ["Tổng cộng", tongSoBenhNhan],
    ];

    introSlide.addTable(summaryData, {
      x: 0.5,
      y: 2.2,
      w: 9,
      h: 2.5,
      border: { type: "solid", color: "1939B7", pt: 1 },
      fill: { color: "FFFFFF" },
      fontFace: "Times New Roman",
      fontSize: 14,
      bold: true,
      color: "1939B7",
      align: "center",
      valign: "middle",
      colW: [6, 3],
    });

    // Slides chi tiết cho từng loại bệnh nhân
    danhSachBenhNhan.forEach((loaiBenhNhan) => {
      if (loaiBenhNhan.data.length > 0) {
        // Slide tiêu đề loại bệnh nhân
        createTitleSlide(
          pres,
          loaiBenhNhan.titleSlide,
          loaiBenhNhan.data.length,
          tenKhoa
        );

        // Slides chi tiết từng bệnh nhân
        loaiBenhNhan.data.forEach((benhnhan) => {
          const titleText = `${loaiBenhNhan.title}: ${loaiBenhNhan.data.length}`;
          createPatientSlides(pres, benhnhan, titleText, tenKhoa);
        });
      }
    });

    // Slide kết thúc
    const finalSlide = pres.addSlide();
    finalSlide.addImage({
      path: "/backgroundSlide.png",
      x: 0,
      y: 0,
      w: 10,
      h: 5.65,
    });

    // Xuất file
    const fileName = `Báo cáo khoa ${tenKhoa} ngày ${fDate(date)}`;
    await pres.writeFile(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error("Lỗi khi xuất PowerPoint:", error);
    throw new Error(`Không thể xuất file PowerPoint: ${error.message}`);
  }
};
