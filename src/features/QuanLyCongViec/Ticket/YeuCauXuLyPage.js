/**
 * YeuCauXuLyPage - Yêu cầu tôi xử lý
 *
 * View cho người XỬ LÝ / Người được điều phối
 * Config: YEU_CAU_TOI_XU_LY_CONFIG
 */
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  Paper,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material";
import {
  Home as HomeIcon,
  Inbox,
  Build,
  HourglassTop,
  CheckCircle,
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import YeuCauList from "./components/YeuCauList";
import {
  getYeuCauList,
  getBadgeCounts,
  selectBadgeCounts,
} from "./yeuCauSlice";
import { useYeuCauTabs } from "./hooks/useYeuCauTabs";
import { TRANG_THAI } from "./yeuCau.constants";

// Icon mapping từ config
const ICON_MAP = {
  Inbox: <Inbox />,
  Build: <Build />,
  HourglassTop: <HourglassTop />,
  CheckCircle: <CheckCircle />,
};

function YeuCauXuLyPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");

  // Sử dụng config từ Single Source of Truth
  const {
    tabs,
    activeTab,
    activeTabInfo,
    apiParams,
    pageTitle,
    pageIcon,
    isLoaded,
    needsRedirect,
  } = useYeuCauTabs("YEU_CAU_TOI_XU_LY", urlTab);

  const { yeuCauList, isLoading } = useSelector((state) => state.yeuCau);
  const badgeCounts = useSelector(selectBadgeCounts("YEU_CAU_TOI_XU_LY"));

  const isClosedTab =
    activeTab === "da-hoan-thanh" ||
    activeTabInfo?.params?.trangThai === TRANG_THAI.DA_DONG ||
    (Array.isArray(activeTabInfo?.params?.trangThai) &&
      activeTabInfo.params.trangThai.includes(TRANG_THAI.DA_DONG));

  // TODO: Load KPI metrics từ API
  const kpiMetrics = {
    tongXuLy: 0,
    trungBinhSao: 0,
    tyLeDungHan: 0,
  };

  // Effect 1: Redirect nếu cần (chạy trước)
  useEffect(() => {
    if (needsRedirect && activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [needsRedirect, activeTab, setSearchParams]);

  // Load badge counts on mount
  useEffect(() => {
    dispatch(getBadgeCounts("YEU_CAU_TOI_XU_LY"));
  }, [dispatch]);

  // Effect 2: Load data khi đã có tab đúng trong URL
  useEffect(() => {
    // Chỉ load khi URL đã có tab đúng (không cần redirect nữa)
    if (!isLoaded || !apiParams || needsRedirect) return;

    dispatch(getYeuCauList(apiParams));
  }, [dispatch, isLoaded, apiParams, needsRedirect]);

  const handleTabChange = (event, newValue) => {
    setSearchParams({ tab: newValue });
    dispatch(getBadgeCounts("YEU_CAU_TOI_XU_LY"));
  };

  const handleViewDetail = (yeuCau) => {
    navigate(`/yeu-cau/${yeuCau._id}`);
  };

  return (
    <Box sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Trang chủ
        </Link>
        <Link underline="hover" color="inherit" href="/quan-ly-cong-viec">
          Quản lý công việc
        </Link>
        <Typography color="text.primary">Yêu cầu tôi xử lý</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {pageIcon} {pageTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {activeTabInfo?.description}
        </Typography>
      </Box>

      {/* KPI Metrics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrophyIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {kpiMetrics.tongXuLy}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng đã xử lý
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <StarIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {kpiMetrics.trungBinhSao.toFixed(1)} ⭐
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trung bình đánh giá
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TimerIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {kpiMetrics.tyLeDungHan}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ đúng hạn
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              icon={ICON_MAP[tab.icon] || null}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{tab.label}</span>
                  {badgeCounts[tab.key] > 0 && (
                    <Chip
                      label={badgeCounts[tab.key]}
                      size="small"
                      color="error"
                      sx={{ height: 20, fontSize: "0.75rem" }}
                    />
                  )}
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Content */}
      <YeuCauList
        yeuCauList={yeuCauList}
        loading={isLoading}
        onViewDetail={handleViewDetail}
        emptyMessage={activeTabInfo?.emptyMessage || "Không có yêu cầu nào"}
        showRatingColumn={isClosedTab}
      />
    </Box>
  );
}

export default YeuCauXuLyPage;
