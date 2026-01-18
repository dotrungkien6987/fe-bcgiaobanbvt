/**
 * YeuCauToiGuiPage - Yêu cầu tôi gửi đi
 *
 * View cho người GỬI yêu cầu
 * Config: YEU_CAU_TOI_GUI_CONFIG
 */
import React, { useEffect, useState } from "react";
import { WorkRoutes } from "utils/navigationHelper";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Stack,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
  Fab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Home as HomeIcon,
  HourglassEmpty,
  Build,
  RateReview,
  CheckCircle,
  Cancel,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import YeuCauList from "./components/YeuCauList";
import { PullToRefreshWrapper } from "./components";
import YeuCauFormDialog from "./components/YeuCauFormDialog";
import YeuCauStatusGrid from "./components/YeuCauStatusGrid";
import YeuCauFilterDrawer from "./components/YeuCauFilterDrawer";
import {
  getYeuCauList,
  getBadgeCounts,
  selectBadgeCounts,
  selectDanhMucList,
  getDanhMucByKhoa,
} from "./yeuCauSlice";
import { useYeuCauTabs } from "./hooks/useYeuCauTabs";
import { TRANG_THAI, TRANG_THAI_OPTIONS } from "./yeuCau.constants";

// Icon mapping
const ICON_MAP = {
  HourglassEmpty: <HourglassEmpty />,
  Build: <Build />,
  RateReview: <RateReview />,
  CheckCircle: <CheckCircle />,
  Cancel: <Cancel />,
};

function YeuCauToiGuiPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [refreshKey, setRefreshKey] = useState(0);
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
  } = useYeuCauTabs("YEU_CAU_TOI_GUI", urlTab);

  const [openForm, setOpenForm] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [khoaOptions, setKhoaOptions] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});

  const { yeuCauList, isLoading } = useSelector((state) => state.yeuCau);
  const badgeCounts = useSelector(selectBadgeCounts("YEU_CAU_TOI_GUI"));
  const danhMucList = useSelector(selectDanhMucList);

  const isClosedTab =
    activeTab === "da-dong" ||
    activeTabInfo?.params?.trangThai === TRANG_THAI.DA_DONG ||
    (Array.isArray(activeTabInfo?.params?.trangThai) &&
      activeTabInfo.params.trangThai.includes(TRANG_THAI.DA_DONG));

  // Load khoa có danh mục
  useEffect(() => {
    const loadKhoa = async () => {
      try {
        const apiService = require("app/apiService").default;
        const response = await apiService.get(
          "/workmanagement/danh-muc-yeu-cau/khoa-co-danh-muc"
        );
        setKhoaOptions(response.data.data || []);
        // Load danh mục for first khoa
        if (response.data.data?.length > 0) {
          dispatch(getDanhMucByKhoa(response.data.data[0]._id));
        }
      } catch (error) {
        console.error("Lỗi load khoa:", error);
      }
    };
    loadKhoa();
  }, [dispatch]);

  // Load badge counts on mount
  useEffect(() => {
    dispatch(getBadgeCounts("YEU_CAU_TOI_GUI"));
  }, [dispatch]);

  // Effect 1: Redirect nếu cần (chạy trước)
  useEffect(() => {
    if (needsRedirect && activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [needsRedirect, activeTab, setSearchParams]);

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
    dispatch(getBadgeCounts("YEU_CAU_TOI_GUI"));
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
        <Typography color="text.primary">Yêu cầu tôi gửi</Typography>
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
          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
            >
              Tạo yêu cầu
            </Button>
          )}
        </Stack>
      </Stack>

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
        />
      </PullToRefreshWrapper>

      {/* Form Dialog */}
      <YeuCauFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        khoaOptions={khoaOptions}
      />

      {/* FAB for mobile */}
      {isMobile && (
        <>
          <Fab
            color="primary"
            aria-label="Tạo yêu cầu mới"
            onClick={() => setOpenForm(true)}
            sx={{
              position: "fixed",
              bottom: "calc(env(safe-area-inset-bottom) + 72px)",
              right: 16,
              zIndex: 1000,
              boxShadow: 4,
            }}
          >
            <AddIcon />
          </Fab>
          <Fab
            color="default"
            aria-label="Lọc yêu cầu"
            onClick={() => setFilterOpen(true)}
            sx={{
              position: "fixed",
              bottom: "calc(env(safe-area-inset-bottom) + 144px)",
              right: 16,
              zIndex: 1000,
              boxShadow: 4,
            }}
          >
            <FilterListIcon />
          </Fab>
        </>
      )}

      {/* Filter Drawer */}
      <YeuCauFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={currentFilters}
        onApply={(newFilters) => {
          setCurrentFilters(newFilters);
          // Merge with existing apiParams and reload
          const mergedParams = { ...apiParams, ...newFilters, page: 1 };
          dispatch(getYeuCauList(mergedParams));
          setFilterOpen(false);
        }}
        onReset={() => {
          setCurrentFilters({});
          // Reload with original params
          dispatch(getYeuCauList(apiParams));
        }}
        khoaOptions={khoaOptions}
        danhMucOptions={danhMucList}
        trangThaiOptions={TRANG_THAI_OPTIONS}
      />
    </Box>
  );
}

export default YeuCauToiGuiPage;
