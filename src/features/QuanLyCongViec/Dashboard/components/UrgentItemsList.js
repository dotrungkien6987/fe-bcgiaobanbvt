/**
 * UrgentItemsList - Danh sách items cần xử lý gấp (mixed CongViec + YeuCau)
 *
 * Hiển thị top 5 items gấp nhất, sorted by deadline
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  List,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Button,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Danger,
  Task,
  MessageQuestion,
  Clock,
  ArrowRight2,
  User,
} from "iconsax-react";
import { WorkRoutes } from "utils/navigationHelper";

/**
 * UrgentItem - Compact Card Mode (gọn gàng hơn)
 */
function UrgentItem({ item, theme, onNavigate }) {
  const isCongViec = item.type === "CONG_VIEC";
  const Icon = isCongViec ? Task : MessageQuestion;
  const colorValue = item.isOverdue
    ? theme.palette.error.main
    : theme.palette.warning.main;
  const typeColor = isCongViec
    ? theme.palette.primary.main
    : theme.palette.info.main;

  return (
    <Card
      onClick={() => onNavigate(item)}
      sx={{
        mb: 1,
        borderLeft: `4px solid ${colorValue}`,
        cursor: "pointer",
        transition: "all 0.2s",
        bgcolor: alpha(colorValue, 0.02),
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          transform: "translateX(4px)",
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          {/* Icon + Type Badge */}
          <Stack spacing={0.5} alignItems="center" minWidth={50}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(typeColor, 0.1),
              }}
            >
              <Icon size={16} color={typeColor} variant="Bold" />
            </Box>
            <Chip
              label={isCongViec ? "CV" : "YC"}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.6rem",
                fontWeight: 600,
                bgcolor: alpha(typeColor, 0.1),
                color: typeColor,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Stack>

          {/* Content */}
          <Box flex={1} minWidth={0}>
            {/* Title */}
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{
                mb: 0.75,
                color: "text.primary",
              }}
            >
              {item.tieuDe}
            </Typography>

            {/* Bottom Info */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ gap: 0.75 }}
            >
              {/* Avatar + Name */}
              {item.nguoiLienQuan && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Avatar
                    src={item.nguoiLienQuan.avatar}
                    sx={{ width: 18, height: 18 }}
                  >
                    <User size={12} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {item.nguoiLienQuan.ten}
                  </Typography>
                </Stack>
              )}

              {/* Deadline Badge */}
              <Chip
                icon={<Clock size={11} />}
                label={item.timeRemaining}
                size="small"
                color={item.isOverdue ? "error" : "warning"}
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  "& .MuiChip-icon": { ml: 0.5 },
                }}
              />
            </Stack>
          </Box>

          {/* Arrow Icon */}
          <ArrowRight2
            size={16}
            color={theme.palette.text.disabled}
            style={{ flexShrink: 0, marginTop: 4 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * LoadingSkeleton - Skeleton khi đang loading (compact)
 */
function LoadingSkeleton() {
  return (
    <Stack spacing={1}>
      {[1, 2, 3].map((i) => (
        <Card key={i} sx={{ borderLeft: "4px solid transparent" }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" spacing={1.5}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box flex={1}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * EmptyState - Hiển thị khi không có items
 */
function EmptyState({ theme, activeTab = 0 }) {
  const messages = [
    "Không có công việc/yêu cầu gấp",
    "Không có công việc gấp",
    "Không có yêu cầu gấp",
  ];

  return (
    <Box
      sx={{
        py: 4,
        textAlign: "center",
        color: theme.palette.text.secondary,
      }}
    >
      <Danger size={40} color={theme.palette.success.main} variant="TwoTone" />
      <Typography variant="body2" mt={1} fontWeight={500}>
        {messages[activeTab]}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        Bạn đã hoàn thành tốt! 🎉
      </Typography>
    </Box>
  );
}

/**
 * UrgentItemsList - Component chính với Tabs filter
 */
function UrgentItemsList({
  items = [],
  total = 0,
  isLoading = false,
  nhanVienId,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0); // 0=All, 1=CongViec, 2=YeuCau

  const handleNavigate = (item) => {
    if (item.type === "CONG_VIEC") {
      navigate(WorkRoutes.congViecDetail(item.id));
    } else {
      navigate(WorkRoutes.yeuCauDetail?.(item.id) || `/yeucau/${item.id}`);
    }
  };

  const handleViewAll = () => {
    // Navigate to received tasks list with urgent filter
    if (nhanVienId) {
      navigate(
        `${WorkRoutes.congViecList(nhanVienId)}?filter=urgent&sort=deadline`,
      );
    }
  };

  // Filter items by tab
  const filteredItems =
    activeTab === 0
      ? items
      : items.filter((item) =>
          activeTab === 1 ? item.type === "CONG_VIEC" : item.type === "YEU_CAU",
        );

  const cvCount = items.filter((item) => item.type === "CONG_VIEC").length;
  const ycCount = items.filter((item) => item.type === "YEU_CAU").length;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                }}
              >
                <Danger
                  size={16}
                  color={theme.palette.error.main}
                  variant="Bold"
                />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Cần xử lý gấp
              </Typography>
              {total > 0 && (
                <Chip
                  label={total}
                  size="small"
                  color="error"
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              )}
            </Stack>

            {total > 5 && (
              <Button
                size="small"
                onClick={handleViewAll}
                endIcon={<ArrowRight2 size={14} />}
                sx={{ textTransform: "none", fontSize: "0.8rem" }}
              >
                Xem tất cả
              </Button>
            )}
          </Stack>

          {/* Tabs Filter */}
          {items.length > 0 && (
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                mt: 1.5,
                minHeight: 36,
                "& .MuiTab-root": {
                  minHeight: 36,
                  py: 0.5,
                  fontSize: "0.8rem",
                },
              }}
            >
              <Tab label={`Tất cả (${total})`} />
              <Tab label={`Công việc (${cvCount})`} />
              <Tab label={`Yêu cầu (${ycCount})`} />
            </Tabs>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ px: 2, pb: 2 }}>
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredItems.length === 0 ? (
            <EmptyState theme={theme} activeTab={activeTab} />
          ) : (
            <Box>
              {filteredItems.map((item, index) => (
                <UrgentItem
                  key={`${item.type}-${item.id}-${index}`}
                  item={item}
                  theme={theme}
                  onNavigate={handleNavigate}
                />
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default UrgentItemsList;
