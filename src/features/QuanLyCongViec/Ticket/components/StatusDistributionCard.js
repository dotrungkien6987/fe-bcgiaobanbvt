/**
 * StatusDistributionCard Component
 *
 * Phân bố trạng thái theo góc nhìn khoa
 * - SegmentedControl: [Gửi đến khoa] [Khoa gửi đi]
 * - Horizontal progress bars với labels
 *
 * Props:
 * - tuNgay, denNgay: Date - Date range filter
 * - onBarClick: (status) => void - Click bar to filter
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from "@mui/material";
import {
  CallReceived as IncomingIcon,
  CallMade as OutgoingIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStatusDistribution,
  selectStatusDistribution,
  selectStatusDistributionLoading,
} from "../yeuCauSlice";
import { TRANG_THAI_LABELS, TRANG_THAI_COLORS } from "../yeuCau.constants";

export default function StatusDistributionCard({
  tuNgay,
  denNgay,
  onBarClick,
}) {
  const dispatch = useDispatch();
  const [view, setView] = useState("xu-ly"); // "gui" | "xu-ly" | "khoa"

  const distribution = useSelector(selectStatusDistribution(view));
  const loading = useSelector(selectStatusDistributionLoading);

  // Load data when view or date changes
  useEffect(() => {
    dispatch(
      fetchStatusDistribution({
        loai: view,
        tuNgay,
        denNgay,
      })
    );
  }, [dispatch, view, tuNgay, denNgay]);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleBarClick = (status) => {
    if (onBarClick) {
      onBarClick(status);
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const colorMap = {
      MOI: "info.main",
      DANG_XU_LY: "warning.main",
      DA_HOAN_THANH: "success.main",
      DA_DONG: "grey.500",
      TU_CHOI: "error.main",
    };
    return colorMap[status] || "primary.main";
  };

  // Render skeleton loading
  const renderSkeleton = () => (
    <Stack spacing={2}>
      {[1, 2, 3, 4].map((i) => (
        <Box key={i}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Skeleton width={100} />
            <Skeleton width={60} />
          </Stack>
          <Skeleton
            variant="rectangular"
            height={28}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      ))}
    </Stack>
  );

  // Render empty state
  const renderEmpty = () => (
    <Box
      sx={{
        py: 4,
        textAlign: "center",
        color: "text.secondary",
      }}
    >
      <Typography variant="body2">Không có dữ liệu</Typography>
    </Box>
  );

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.125rem" },
            }}
          >
            📊 Tổng quan khoa
          </Typography>
        </Stack>

        {/* View Segmented Control */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            size="small"
            fullWidth
            sx={{
              "& .MuiToggleButton-root": {
                py: 1,
                textTransform: "none",
                fontSize: { xs: "0.813rem", sm: "0.875rem" },
                fontWeight: 500,
                borderRadius: "8px",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
              },
            }}
          >
            <ToggleButton value="gui">
              <Stack direction="row" spacing={1} alignItems="center">
                <OutgoingIcon fontSize="small" />
                <span>Tôi gửi</span>
              </Stack>
            </ToggleButton>
            <ToggleButton value="xu-ly">
              <Stack direction="row" spacing={1} alignItems="center">
                <IncomingIcon fontSize="small" />
                <span>Tôi xử lý</span>
              </Stack>
            </ToggleButton>
            <ToggleButton value="khoa">
              <Stack direction="row" spacing={1} alignItems="center">
                <span>📋</span>
                <span>Toàn khoa</span>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Distribution Bars */}
        {loading ? (
          renderSkeleton()
        ) : !distribution || distribution.total === 0 ? (
          renderEmpty()
        ) : (
          <Stack spacing={2.5}>
            {distribution.distribution.map((item) => (
              <Box
                key={item.status}
                sx={{
                  cursor: onBarClick ? "pointer" : "default",
                  "&:hover": onBarClick
                    ? {
                        opacity: 0.8,
                      }
                    : {},
                }}
                onClick={() => handleBarClick(item.status)}
              >
                {/* Label + Count */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.75 }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.875rem", sm: "0.938rem" },
                    }}
                  >
                    {TRANG_THAI_LABELS[item.status] || item.status}
                  </Typography>
                  <Chip
                    label={`${item.percentage}% (${item.count})`}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      bgcolor: getStatusColor(item.status),
                      color: "white",
                    }}
                  />
                </Stack>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(item.percentage)}
                  sx={{
                    height: 28,
                    borderRadius: 1,
                    bgcolor: (theme) => theme.palette.grey[200],
                    "& .MuiLinearProgress-bar": {
                      bgcolor: getStatusColor(item.status),
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>
            ))}

            {/* Total */}
            <Box
              sx={{
                pt: 1.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  Tổng cộng
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  {distribution.total}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
