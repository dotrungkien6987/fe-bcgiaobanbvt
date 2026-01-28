import React, { useEffect } from "react";
import {
  Box,
  Alert,
  Grid,
  Skeleton,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  LinearProgress,
  Stack,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { fetchYeuCauDashboard } from "../../../../Ticket/yeuCauSlice";

/**
 * YeuCauDashboard - Dashboard for YeuCau (Tickets/Requests) in KPI evaluation
 * @param {string} nhiemVuThuongQuyID - Routine duty ID
 * @param {string} nhanVienID - Employee ID
 * @param {string} chuKyDanhGiaID - Evaluation cycle ID
 * @param {boolean} open - Whether dashboard is visible (for lazy loading)
 * @param {Function} onViewYeuCau - Callback when viewing yeucau detail
 * @param {boolean} isMobile - Whether to use mobile-optimized layout
 */
function YeuCauDashboard({
  nhiemVuThuongQuyID,
  nhanVienID,
  chuKyDanhGiaID,
  open = false,
  onViewYeuCau,
  isMobile = false,
}) {
  const dispatch = useDispatch();

  // Get dashboard data from Redux, keyed by nhiemVuID_chuKyID
  const dashboardKey = `${nhiemVuThuongQuyID}_${chuKyDanhGiaID}`;
  const dashboardState = useSelector(
    (state) => state.yeuCau.yeuCauDashboard?.[dashboardKey],
  );

  const { data, isLoading, error } = dashboardState || {
    data: null,
    isLoading: false,
    error: null,
  };

  // Lazy loading: only fetch when dashboard is opened
  useEffect(() => {
    if (open && !data && !isLoading && !error) {
      dispatch(
        fetchYeuCauDashboard({
          nhiemVuThuongQuyID,
          nhanVienID,
          chuKyDanhGiaID,
        }),
      );
    }
  }, [
    open,
    data,
    isLoading,
    error,
    dispatch,
    nhiemVuThuongQuyID,
    nhanVienID,
    chuKyDanhGiaID,
  ]);

  // Loading state with skeleton loaders
  if (isLoading) {
    return (
      <Box sx={{ p: isMobile ? 0.5 : 2 }}>
        <Grid container spacing={isMobile ? 1 : 2} mb={isMobile ? 1 : 2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={isMobile ? 60 : 100} />
            </Grid>
          ))}
        </Grid>
        <Stack spacing={isMobile ? 1 : 2}>
          <Skeleton variant="rectangular" height={isMobile ? 150 : 300} />
          <Skeleton variant="rectangular" height={isMobile ? 150 : 300} />
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: isMobile ? 1 : 2 }}>
        <Alert severity="error">
          <strong>Lỗi tải dữ liệu:</strong> {error}
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!data) {
    return (
      <Box sx={{ p: isMobile ? 1 : 2 }}>
        <Typography variant="body2" color="text.secondary">
          Không có dữ liệu
        </Typography>
      </Box>
    );
  }

  const {
    summary = {},
    statusDistribution = [],
    rating = {},
    yeuCauList = [],
  } = data;

  // Mobile-optimized compact cards (4 instead of 8)
  const compactCards = [
    {
      label: "Tổng số",
      value: summary.total || 0,
      bgcolor: "primary.lighter",
    },
    {
      label: "Hoàn thành",
      value: `${summary.completionRate || 0}%`,
      bgcolor: "success.lighter",
    },
    {
      label: "Trễ hạn",
      value: summary.late || 0,
      bgcolor: "warning.lighter",
    },
    {
      label: "Đánh giá",
      value: `⭐${rating.avgScore || "0"}`,
      bgcolor: "secondary.lighter",
    },
  ];

  return (
    <Box sx={{ p: isMobile ? { px: 0.5, py: 0 } : 2 }}>
      {!isMobile && (
        <Typography variant="h6" gutterBottom>
          📊 Dashboard Yêu Cầu
        </Typography>
      )}

      {/* Compact 4-card grid for mobile, 8 cards for desktop */}
      {isMobile ? (
        <Grid container spacing={0.5} sx={{ mb: 1 }}>
          {compactCards.map((card, idx) => (
            <Grid item xs={3} key={idx}>
              <Card
                sx={{
                  bgcolor: card.bgcolor,
                  height: "100%",
                  boxShadow: 0,
                  borderRadius: 1,
                }}
              >
                <CardContent sx={{ p: 0.75, "&:last-child": { pb: 0.75 } }}>
                  <Typography
                    color="text.secondary"
                    variant="caption"
                    sx={{ fontSize: "0.65rem", lineHeight: 1.2 }}
                  >
                    {card.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    sx={{ fontSize: "0.9rem", mt: 0.25 }}
                  >
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Card 1: Tổng số */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "primary.lighter", height: "100%" }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Tổng số yêu cầu
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {summary.total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Tỷ lệ hoàn thành */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "success.lighter", height: "100%" }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Tỷ lệ hoàn thành
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {summary.completionRate || "0.0"}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.completed || 0} / {summary.total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Trễ hạn */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "warning.lighter", height: "100%" }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Trễ hạn
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {summary.late || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 4: Tỷ lệ trễ */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "warning.lighter", height: "100%" }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Tỷ lệ trễ
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {summary.lateRate || "0.0"}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 5: Đang xử lý */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "info.lighter", height: "100%" }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Đang xử lý
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {summary.active || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 6: Quá hạn */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "error.lighter", height: "100%" }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Quá hạn
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {summary.overdue || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 7: Reserved (empty) */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "grey.200", height: "100%" }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  [Dự kiến]
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Sẽ cập nhật sau
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 8: Đánh giá trung bình */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "secondary.lighter", height: "100%" }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Đánh giá trung bình
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  ⭐ {rating.avgScore || "0.0"} / 5.0
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {rating.totalRatings || 0} đánh giá
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Visualizations Row - Mobile uses Stack, Desktop uses Grid */}
      {isMobile ? (
        <Stack spacing={1}>
          {/* Compact Status Distribution */}
          <Card sx={{ boxShadow: 0, border: 1, borderColor: "divider" }}>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                📊 Trạng thái
              </Typography>
              {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={statusDistribution.map((item) => ({
                        name: getStatusLabel(item.status),
                        value: item.count,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      innerRadius={25}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getStatusColor(entry.status)}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center", py: 2 }}
                >
                  Không có dữ liệu
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Compact Rating Distribution */}
          <Card sx={{ boxShadow: 0, border: 1, borderColor: "divider" }}>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                ⭐ Đánh giá ({rating.avgScore || "0"}/5)
              </Typography>
              {rating.distribution && rating.distribution.length > 0 ? (
                <Box>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const item = rating.distribution.find(
                      (d) => d.stars === stars,
                    ) || { stars, count: 0 };
                    const percentage = rating.totalRatings
                      ? (item.count / rating.totalRatings) * 100
                      : 0;
                    return (
                      <Box
                        key={stars}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ minWidth: 24, fontSize: "0.7rem" }}
                        >
                          {stars}⭐
                        </Typography>
                        <Box sx={{ flexGrow: 1, mx: 0.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{ height: 4, borderRadius: 1 }}
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ minWidth: 20, fontSize: "0.7rem" }}
                        >
                          {item.count}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center", py: 1 }}
                >
                  Chưa có đánh giá
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Compact YeuCau List */}
          <Card sx={{ boxShadow: 0, border: 1, borderColor: "divider" }}>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                📋 Danh sách ({yeuCauList.length})
              </Typography>
              {yeuCauList.length > 0 ? (
                <Stack spacing={0.5}>
                  {yeuCauList.slice(0, 5).map((yc) => (
                    <Box
                      key={yc._id}
                      onClick={() => onViewYeuCau && onViewYeuCau(yc._id)}
                      sx={{
                        p: 0.75,
                        borderRadius: 1,
                        bgcolor: "grey.50",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "grey.100" },
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        noWrap
                        sx={{ display: "block" }}
                      >
                        {yc.MaYeuCau} - {yc.TieuDe}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                        <Chip
                          label={getStatusLabel(yc.TrangThai)}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.6rem",
                            bgcolor: getStatusColor(yc.TrangThai),
                            color: "white",
                          }}
                        />
                        {yc.DanhGia?.SoSao && (
                          <Typography variant="caption" color="text.secondary">
                            ⭐{yc.DanhGia.SoSao}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  ))}
                  {yeuCauList.length > 5 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 0.5 }}
                    >
                      +{yeuCauList.length - 5} yêu cầu khác
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center", py: 2 }}
                >
                  Chưa có yêu cầu nào
                </Typography>
              )}
            </CardContent>
          </Card>
        </Stack>
      ) : (
        <>
          {/* Visualizations Row - Desktop */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Status Distribution Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 Phân bố trạng thái
                  </Typography>
                  {statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusDistribution.map((item) => ({
                            name: getStatusLabel(item.status),
                            value: item.count,
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getStatusColor(entry.status)}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        Không có dữ liệu
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Rating Distribution */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⭐ Phân bố đánh giá
                  </Typography>
                  {rating.distribution && rating.distribution.length > 0 ? (
                    <Box sx={{ mt: 2 }}>
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const item = rating.distribution.find(
                          (d) => d.stars === stars,
                        ) || { stars, count: 0 };
                        const percentage = rating.totalRatings
                          ? (item.count / rating.totalRatings) * 100
                          : 0;
                        return (
                          <Box
                            key={stars}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ minWidth: 60 }}>
                              {stars}⭐
                            </Typography>
                            <Box sx={{ flexGrow: 1, mx: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{ height: 8, borderRadius: 1 }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ minWidth: 40 }}>
                              {item.count}
                            </Typography>
                          </Box>
                        );
                      })}
                      <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Typography variant="h5" color="primary">
                          {rating.avgScore} / 5.0
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Trung bình từ {rating.totalRatings} đánh giá
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: 280,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        ⭐ ⭐ ⭐ ⭐ ⭐
                      </Typography>
                      <Typography color="text.secondary">
                        Chưa có đánh giá nào
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Các yêu cầu chưa được người yêu cầu đánh giá
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* YeuCau List Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Danh sách yêu cầu (tối đa 50)
              </Typography>
              {yeuCauList.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã YC</TableCell>
                        <TableCell>Tiêu đề</TableCell>
                        <TableCell>Người yêu cầu</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ưu tiên</TableCell>
                        <TableCell>Đánh giá</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {yeuCauList.map((yc) => (
                        <TableRow
                          key={yc._id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => onViewYeuCau && onViewYeuCau(yc._id)}
                        >
                          <TableCell>{yc.MaYeuCau}</TableCell>
                          <TableCell>{yc.TieuDe}</TableCell>
                          <TableCell>{yc.NguoiYeuCauID?.Ten || "-"}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(yc.TrangThai)}
                              color={getStatusChipColor(yc.TrangThai)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={yc.MucDoUuTien || "Bình thường"}
                              color={getPriorityColor(yc.MucDoUuTien)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {yc.DanhGia?.SoSao ? (
                              <Box display="flex" alignItems="center">
                                ⭐ {yc.DanhGia.SoSao}
                              </Box>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                Chưa đánh giá
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    bgcolor: "grey.50",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    🎫
                  </Typography>
                  <Typography color="text.secondary">
                    Chưa có yêu cầu nào trong chu kỳ này
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Nhân viên chưa xử lý yêu cầu nào liên quan đến nhiệm vụ
                    thường quy này
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

// Helper functions
const getStatusLabel = (status) => {
  const labels = {
    MOI: "Mới",
    DANG_XU_LY: "Đang xử lý",
    DA_HOAN_THANH: "Đã hoàn thành",
    DA_DONG: "Đã đóng",
    TU_CHOI: "Từ chối",
  };
  return labels[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    MOI: "#2196f3", // Blue
    DANG_XU_LY: "#ff9800", // Orange
    DA_HOAN_THANH: "#4caf50", // Green
    DA_DONG: "#9e9e9e", // Grey
    TU_CHOI: "#f44336", // Red
  };
  return colors[status] || "#666";
};

const getStatusChipColor = (status) => {
  const colors = {
    MOI: "info",
    DANG_XU_LY: "warning",
    DA_HOAN_THANH: "success",
    DA_DONG: "default",
    TU_CHOI: "error",
  };
  return colors[status] || "default";
};

const getPriorityColor = (priority) => {
  const colors = {
    CAO: "error",
    TRUNG_BINH: "warning",
    THAP: "info",
  };
  return colors[priority] || "default";
};

export default YeuCauDashboard;
