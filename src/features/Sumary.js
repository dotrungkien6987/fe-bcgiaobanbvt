import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import { useNavigate, Link as RouterLink, Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  InsertOrUpdateTrangThaiForBCGiaoBan,
  getDataBCGiaoBanCurent,
  getDataBCNgaysForGiaoBan,
  getKhoasInBCGiaoBan,
} from "./BCGiaoBan/bcgiaobanSlice";

import DisplayKhoaButton from "../components/DisplayKhoaButton";
import TongHopHeNoi from "./BCGiaoBan/BaoCaoSoLieuGiaoBan/TongHopHeNoi";

import { fDate } from "../utils/formatTime";
import TongHopHeNgoai from "./BCGiaoBan/BaoCaoSoLieuGiaoBan/TongHopHeNgoai";
import TongHopCLC from "./BCGiaoBan/BaoCaoSoLieuGiaoBan/TongHopCLC";
import TongHopToanVien from "./BCGiaoBan/BaoCaoSoLieuGiaoBan/TongHopToanVien";
import TongHopKKB from "./BCGiaoBan/BaoCaoSoLieuGiaoBan/TongHopKKB";
import useAuth from "../hooks/useAuth";
import TongHopCanLamSang from "./BCGiaoBan/BaoCaoSoLieuGiaoBan/TongHopCanLamSang";

import TrangThai from "./BCGiaoBan/TrangThai";
import MenuIcon from "@mui/icons-material/Menu";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import pptxgen from "pptxgenjs";
import { getObjectByMaKhoa } from "../utils/heplFuntion";

dayjs.extend(utc);
dayjs.extend(timezone);

function Sumary() {
  const { user } = useAuth();
  const { khoaDaGuis, khoaChuaGuis, khoas } = useSelector(
    (state) => state.bcgiaoban
  );

  const {
    noiBNTuvongs,
    noiBNChuyenViens,
    noiBNXinVes,
    noiBNNangs,
    noiBNCanThieps,
    noiBNTheoDois,
    noiBNNgoaiGiosKhongGomCLC,

    ngoaiBNTuvongs,
    ngoaiBNChuyenViens,
    ngoaiBNXinVes,
    ngoaiBNNangs,
    ngoaiBNPhauThuats,
    ngoaiBNTheoDois,

    ngoaiBNNgoaiGiosKhongGomCLC,

    bcGiaoBanCurent,
    clcBNTuvongs,
    clcBNChuyenViens,
    clcBNXinVes,
    clcBNNangs,
    clcBNCanThieps,
    clcBNTheoDois,

    hsccycBNNgoaiGios,
    noiycBNNgoaiGios,
    ngoaiycBNNgoaiGios,
    ngoaiycBNPhauThuats,
    baocaongays,
    chiso,
    pkycs,
  } = useSelector((state) => state.bcgiaoban);

  // Lấy thời gian hiện tại theo múi giờ của Việt Nam
  const now = dayjs().tz("Asia/Ho_Chi_Minh");

  // Kiểm tra xem giờ hiện tại có >= 18 hay không
  const isAfter18 = now.hour() >= 18;

  // Thiết lập giá trị mặc định cho date dựa trên giờ hiện tại
  const defaultDate = isAfter18
    ? now.hour(7).minute(0).second(0).millisecond(0)
    : now.subtract(1, "day").hour(7).minute(0).second(0).millisecond(0);

  const [date, setDate] = useState(defaultDate);

  const handleDateChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào

    if (newDate instanceof Date) {
      newDate.setHours(7, 0, 0, 0);
      setDate(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
      const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      console.log("updateDate", updatedDate);
      setDate(updatedDate);
    }
  };
  const dispatch = useDispatch();
  useEffect(() => {
    //SetBaoCaoNgayInStore
    const dateISO = date.toISOString();

    dispatch(getDataBCGiaoBanCurent(dateISO));
  }, [date, dispatch]);

  useEffect(() => {
    //Set BCGiaoBanCurent In Store
    const dateISO = date.toISOString();

    dispatch(getDataBCNgaysForGiaoBan(dateISO));
  }, [date, khoas, dispatch]);

  useEffect(() => {
    //SetBaoCaoNgayInStore
    dispatch(getKhoasInBCGiaoBan());
  }, []);
  const navigate = useNavigate();
  const handleNhapBaoCao = () => {
    navigate("/khoa");
  };
  const handleDuyet = () => {
    const dateISO = date.toISOString();

    dispatch(
      InsertOrUpdateTrangThaiForBCGiaoBan(dateISO, !bcGiaoBanCurent.TrangThai)
    );
  };

  const isLargeScreen = useMediaQuery("(min-width:1200px)");
  const isMediumScreen = useMediaQuery(
    "(min-width:768px) and (max-width:1199px)"
  );
  const isSmallScreen = useMediaQuery("(max-width:767px)");

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorE2, setAnchorE2] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClick2 = (event) => {
    setAnchorE2(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClose2 = () => {
    setAnchorE2(null);
  };

  //Xu ly Export to Powerpoint

  const styleCenterTable = {
    x: 0,
    y: 1,
    w: 10,
    h: 4.5,
    fontFace: "Times New Roman",
    bold: true,
    color: "1939B7",
    fill: { color: "FFFFFF" },
    border: { type: "solid", color: "1939B7", pt: 1 },
    fontSize: 16,
    margin: [0.5, 0.5, 0.5, 0.5], // [Left, Top, Right, Bottom] margins for text in cell
    valign: "middle",
  };
  // margin: [0.5, 0.5, 0.5, 0.5], colSpan: 2
  const styleCenterCell = {
    fontFace: "Times New Roman",
    fontSize: 16,
    align: "center",
    color: "1939B7",
    bold: true,
    valign: "middle",
  };
  const styleLeftCell = {
    fontFace: "Times New Roman",
    fontSize: 16,
    align: "left",
    color: "1939B7",
    bold: true,
    valign: "middle",
  };
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
  const styleMegerCellKhoaKhamBenh = {
    fontSize: 14,
    fontFace: "Times New Roman",
    align: "center",
    valign: "middle",
    color: "1939B7",
    bold: true,
    // fill: { color: "FFFFFF" },
    // border: { type: "solid", color: "1939B7", pt: 1 }, // Thêm viền nếu cần
  };

  //Du lieu khoa GMHS
  const bcGMHS = baocaongays.filter((baocaongay) => {
    return baocaongay.KhoaID.MaKhoa === "GMHS";
  });
  const bcGM = bcGMHS[0];

  const handleExportToPowerPoint = () => {
    let pres = new pptxgen();

    let startSilde = pres.addSlide();
    startSilde.addImage({
      path: "/backgroundSlide.png",
      x: 0,
      y: 0,
      w: 10,
      h: 5.65,
    });
    //Du lieu khoa cap cuu

    const bcFilterTheoMaKhoa = getObjectByMaKhoa(baocaongays, "KCC");
    let bcNgayKhoaCC = { BSTruc: "", DDTruc: "" };
    if (bcFilterTheoMaKhoa.length > 0) bcNgayKhoaCC = bcFilterTheoMaKhoa[0];

    const bcLamSang = baocaongays
      .filter((baocaongay) => {
        return (
          (baocaongay.KhoaID.LoaiKhoa === "noi" &&
            baocaongay.KhoaID.MaKhoa !== "CDHA") ||
          baocaongay.KhoaID.LoaiKhoa === "ngoai"
        );
      })
      .sort((a, b) => {
        return a.KhoaID.STT - b.KhoaID.STT;
      });
    const HeNoi = () => {
      let totalRow = {
        TenKhoa: "Tổng",

        "ls-NgoaiGio": 0,
      };
      let stt = 0;
      const rows = bcLamSang.map((entry) => {
        const row = {
          TenKhoa: entry.KhoaID.TenKhoa,
          BSTruc: entry.BSTruc,
        };

        ["ls-NgoaiGio"].forEach((code) => {
          row[code] = 0;
        });

        entry.ChiTietChiSo.forEach((chitiet) => {
          if (row.hasOwnProperty(chitiet.ChiSoCode)) {
            row[chitiet.ChiSoCode] = chitiet.SoLuong;
            totalRow[chitiet.ChiSoCode] += chitiet.SoLuong;
          }
        });
        stt++;
        row["STT"] = stt;
        return row;
      });

      rows.unshift(totalRow);

      return rows;
    };

    const rowsKhoaCC = HeNoi();

    let slideKCC = pres.addSlide();

    slideKCC.addText("Trực khoa cấp cứu", {
      x: 0,
      y: 0,
      fontSize: 20,
      fontFace: "Times New Roman",
      bold: true,
      color: "FFFFFF",
      fill: { color: "1939B7" },
      align: "left",
      w: 9,
      h: 0.5,
    });

    slideKCC.addText(
      `Kíp trực: ${bcNgayKhoaCC?.BSTruc} - ${bcNgayKhoaCC?.DDTruc}`,
      {
        x: 0,
        y: 0.5,
        fontSize: 20,
        fontFace: "Times New Roman",
        bold: true,
        color: "FFFFFF",
        fill: { color: "1939B7" },
        align: "left",
        w: 10,
        h: 0.5,
      }
    );
    slideKCC.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
    const table1Data = [
      [
        {
          text: "Khám ngoài giờ khoa cấp cứu",
          options: { ...styleCenterCell },
        },
        {},
        { text: "Khám cấp cứu", options: styleCenterCell },
        { text: "Vào viện", options: styleCenterCell },
      ],
      [
        {},
        {},
        {
          text: chiso["kcc-TongKham"],
          options: {
            fontFace: "Times New Roman",
            fontSize: 16,
            align: "center",
            valign: "middle",
            color: "1939B7",
            bold: true,
          },
        },
        {
          text: chiso["kcc-VaoVien"],
          options: {
            fontFace: "Times New Roman",
            fontSize: 16,
            align: "center",
            valign: "middle",
            color: "1939B7",
            bold: true,
          },
        },
      ],
    ];
    slideKCC.addTable(table1Data, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 2,
      colW: [2, 1, 3, 3],
      border: { type: "solid", color: "1939B7", pt: 1 },
    });

    slideKCC.addShape(pres.shapes.RECTANGLE, {
      x: 0.5,
      y: 2,
      w: 3,
      h: 2,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKCC.addText("Khám ngoài giờ khoa cấp cứu", {
      x: 0.5, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 2, // với vị trí của các ô bạn muốn "trộn"
      w: 3, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 2, // với kích thước của các ô bạn muốn "trộn"
      fontSize: 16,
      fontFace: "Times New Roman",
      align: "center",
      valign: "middle",
      color: "1939B7",
      bold: true,
    });
    //Benh nhan vao vien cac khoa
    let slideBNVaoVienCacKhoa = pres.addSlide();
    slideBNVaoVienCacKhoa.addText("Bệnh nhân vào viện các khoa", {
      x: 0,
      y: 0,
      fontSize: 25,
      fontFace: "Times New Roman",
      bold: true,
      color: "FFFFFF",
      fill: { color: "1939B7" },
      align: "left",
      w: 10,
      h: 1,
    });
    slideBNVaoVienCacKhoa.addImage({
      path: "/logo.png",
      x: 9,
      y: 0,
      w: 1,
      h: 1,
    });
    const table2Data = [
      [
        { text: "STT", options: styleCenterCell },
        { text: "Khoa", options: styleCenterCell },
        { text: "Vào viện", options: styleCenterCell },
      ],
      ...rowsKhoaCC.map((row, index) => [
        { text: row.STT, options: styleCenterCell },
        { text: row.TenKhoa, options: styleLeftCell },
        { text: row["ls-NgoaiGio"], options: styleCenterCell },
      ]),
    ];

    slideBNVaoVienCacKhoa.addTable(table2Data, {
      x: 0,
      y: 1,
      w: 10,
      h: 4.5,
      border: { type: "solid", color: "1939B7", pt: 1 },
      autoPage: true,
      colW: [2, 6, 2],
    });
    slideBNVaoVienCacKhoa.addShape(pres.shapes.RECTANGLE, {
      x: 0,
      y: 1.56,
      w: 8,
      h: 0.55,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideBNVaoVienCacKhoa.addText("Tổng ", {
      x: 0, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1.56, // với vị trí của các ô bạn muốn "trộn"
      w: 8, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 0.55, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
      fontSize: 18,
    });

    //Export khoa kham benh
    let slideKhoaKhamBenh = pres.addSlide();

    // Adding Title
    slideKhoaKhamBenh.addText("Khoa khám bệnh", styleTitle);
    slideKhoaKhamBenh.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
    // Adding Table
    const tableData = [
      [
        { text: "Tổng khám", options: { rowSpan: 3 } },
        { text: "Bảo hiểm", options: { rowSpan: 3 } },
        { text: "Viện phí", options: { rowSpan: 3 } },
        { text: "Khám yêu cầu", options: { rowSpan: 3 } },
        { text: "Vào viện", options: { rowSpan: 3 } },
        { text: "Chuyển viện", options: { colSpan: 2 } },
        { text: "Chuyển viện", options: { colSpan: 2 } },
        { text: "Ngoại tỉnh", options: { colSpan: 4 } },
        { text: "Ngoại tỉnh", options: { colSpan: 4 } },
        { text: "Ngoại tỉnh", options: { colSpan: 4 } },
        { text: "Ngoại tỉnh", options: { colSpan: 4 } },
      ],
      [
        "",
        "",
        "",
        "",
        "",
        { text: "Nội Trú", options: { rowSpan: 2 } },
        { text: "Ngoại Trú", options: { rowSpan: 2 } },
        { text: "Ngoại trú", options: { colSpan: 2 } },
        { text: "Ngoại trú", options: { colSpan: 2 } },
        { text: "Nội trú", options: { colSpan: 2 } },
        { text: "Nội trú", options: { colSpan: 2 } },
      ],
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Bảo hiểm",
        "Viện phí",
        "Bảo hiểm",
        "Viện phí",
      ],
      [
        chiso["kkb-TongKham"],
        chiso["kkb-BaoHiem"],
        chiso["kkb-VienPhi"],
        chiso["kkb-YeuCau"],
        chiso["kkb-NBVaoVien"],
        chiso["kkb-CVNoiTru"],
        chiso["kkb-CVNgoaiTru"],
        chiso["kkb-NgoaiTinhNgoaiTruBH"],
        chiso["kkb-NgoaiTinhNgoaiTruVP"],
        chiso["kkb-NgoaiTinhNoiTruBH"],
        chiso["kkb-NgoaiTinhNoiTruVP"],
      ],
    ];

    slideKhoaKhamBenh.addTable(tableData, {
      x: 0,
      y: 1,
      w: 10,
      h: 4,
      border: { type: "solid", color: "1939B7", pt: 1 },
      fill: { color: "FFFFFF" },
      colW: [1, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
      fontFace: "Times New Roman",
      bold: true,
      fontSize: 13,
      color: "1939B7",
      align: "center",
      valign: "middle",
    });

    //meger cell

    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 0,
      y: 1,
      w: 1,
      h: 3,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Tổng khám", {
      x: 0, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 1, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 3, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 1,
      y: 1,
      w: 0.9,
      h: 3,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Bảo hiểm", {
      x: 1, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 0.9, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 3, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 1.9,
      y: 1,
      w: 0.9,
      h: 3,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Viện phí", {
      x: 1.9, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 0.9, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 3, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 2.8,
      y: 1,
      w: 0.9,
      h: 3,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Khám yêu cầu", {
      x: 2.8, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 0.9, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 3, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 3.7,
      y: 1,
      w: 0.9,
      h: 3,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Vào viện", {
      x: 3.7, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 0.9, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 3, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 4.6,
      y: 1,
      w: 1.8,
      h: 1,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Chuyển viện", {
      x: 4.6, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 1.8, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 4.6,
      y: 2,
      w: 0.9,
      h: 2,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Nội trú", {
      x: 4.6, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 2, // với vị trí của các ô bạn muốn "trộn"
      w: 0.9, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 2, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 5.5,
      y: 2,
      w: 0.9,
      h: 2,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Ngoại trú", {
      x: 5.5, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 2, // với vị trí của các ô bạn muốn "trộn"
      w: 0.9, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 2, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 6.4,
      y: 1,
      w: 3.6,
      h: 1,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Ngoại tỉnh", {
      x: 6.4, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 3.6, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 6.4,
      y: 2,
      w: 1.8,
      h: 1,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Ngoại trú", {
      x: 6.4, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 2, // với vị trí của các ô bạn muốn "trộn"
      w: 1.8, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slideKhoaKhamBenh.addShape(pres.shapes.RECTANGLE, {
      x: 8.2,
      y: 2,
      w: 1.8,
      h: 1,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slideKhoaKhamBenh.addText("Nội trú", {
      x: 8.2, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 2, // với vị trí của các ô bạn muốn "trộn"
      w: 1.8, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    //Export du lieu he ngoai

    let slideChuyenHeNgoai = pres.addSlide();
    slideChuyenHeNgoai.addText("BÁO CÁO GIAO BAN TOÀN VIỆN", {
      ...styleTitle,
      align: "center",
    });
    slideChuyenHeNgoai.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
    slideChuyenHeNgoai.addText(
      "PHẦN BÁO CÁO TỔNG TRỰC HỆ NGOẠI",
      styleTextChuyenForm
    );

    let slideBCTongTrucHeNgoai = pres.addSlide();

    slideBCTongTrucHeNgoai.addText(
      "Trực lãnh đạo: " + (bcGiaoBanCurent?.TrucLanhDao || ""),
      { ...styleTitle, h: 0.5 }
    );

    slideBCTongTrucHeNgoai.addText(
      "Tổng trực: " + (bcGiaoBanCurent?.TTHeNgoai || ""),
      {
        ...styleTitle,
        y: 0.5,
        h: 0.5,
      }
    );
    slideBCTongTrucHeNgoai.addImage({
      path: "/logo.png",
      x: 9,
      y: 0,
      w: 1,
      h: 1,
    });
    //sua lai

    const bcHeNgoai = baocaongays.filter((baocaongay) => {
      return (
        baocaongay.KhoaID.LoaiKhoa === "ngoai"
        //  && !excludedMaKhoa.includes(baocaongay.KhoaID.MaKhoa)
      );
    });

    const getRowDataHeNgoai = () => {
      let totalRow = {
        TenKhoa: "Tổng",
        BSTruc: "",
        "ls-TongNB": 0,
        "ls-NgoaiGio": 0,
        "ls-ChuyenVien": 0,
        "ls-TuVong": 0,
        "ls-Nang": 0,
        "ls-XinVe": 0,
        "ls-PhauThuat": 0,
        "ls-TheoDoi": 0,
      };

      const rows = bcHeNgoai.map((entry) => {
        const row = {
          TenKhoa: entry.KhoaID.TenKhoa,
          BSTruc: entry.BSTruc,
        };

        [
          "ls-TongNB",
          "ls-NgoaiGio",
          "ls-ChuyenVien",
          "ls-TuVong",
          "ls-Nang",
          "ls-XinVe",
          "ls-PhauThuat",
          "ls-TheoDoi",
        ].forEach((code) => {
          row[code] = 0;
        });

        entry.ChiTietChiSo.forEach((chitiet) => {
          if (row.hasOwnProperty(chitiet.ChiSoCode)) {
            row[chitiet.ChiSoCode] = chitiet.SoLuong;
            totalRow[chitiet.ChiSoCode] += chitiet.SoLuong;
          }
        });

        return row;
      });

      rows.unshift(totalRow);

      return rows;
    };

    const rowTongTrucHeNgoai = getRowDataHeNgoai();
    console.log("row tong truc he ngoai", rowTongTrucHeNgoai);
    const tableHeNgoai = [
      [
        { text: "Khoa", options: { ...styleCenterCell, fontSize: 13 } },
        { text: "Bác sĩ trực", options: { ...styleCenterCell, fontSize: 13 } },
        { text: "Tổng số", options: { ...styleCenterCell, fontSize: 13 } },
        { text: "Vào viện", options: { ...styleCenterCell, fontSize: 13 } },
        { text: "Chuyển viện", options: { ...styleCenterCell, fontSize: 13 } },
        { text: "Tử vong", options: { ...styleCenterCell, fontSize: 13 } },
        { text: "NB nặng", options: { ...styleCenterCell, fontSize: 13 } },
        { text: "Xin về", options: { ...styleCenterCell, fontSize: 13 } },
        { text: "Phẫu thuật", options: { ...styleCenterCell, fontSize: 13 } },
        { text: "Theo dõi", options: { ...styleCenterCell, fontSize: 13 } },
      ],
      ...rowTongTrucHeNgoai.map((row, index) => [
        { text: row.TenKhoa, options: { ...styleLeftCell, fontSize: 13 } },
        { text: row.BSTruc, options: { ...styleLeftCell, fontSize: 13 } },
        {
          text: row["ls-TongNB"],
          options: { ...styleCenterCell, fontSize: 13 },
        },
        {
          text: row["ls-NgoaiGio"],
          options: { ...styleCenterCell, fontSize: 13 },
        },
        {
          text: row["ls-ChuyenVien"],
          options: { ...styleCenterCell, fontSize: 13 },
        },
        {
          text: row["ls-TuVong"],
          options: { ...styleCenterCell, fontSize: 13 },
        },
        { text: row["ls-Nang"], options: { ...styleCenterCell, fontSize: 13 } },
        {
          text: row["ls-XinVe"],
          options: { ...styleCenterCell, fontSize: 13 },
        },
        {
          text: row["ls-PhauThuat"],
          options: { ...styleCenterCell, fontSize: 13 },
        },
        {
          text: row["ls-TheoDoi"],
          options: { ...styleCenterCell, fontSize: 13 },
        },
      ]),
    ];
    slideBCTongTrucHeNgoai.addTable(tableHeNgoai, {
      x: 0,
      y: 1,
      w: 10,
      h: 4.2,
      border: { type: "solid", color: "1939B7", pt: 1 },
      colW: [2.2, 2, 0.7, 0.7, 0.9, 0.7, 0.7, 0.7, 0.7, 0.7],
      color: "1939B7",
      fontFace: "Times New Roman",
      autoPage: true,
    });

    //Export du lieu khoa GMHS
    let slide = pres.addSlide();
    slide.addText("Báo cáo khoa gây mê hồi sức", styleTitle);
    slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
    const row = {
      BSTruc: bcGM?.BSTruc || "",
      DDTruc: bcGM?.DDTruc || "",
    };
    ["gmhs-TongMo", "gmhs-TrongGio", "gmhs-NgoaiGio"].forEach((code) => {
      row[code] = 0;
    });

    bcGM?.ChiTietChiSo?.forEach((chitiet) => {
      if (row.hasOwnProperty(chitiet.ChiSoCode)) {
        row[chitiet.ChiSoCode] = chitiet.SoLuong;
      }
    });

    const rows = [
      [
        "Bác sĩ trực",
        "KTV, điều dưỡng trực",
        "Số ca phẫu thuật",
        "Số ca mổ trong giờ",
        "Số ca mổ ngoài giờ",
      ],
      [
        row.BSTruc,
        row.DDTruc,
        row["gmhs-TongMo"],
        row["gmhs-TrongGio"],
        row["gmhs-NgoaiGio"],
      ],
    ];

    slide.addTable(rows, styleCenterTable);
    // slide.addImage({ path: "../../public/logoBVTPT.png" });

    const listBenhNhanBaoCaoTongTrucHeNgoai = [
      ngoaiBNTuvongs,
      ngoaiBNChuyenViens,
      ngoaiBNXinVes,
      ngoaiBNNangs,
      ngoaiBNPhauThuats,
      ngoaiBNTheoDois,
      ngoaiBNNgoaiGiosKhongGomCLC,
    ];

    const listTitleSlideHeNgoai = [
      "Người bệnh tử vong",
      "Người bệnh chuyển viện",
      "Người bệnh xin về",
      "Người bệnh nặng tại khoa",
      "Người bệnh phẫu thuật",
      "Người bệnh theo dõi",
      "Người bệnh vào viện ngoài giờ",
    ];
    listBenhNhanBaoCaoTongTrucHeNgoai.forEach((lstBenhNhan, index) => {
      //Export lstBenhNhan
      if (lstBenhNhan.length > 0) {
        //Slide chuyen ngoai gio he ngoai
        if (index === 6) {
          let slideChuyenNgoaiGio = pres.addSlide();
          slideChuyenNgoaiGio.addText("BÁO CÁO GIAO BAN TOÀN VIỆN", {
            ...styleTitle,
            align: "center",
          });
          slideChuyenNgoaiGio.addImage({
            path: "/logo.png",
            x: 9,
            y: 0,
            w: 1,
            h: 1,
          });
          slideChuyenNgoaiGio.addText(
            "NGƯỜI BỆNH VÀO VIỆN NGOÀI GIỜ HỆ NGOẠI",
            styleTextChuyenForm
          );
        }

        for (let benhnhan of lstBenhNhan) {
          // Slide chính với thông tin bệnh nhân
          let slide = pres.addSlide();
          slide.addText(
            `${listTitleSlideHeNgoai[index]} : ${lstBenhNhan.length}`,
            { ...styleTitle, h: 1 }
          );
          slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 0,
            y: 1,
            w: 1.6,
            h: 4.6,
            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          slide.addText(benhnhan.TenKhoa, {
            x: 0,
            y: 1,
            w: 1.6,
            h: 4.6,
            fontSize: 29,
            color: "bb1515",
            valign: "center",
            align: "center",
          });

          // Add shape cot 2
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 1.6,
            y: 1,
            w: 8.4,
            h: 4.6,
            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          // Tạo text cho cột 2
          let textForCol2 =
            benhnhan.Stt +
            ". " +
            benhnhan.TenBenhNhan +
            " - " +
            benhnhan.Tuoi +
            " tuổi - " +
            benhnhan.GioiTinh;
          textForCol2 +=
            benhnhan.DiaChi && benhnhan.DiaChi.trim().length > 0
              ? `\n- Địa chỉ: ${benhnhan.DiaChi.trim()}`
              : "";
          textForCol2 +=
            benhnhan.VaoVien && benhnhan.VaoVien.trim().length > 0
              ? `\n- Vào viện: ${benhnhan.VaoVien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.LyDoVV && benhnhan.LyDoVV.trim().length > 0
              ? `\n- Lý do vv: ${benhnhan.LyDoVV.trim()}`
              : "";
          textForCol2 +=
            benhnhan.DienBien && benhnhan.DienBien.trim().length > 0
              ? `\n- Diễn biến: ${benhnhan.DienBien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.ChanDoan && benhnhan.ChanDoan.trim().length > 0
              ? `\n- Chẩn đoán: ${benhnhan.ChanDoan.trim()}`
              : "";
          textForCol2 +=
            benhnhan.XuTri && benhnhan.XuTri.trim().length > 0
              ? `\n- Xử trí: ${benhnhan.XuTri.trim()}`
              : "";
          textForCol2 +=
            benhnhan.HienTai && benhnhan.HienTai.trim().length > 0
              ? `\n- Hiện tại: ${benhnhan.HienTai.trim()}`
              : "";
          textForCol2 +=
            benhnhan.GhiChu && benhnhan.GhiChu.trim().length > 0
              ? `\n- ${benhnhan.GhiChu.trim()}`
              : "";

          let MAX_CHARS_PER_LINE = 65; // Adjust as necessary
          let MAX_LINES_PER_SLIDE = 12; // Adjust as necessary
          let paragraphs = textForCol2.split("\n");
          let lines = [];

          paragraphs.forEach((paragraph) => {
            let words = paragraph.split(" ");
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

          for (let i = 0; i < lines.length; i += MAX_LINES_PER_SLIDE) {
            let textToInclude = lines
              .slice(i, i + MAX_LINES_PER_SLIDE)
              .join("\n");
            slide.addText(textToInclude, {
              x: 1.6,
              y: 1,
              w: 8.4,
              h: 4.5,
              fontFace: "Times New Roman",
              fontSize: 20,
              color: "1939B7",
            });
            if (i + MAX_LINES_PER_SLIDE < lines.length) {
              slide = pres.addSlide();
              slide.addText(
                `${listTitleSlideHeNgoai[index]} : ${lstBenhNhan.length}`,
                { ...styleTitle, h: 1 }
              );
              slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
              slide.addShape(pres.shapes.RECTANGLE, {
                x: 0,
                y: 1,
                w: 1.6,
                h: 4.6,
                fill: { color: "FFFFFF" },
                line: { color: "1939B7", width: 1 },
              });
              slide.addText(benhnhan.TenKhoa, {
                x: 0,
                y: 1,
                w: 1.6,
                h: 4.5,
                fontFace: "Times New Roman",
                fontSize: 30,
                color: "bb1515",
                valign: "center",
                align: "center",
              });
              // Add shape cot 2 vao slide moi
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

          for (let img of benhnhan.Images) {
            let imgSlide = pres.addSlide();
            imgSlide.addText(
              `${listTitleSlideHeNgoai[index]} : ${lstBenhNhan.length}`,
              { ...styleTitle, h: 1 }
            );
            imgSlide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
            imgSlide.addShape(pres.shapes.RECTANGLE, {
              x: 0,
              y: 1,
              w: 1.6,
              h: 4.6,
              fill: { color: "FFFFFF" },
              line: { color: "1939B7", width: 1 },
            });
            imgSlide.addText(benhnhan.TenKhoa, {
              x: 0,
              y: 1,
              w: 1.6,
              h: 4.5,
              fontSize: 30,
              fontFace: "Times New Roman",
              color: "bb1515",
              valign: "center",
              align: "center",
            });
            imgSlide.addImage({ path: img, x: 3.5, y: 1.1, w: 4.5, h: 4.5 });
          }
        }
      }
    });

    //Export du lieu tong truc he noi

    let slideChuyenHeNoi = pres.addSlide();
    slideChuyenHeNoi.addText("BÁO CÁO GIAO BAN TOÀN VIỆN", {
      ...styleTitle,
      align: "center",
    });
    slideChuyenHeNoi.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
    slideChuyenHeNoi.addText(
      "PHẦN BÁO CÁO TỔNG TRỰC HỆ NỘI",
      styleTextChuyenForm
    );

    let slideBCTongTrucHeNoi = pres.addSlide();

    slideBCTongTrucHeNoi.addText(
      "Trực lãnh đạo: " + (bcGiaoBanCurent?.TrucLanhDao || ""),
      { ...styleTitle, h: 0.5 }
    );

    slideBCTongTrucHeNoi.addText(
      "Tổng trực: " + (bcGiaoBanCurent?.TTHeNoi || ""),
      {
        ...styleTitle,
        y: 0.5,
        h: 0.5,
      }
    );
    slideBCTongTrucHeNoi.addImage({
      path: "/logo.png",
      x: 9,
      y: 0,
      w: 1,
      h: 1,
    });
    // const excludedMaKhoa = ["NoiYC", "NgoaiYC", "HSCCYC"];
    const bcHeNoi = baocaongays.filter((baocaongay) => {
      return (
        baocaongay.KhoaID.LoaiKhoa === "noi"
        // && !excludedMaKhoa.includes(baocaongay.KhoaID.MaKhoa)
      );
    });

    const getRowDataHeNoi = () => {
      let totalRow = {
        TenKhoa: "Tổng",
        BSTruc: "",
        "ls-TongNB": 0,
        "ls-NgoaiGio": 0,
        "ls-ChuyenVien": 0,
        "ls-TuVong": 0,
        "ls-Nang": 0,
        "ls-XinVe": 0,
        "ls-CanThiep": 0,
        "ls-TheoDoi": 0,
      };

      const rows = bcHeNoi.map((entry) => {
        const row = {
          TenKhoa: entry.KhoaID.TenKhoa,
          BSTruc: entry.BSTruc,
        };

        [
          "ls-TongNB",
          "ls-NgoaiGio",
          "ls-ChuyenVien",
          "ls-TuVong",
          "ls-Nang",
          "ls-XinVe",
          "ls-CanThiep",
          "ls-TheoDoi",
        ].forEach((code) => {
          row[code] = 0;
        });

        entry.ChiTietChiSo.forEach((chitiet) => {
          if (row.hasOwnProperty(chitiet.ChiSoCode)) {
            row[chitiet.ChiSoCode] = chitiet.SoLuong;
            totalRow[chitiet.ChiSoCode] += chitiet.SoLuong;
          }
        });

        return row;
      });

      rows.unshift(totalRow);

      return rows;
    };

    const rowTongTrucHeNoi = getRowDataHeNoi();
    console.log("row tong truc he noi", rowTongTrucHeNoi);
    const tableHeNoi = [
      [
        { text: "Khoa", options: { ...styleCenterCell, fontSize: 14 } },
        { text: "Bác sĩ trực", options: { ...styleCenterCell, fontSize: 14 } },
        { text: "Tổng số", options: { ...styleCenterCell, fontSize: 14 } },
        { text: "Vào viện", options: { ...styleCenterCell, fontSize: 14 } },
        { text: "Chuyển viện", options: { ...styleCenterCell, fontSize: 14 } },
        { text: "Tử vong", options: { ...styleCenterCell, fontSize: 14 } },
        { text: "NB nặng", options: { ...styleCenterCell, fontSize: 14 } },
        { text: "Xin về", options: { ...styleCenterCell, fontSize: 14 } },
        { text: "Can thiệp", options: { ...styleCenterCell, fontSize: 14 } },
        { text: "Theo dõi", options: { ...styleCenterCell, fontSize: 14 } },
      ],
      ...rowTongTrucHeNoi.map((row, index) => [
        { text: row.TenKhoa, options: { ...styleLeftCell, fontSize: 14 } },
        { text: row.BSTruc, options: { ...styleLeftCell, fontSize: 14 } },
        {
          text: row["ls-TongNB"],
          options: { ...styleCenterCell, fontSize: 14 },
        },
        {
          text: row["ls-NgoaiGio"],
          options: { ...styleCenterCell, fontSize: 14 },
        },
        {
          text: row["ls-ChuyenVien"],
          options: { ...styleCenterCell, fontSize: 14 },
        },
        {
          text: row["ls-TuVong"],
          options: { ...styleCenterCell, fontSize: 14 },
        },
        { text: row["ls-Nang"], options: { ...styleCenterCell, fontSize: 14 } },
        {
          text: row["ls-XinVe"],
          options: { ...styleCenterCell, fontSize: 14 },
        },
        {
          text: row["ls-CanThiep"],
          options: { ...styleCenterCell, fontSize: 14 },
        },
        {
          text: row["ls-TheoDoi"],
          options: { ...styleCenterCell, fontSize: 14 },
        },
      ]),
    ];
    slideBCTongTrucHeNoi.addTable(tableHeNoi, {
      x: 0,
      y: 1,
      w: 10,
      h: 4.5,
      border: { type: "solid", color: "1939B7", pt: 1 },
      color: "1939B7",
      colW: [2.2, 2, 0.7, 0.7, 0.9, 0.7, 0.7, 0.7, 0.7, 0.7],
      fontFace: "Times New Roman",
      align: "center",
      valign: "middle",

      autoPage: true,
    });

    //Export du lieu Can lam sang
    let slideChuyenCanLamSang = pres.addSlide();
    slideChuyenCanLamSang.addText("BÁO CÁO GIAO BAN TOÀN VIỆN", {
      ...styleTitle,
      align: "center",
    });
    slideChuyenCanLamSang.addImage({
      path: "/logo.png",
      x: 9,
      y: 0,
      w: 1,
      h: 1,
    });
    slideChuyenCanLamSang.addText("BÁO CÁO CẬN LÂM SÀNG", styleTextChuyenForm);

    let slideCanLamSang = pres.addSlide();

    slideCanLamSang.addText("Báo cáo cận lâm sàng", styleTitle);
    slideCanLamSang.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
    const bcKhoaCLS = baocaongays
      .filter((baocaongay) =>
        ["CDHA", "TDCN", "XNHoaSinh", "XNViSinh", "XNHuyetHoc"].includes(
          baocaongay.KhoaID.MaKhoa
        )
      )
      .sort((a, b) => a.KhoaID.STT - b.KhoaID.STT);

    const rowCamLamSang = bcKhoaCLS.map((entry) => {
      const row = {
        TenKhoa: entry.KhoaID.TenKhoa,
        BSTruc: entry.BSTruc,
      };

      [
        "cdha-Xquang",
        "cdha-CT16",
        "cdha-CT128",
        "cdha-MRI",
        "tdcn-SieuAm",
        "tdcn-NoiSoi",
        "xn-HuyetHoc",
        "xn-HoaSinh",
        "xn-ViSinh",
      ].forEach((code) => {
        row[code] = "";
      });

      entry.ChiTietChiSo.forEach((chitiet) => {
        if (row.hasOwnProperty(chitiet.ChiSoCode)) {
          row[chitiet.ChiSoCode] = chitiet.SoLuong;
        }
      });

      return row;
    });

    const tableCanLamSang = [
      [
        "Khoa",
        "BS trực",
        "XQ",
        "CT16",
        "CT128",
        "MRI",
        "Siêu âm",
        "Nội soi",
        "XNHH",
        "Sinh hóa",
        "Vi sinh",
      ],
      ...rowCamLamSang.map((row) => [
        row.TenKhoa,
        row.BSTruc,
        row["cdha-Xquang"],
        row["cdha-CT16"],
        row["cdha-CT128"],
        row["cdha-MRI"],
        row["tdcn-SieuAm"],
        row["tdcn-NoiSoi"],
        row["xn-HuyetHoc"],
        row["xn-HoaSinh"],
        row["xn-ViSinh"],
      ]),
    ];

    slideCanLamSang.addTable(tableCanLamSang, {
      x: 0,
      y: 1,
      w: 10,
      h: 4.6,
      align: "center",
      border: { type: "solid", color: "1939B7", pt: 1 },
      color: "1939B7",
      colW: [1.8, 1.7, 0.7, 0.7, 0.9, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
      fontFace: "Times New Roman",
      fontSize: 14,
      bold: true,
    });

    //Export du lieu Huyet hoc truyen mau

    let slideHuyethocTruyenMau = pres.addSlide();

    slideHuyethocTruyenMau.addText(
      "Báo cáo ĐV huyết học truyền máu",
      styleTitle
    );
    slideHuyethocTruyenMau.addImage({
      path: "/logo.png",
      x: 9,
      y: 0,
      w: 1,
      h: 1,
    });
    const filterBCHuyetHocTM = baocaongays.filter(
      (baocaongay) => baocaongay.KhoaID.MaKhoa === "HHTM"
    );

    const rowHHTM = {};
    [
      "Bacsi",
      "hhtm-HongCau",
      "hhtm-HuyetTuong",
      "hhtm-TieuCau",
      "hhtm-TongXN",
    ].forEach((code) => {
      rowHHTM[code] = "";
    });

    if (filterBCHuyetHocTM.length > 0) {
      const bcHHTM = filterBCHuyetHocTM[0];
      bcHHTM.ChiTietChiSo.forEach((chitiet) => {
        if (rowHHTM.hasOwnProperty(chitiet.ChiSoCode)) {
          rowHHTM[chitiet.ChiSoCode] = chitiet.SoLuong;
          rowHHTM["Bacsi"] = bcHHTM.BSTruc;
        }
      });
    }

    const tableHHTruyenMau = [
      [
        "Bác sĩ",
        "Khối hồng cầu",
        "Huyết tương tươi",
        "Tiểu cầu máy",
        "Tổng xét nghiệm",
      ],
      [
        rowHHTM["Bacsi"],
        rowHHTM["hhtm-HongCau"],
        rowHHTM["hhtm-HuyetTuong"],
        rowHHTM["hhtm-TieuCau"],
        rowHHTM["hhtm-TongXN"],
      ],
    ];

    slideHuyethocTruyenMau.addTable(tableHHTruyenMau, {
      x: 0,
      y: 1,
      w: 10,
      h: 3,
      margin: [0.5, 0.5, 0.5, 0.5],
      border: { type: "solid", color: "1939B7", pt: 1 },
      color: "1939B7",
      bold: true,
      align: "center",
      fontFace: "Times New Roman",
      fontSize: 14,
    });

    const listBenhNhanBaoCaoTongTrucHeNoi = [
      noiBNTuvongs,
      noiBNChuyenViens,
      noiBNXinVes,
      noiBNNangs,
      noiBNCanThieps,
      noiBNTheoDois,
      noiBNNgoaiGiosKhongGomCLC,
    ];

    const listTitleSlideHeNoi = [
      "Người bệnh tử vong",
      "Người bệnh chuyển viện",
      "Người bệnh xin về",
      "Người bệnh nặng tại khoa",
      "Người bệnh can thiệp",
      "Người bệnh theo dõi",
      "Người bệnh vào viện ngoài giờ",
    ];
    listBenhNhanBaoCaoTongTrucHeNoi.forEach((lstBenhNhan, index) => {
      //Export lstBenhNhan
      if (lstBenhNhan.length > 0) {
        //Slide chuyen ngoai gio he noi
        if (index === 6) {
          let slideChuyenNgoaiGio = pres.addSlide();
          slideChuyenNgoaiGio.addText("BÁO CÁO GIAO BAN TOÀN VIỆN", {
            ...styleTitle,
            align: "center",
          });
          slideChuyenNgoaiGio.addImage({
            path: "/logo.png",
            x: 9,
            y: 0,
            w: 1,
            h: 1,
          });
          slideChuyenNgoaiGio.addText(
            "NGƯỜI BỆNH VÀO VIỆN NGOÀI GIỜ HỆ NỘI",
            styleTextChuyenForm
          );
        }

        for (let benhnhan of lstBenhNhan) {
          // Slide chính với thông tin bệnh nhân
          let slide = pres.addSlide();
          slide.addText(
            `${listTitleSlideHeNoi[index]} : ${lstBenhNhan.length}`,
            { ...styleTitle, h: 1 }
          );
          slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 0,
            y: 1,
            w: 1.6,
            h: 4.6,
            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          slide.addText(benhnhan.TenKhoa, {
            x: 0,
            y: 1,
            w: 1.6,
            h: 4.6,
            fontSize: 30,
            fontFace: "Times New Roman",
            color: "bb1515",
            valign: "center",
            align: "center",
          });

          // Add shape cot 2
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 1.6,
            y: 1,
            w: 8.4,
            h: 4.6,

            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          // Tạo text cho cột 2
          let textForCol2 =
            benhnhan.Stt +
            ". " +
            benhnhan.TenBenhNhan +
            " - " +
            benhnhan.Tuoi +
            " tuổi - " +
            benhnhan.GioiTinh;
          textForCol2 +=
            benhnhan.DiaChi && benhnhan.DiaChi.trim().length > 0
              ? `\n- Địa chỉ: ${benhnhan.DiaChi.trim()}`
              : "";
          textForCol2 +=
            benhnhan.VaoVien && benhnhan.VaoVien.trim().length > 0
              ? `\n- Vào viện: ${benhnhan.VaoVien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.LyDoVV && benhnhan.LyDoVV.trim().length > 0
              ? `\n- Lý do vv: ${benhnhan.LyDoVV.trim()}`
              : "";
          textForCol2 +=
            benhnhan.DienBien && benhnhan.DienBien.trim().length > 0
              ? `\n- Diễn biến: ${benhnhan.DienBien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.ChanDoan && benhnhan.ChanDoan.trim().length > 0
              ? `\n- Chẩn đoán: ${benhnhan.ChanDoan.trim()}`
              : "";
          textForCol2 +=
            benhnhan.XuTri && benhnhan.XuTri.trim().length > 0
              ? `\n- Xử trí: ${benhnhan.XuTri.trim()}`
              : "";
          textForCol2 +=
            benhnhan.HienTai && benhnhan.HienTai.trim().length > 0
              ? `\n- Hiện tại: ${benhnhan.HienTai.trim()}`
              : "";
          textForCol2 +=
            benhnhan.GhiChu && benhnhan.GhiChu.trim().length > 0
              ? `\n- ${benhnhan.GhiChu.trim()}`
              : "";

          let MAX_CHARS_PER_LINE = 65; // Adjust as necessary
          let MAX_LINES_PER_SLIDE = 12; // Adjust as necessary
          let paragraphs = textForCol2.split("\n");

          let lines = [];

          paragraphs.forEach((paragraph) => {
            let words = paragraph.split(" ");
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

          for (let i = 0; i < lines.length; i += MAX_LINES_PER_SLIDE) {
            let textToInclude = lines
              .slice(i, i + MAX_LINES_PER_SLIDE)
              .join("\n");
            slide.addText(textToInclude, {
              x: 1.6,
              y: 1,
              w: 8.4,
              h: 4.5,
              fontSize: 20,
              fontFace: "Times New Roman",
              color: "1939B7",
            });
            if (i + MAX_LINES_PER_SLIDE < lines.length) {
              slide = pres.addSlide();
              slide.addText(
                `${listTitleSlideHeNoi[index]} : ${lstBenhNhan.length}`,
                { ...styleTitle, h: 1 }
              );
              slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
              slide.addShape(pres.shapes.RECTANGLE, {
                x: 0,
                y: 1,
                w: 1.6,
                h: 4.6,
                fill: { color: "FFFFFF" },
                line: { color: "1939B7", width: 1 },
              });
              slide.addText(benhnhan.TenKhoa, {
                x: 0,
                y: 1,
                w: 1.6,
                h: 4.5,
                fontSize: 30,
                fontFace: "Times New Roman",
                color: "bb1515",
                valign: "center",
                align: "center",
              });
              // Add shape cot 2 vao slide moi
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

          for (let img of benhnhan.Images) {
            let imgSlide = pres.addSlide();
            imgSlide.addText(
              `${listTitleSlideHeNoi[index]} : ${lstBenhNhan.length}`,
              { ...styleTitle, h: 1 }
            );
            imgSlide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
            imgSlide.addShape(pres.shapes.RECTANGLE, {
              x: 0,
              y: 1,
              w: 1.6,
              h: 4.6,
              fill: { color: "FFFFFF" },
              line: { color: "1939B7", width: 1 },
            });
            imgSlide.addText(benhnhan.TenKhoa, {
              x: 0,
              y: 1,
              w: 1.6,
              h: 4.5,
              fontSize: 30,
              fontFace: "Times New Roman",
              color: "bb1515",
              valign: "center",
              align: "center",
            });
            imgSlide.addImage({ path: img, x: 3.5, y: 1.1, w: 4.5, h: 4.5 });
          }
        }
      }
    });

    //Export du lieu Trung tam CLC
    let slideChuyenTrungTamCLC = pres.addSlide();
    slideChuyenTrungTamCLC.addText("BÁO CÁO GIAO BAN TOÀN VIỆN", {
      ...styleTitle,
      align: "center",
    });
    slideChuyenTrungTamCLC.addImage({
      path: "/logo.png",
      x: 9,
      y: 0,
      w: 1,
      h: 1,
    });
    slideChuyenTrungTamCLC.addText(
      "BÁO CÁO TRUNG TÂM KCB CHẤT LƯỢNG CAO",
      styleTextChuyenForm
    );

    let slideThongKeGiuong = pres.addSlide();

    slideThongKeGiuong.addText(
      "Trung tâm khám chữa bệnh chất lượng cao",
      styleTitle
    );
    slideThongKeGiuong.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
    const filterBCs = baocaongays.filter(
      (baocaongay) => baocaongay.KhoaID.MaKhoa === "CLC"
    );
    let rowThongKeGiuong = {};
    ["clc-TongNB", "clc-VaoThang", "clc-ChuyenSang", "clc-GiuongTrong"].forEach(
      (code) => {
        rowThongKeGiuong[code] = 0;
      }
    );

    if (filterBCs.length > 0) {
      const bcCLC = filterBCs[0];
      bcCLC.ChiTietChiSo.forEach((chitiet) => {
        if (rowThongKeGiuong.hasOwnProperty(chitiet.ChiSoCode)) {
          rowThongKeGiuong[chitiet.ChiSoCode] = chitiet.SoLuong;
        }
      });
    }

    const tableThongKeGiuong = [
      [
        "Tổng số NB",
        "NB vào thẳng",
        "NB từ các khoa chuyển sang",
        "Số giường trống",
      ],
      [
        rowThongKeGiuong["clc-TongNB"],
        rowThongKeGiuong["clc-VaoThang"],
        rowThongKeGiuong["clc-ChuyenSang"],
        rowThongKeGiuong["clc-GiuongTrong"],
      ],
    ];

    slideThongKeGiuong.addTable(tableThongKeGiuong, {
      x: 0,
      y: 1,
      w: 10,
      h: 1,
      border: { type: "solid", color: "1939B7", pt: 1 },
      color: "1939B7",
      align: "center",
      fontFace: "Times New Roman",
      fontSize: 14,
      bold: true,
    });

    const bcTrungTamCLC = baocaongays.filter((baocaongay) =>
      ["NoiYC", "NgoaiYC", "HSCCYC"].includes(baocaongay.KhoaID.MaKhoa)
    );

    let totalRow = {
      TenKhoa: "Tổng",
      BSTruc: "",
      "ls-TongNB": 0,
      "ls-NgoaiGio": 0,
      "ls-ChuyenVien": 0,
      "ls-TuVong": 0,
      "ls-Nang": 0,
      "ls-XinVe": 0,
      "ls-PhauThuat": 0,
      "ls-TheoDoi": 0,
    };

    const rowThongKeTrungTamCLC = bcTrungTamCLC.map((entry) => {
      const row = {
        TenKhoa: entry.KhoaID.TenKhoa,
        BSTruc: entry.BSTruc,
      };

      [
        "ls-TongNB",
        "ls-NgoaiGio",
        "ls-ChuyenVien",
        "ls-TuVong",
        "ls-Nang",
        "ls-XinVe",
        "ls-PhauThuat",
        "ls-TheoDoi",
      ].forEach((code) => {
        row[code] = 0;
      });

      entry.ChiTietChiSo.forEach((chitiet) => {
        if (row.hasOwnProperty(chitiet.ChiSoCode)) {
          row[chitiet.ChiSoCode] = chitiet.SoLuong;
          totalRow[chitiet.ChiSoCode] += chitiet.SoLuong;
        }
      });

      return row;
    });

    rowThongKeTrungTamCLC.unshift(totalRow);

    const tableThongKeTrungTamCLC = [
      [
        "Khoa",
        "Bác sĩ trực",
        "Tổng số",
        "Vào viện",
        "Chuyển viện",
        "Tử vong",
        "NB nặng",
        "Xin về",
        "Phẫu thuật",
        "Theo dõi",
      ],
      ...rowThongKeTrungTamCLC.map((row) => [
        row.TenKhoa,
        row.BSTruc,
        row["ls-TongNB"],
        row["ls-NgoaiGio"],
        row["ls-ChuyenVien"],
        row["ls-TuVong"],
        row["ls-Nang"],
        row["ls-XinVe"],
        row["ls-PhauThuat"],
        row["ls-TheoDoi"],
      ]),
    ];

    slideThongKeGiuong.addTable(tableThongKeTrungTamCLC, {
      x: 0,
      y: 2.1,
      w: 10,
      h: 3.5,
      // margin: [0.5, 0.5, 0.5, 0.5],
      colW: [2.2, 2.1, 0.7, 0.7, 0.8, 0.7, 0.7, 0.7, 0.7,0.7],
      align: "center",
      valign: "middle",
      border: { type: "solid", color: "1939B7", pt: 1 },
      color: "1939B7",
      fontFace: "Times New Roman",
      fontSize: 14,
      bold: true,
    });

    //Du lieu Ngoai gio TT CLC

    const listBenhNhanBaoCaoTTCLC = [
      hsccycBNNgoaiGios,
      noiycBNNgoaiGios,
      ngoaiycBNNgoaiGios,
    ];

    //kiem tra neu co BN ngoai gio thi hien thi slide chuyen
    if (
      hsccycBNNgoaiGios.length +
        noiycBNNgoaiGios.length +
        ngoaiycBNNgoaiGios.length >
      0
    ) {
      //Slide chuyen ngoai gio

      let slideChuyenNgoaiGio = pres.addSlide();
      slideChuyenNgoaiGio.addText("BÁO CÁO GIAO BAN TOÀN VIỆN", {
        ...styleTitle,
        align: "center",
      });
      slideChuyenNgoaiGio.addImage({
        path: "/logo.png",
        x: 9,
        y: 0,
        w: 1,
        h: 1,
      });
      slideChuyenNgoaiGio.addText(
        "NGƯỜI BỆNH VÀO VIỆN NGOÀI GIỜ TT KCB CLC",
        styleTextChuyenForm
      );
    }
    listBenhNhanBaoCaoTTCLC.forEach((lstBenhNhan, index) => {
      //Export lstBenhNhan
      if (lstBenhNhan.length > 0) {
        for (let benhnhan of lstBenhNhan) {
          // Slide chính với thông tin bệnh nhân
          let slide = pres.addSlide();
          slide.addText(
            `Người bệnh vào viện ngoài giờ: ${
              hsccycBNNgoaiGios.length +
              noiycBNNgoaiGios.length +
              ngoaiycBNNgoaiGios.length
            }`,
            {
              ...styleTitle,
              h: 1,
            }
          );
          slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 0,
            y: 1,
            w: 1.4,
            h: 4.6,
            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          slide.addText(benhnhan.TenKhoa, {
            x: 0,
            y: 1,
            w: 1.4,
            h: 4.6,
            fontFace: "Times New Roman",
            fontSize: 30,
            color: "bb1515",
            valign: "center",
            align: "center",
          });

          // Add shape cot 2
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 1.4,
            y: 1,
            w: 8.6,
            h: 4.6,
            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          // Tạo text cho cột 2
          let textForCol2 =
            benhnhan.Stt +
            ". " +
            benhnhan.TenBenhNhan +
            " - " +
            benhnhan.Tuoi +
            " tuổi - " +
            benhnhan.GioiTinh;
          textForCol2 +=
            benhnhan.DiaChi && benhnhan.DiaChi.trim().length > 0
              ? `\n- Địa chỉ: ${benhnhan.DiaChi.trim()}`
              : "";
          textForCol2 +=
            benhnhan.VaoVien && benhnhan.VaoVien.trim().length > 0
              ? `\n- Vào viện: ${benhnhan.VaoVien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.LyDoVV && benhnhan.LyDoVV.trim().length > 0
              ? `\n- Lý do vv: ${benhnhan.LyDoVV.trim()}`
              : "";
          textForCol2 +=
            benhnhan.DienBien && benhnhan.DienBien.trim().length > 0
              ? `\n- Diễn biến: ${benhnhan.DienBien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.ChanDoan && benhnhan.ChanDoan.trim().length > 0
              ? `\n- Chẩn đoán: ${benhnhan.ChanDoan.trim()}`
              : "";
          textForCol2 +=
            benhnhan.XuTri && benhnhan.XuTri.trim().length > 0
              ? `\n- Xử trí: ${benhnhan.XuTri.trim()}`
              : "";
          textForCol2 +=
            benhnhan.HienTai && benhnhan.HienTai.trim().length > 0
              ? `\n- Hiện tại: ${benhnhan.HienTai.trim()}`
              : "";
          textForCol2 +=
            benhnhan.GhiChu && benhnhan.GhiChu.trim().length > 0
              ? `\n- ${benhnhan.GhiChu.trim()}`
              : "";

          let MAX_CHARS_PER_LINE = 65; // Adjust as necessary
          let MAX_LINES_PER_SLIDE = 12; // Adjust as necessary
          let paragraphs = textForCol2.split("\n");
          let lines = [];

          paragraphs.forEach((paragraph) => {
            let words = paragraph.split(" ");
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

          for (let i = 0; i < lines.length; i += MAX_LINES_PER_SLIDE) {
            let textToInclude = lines
              .slice(i, i + MAX_LINES_PER_SLIDE)
              .join("\n");
            slide.addText(textToInclude, {
              x: 1.5,
              y: 1,
              w: 8.5,
              h: 4.5,
              fontSize: 20,
              fontFace: "Times New Roman",
              color: "1939B7",
            });
            if (i + MAX_LINES_PER_SLIDE < lines.length) {
              slide = pres.addSlide();
              slide.addText(
                `Người bệnh vào viện ngoài giờ: ${
                  hsccycBNNgoaiGios.length +
                  noiycBNNgoaiGios.length +
                  ngoaiycBNNgoaiGios.length
                }`,
                {
                  ...styleTitle,
                  h: 1,
                }
              );
              slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
              slide.addShape(pres.shapes.RECTANGLE, {
                x: 0,
                y: 1,
                w: 1.4,
                h: 4.6,
                fill: { color: "FFFFFF" },
                line: { color: "1939B7", width: 1 },
              });
              slide.addText(benhnhan.TenKhoa, {
                x: 0,
                y: 1,
                w: 1.4,
                h: 4.5,
                fontSize: 30,
                fontFace: "Times New Roman",
                color: "bb1515",
                valign: "center",
                align: "center",
              });
              // Add shape cot 2 vao slide moi
              slide.addShape(pres.shapes.RECTANGLE, {
                x: 1.4,
                y: 1,
                w: 8.6,
                h: 4.6,
                fill: { color: "FFFFFF" },
                line: { color: "1939B7", width: 1 },
              });
            }
          }

          for (let img of benhnhan.Images) {
            let imgSlide = pres.addSlide();
            imgSlide.addText(
              `Người bệnh vào viện ngoài giờ : ${ hsccycBNNgoaiGios.length +
                noiycBNNgoaiGios.length +
                ngoaiycBNNgoaiGios.length}`,
              { ...styleTitle, h: 1 }
            );
            imgSlide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
            imgSlide.addShape(pres.shapes.RECTANGLE, {
              x: 0,
              y: 1,
              w: 1.4,
              h: 4.6,
              fill: { color: "FFFFFF" },
              line: { color: "1939B7", width: 1 },
            });
            imgSlide.addText(benhnhan.TenKhoa, {
              x: 0,
              y: 1,
              w: 1.4,
              h: 4.5,
              fontSize: 30,
              fontFace: "Times New Roman",
              color: "bb1515",
              valign: "center",
              align: "center",
            });
            imgSlide.addImage({ path: img, x: 3.5, y: 1.1, w: 4.5, h: 4.5 });
          }
        }
      }
    });

    let finalSlide = pres.addSlide();
    finalSlide.addImage({
      path: "/backgroundSlide.png",
      x: 0,
      y: 0,
      w: 10,
      h: 5.65,
    });
    pres.writeFile(`Báo cáo giao ban ngày ${fDate(date)}`);
  };

  const handleExportTrungTamCLC = () => {
    let pres = new pptxgen();

    let startSilde = pres.addSlide();
    startSilde.addImage({
      path: "/ttclc.jpg",
      x: 0,
      y: 0,
      w: 10,
      h: 5.65,
    });

    //Export du lieu Trung tam CLC
    let slideChuyenTrungTamCLC = pres.addSlide();
    slideChuyenTrungTamCLC.addText("BÁO CÁO GIAO BAN TOÀN VIỆN", {
      ...styleTitle,
      align: "center",
    });
    slideChuyenTrungTamCLC.addImage({
      path: "/logo.png",
      x: 9,
      y: 0,
      w: 1,
      h: 1,
    });
    slideChuyenTrungTamCLC.addText(
      "BÁO CÁO TRUNG TÂM KCB CHẤT LƯỢNG CAO",
      styleTextChuyenForm
    );

    let slideThongKeGiuong = pres.addSlide();

    slideThongKeGiuong.addText(
      "Trung tâm khám chữa bệnh chất lượng cao",
      styleTitle
    );
    slideThongKeGiuong.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
    const filterBCs = baocaongays.filter(
      (baocaongay) => baocaongay.KhoaID.MaKhoa === "CLC"
    );
    let rowThongKeGiuong = {};
    ["clc-TongNB", "clc-VaoThang", "clc-ChuyenSang", "clc-GiuongTrong"].forEach(
      (code) => {
        rowThongKeGiuong[code] = 0;
      }
    );

    if (filterBCs.length > 0) {
      const bcCLC = filterBCs[0];
      bcCLC.ChiTietChiSo.forEach((chitiet) => {
        if (rowThongKeGiuong.hasOwnProperty(chitiet.ChiSoCode)) {
          rowThongKeGiuong[chitiet.ChiSoCode] = chitiet.SoLuong;
        }
      });
    }

    const tableThongKeGiuong = [
      [
        "Tổng số NB",
        "NB vào thẳng",
        "NB từ các khoa chuyển sang",
        "Số giường trống",
      ],
      [
        rowThongKeGiuong["clc-TongNB"],
        rowThongKeGiuong["clc-VaoThang"],
        rowThongKeGiuong["clc-ChuyenSang"],
        rowThongKeGiuong["clc-GiuongTrong"],
      ],
    ];

    slideThongKeGiuong.addTable(tableThongKeGiuong, {
      x: 0,
      y: 1,
      w: 10,
      h: 1,
      border: { type: "solid", color: "1939B7", pt: 1 },
      color: "1939B7",
      align: "center",
      fontFace: "Times New Roman",
      fontSize: 14,
      bold: true,
    });

    const bcTrungTamCLC = baocaongays.filter((baocaongay) =>
      ["NoiYC", "NgoaiYC", "HSCCYC"].includes(baocaongay.KhoaID.MaKhoa)
    );

    let totalRow = {
      TenKhoa: "Tổng",
      BSTruc: "",
      "ls-TongNB": 0,
      "ls-NgoaiGio": 0,
      "ls-ChuyenVien": 0,
      "ls-TuVong": 0,
      "ls-Nang": 0,
      "ls-XinVe": 0,
      "ls-PhauThuat": 0,
      "ls-TheoDoi": 0,
    };

    const rowThongKeTrungTamCLC = bcTrungTamCLC.map((entry) => {
      const row = {
        TenKhoa: entry.KhoaID.TenKhoa,
        BSTruc: entry.BSTruc,
      };

      [
        "ls-TongNB",
        "ls-NgoaiGio",
        "ls-ChuyenVien",
        "ls-TuVong",
        "ls-Nang",
        "ls-XinVe",
        "ls-PhauThuat",
        "ls-TheoDoi",
      ].forEach((code) => {
        row[code] = 0;
      });

      entry.ChiTietChiSo.forEach((chitiet) => {
        if (row.hasOwnProperty(chitiet.ChiSoCode)) {
          row[chitiet.ChiSoCode] = chitiet.SoLuong;
          totalRow[chitiet.ChiSoCode] += chitiet.SoLuong;
        }
      });

      return row;
    });

    rowThongKeTrungTamCLC.unshift(totalRow);

    const tableThongKeTrungTamCLC = [
      [
        "Khoa",
        "Bác sĩ trực",
        "Tổng số",
        "Vào viện",
        "Chuyển viện",
        "Tử vong",
        "NB nặng",
        "Xin về",
        "Phẫu thuật",
        "Theo dõi",
      ],
      ...rowThongKeTrungTamCLC.map((row) => [
        row.TenKhoa,
        row.BSTruc,
        row["ls-TongNB"],
        row["ls-NgoaiGio"],
        row["ls-ChuyenVien"],
        row["ls-TuVong"],
        row["ls-Nang"],
        row["ls-XinVe"],
        row["ls-PhauThuat"],
        row["ls-TheoDoi"],
      ]),
    ];

    slideThongKeGiuong.addTable(tableThongKeTrungTamCLC, {
      x: 0,
      y: 2.1,
      w: 10,
      h: 3.5,
      // margin: [0.5, 0.5, 0.5, 0.5],
      colW: [2.2, 2, 0.7, 0.7, 0.9, 0.7, 0.7, 0.7, 0.7,0.7],
      align: "center",
      valign: "middle",
      border: { type: "solid", color: "1939B7", pt: 1 },
      color: "1939B7",
      fontFace: "Times New Roman",
      fontSize: 14,
      bold: true,
    });

    //Export Phong kham yeu cau
    let slidePhongKhamYeuCau = pres.addSlide();

    // Adding Title
    slidePhongKhamYeuCau.addText("Tổng hợp các phòng khám yêu cầu", styleTitle);
    slidePhongKhamYeuCau.addImage({
      path: "/logo.png",
      x: 9,
      y: 0,
      w: 1,
      h: 1,
    });

    //Xứ lý dữ liệu phòng khám yêu cầu

    const getRowData = () => {
      let totalRow = {
        TenKhoa: "Tổng",

        "pkyc-TongKham": 0,
        "pkyc-BaoHiem": 0,
        "pkyc-VienPhi": 0,
        "pkyc-YeuCau": 0,
        "pkyc-NBVaoVien": 0,
        "pkyc-CVNgoaiTru": 0,
        "pkyc-CVNoiTru": 0,
        "pkyc-NgoaiTinhNgoaiTruBH": 0,
        "pkyc-NgoaiTinhNgoaiTruVP": 0,
        "pkyc-NgoaiTinhNoiTruBH": 0,
        "pkyc-NgoaiTinhNoiTruVP": 0,
      };

      const rows = pkycs.map((entry) => {
        const row = {
          TenKhoa: entry.KhoaID.TenKhoa,
        };

        [
          "pkyc-TongKham",
          "pkyc-BaoHiem",
          "pkyc-VienPhi",
          "pkyc-YeuCau",
          "pkyc-NBVaoVien",
          "pkyc-CVNgoaiTru",
          "pkyc-CVNoiTru",
          "pkyc-NgoaiTinhNgoaiTruBH",
          "pkyc-NgoaiTinhNgoaiTruVP",
          "pkyc-NgoaiTinhNoiTruBH",
          "pkyc-NgoaiTinhNoiTruVP",
        ].forEach((code) => {
          row[code] = 0;
        });

        entry.ChiTietChiSo.forEach((chitiet) => {
          if (row.hasOwnProperty(chitiet.ChiSoCode)) {
            row[chitiet.ChiSoCode] = chitiet.SoLuong;
            totalRow[chitiet.ChiSoCode] += chitiet.SoLuong;
          }
        });

        return row;
      });

      rows.unshift(totalRow);

      return rows;
    };

    const rowsPKYC = getRowData();

    // Adding Table
    const tableDataPKYC = [
      [
        { text: "", options: { rowSpan: 3 } },
        { text: "T", options: { rowSpan: 3 } },
        { text: "", options: { rowSpan: 3 } },
        { text: "", options: { rowSpan: 3 } },
        { text: "", options: { rowSpan: 3 } },
        { text: "", options: { rowSpan: 3 } },
        { text: "", options: { colSpan: 2 } },
        { text: "", options: { colSpan: 2 } },
        { text: "", options: { colSpan: 4 } },
        { text: "", options: { colSpan: 4 } },
        { text: "", options: { colSpan: 4 } },
        { text: "", options: { colSpan: 4 } },
      ],
      [
        "",
        "",
        "",
        "",
        "",
        "",
        { text: "", options: { rowSpan: 2 } },
        { text: "", options: { rowSpan: 2 } },
        { text: "", options: { colSpan: 2 } },
        { text: "", options: { colSpan: 2 } },
        { text: "", options: { colSpan: 2 } },
        { text: "", options: { colSpan: 2 } },
      ],
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Bảo hiểm",
        "Viện phí",
        "Bảo hiểm",
        "Viện phí",
      ],
      ...rowsPKYC.map((row) => [
        { text: row.TenKhoa, options: styleLeftCell },
        row["pkyc-TongKham"],
        row["pkyc-BaoHiem"],
        row["pkyc-VienPhi"],
        row["pkyc-YeuCau"],
        row["pkyc-NBVaoVien"],
        row["pkyc-CVNgoaiTru"],
        row["pkyc-CVNoiTru"],
        row["pkyc-NgoaiTinhNgoaiTruBH"],
        row["pkyc-NgoaiTinhNgoaiTruVP"],
        row["pkyc-NgoaiTinhNoiTruBH"],
        row["pkyc-NgoaiTinhNoiTruVP"],
      ]),
    ];

    slidePhongKhamYeuCau.addTable(tableDataPKYC, {
      x: 0,
      y: 1,
      w: 10,
      h: 4.5,
      border: { type: "solid", color: "1939B7", pt: 1 },
      fill: { color: "FFFFFF" },
      colW: [2.3, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
      fontFace: "Times New Roman",
      bold: true,
      fontSize: 14,
      color: "1939B7",
      align: "center",
      valign: "middle",
      autoPage: true,
    });

    //meger cell

    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 0,
      y: 1,
      w: 2.3,
      h: 1.7,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Phòng khám ", {
      x: 0, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 2.3, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1.7, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 2.3,
      y: 1,
      w: 0.7,
      h: 1.7,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Tổng khám", {
      x: 2.3, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 0.7, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1.7, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 3,
      y: 1,
      w: 0.7,
      h: 1.7,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Bảo hiểm", {
      x: 3, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 0.7, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1.7, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 3.7,
      y: 1,
      w: 0.7,
      h: 1.7,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Viện phí", {
      x: 3.7, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 0.7, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1.7, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 4.4,
      y: 1,
      w: 0.7,
      h: 1.7,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Yêu cầu", {
      x: 4.4, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 0.7, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1.7, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 5.1,
      y: 1,
      w: 0.7,
      h: 1.7,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Vào viện", {
      x: 5.1, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 0.7, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1.7, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 5.8,
      y: 1,
      w: 1.4,
      h: 0.5,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Chuyển viện", {
      x: 5.8, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 1.4, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 0.5, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 5.8,
      y: 1.5,
      w: 0.7,
      h: 1.2,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Nội trú", {
      x: 5.8, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1.5, // với vị trí của các ô bạn muốn "trộn"
      w: 0.7, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1.2, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 6.5,
      y: 1.5,
      w: 0.7,
      h: 1.2,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Ngoại trú", {
      x: 6.5, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1.5, // với vị trí của các ô bạn muốn "trộn"
      w: 0.7, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 1.2, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 7.2,
      y: 1,
      w: 2.8,
      h: 0.5,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Ngoại tỉnh", {
      x: 7.2, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1, // với vị trí của các ô bạn muốn "trộn"
      w: 2.8, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 0.5, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 7.2,
      y: 1.5,
      w: 1.4,
      h: 0.65,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Ngoại trú", {
      x: 7.2, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1.5, // với vị trí của các ô bạn muốn "trộn"
      w: 1.4, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 0.65, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });
    slidePhongKhamYeuCau.addShape(pres.shapes.RECTANGLE, {
      x: 8.6,
      y: 1.5,
      w: 1.4,
      h: 0.65,
      fill: { color: "FFFFFF" },
      line: { color: "1939B7", width: 1 },
    });
    slidePhongKhamYeuCau.addText("Nội trú", {
      x: 8.6, // Điều chỉnh tọa độ x và y sao cho phù hợp
      y: 1.5, // với vị trí của các ô bạn muốn "trộn"
      w: 1.4, // Điều chỉnh chiều rộng và chiều cao sao cho phù hợp
      h: 0.65, // với kích thước của các ô bạn muốn "trộn"
      ...styleMegerCellKhoaKhamBenh,
    });

    //Du lieu cac BN quan tam  TTCLC
    const listBenhNhanQuanTamCLC = [
      clcBNTuvongs,
      clcBNChuyenViens,
      clcBNXinVes,
      clcBNNangs,
      clcBNCanThieps,
      ngoaiycBNPhauThuats,
      clcBNTheoDois,
    ];

    const listTitleSlideTTCLC = [
      "Người bệnh tử vong",
      "Người bệnh chuyển viện",
      "Người bệnh xin về",
      "Người bệnh nặng tại khoa",
      "Người bệnh can thiệp",
      "Người bệnh phẫu thuật",
      "Người bệnh theo dõi",
    ];

    listBenhNhanQuanTamCLC.forEach((lstBenhNhan, index) => {
      //Export lstBenhNhan
      if (lstBenhNhan.length > 0) {
        for (let benhnhan of lstBenhNhan) {
          // Slide chính với thông tin bệnh nhân
          let slide = pres.addSlide();
          slide.addText(
            `${listTitleSlideTTCLC[index]} : ${lstBenhNhan.length}`,
            { ...styleTitle, h: 1 }
          );
          slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 0,
            y: 1,
            w: 1.6,
            h: 4.6,
            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          slide.addText(benhnhan.TenKhoa, {
            x: 0,
            y: 1,
            w: 1.6,
            h: 4.6,
            fontSize: 29,
            color: "bb1515",
            valign: "center",
            align: "center",
          });

          // Add shape cot 2
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 1.6,
            y: 1,
            w: 8.4,
            h: 4.6,
            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          // Tạo text cho cột 2
          let textForCol2 =
            benhnhan.Stt +
            ". " +
            benhnhan.TenBenhNhan +
            " - " +
            benhnhan.Tuoi +
            " tuổi - " +
            benhnhan.GioiTinh;
          textForCol2 +=
            benhnhan.DiaChi && benhnhan.DiaChi.trim().length > 0
              ? `\n- Địa chỉ: ${benhnhan.DiaChi.trim()}`
              : "";
          textForCol2 +=
            benhnhan.VaoVien && benhnhan.VaoVien.trim().length > 0
              ? `\n- Vào viện: ${benhnhan.VaoVien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.LyDoVV && benhnhan.LyDoVV.trim().length > 0
              ? `\n- Lý do vv: ${benhnhan.LyDoVV.trim()}`
              : "";
          textForCol2 +=
            benhnhan.DienBien && benhnhan.DienBien.trim().length > 0
              ? `\n- Diễn biến: ${benhnhan.DienBien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.ChanDoan && benhnhan.ChanDoan.trim().length > 0
              ? `\n- Chẩn đoán: ${benhnhan.ChanDoan.trim()}`
              : "";
          textForCol2 +=
            benhnhan.XuTri && benhnhan.XuTri.trim().length > 0
              ? `\n- Xử trí: ${benhnhan.XuTri.trim()}`
              : "";
          textForCol2 +=
            benhnhan.HienTai && benhnhan.HienTai.trim().length > 0
              ? `\n- Hiện tại: ${benhnhan.HienTai.trim()}`
              : "";
          textForCol2 +=
            benhnhan.GhiChu && benhnhan.GhiChu.trim().length > 0
              ? `\n- ${benhnhan.GhiChu.trim()}`
              : "";

          let MAX_CHARS_PER_LINE = 65; // Adjust as necessary
          let MAX_LINES_PER_SLIDE = 12; // Adjust as necessary
          let paragraphs = textForCol2.split("\n");
          let lines = [];

          paragraphs.forEach((paragraph) => {
            let words = paragraph.split(" ");
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

          for (let i = 0; i < lines.length; i += MAX_LINES_PER_SLIDE) {
            let textToInclude = lines
              .slice(i, i + MAX_LINES_PER_SLIDE)
              .join("\n");
            slide.addText(textToInclude, {
              x: 1.6,
              y: 1,
              w: 8.4,
              h: 4.5,
              fontFace: "Times New Roman",
              fontSize: 20,
              color: "1939B7",
            });
            if (i + MAX_LINES_PER_SLIDE < lines.length) {
              slide = pres.addSlide();
              slide.addText(
                `${listTitleSlideTTCLC[index]} : ${lstBenhNhan.length}`,
                { ...styleTitle, h: 1 }
              );
              slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
              slide.addShape(pres.shapes.RECTANGLE, {
                x: 0,
                y: 1,
                w: 1.6,
                h: 4.6,
                fill: { color: "FFFFFF" },
                line: { color: "1939B7", width: 1 },
              });
              slide.addText(benhnhan.TenKhoa, {
                x: 0,
                y: 1,
                w: 1.6,
                h: 4.5,
                fontFace: "Times New Roman",
                fontSize: 30,
                color: "bb1515",
                valign: "center",
                align: "center",
              });
              // Add shape cot 2 vao slide moi
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

          for (let img of benhnhan.Images) {
            let imgSlide = pres.addSlide();
            imgSlide.addText(
              `${listTitleSlideTTCLC[index]} : ${lstBenhNhan.length}`,
              { ...styleTitle, h: 1 }
            );
            imgSlide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
            imgSlide.addShape(pres.shapes.RECTANGLE, {
              x: 0,
              y: 1,
              w: 1.6,
              h: 4.6,
              fill: { color: "FFFFFF" },
              line: { color: "1939B7", width: 1 },
            });
            imgSlide.addText(benhnhan.TenKhoa, {
              x: 0,
              y: 1,
              w: 1.6,
              h: 4.5,
              fontSize: 30,
              fontFace: "Times New Roman",
              color: "bb1515",
              valign: "center",
              align: "center",
            });
            imgSlide.addImage({ path: img, x: 3.5, y: 1.1, w: 4.5, h: 4.5 });
          }
        }
      }
    });

    //Du lieu Ngoai gio TT CLC

    const listBenhNhanBaoCaoTTCLC = [
      hsccycBNNgoaiGios,
      noiycBNNgoaiGios,
      ngoaiycBNNgoaiGios,
    ];

    //kiem tra neu co BN ngoai gio thi hien thi slide chuyen
    if (
      hsccycBNNgoaiGios.length +
        noiycBNNgoaiGios.length +
        ngoaiycBNNgoaiGios.length >
      0
    ) {
      //Slide chuyen ngoai gio

      let slideChuyenNgoaiGio = pres.addSlide();
      slideChuyenNgoaiGio.addText("BÁO CÁO GIAO BAN TOÀN VIỆN", {
        ...styleTitle,
        align: "center",
      });
      slideChuyenNgoaiGio.addImage({
        path: "/logo.png",
        x: 9,
        y: 0,
        w: 1,
        h: 1,
      });
      slideChuyenNgoaiGio.addText(
        "NGƯỜI BỆNH VÀO VIỆN NGOÀI GIỜ TT KCB CLC",
        styleTextChuyenForm
      );
    }

    listBenhNhanBaoCaoTTCLC.forEach((lstBenhNhan, index) => {
      //Export lstBenhNhan
      if (lstBenhNhan.length > 0) {
        for (let benhnhan of lstBenhNhan) {
          // Slide chính với thông tin bệnh nhân
          let slide = pres.addSlide();
          slide.addText(
            `Người bệnh vào viện ngoài giờ: ${
              hsccycBNNgoaiGios.length +
              noiycBNNgoaiGios.length +
              ngoaiycBNNgoaiGios.length
            }`,
            {
              ...styleTitle,
              h: 1,
            }
          );
          slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 0,
            y: 1,
            w: 1.4,
            h: 4.6,
            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          slide.addText(benhnhan.TenKhoa, {
            x: 0,
            y: 1,
            w: 1.4,
            h: 4.6,
            fontFace: "Times New Roman",
            fontSize: 30,
            color: "bb1515",
            valign: "center",
            align: "center",
          });

          // Add shape cot 2
          slide.addShape(pres.shapes.RECTANGLE, {
            x: 1.4,
            y: 1,
            w: 8.6,
            h: 4.6,
            fill: { color: "FFFFFF" },
            line: { color: "1939B7", width: 1 },
          });
          // Tạo text cho cột 2
          let textForCol2 =
            benhnhan.Stt +
            ". " +
            benhnhan.TenBenhNhan +
            " - " +
            benhnhan.Tuoi +
            " tuổi - " +
            benhnhan.GioiTinh;
          textForCol2 +=
            benhnhan.DiaChi && benhnhan.DiaChi.trim().length > 0
              ? `\n- Địa chỉ: ${benhnhan.DiaChi.trim()}`
              : "";
          textForCol2 +=
            benhnhan.VaoVien && benhnhan.VaoVien.trim().length > 0
              ? `\n- Vào viện: ${benhnhan.VaoVien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.LyDoVV && benhnhan.LyDoVV.trim().length > 0
              ? `\n- Lý do vv: ${benhnhan.LyDoVV.trim()}`
              : "";
          textForCol2 +=
            benhnhan.DienBien && benhnhan.DienBien.trim().length > 0
              ? `\n- Diễn biến: ${benhnhan.DienBien.trim()}`
              : "";
          textForCol2 +=
            benhnhan.ChanDoan && benhnhan.ChanDoan.trim().length > 0
              ? `\n- Chẩn đoán: ${benhnhan.ChanDoan.trim()}`
              : "";
          textForCol2 +=
            benhnhan.XuTri && benhnhan.XuTri.trim().length > 0
              ? `\n- Xử trí: ${benhnhan.XuTri.trim()}`
              : "";
          textForCol2 +=
            benhnhan.HienTai && benhnhan.HienTai.trim().length > 0
              ? `\n- Hiện tại: ${benhnhan.HienTai.trim()}`
              : "";
          textForCol2 +=
            benhnhan.GhiChu && benhnhan.GhiChu.trim().length > 0
              ? `\n- ${benhnhan.GhiChu.trim()}`
              : "";

          let MAX_CHARS_PER_LINE = 65; // Adjust as necessary
          let MAX_LINES_PER_SLIDE = 12; // Adjust as necessary
          let paragraphs = textForCol2.split("\n");
          let lines = [];

          paragraphs.forEach((paragraph) => {
            let words = paragraph.split(" ");
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

          for (let i = 0; i < lines.length; i += MAX_LINES_PER_SLIDE) {
            let textToInclude = lines
              .slice(i, i + MAX_LINES_PER_SLIDE)
              .join("\n");
            slide.addText(textToInclude, {
              x: 1.5,
              y: 1,
              w: 8.5,
              h: 4.5,
              fontSize: 20,
              fontFace: "Times New Roman",
              color: "1939B7",
            });
            if (i + MAX_LINES_PER_SLIDE < lines.length) {
              slide = pres.addSlide();
              slide.addText(
                `Người bệnh vào viện ngoài giờ: ${
                  hsccycBNNgoaiGios.length +
                  noiycBNNgoaiGios.length +
                  ngoaiycBNNgoaiGios.length
                }`,
                {
                  ...styleTitle,
                  h: 1,
                }
              );
              slide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
              slide.addShape(pres.shapes.RECTANGLE, {
                x: 0,
                y: 1,
                w: 1.4,
                h: 4.6,
                fill: { color: "FFFFFF" },
                line: { color: "1939B7", width: 1 },
              });
              slide.addText(benhnhan.TenKhoa, {
                x: 0,
                y: 1,
                w: 1.4,
                h: 4.5,
                fontSize: 30,
                fontFace: "Times New Roman",
                color: "bb1515",
                valign: "center",
                align: "center",
              });
              // Add shape cot 2 vao slide moi
              slide.addShape(pres.shapes.RECTANGLE, {
                x: 1.4,
                y: 1,
                w: 8.6,
                h: 4.6,
                fill: { color: "FFFFFF" },
                line: { color: "1939B7", width: 1 },
              });
            }
          }

          for (let img of benhnhan.Images) {
            let imgSlide = pres.addSlide();
            imgSlide.addText(
              `Người bệnh vào viện ngoài giờ: ${
                hsccycBNNgoaiGios.length +
                noiycBNNgoaiGios.length +
                ngoaiycBNNgoaiGios.length
              }`,
              { ...styleTitle, h: 1 }
            );
            imgSlide.addImage({ path: "/logo.png", x: 9, y: 0, w: 1, h: 1 });
            imgSlide.addShape(pres.shapes.RECTANGLE, {
              x: 0,
              y: 1,
              w: 1.4,
              h: 4.6,
              fill: { color: "FFFFFF" },
              line: { color: "1939B7", width: 1 },
            });
            imgSlide.addText(benhnhan.TenKhoa, {
              x: 0,
              y: 1,
              w: 1.4,
              h: 4.5,
              fontSize: 30,
              fontFace: "Times New Roman",
              color: "bb1515",
              valign: "center",
              align: "center",
            });
            imgSlide.addImage({ path: img, x: 3.5, y: 1.1, w: 4.5, h: 4.5 });
          }
        }
      }
    });

    let finalSlide = pres.addSlide();
    finalSlide.addImage({
      path: "/ttclc.jpg",
      x: 0,
      y: 0,
      w: 10,
      h: 5.65,
    });
    pres.writeFile(`Báo cáo TTCLC ngày ${fDate(date)}`);
  };
  return (
    <Box>
      <Card sx={{ p: 2, my: 3 }}>
        {/* For small screens */}
        {isSmallScreen && (
          <Stack direction="column" spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Ngày"
                value={date}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
            <TrangThai trangthai={bcGiaoBanCurent.TrangThai} />
            <Stack direction="row" spacing={2}>
              <DisplayKhoaButton khoaHienThis={khoaDaGuis} type="đã gửi" />
              <DisplayKhoaButton khoaHienThis={khoaChuaGuis} type="chưa gửi" />
              <Box sx={{ flexGrow: 1 }} />
              <IconButton onClick={handleClick}>
                <MenuIcon />
              </IconButton>
            </Stack>
          </Stack>
        )}

        {/* For medium screens */}
        {isMediumScreen && (
          <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Ngày"
                  value={date}
                  onChange={handleDateChange}
                />
              </LocalizationProvider>
              <TrangThai trangthai={bcGiaoBanCurent.TrangThai} />

              <DisplayKhoaButton khoaHienThis={khoaDaGuis} type="đã gửi" />
              <DisplayKhoaButton khoaHienThis={khoaChuaGuis} type="chưa gửi" />
              <Box sx={{ flexGrow: 1 }} />
              <IconButton onClick={handleClick}>
                <MenuIcon />
              </IconButton>
            </Stack>
            {/* {(user.PhanQuyen === 'admin' || user.PhanQuyen === 'manager') && (
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleDuyet}> {bcGiaoBanCurent.TrangThai ? "Gỡ duyệt" : "Duyệt"}</Button>
          <Button variant="contained" onClick={handleNhapBaoCao}> Nhập báo cáo</Button>
          <Button variant="contained"> Export</Button>
        </Stack>
      )} */}
          </Stack>
        )}

        {/* For large screens */}
        {isLargeScreen && (
          <Stack direction="row" spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Ngày"
                value={date}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
            <TrangThai trangthai={bcGiaoBanCurent.TrangThai} />

            <DisplayKhoaButton khoaHienThis={khoaDaGuis} type="đã gửi" />
            <DisplayKhoaButton khoaHienThis={khoaChuaGuis} type="chưa gửi" />
            {(user.PhanQuyen === "admin" || user.PhanQuyen === "manager") && (
              <Button variant="contained" onClick={handleDuyet}>
                {" "}
                {bcGiaoBanCurent.TrangThai ? "Gỡ duyệt" : "Duyệt"}
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" onClick={handleNhapBaoCao}>
              {" "}
              Nhập báo cáo
            </Button>
            {/* <Button onClick={handleExportToPowerPoint} variant="contained">
              {" "}
              Export
            </Button> */}
            <IconButton onClick={handleClick2}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorE2}
              open={Boolean(anchorE2)}
              onClose={handleClose2}
            >
              <MenuItem onClick={handleExportToPowerPoint}>
                Export toàn viện
              </MenuItem>
              <MenuItem onClick={handleExportTrungTamCLC}>
                Export trung tâm KCB CLC
              </MenuItem>
            </Menu>
          </Stack>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {(user.PhanQuyen === "admin" || user.PhanQuyen === "manager") && (
            <MenuItem
              onClick={() => {
                handleDuyet();
                handleClose();
              }}
            >
              {bcGiaoBanCurent.TrangThai ? "Gỡ duyệt" : "Duyệt"}
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              handleNhapBaoCao();
              handleClose();
            }}
          >
            Nhập báo cáo
          </MenuItem>
          <MenuItem onClick={handleExportToPowerPoint}>
            Export toàn viện
          </MenuItem>
          <MenuItem onClick={handleExportTrungTamCLC}>
            Export trung tâm KCB CLC
          </MenuItem>
        </Menu>
      </Card>
      <Card sx={{ p: 2, my: 3 }}>
        <Typography
          variant="h4"
          sx={{ my: 1, fontSize: isSmallScreen ? "1.5rem" : "2rem" }}
          textAlign="center"
        >
          BÁO CÁO GIAO BAN TOÀN VIỆN NGÀY {fDate(date)}
        </Typography>
        <Stack direction="row" justifyContent="center">
          <Card sx={{ p: 2, my: 4 }}>
            <Typography sx={{ fontSize: isSmallScreen ? "0.9rem" : "1rem" }}>
              - Trực lãnh đạo :{" "}
              {bcGiaoBanCurent ? bcGiaoBanCurent.TrucLanhDao : " "}{" "}
            </Typography>
            <Typography sx={{ fontSize: isSmallScreen ? "0.9rem" : "1rem" }}>
              {" "}
              - Tổng trực hệ nội:{" "}
              {bcGiaoBanCurent ? bcGiaoBanCurent.TTHeNoi : " "}
            </Typography>
            <Typography sx={{ fontSize: isSmallScreen ? "0.9rem" : "1rem" }}>
              - Tổng trực hệ ngoại:{" "}
              {bcGiaoBanCurent ? bcGiaoBanCurent.TTHeNgoai : " "}
            </Typography>
          </Card>
        </Stack>

        <Grid container spacing={2}>
          {/* Màn hình lớn (md trở lên): 1 dòng, Màn hình vừa (sm): 2 component/1 dòng, Màn hình nhỏ (xs): 1 component/1 dòng */}
          <Grid item xs={12} sm={6} md={2}>
            <TongHopToanVien />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TongHopHeNoi />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TongHopHeNgoai />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TongHopCLC />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TongHopKKB />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TongHopCanLamSang />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

export default Sumary;
