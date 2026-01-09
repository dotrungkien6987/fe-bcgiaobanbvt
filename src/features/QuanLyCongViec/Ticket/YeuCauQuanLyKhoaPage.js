/**
 * YeuCauQuanLyKhoaPage - Quản lý yêu cầu khoa (Manager View)
 *
 * View cho QUẢN LÝ KHOA (từ CauHinhThongBaoKhoa)
 * Config: YEU_CAU_QUAN_LY_KHOA_CONFIG
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
  Alert,
  Button,
  ButtonGroup,
  Chip,
} from "@mui/material";
import {
  Home as HomeIcon,
  CallReceived,
  CallMade,
  Warning as WarningIcon,
  Assessment,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import YeuCauList from "./components/YeuCauList";
import { PullToRefreshWrapper } from "./components";
import {
  getYeuCauList,
  getBadgeCounts,
  selectBadgeCounts,
} from "./yeuCauSlice";
import { useYeuCauRoles } from "./hooks/useYeuCauRoles";
import { useYeuCauTabs } from "./hooks/useYeuCauTabs";
import { TRANG_THAI } from "./yeuCau.constants";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const roles = useYeuCauRoles();
  const urlTab = searchParams.get("tab");
  const [refreshKey, setRefreshKey] = useState(0);

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
    setSearchParams({ tab: newValue });
    dispatch(getBadgeCounts("YEU_CAU_QUAN_LY_KHOA"));
  };

  const handleViewDetail = (yeuCau) => {
    navigate(`/quanlycongviec/yeucau/${yeuCau._id}`);
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
        <ButtonGroup variant="outlined">
          <Button startIcon={<RefreshIcon />}>Làm mới</Button>
          <Button startIcon={<DownloadIcon />} onClick={handleExportReport}>
            Xuất báo cáo
          </Button>
        </ButtonGroup>
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
    </Box>
  );
}

export default YeuCauQuanLyKhoaPage;
