import React from "react";
import { useSelector } from "react-redux";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  LinearProgress,
  Box,
  Avatar,
  Stack,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  TrendingDown as WarningIcon,
} from "@mui/icons-material";

function TopPerformersTable() {
  const { topNhanVienXuatSac, nhanVienCanCaiThien, isLoading } = useSelector(
    (state) => state.baoCaoKPI
  );

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card>
              <CardHeader title="Đang tải..." />
              <CardContent>
                <LinearProgress />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const renderTable = (data, type) => {
    const isTop = type === "top";
    const emptyMessage = isTop
      ? "Chưa có dữ liệu nhân viên xuất sắc"
      : "Chưa có dữ liệu nhân viên cần cải thiện";

    if (!data || data.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nhân viên</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Khoa/Phòng</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Điểm TB
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={item.nhanVienId || index}
                sx={{
                  "&:hover": { backgroundColor: "action.hover" },
                  backgroundColor:
                    index < 3 && isTop ? "success.lighter" : "inherit",
                }}
              >
                <TableCell>
                  {isTop && index < 3 ? (
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        backgroundColor:
                          index === 0
                            ? "gold"
                            : index === 1
                            ? "silver"
                            : "#cd7f32",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  ) : (
                    <Typography variant="body2">{index + 1}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.tenNhanVien || "N/A"}
                    </Typography>
                    {item.email && (
                      <Typography variant="caption" color="text.secondary">
                        {item.email}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap maxWidth={150}>
                    {item.tenKhoa || "Chưa xác định"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={item.diemTrungBinh?.toFixed(2) || 0}
                    size="small"
                    color={isTop ? "success" : "error"}
                    sx={{ fontWeight: 600, minWidth: 60 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Grid container spacing={3}>
      {/* Top Performers */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ backgroundColor: "success.main" }}>
                <TrophyIcon />
              </Avatar>
            }
            title="Top 10 Nhân viên xuất sắc"
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
            sx={{ backgroundColor: "success.lighter" }}
          />
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {renderTable(topNhanVienXuatSac, "top")}
          </CardContent>
        </Card>
      </Grid>

      {/* Need Improvement */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            avatar={
              <Avatar sx={{ backgroundColor: "warning.main" }}>
                <WarningIcon />
              </Avatar>
            }
            title="Top 10 Nhân viên cần cải thiện"
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
            sx={{ backgroundColor: "warning.lighter" }}
          />
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {renderTable(nhanVienCanCaiThien, "bottom")}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default TopPerformersTable;
