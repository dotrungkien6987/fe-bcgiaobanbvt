/**
 * YeuCauXuLyPage - Yêu cầu tôi xử lý
 *
 * View cho người XỬ LÝ / Người được điều phối
 * Config: YEU_CAU_TOI_XU_LY_CONFIG
 */
import React, { useEffect, useState } from "react";
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
  Button,
  Fab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { WorkRoutes } from "utils/navigationHelper";
import {
  Home as HomeIcon,
  Inbox,
  Build,
  HourglassTop,
  CheckCircle,
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import YeuCauList from "./components/YeuCauList";
import { PullToRefreshWrapper } from "./components";
import YeuCauStatusGrid from "./components/YeuCauStatusGrid";
import YeuCauFilterDrawer from "./components/YeuCauFilterDrawer";
import TiepNhanDialog from "./components/TiepNhanDialog";
import TuChoiDialog from "./components/TuChoiDialog";
import { Check as AcceptIcon, Close as RejectIcon } from "@mui/icons-material";
import {
  getYeuCauList,
  getBadgeCounts,
  selectBadgeCounts,
  fetchDashboardXuLy,
  selectDashboardXuLy,
  selectDanhMucList,
  getDanhMucByKhoa,
} from "./yeuCauSlice";
import { useYeuCauTabs } from "./hooks/useYeuCauTabs";
import { TRANG_THAI, TRANG_THAI_OPTIONS } from "./yeuCau.constants";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");

  // Dialog states
  const [openTiepNhanDialog, setOpenTiepNhanDialog] = useState(false);
  const [openTuChoiDialog, setOpenTuChoiDialog] = useState(false);
  const [selectedYeuCau, setSelectedYeuCau] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [khoaOptions, setKhoaOptions] = useState([]);

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
  const kpiMetrics = useSelector(selectDashboardXuLy);
  const danhMucList = useSelector(selectDanhMucList);

  // Load khoa có danh mục
  useEffect(() => {
    const loadKhoa = async () => {
      try {
        const apiService = require("app/apiService").default;
        const response = await apiService.get(
          "/workmanagement/danh-muc-yeu-cau/khoa-co-danh-muc"
        );
        setKhoaOptions(response.data.data || []);
        if (response.data.data?.length > 0) {
          dispatch(getDanhMucByKhoa(response.data.data[0]._id));
        }
      } catch (error) {
        console.error("Lỗi load khoa:", error);
      }
    };
    loadKhoa();
  }, [dispatch]);

  const isClosedTab =
    activeTab === "da-hoan-thanh" ||
    activeTabInfo?.params?.trangThai === TRANG_THAI.DA_DONG ||
    (Array.isArray(activeTabInfo?.params?.trangThai) &&
      activeTabInfo.params.trangThai.includes(TRANG_THAI.DA_DONG));

  // Load KPI metrics on mount
  useEffect(() => {
    dispatch(fetchDashboardXuLy());
  }, [dispatch]);

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
    // Support both Tabs (event, newValue) and StatusGrid (tabKey only)
    const tabKey = typeof event === "string" ? event : newValue;
    setSearchParams({ tab: tabKey });
    dispatch(getBadgeCounts("YEU_CAU_TOI_XU_LY"));
  };

  const handleViewDetail = (yeuCau) => {
    navigate(WorkRoutes.yeuCauDetail(yeuCau._id));
  };

  const handleRefresh = async () => {
    // Reload data từ API với filters hiện tại
    if (apiParams) {
      await dispatch(getYeuCauList(apiParams));
    }
    // Change key để force re-render YeuCauList
    setRefreshKey((prev) => prev + 1);
  };

  // Swipe action handler
  const handleSwipeAction = (yeuCau, action) => {
    setSelectedYeuCau(yeuCau);
    if (action === "TIEP_NHAN") {
      setOpenTiepNhanDialog(true);
    } else if (action === "TU_CHOI") {
      setOpenTuChoiDialog(true);
    }
  };

  const handleTiepNhanSubmit = async (data) => {
    // TODO: Implement tiếp nhận API call
    console.log("Tiếp nhận:", selectedYeuCau, data);
    setOpenTiepNhanDialog(false);
    handleRefresh();
  };

  const handleTuChoiSubmit = async (data) => {
    // TODO: Implement từ chối API call
    console.log("Từ chối:", selectedYeuCau, data);
    setOpenTuChoiDialog(false);
    handleRefresh();
  };

  return (
    <Box
      sx={{
        py: 3,
        px: { xs: 1, sm: 2, md: 3 },
        pb: { xs: "calc(env(safe-area-inset-bottom) + 72px)", md: 3 },
      }}
    >
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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {pageIcon} {pageTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTabInfo?.description}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFilterOpen(true)}
          sx={{ display: { xs: "none", sm: "inline-flex" } }}
        >
          Lọc
        </Button>
      </Stack>

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

      {/* Status Grid for Mobile */}
      <YeuCauStatusGrid
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        badgeCounts={badgeCounts}
      />

      {/* Tabs for Desktop */}
      <Paper sx={{ mb: 3, display: { xs: "none", md: "block" } }}>
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
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <YeuCauList
          key={refreshKey}
          disableAutoFetch
          yeuCauList={yeuCauList}
          loading={isLoading}
          onViewDetail={handleViewDetail}
          emptyMessage={activeTabInfo?.emptyMessage || "Không có yêu cầu nào"}
          showRatingColumn={isClosedTab}
          swipeActions={{
            onSwipeAction: handleSwipeAction,
            leftAction: {
              icon: <AcceptIcon />,
              color: "success",
              action: "TIEP_NHAN",
            },
            rightAction: {
              icon: <RejectIcon />,
              color: "error",
              action: "TU_CHOI",
            },
          }}
        />
      </PullToRefreshWrapper>

      {/* Dialogs */}
      <TiepNhanDialog
        open={openTiepNhanDialog}
        onClose={() => setOpenTiepNhanDialog(false)}
        yeuCau={selectedYeuCau}
        onSubmit={handleTiepNhanSubmit}
      />
      <TuChoiDialog
        open={openTuChoiDialog}
        onClose={() => setOpenTuChoiDialog(false)}
        yeuCau={selectedYeuCau}
        onSubmit={handleTuChoiSubmit}
      />

      {/* Filter Drawer */}
      <YeuCauFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={currentFilters}
        onApply={(newFilters) => {
          setCurrentFilters(newFilters);
          const mergedParams = { ...apiParams, ...newFilters, page: 1 };
          dispatch(getYeuCauList(mergedParams));
          setFilterOpen(false);
        }}
        onReset={() => {
          setCurrentFilters({});
          dispatch(getYeuCauList(apiParams));
        }}
        khoaOptions={khoaOptions}
        danhMucOptions={danhMucList}
        trangThaiOptions={TRANG_THAI_OPTIONS}
      />

      {/* FAB for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="Lọc yêu cầu"
          onClick={() => setFilterOpen(true)}
          sx={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom) + 72px)",
            right: 16,
            zIndex: 1000,
            boxShadow: 4,
          }}
        >
          <FilterListIcon />
        </Fab>
      )}
    </Box>
  );
}

export default YeuCauXuLyPage;
