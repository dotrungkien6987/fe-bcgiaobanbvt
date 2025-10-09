import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { COLORS } from "../constants";
import PercentageBar from "./PercentageBar";
import DifferenceCell from "./DifferenceCell";
import BenchmarkCell from "./BenchmarkCell";

const headCells = [
  { id: "STT", label: "STT", align: "center", minWidth: 40 },
  { id: "TenKhoa", label: "Tên Khoa", align: "left", minWidth: 140 },
  { id: "vienphi_count", label: "Số ca", align: "center", minWidth: 70 },
  { id: "total_money", label: "Tổng tiền", align: "right", minWidth: 120 },
  { id: "total_thuoc", label: "Thuốc", align: "right", minWidth: 120 },
  { id: "total_vattu", label: "Vật tư", align: "right", minWidth: 120 },
  {
    id: "avg_money_per_case",
    label: "Bình quân/ca",
    align: "right",
    minWidth: 120,
  },
  {
    id: "ty_le_thuoc",
    label: "Tỷ lệ thuốc (%)",
    align: "center",
    minWidth: 140,
  },
  {
    id: "ty_le_vattu",
    label: "Tỷ lệ vật tư (%)",
    align: "center",
    minWidth: 140,
  },
  {
    id: "ty_le_tong",
    label: "Tổng tỷ lệ (Thuốc + VT) (%)",
    align: "center",
    minWidth: 180,
  },
];

function DataTableHead({ order, orderBy, onRequestSort, darkMode, loaiKhoa }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const BLUE = "#1939B7";

  // Filter headCells - bỏ cột vật tư cho ngoại trú
  const filteredHeadCells =
    loaiKhoa === "ngoaitru"
      ? headCells.filter(
          (cell) => cell.id !== "total_vattu" && cell.id !== "ty_le_vattu"
        )
      : headCells;

  return (
    <TableHead>
      <TableRow>
        {filteredHeadCells.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.7rem", sm: "0.85rem" },
              backgroundColor: darkMode ? "#1D1D1D" : BLUE,
              color: "#FFF",
              minWidth: headCell.minWidth,
              whiteSpace: "nowrap",
              border: `1px solid ${BLUE}`,
              ...(index < 2 && {
                position: "sticky",
                left: index === 0 ? 0 : { xs: 40, sm: 50 },
                zIndex: 3,
                backgroundColor: darkMode ? "#1D1D1D" : BLUE,
              }),
            }}
          >
            {[
              "vienphi_count",
              "total_money",
              "total_thuoc",
              "total_vattu",
              "avg_money_per_case",
              "ty_le_thuoc",
              "ty_le_vattu",
            ].includes(headCell.id) ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
                sx={{
                  color: "#FFF !important",
                  "&:hover": {
                    color: "#FFF",
                  },
                  "&.Mui-active": {
                    color: "#FFF",
                  },
                  "& .MuiTableSortLabel-icon": {
                    color: "#FFF !important",
                  },
                }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function DataTable({
  sorted,
  totals,
  order,
  orderBy,
  onRequestSort,
  darkMode,
  loaiKhoa,
}) {
  const BLUE = "#1939B7";

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: "70vh",
        borderRadius: 2,
        boxShadow: 3,
        "& .MuiTableCell-root": {
          borderBottom: darkMode
            ? "1px solid rgba(255, 255, 255, 0.12)"
            : "1px solid rgba(224, 224, 224, 1)",
        },
      }}
    >
      <Table stickyHeader aria-label="sticky table" size="small">
        <DataTableHead
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
          darkMode={darkMode}
          loaiKhoa={loaiKhoa}
        />
        <TableBody>
          {sorted.map((row, index) => {
            const ty_le_thuoc =
              row.total_money !== 0 ? row.total_thuoc / row.total_money : 0;
            const ty_le_vattu =
              row.total_money !== 0 ? row.total_vattu / row.total_money : 0;

            return (
              <TableRow
                hover
                tabIndex={-1}
                key={row.KhoaID}
                sx={{
                  "&:hover": {
                    backgroundColor: darkMode
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {/* STT */}
                <TableCell
                  align="center"
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.85rem" },
                    fontWeight: 600,
                    color: BLUE,
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                    backgroundColor: darkMode ? "#121212" : "#fff",
                  }}
                >
                  {index + 1}
                </TableCell>

                {/* Tên Khoa */}
                <TableCell
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.85rem" },
                    fontWeight: 600,
                    color: BLUE,
                    position: "sticky",
                    left: { xs: 40, sm: 50 },
                    zIndex: 2,
                    backgroundColor: darkMode ? "#121212" : "#fff",
                    minWidth: 140,
                  }}
                >
                  {row.TenKhoa}
                </TableCell>

                {/* Số ca - với chênh lệch */}
                <TableCell align="center">
                  <DifferenceCell
                    current={row.vienphi_count}
                    difference={row.vienphi_count_diff || 0}
                    type="number"
                    align="center"
                  />
                </TableCell>

                {/* Tổng tiền - với chênh lệch */}
                <TableCell align="right">
                  <DifferenceCell
                    current={row.total_money}
                    difference={row.total_money_diff || 0}
                    type="money"
                    align="right"
                  />
                </TableCell>

                {/* Thuốc - với chênh lệch */}
                <TableCell align="right">
                  <DifferenceCell
                    current={row.total_thuoc}
                    difference={row.total_thuoc_diff || 0}
                    type="money"
                    align="right"
                  />
                </TableCell>

                {/* Vật tư - với chênh lệch (chỉ hiển thị cho nội trú) */}
                {loaiKhoa !== "ngoaitru" && (
                  <TableCell align="right">
                    <DifferenceCell
                      current={row.total_vattu}
                      difference={row.total_vattu_diff || 0}
                      type="money"
                      align="right"
                    />
                  </TableCell>
                )}

                {/* Bình quân/ca - chỉ hiển thị giá trị và khuyến cáo (không có chênh lệch) */}
                <TableCell align="right">
                  <BenchmarkCell
                    current={row.avg_money_per_case}
                    difference={0} // ✅ Bỏ chênh lệch
                    benchmark={
                      row.KhuyenCaoBinhQuanHSBA
                        ? row.KhuyenCaoBinhQuanHSBA
                        : null
                    }
                    type="money"
                    align="right"
                    invertBenchmarkColor={true} // ✅ Đảo ngược màu: cao hơn KC = xanh
                    benchmarkFormat="full" // ✅ Hiển thị đầy đủ với dấu phẩy
                  />
                </TableCell>

                {/* Tỷ lệ thuốc */}
                <TableCell align="center">
                  <PercentageBar value={ty_le_thuoc} color={COLORS.thuoc} />
                </TableCell>

                {/* Tỷ lệ vật tư (chỉ hiển thị cho nội trú) */}
                {loaiKhoa !== "ngoaitru" && (
                  <TableCell align="center">
                    <PercentageBar value={ty_le_vattu} color={COLORS.vattu} />
                  </TableCell>
                )}

                {/* Tổng tỷ lệ (Thuốc + Vật tư) với khuyến cáo */}
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {/* Progress bar */}
                    <PercentageBar
                      value={
                        loaiKhoa === "ngoaitru"
                          ? ty_le_thuoc
                          : ty_le_thuoc + ty_le_vattu
                      }
                      color="#FF6B35"
                    />

                    {/* Khuyến cáo nếu có */}
                    {row.KhuyenCaoTyLeThuocVatTu !== null &&
                      row.KhuyenCaoTyLeThuocVatTu !== undefined && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            padding: "2px 6px",
                            borderRadius: 1,
                            backgroundColor:
                              (loaiKhoa === "ngoaitru"
                                ? ty_le_thuoc * 100
                                : (ty_le_thuoc + ty_le_vattu) * 100) >
                              row.KhuyenCaoTyLeThuocVatTu
                                ? "rgba(187, 21, 21, 0.1)"
                                : "rgba(0, 196, 159, 0.1)",
                            border: `1px solid ${
                              (loaiKhoa === "ngoaitru"
                                ? ty_le_thuoc * 100
                                : (ty_le_thuoc + ty_le_vattu) * 100) >
                              row.KhuyenCaoTyLeThuocVatTu
                                ? "#bb1515"
                                : "#00C49F"
                            }`,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                              fontWeight: 600,
                              color:
                                (loaiKhoa === "ngoaitru"
                                  ? ty_le_thuoc * 100
                                  : (ty_le_thuoc + ty_le_vattu) * 100) >
                                row.KhuyenCaoTyLeThuocVatTu
                                  ? "#bb1515"
                                  : "#00C49F",
                            }}
                          >
                            KC: {row.KhuyenCaoTyLeThuocVatTu.toFixed(1)}%
                          </Typography>
                        </Box>
                      )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}

          {/* Totals Row */}
          <TableRow
            sx={{
              backgroundColor: "#CDF5BC",
              "&:hover": {
                backgroundColor: "#B8E6A3",
              },
            }}
          >
            <TableCell
              colSpan={2}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.9rem" },
                fontWeight: 700,
                color: BLUE,
                position: "sticky",
                left: 0,
                zIndex: 2,
                backgroundColor: "#CDF5BC",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.75rem", sm: "0.9rem" },
                  color: BLUE,
                }}
              >
                Tổng cộng
              </Typography>
            </TableCell>

            {/* Tổng số ca - với chênh lệch */}
            <TableCell align="center">
              <DifferenceCell
                current={totals.totalCases}
                difference={totals.totalCases_diff || 0}
                type="number"
                align="center"
              />
            </TableCell>

            {/* Tổng tiền - với chênh lệch */}
            <TableCell align="right">
              <DifferenceCell
                current={totals.totalMoney}
                difference={totals.totalMoney_diff || 0}
                type="money"
                align="right"
              />
            </TableCell>

            {/* Tổng thuốc - với chênh lệch */}
            <TableCell align="right">
              <DifferenceCell
                current={totals.totalThuoc}
                difference={totals.totalThuoc_diff || 0}
                type="money"
                align="right"
              />
            </TableCell>

            {/* Tổng vật tư - với chênh lệch (chỉ hiển thị cho nội trú) */}
            {loaiKhoa !== "ngoaitru" && (
              <TableCell align="right">
                <DifferenceCell
                  current={totals.totalVattu}
                  difference={totals.totalVattu_diff || 0}
                  type="money"
                  align="right"
                />
              </TableCell>
            )}

            {/* Bình quân/ca - với chênh lệch */}
            <TableCell align="right">
              <DifferenceCell
                current={totals.avgPerCase}
                difference={totals.avgPerCase_diff || 0}
                type="money"
                align="right"
                invertColor={false}
              />
            </TableCell>

            {/* Tỷ lệ thuốc */}
            <TableCell align="center">
              <PercentageBar
                value={
                  totals.totalMoney !== 0
                    ? totals.totalThuoc / totals.totalMoney
                    : 0
                }
                color={COLORS.thuoc}
              />
            </TableCell>

            {/* Tỷ lệ vật tư (chỉ hiển thị cho nội trú) */}
            {loaiKhoa !== "ngoaitru" && (
              <TableCell align="center">
                <PercentageBar
                  value={
                    totals.totalMoney !== 0
                      ? totals.totalVattu / totals.totalMoney
                      : 0
                  }
                  color={COLORS.vattu}
                />
              </TableCell>
            )}

            {/* Tổng tỷ lệ (Thuốc + Vật tư) */}
            <TableCell align="center">
              <PercentageBar
                value={
                  totals.totalMoney !== 0
                    ? loaiKhoa === "ngoaitru"
                      ? totals.totalThuoc / totals.totalMoney
                      : (totals.totalThuoc + totals.totalVattu) /
                        totals.totalMoney
                    : 0
                }
                color="#FF6B35"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
