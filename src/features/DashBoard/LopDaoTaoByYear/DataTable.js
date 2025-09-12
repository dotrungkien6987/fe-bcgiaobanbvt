import React from "react";
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function DataTable({
  rows,
  mas,
  labels,
  years,
  overviewColorPalette,
  group = null, // null for overview, group object for group tables
  showTotal = true,
}) {
  const isGroupTable = !!group;

  // Calculate totals for each code across all years
  const calculateCodeTotal = (code) => {
    return rows.reduce((sum, row) => sum + (row[code] || 0), 0);
  };

  // Calculate grand total (all codes, all years)
  const calculateGrandTotal = () => {
    return rows.reduce((sum, row) => {
      return sum + mas.reduce((rowSum, m) => rowSum + (row[m] || 0), 0);
    }, 0);
  };

  return (
    <TableContainer sx={{ maxHeight: 320 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 600,
                bgcolor: isGroupTable ? group.bgColor : "grey.100",
                textAlign: "center",
              }}
            >
              Năm
            </TableCell>
            {mas.map((m, idx) => (
              <TableCell
                key={m}
                align="center"
                sx={{
                  fontWeight: 600,
                  bgcolor: isGroupTable ? group.bgColor : "grey.100",
                  fontSize: isGroupTable ? "0.75rem" : "0.875rem",
                }}
              >
                {isGroupTable ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={0.5}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: group.colorPalette[idx] || group.color,
                      }}
                    />
                    <span>{labels[m] || m}</span>
                  </Stack>
                ) : (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={0.5}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: overviewColorPalette?.[m] || "#1976d2",
                      }}
                    />
                    <span>{labels[m] || m}</span>
                  </Stack>
                )}
              </TableCell>
            ))}
            {showTotal && (
              <TableCell
                align="center"
                sx={{
                  fontWeight: 600,
                  bgcolor: isGroupTable ? group.bgColor : "grey.100",
                  fontSize: isGroupTable ? "0.75rem" : "0.875rem",
                  color: isGroupTable ? group.color : "primary.main",
                }}
              >
                Tổng
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {years.map((y) => (
            <TableRow key={y} hover>
              <TableCell sx={{ fontWeight: 500, textAlign: "center" }}>
                {y}
              </TableCell>
              {mas.map((m, idx) => (
                <TableCell key={m} align="center">
                  {isGroupTable ? (
                    <Chip
                      label={rows.find((r) => r.year === y)?.[m] || 0}
                      size="small"
                      sx={{
                        bgcolor:
                          (group.colorPalette[idx] || group.color) + "20",
                        color: group.colorPalette[idx] || group.color,
                        fontWeight: 600,
                        minWidth: 40,
                        border: `1px solid ${
                          group.colorPalette[idx] || group.color
                        }40`,
                      }}
                    />
                  ) : (
                    <Chip
                      label={rows.find((r) => r.year === y)?.[m] || 0}
                      size="small"
                      sx={{
                        bgcolor:
                          (overviewColorPalette?.[m] || "#1976d2") + "20",
                        color: overviewColorPalette?.[m] || "#1976d2",
                        fontWeight: 600,
                        minWidth: 40,
                        border: `1px solid ${
                          overviewColorPalette?.[m] || "#1976d2"
                        }40`,
                      }}
                    />
                  )}
                </TableCell>
              ))}
              {showTotal && (
                <TableCell align="center">
                  {isGroupTable ? (
                    <Chip
                      label={(() => {
                        const row = rows.find((r) => r.year === y) || {};
                        return mas.reduce((sum, m) => sum + (row[m] || 0), 0);
                      })()}
                      size="small"
                      sx={{
                        bgcolor: group.color + "20",
                        color: group.color,
                        fontWeight: 700,
                        minWidth: 50,
                        border: `2px solid ${group.color}`,
                      }}
                    />
                  ) : (
                    <Chip
                      label={(() => {
                        const row = rows.find((r) => r.year === y) || {};
                        return mas.reduce((sum, m) => sum + (row[m] || 0), 0);
                      })()}
                      size="small"
                      sx={{
                        bgcolor: "primary.light",
                        color: "primary.main",
                        fontWeight: 700,
                        minWidth: 50,
                        border: "2px solid",
                        borderColor: "primary.main",
                      }}
                    />
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
          {/* Dòng tổng cộng tất cả các năm */}
          {showTotal && (
            <TableRow
              sx={{
                bgcolor: isGroupTable ? group.bgColor : "#e3f2fd",
                fontWeight: 700,
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 700,
                  textAlign: "center",
                  color: isGroupTable ? group.color : "primary.main",
                }}
              >
                Tổng
              </TableCell>
              {mas.map((m, idx) => (
                <TableCell key={m} align="center">
                  {isGroupTable ? (
                    <Chip
                      label={calculateCodeTotal(m)}
                      size="small"
                      sx={{
                        bgcolor: group.colorPalette[idx] || group.color,
                        color: "white",
                        fontWeight: 700,
                        minWidth: 40,
                        border: `2px solid ${
                          group.colorPalette[idx] || group.color
                        }`,
                      }}
                    />
                  ) : (
                    <Chip
                      label={calculateCodeTotal(m)}
                      size="small"
                      sx={{
                        bgcolor: overviewColorPalette?.[m] || "#1976d2",
                        color: "white",
                        fontWeight: 700,
                        minWidth: 40,
                        border: `2px solid ${
                          overviewColorPalette?.[m] || "#1976d2"
                        }`,
                      }}
                    />
                  )}
                </TableCell>
              ))}
              <TableCell align="center">
                {isGroupTable ? (
                  <Chip
                    label={calculateGrandTotal()}
                    size="small"
                    sx={{
                      bgcolor: group.color,
                      color: "white",
                      fontWeight: 700,
                      minWidth: 50,
                      border: `3px solid ${group.color}`,
                    }}
                  />
                ) : (
                  <Chip
                    label={calculateGrandTotal()}
                    size="small"
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      fontWeight: 700,
                      minWidth: 50,
                      border: "3px solid",
                      borderColor: "primary.main",
                    }}
                  />
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
