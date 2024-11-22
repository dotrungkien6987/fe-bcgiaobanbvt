import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  
  Typography,
  Card,
  useMediaQuery,
  Box,
  Stack,
} from "@mui/material";
import { commonStyle, commonStyleLeft } from "../../utils/heplFuntion";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";

function TablePhongChiDinhPhongThucHien({ dataPhongChiDinh, titleTable }) {
  const theme = useTheme();
  const { darkMode } = useSelector((state) => state.mytheme);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  let commonStyleReponsive = isSmallScreen
    ? { ...commonStyle, fontSize: "0.6rem" }
    : { ...commonStyle };
  let commonStyleLeftReponsive = isSmallScreen
    ? { ...commonStyleLeft, fontSize: "0.6rem" }
    : { ...commonStyleLeft };
  commonStyleReponsive = darkMode
    ? { ...commonStyleReponsive, color: "#FFF" }
    : { ...commonStyleReponsive };
  commonStyleLeftReponsive = darkMode
    ? { ...commonStyleLeftReponsive, color: "#FFF" }
    : { ...commonStyleLeftReponsive };

  const commonStyleLeftReponsiveRed = {
    ...commonStyleLeftReponsive,
    color: "#bb1515",
  };
  const rowStyle = {
    height: "35px", // Adjust the height as needed
    "& td, & th": { padding: "5px" }, // Adjust the padding as needed
  };

  return (
    <Box sx={{ my: 1, p: 2 }}>
      <TableContainer>
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
          <Typography
            sx={{
              textAlign: "center",
              fontSize: isSmallScreen ? "1rem" : "1.3rem",
            }}
          >
            {titleTable}
          </Typography>
          <Stack></Stack>
        </Card>
        <TableContainer component={Paper} style={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={rowStyle}>
                <TableCell style={commonStyleReponsive}>Khoa</TableCell>
                <TableCell style={commonStyleReponsive}>Phòng</TableCell>
                <TableCell style={commonStyleReponsive}>Chỉ định</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataPhongChiDinh.map((row, index) => (
                <TableRow key={index} sx={rowStyle}>
                  <TableCell style={commonStyleLeftReponsive}>
                    {row.departmentgroupname}
                  </TableCell>
                  <TableCell style={commonStyleLeftReponsive}>
                    {row.departmentname}
                  </TableCell>
                  <TableCell style={commonStyleLeftReponsive}>
                    {row.soluong}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TableContainer>
    </Box>
  );
}

export default TablePhongChiDinhPhongThucHien;
