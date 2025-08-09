import React from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Avatar,
} from "@mui/material";
import { DeleteOutline, Assignment, Person } from "@mui/icons-material";

const AssignmentTable = ({ assignments = [], onUnassign }) => {
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        "& .MuiTable-root": {
          minWidth: 650,
        },
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              "& .MuiTableCell-head": {
                fontWeight: 600,
                color: theme.palette.primary.dark,
                borderBottom: `2px solid ${alpha(
                  theme.palette.primary.main,
                  0.2
                )}`,
              },
            }}
          >
            <TableCell>Tên nhiệm vụ</TableCell>
            <TableCell>Khoa</TableCell>
            <TableCell>Người gán</TableCell>
            <TableCell>Ngày gán</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assignments.map((a, index) => (
            <TableRow
              key={a._id}
              hover
              sx={{
                "&:nth-of-type(odd)": {
                  backgroundColor: alpha(theme.palette.grey[500], 0.04),
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  transform: "scale(1.002)",
                  transition: "all 0.2s ease-in-out",
                },
                "& .MuiTableCell-root": {
                  borderBottom: `1px solid ${alpha(
                    theme.palette.divider,
                    0.5
                  )}`,
                },
              }}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.main,
                      fontSize: "0.875rem",
                    }}
                  >
                    <Assignment fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {a?.NhiemVuThuongQuyID?.TenNhiemVu || "Nhiệm vụ"}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        #{index + 1}
                      </Typography>
                      {/* Indicator cho assignment được khôi phục gần đây */}
                      {(() => {
                        const assignedDate = new Date(a.NgayGan || a.createdAt);
                        const diffHours =
                          (new Date() - assignedDate) / (1000 * 60 * 60);
                        if (diffHours < 24) {
                          return (
                            <Chip
                              size="small"
                              label="Mới gán"
                              color="success"
                              variant="outlined"
                              sx={{
                                fontSize: "0.6rem",
                                height: 16,
                                "& .MuiChip-label": { px: 0.5 },
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                    </Box>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                {a?.NhiemVuThuongQuyID?.KhoaID?.TenKhoa ? (
                  <Chip
                    size="small"
                    label={a.NhiemVuThuongQuyID.KhoaID.TenKhoa}
                    color="secondary"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      "& .MuiChip-label": { px: 1.5 },
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Chưa phân khoa
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: theme.palette.grey[400],
                      fontSize: "0.75rem",
                    }}
                  >
                    <Person fontSize="small" />
                  </Avatar>
                  <Typography variant="body2">
                    {a?.NguoiGanID?.Ten || (
                      <span style={{ color: theme.palette.text.secondary }}>
                        Chưa xác định
                      </span>
                    )}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {a?.NgayGan || a?.createdAt
                    ? new Date(a.NgayGan || a.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Chưa rõ"}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Gỡ nhiệm vụ">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => onUnassign?.(a._id)}
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {assignments.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Paper
                  variant="outlined"
                  sx={{
                    py: 4,
                    textAlign: "center",
                    backgroundColor: alpha(theme.palette.grey[500], 0.04),
                    border: `1px dashed ${alpha(theme.palette.grey[500], 0.3)}`,
                    borderRadius: 2,
                  }}
                >
                  <Assignment
                    color="disabled"
                    sx={{ fontSize: 48, mb: 1, opacity: 0.5 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Chưa có nhiệm vụ nào được gán
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Chọn nhiệm vụ từ danh sách bên trái để gán cho nhân viên
                  </Typography>
                </Paper>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssignmentTable;
