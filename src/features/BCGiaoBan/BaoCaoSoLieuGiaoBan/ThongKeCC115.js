import React from "react";
import {
  Card,
  Container,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useTheme } from "@emotion/react";

import { commonStyle, commonStyleLeft } from "../../../utils/heplFuntion";
import {
  cc115ChiSoFields,
} from "../../BaoCaoNgay/cc115Config";
import { isCC115DepartmentCode } from "../../../utils/cc115";

function ThongKeCC115() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { baocaongays } = useSelector((state) => state.bcgiaoban);
  const { darkMode } = useSelector((state) => state.mytheme);

  let commonStyleResponsive = isSmallScreen
    ? { ...commonStyle, fontSize: "0.8rem" }
    : { ...commonStyle };
  let commonStyleLeftResponsive = isSmallScreen
    ? { ...commonStyleLeft, fontSize: "0.8rem" }
    : { ...commonStyleLeft };

  commonStyleResponsive = darkMode
    ? { ...commonStyleResponsive, color: "#FFF" }
    : commonStyleResponsive;
  commonStyleLeftResponsive = darkMode
    ? { ...commonStyleLeftResponsive, color: "#FFF" }
    : commonStyleLeftResponsive;

  const bcCC115 = baocaongays.filter((baocaongay) =>
    isCC115DepartmentCode(baocaongay.KhoaID.MaKhoa),
  );

  const chiSoMap = cc115ChiSoFields.reduce((acc, field) => {
    acc[field.code] = { SoLuong: 0, GhiChu: "" };
    return acc;
  }, {});

  bcCC115.forEach((entry) => {
    entry.ChiTietChiSo.forEach((chitiet) => {
      if (Object.prototype.hasOwnProperty.call(chiSoMap, chitiet.ChiSoCode)) {
        chiSoMap[chitiet.ChiSoCode].SoLuong += chitiet.SoLuong;
        if (chitiet.GhiChu) {
          chiSoMap[chitiet.ChiSoCode].GhiChu = chitiet.GhiChu;
        }
      }
    });
  });

  const bsTruc = bcCC115[0]?.BSTruc || "";
  const ddTruc = bcCC115[0]?.DDTruc || "";
  const kipTruc = [bsTruc, ddTruc].filter(Boolean).join("  ");

  // Định nghĩa cấu trúc bảng phân cấp theo file docx
  const tableRows = [
    {
      stt: "1",
      label: "Tổng số ca cấp cứu",
      code: "cc115-TongSoCaCapCuu",
      isParent: true,
    },
    {
      stt: "",
      label: "Số ca chuyển về BV điều trị",
      code: "cc115-ChuyenVeBVDieuTri",
      isParent: false,
    },
    {
      stt: "",
      label: "Số ca tử vong",
      code: "cc115-TuVong",
      isParent: false,
      isDanger: true,
    },
    {
      stt: "2",
      label: "Tổng số ca vận chuyển",
      code: "cc115-TongSoCaVanChuyen",
      isParent: true,
    },
    {
      stt: "",
      label: "Chuyển viện",
      code: "cc115-ChuyenVien",
      isParent: false,
    },
    {
      stt: "",
      label: "Chuyển về gia đình",
      code: "cc115-VeGiaDinh",
      isParent: false,
    },
  ];

  return (
    <Container sx={{ my: 1 }} id="tinhhinhchungcc115">
      <Card
        sx={{
          fontWeight: "bold",
          color: "white",
          backgroundColor: "#1939B7",
          p: 1.5,
          boxShadow: 3,
          borderRadius: 3,
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: isSmallScreen ? "1rem" : "1.3rem", fontWeight: "bold" }}>
          Trực Trung tâm cấp cứu 115
        </Typography>
        <Typography sx={{ fontSize: isSmallScreen ? "0.95rem" : "1.2rem", mt: 0.5 }}>
          Kíp trực: {kipTruc}
        </Typography>
      </Card>

      <TableContainer component={Paper} sx={{ mb: 2, borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1939B7" }}>
              <TableCell style={{ ...commonStyleResponsive, color: "white", fontWeight: "bold" }} width="10%" align="center">STT</TableCell>
              <TableCell style={{ ...commonStyleLeftResponsive, color: "white", fontWeight: "bold" }} width="45%">Chỉ số</TableCell>
              <TableCell style={{ ...commonStyleResponsive, color: "white", fontWeight: "bold" }} width="15%" align="center">Số lượng</TableCell>
              <TableCell style={{ ...commonStyleLeftResponsive, color: "white", fontWeight: "bold" }} width="30%">Ghi chú</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((row) => {
              const value = chiSoMap[row.code]?.SoLuong || 0;
              const note = chiSoMap[row.code]?.GhiChu || "";
              const isDangerAlert = row.isDanger && value > 0;

              // Nền dòng: dòng cha có nền xám/xanh nhạt
              let rowBgColor = "transparent";
              if (row.isParent) {
                rowBgColor = darkMode ? "#1e293b" : "#f1f5f9";
              }

              const textStyle = {
                fontWeight: row.isParent ? "bold" : "normal",
                color: isDangerAlert ? "#d32f2f" : (darkMode ? "#FFF" : "#333"),
                paddingLeft: row.isParent ? "16px" : "36px",
              };

              const qtyStyle = {
                fontWeight: (row.isParent || isDangerAlert) ? "bold" : "normal",
                color: isDangerAlert ? "#d32f2f" : (row.isParent ? (darkMode ? "#60a5fa" : "#1939B7") : (darkMode ? "#FFF" : "#333")),
                textAlign: "center",
              };

              return (
                <TableRow
                  key={row.code}
                  sx={{
                    backgroundColor: rowBgColor,
                    "&:hover": {
                      backgroundColor: darkMode ? "#334155" : "#f8fafc",
                    },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <TableCell
                    align="center"
                    style={{
                      ...commonStyleResponsive,
                      color: darkMode ? "#FFF" : "#333",
                      fontWeight: row.isParent ? "bold" : "normal",
                    }}
                  >
                    {row.stt}
                  </TableCell>
                  <TableCell style={{ ...commonStyleLeftResponsive, ...textStyle }}>
                    {!row.isParent && "— "} {row.label}
                  </TableCell>
                  <TableCell align="center" style={{ ...commonStyleResponsive, ...qtyStyle }}>
                    {value}
                  </TableCell>
                  <TableCell
                    style={{
                      ...commonStyleLeftResponsive,
                      color: darkMode ? "#cbd5e1" : "#555",
                      fontStyle: "italic",
                    }}
                  >
                    {note}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
    </Container>
  );
}

export default ThongKeCC115;

