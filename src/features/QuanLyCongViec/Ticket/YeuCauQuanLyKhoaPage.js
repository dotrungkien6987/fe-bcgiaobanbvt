/**
 * YeuCauQuanLyKhoaPage - Quản lý yêu cầu khoa (Manager View)
 *
 * View cho QUẢN LÝ KHOA (từ CauHinhThongBaoKhoa)
 * Config: YEU_CAU_QUAN_LY_KHOA_CONFIG
 */
import React, { useEffect, useState } from "react";
import { WorkRoutes } from "utils/navigationHelper";
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
  Alert,
  Button,
  ButtonGroup,
  Chip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Home as HomeIcon,
  CallReceived,
  CallMade,
  Warning as WarningIcon,
  Assessment,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import YeuCauList from "./components/YeuCauList";
import { PullToRefreshWrapper } from "./components";
import YeuCauStatusGrid from "./components/YeuCauStatusGrid";
import YeuCauFilterDrawer from "./components/YeuCauFilterDrawer";
import {
  getYeuCauList,
  getBadgeCounts,
  selectBadgeCounts,
  selectDanhMucList,
  getDanhMucByKhoa,
} from "./yeuCauSlice";
import { useYeuCauRoles } from "./hooks/useYeuCauRoles";
import { useYeuCauTabs } from "./hooks/useYeuCauTabs";
import { TRANG_THAI, TRANG_THAI_OPTIONS } from "./yeuCau.constants";

// Icon mapping từ config
const ICON_MAP = {
  CallReceived: <CallReceived />,
  CallMade: <CallMade />,
  Warning: <WarningIcon />,
  Assessment: <Assessment />,
};

function YeuCauQuanLyKhoaPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();
  const roles = useYeuCauRoles();
  const urlTab = searchParams.get("tab");
  const [refreshKey, setRefreshKey] = useState(0);
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
  } = useYeuCauTabs("YEU_CAU_QUAN_LY_KHOA", urlTab);

  const { yeuCauList, isLoading } = useSelector((state) => state.yeuCau);
  const badgeCounts = useSelector(selectBadgeCounts("YEU_CAU_QUAN_LY_KHOA"));
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
    activeTab === "da-dong" ||
    activeTabInfo?.params?.trangThai === TRANG_THAI.DA_DONG ||
    (Array.isArray(activeTabInfo?.params?.trangThai) &&
      activeTabInfo.params.trangThai.includes(TRANG_THAI.DA_DONG));

  // Summary stats
  const [summaryStats] = useState({
    tongDen: 0,
    tongGui: 0,
    quaHan: 0,
    trungBinhSao: 0,
    tyLeHaiLong: 0,
  });

  // Effect 1: Redirect nếu cần (chạy trước)
  useEffect(() => {
    if (needsRedirect && activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [needsRedirect, activeTab, setSearchParams]);

  // Load badge counts on mount
  useEffect(() => {
    if (roles.isQuanLyKhoa) {
      dispatch(getBadgeCounts("YEU_CAU_QUAN_LY_KHOA"));
    }
  }, [dispatch, roles.isQuanLyKhoa]);

  // Effect 2: Load data khi đã có tab đúng trong URL
  useEffect(() => {
    // Chỉ load khi URL đã có tab đúng (không cần redirect nữa)
    if (!isLoaded || !apiParams || !roles.isQuanLyKhoa || needsRedirect) return;

    // Tab báo cáo không load list
    if (activeTab === "bao-cao") return;

    dispatch(getYeuCauList(apiParams));

    // TODO: Load summary stats từ API
  }, [
    dispatch,
    isLoaded,
    apiParams,
    roles.isQuanLyKhoa,
    needsRedirect,
    activeTab,
  ]);

  const handleTabChange = (event, newValue) => {
    // Support both Tabs (event, newValue) and StatusGrid (tabKey only)
    const tabKey = typeof event === "string" ? event : newValue;
    setSearchParams({ tab: tabKey });
    dispatch(getBadgeCounts("YEU_CAU_QUAN_LY_KHOA"));
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

  const handleExportReport = () => {
    // TODO: Export Excel report
    console.log("Export report");
  };

  // Kiểm tra quyền
  if (roles.loading) {
    return (
      <Box sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        <Typography>Đang kiểm tra quyền...</Typography>
      </Box>
    );
  }

  if (!roles.isQuanLyKhoa) {
    return (
      <Box sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        <Alert severity="warning">
          Bạn không có quyền quản lý yêu cầu khoa. Vui lòng liên hệ quản trị
          viên nếu cần hỗ trợ.
        </Alert>
      </Box>
    );
  }

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
        <Typography color="text.primary">{pageTitle}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
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
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterOpen(true)}
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            Lọc
          </Button>
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Làm mới
            </Button>
            <Button startIcon={<DownloadIcon />} onClick={handleExportReport}>
              Xuất báo cáo
            </Button>
          </ButtonGroup>
        </Stack>
      </Stack>

      {/* Summary Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {summaryStats.tongDen}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng gửi đến
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {summaryStats.tongGui}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng gửi đi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {summaryStats.quaHan}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quá hạn
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {summaryStats.trungBinhSao.toFixed(1)} ⭐
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trung bình sao
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {summaryStats.tyLeHaiLong}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tỷ lệ hài lòng
              </Typography>
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
      {activeTab === "bao-cao" ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Báo cáo chi tiết
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chức năng này đang được phát triển...
          </Typography>
          {/* TODO: Add charts and detailed reports */}
        </Paper>
      ) : (
        <PullToRefreshWrapper onRefresh={handleRefresh}>
          <YeuCauList
            key={refreshKey}
            disableAutoFetch
            yeuCauList={yeuCauList}
            loading={isLoading}
            onViewDetail={handleViewDetail}
            emptyMessage={`Không có yêu cầu nào trong "${activeTabInfo?.label}"`}
            showRatingColumn={isClosedTab}
          />
        </PullToRefreshWrapper>
      )}

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

      {/* SpeedDial FAB for mobile */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Hành động"
          sx={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom) + 72px)",
            right: 16,
            "& .MuiSpeedDial-fab": {
              bgcolor: "primary.main",
              color: "white",
              boxShadow: 4,
            },
          }}
          icon={<MoreVertIcon />}
        >
          <SpeedDialAction
            icon={<FilterListIcon />}
            tooltipTitle="Lọc"
            onClick={() => setFilterOpen(true)}
          />
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Làm mới"
            onClick={handleRefresh}
          />
          <SpeedDialAction
            icon={<DownloadIcon />}
            tooltipTitle="Xuất báo cáo"
            onClick={handleExportReport}
          />
        </SpeedDial>
      )}
    </Box>
  );
}

export default YeuCauQuanLyKhoaPage;
