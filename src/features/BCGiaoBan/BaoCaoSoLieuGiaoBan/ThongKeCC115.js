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
  cc115ChiSoGroups,
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
    acc[field.trongGioCode] = 0;
    acc[field.ngoaiGioCode] = 0;
    return acc;
  }, {});

  bcCC115.forEach((entry) => {
    entry.ChiTietChiSo.forEach((chitiet) => {
      if (Object.prototype.hasOwnProperty.call(chiSoMap, chitiet.ChiSoCode)) {
        chiSoMap[chitiet.ChiSoCode] += chitiet.SoLuong;
      }
    });
  });

  const bsTruc = bcCC115[0]?.BSTruc || "";
  const ddTruc = bcCC115[0]?.DDTruc || "";
  const kipTruc = [bsTruc, ddTruc].filter(Boolean).join("  ");

  return (
    <Container sx={{ my: 1 }} id="tinhhinhchungcc115">
      <Card
        sx={{
          fontWeight: "bold",
          color: "white",
          backgroundColor: "#1939B7",
          p: 1,
          boxShadow: 3,
          borderRadius: 3,
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: isSmallScreen ? "1rem" : "1.3rem" }}>
          Trực Trung tâm cấp cứu 115
        </Typography>
        <Typography sx={{ fontSize: isSmallScreen ? "1rem" : "1.3rem" }}>
          Kíp trực: {kipTruc}
        </Typography>
      </Card>

      {cc115ChiSoGroups.map((group) => (
        <TableContainer key={group.title} component={Paper} sx={{ mb: 2 }}>
          <Card
            sx={{
              fontWeight: "bold",
              color: "#f2f2f2",
              backgroundColor: "#1939B7",
              p: 1,
              boxShadow: 3,
              borderRadius: 3,
            }}
          >
            <Typography sx={{ fontSize: isSmallScreen ? "1rem" : "1.3rem" }}>
              {group.title}
            </Typography>
          </Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={commonStyleResponsive}>Chỉ số</TableCell>
                <TableCell style={commonStyleResponsive}>Trong giờ</TableCell>
                <TableCell style={commonStyleResponsive}>Ngoài giờ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {group.fields.map((field) => (
                <TableRow key={field.label}>
                  <TableCell style={commonStyleLeftResponsive}>
                    {field.label}
                  </TableCell>
                  <TableCell style={commonStyleResponsive}>
                    {chiSoMap[field.trongGioCode]}
                  </TableCell>
                  <TableCell style={commonStyleResponsive}>
                    {chiSoMap[field.ngoaiGioCode]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}
      <Divider />
    </Container>
  );
}

export default ThongKeCC115;
