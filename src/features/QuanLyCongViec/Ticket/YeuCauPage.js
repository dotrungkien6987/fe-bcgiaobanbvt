/**
 * YeuCauPage - Trang chính quản lý yêu cầu hỗ trợ
 */
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  Stack,
  Paper,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import apiService from "app/apiService";
import YeuCauList from "./components/YeuCauList";
import YeuCauFormDialog from "./components/YeuCauFormDialog";
import { PullToRefreshWrapper } from "./components";
import { setActiveTab, resetFilters, selectActiveTab } from "./yeuCauSlice";

function YeuCauPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const activeTab = useSelector(selectActiveTab);
  const [openForm, setOpenForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Lấy danh sách Khoa có danh mục yêu cầu
  const [khoaOptions, setKhoaOptions] = useState([]);

  // Load khoa có danh mục yêu cầu
  useEffect(() => {
    const loadKhoaCoDanhMuc = async () => {
      try {
        const response = await apiService.get(
          "/workmanagement/danh-muc-yeu-cau/khoa-co-danh-muc"
        );
        setKhoaOptions(response.data.data || []);
      } catch (error) {
        console.error("Lỗi load khoa có danh mục:", error);
      }
    };
    loadKhoaCoDanhMuc();
  }, []);

  const handleTabChange = (event, newValue) => {
    dispatch(setActiveTab(newValue));
    // Backend sẽ tự filter dựa trên tab param (toi-gui / can-xu-ly)
    // Reset các filter khác khi đổi tab
    dispatch(resetFilters());
  };

  const handleViewDetail = (yeuCau) => {
    navigate(`/yeu-cau/${yeuCau._id}`);
  };

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleRefresh = async () => {
    // Change key để trigger re-render và reload data
    // YeuCauList sẽ tự động gọi getYeuCauList trong useEffect của nó
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
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
        <Typography color="text.primary">Yêu cầu hỗ trợ</Typography>
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
            Yêu cầu hỗ trợ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các yêu cầu hỗ trợ giữa các khoa
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
        >
          Tạo yêu cầu
        </Button>
      </Stack>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<SendIcon />}
            iconPosition="start"
            label="Tôi gửi đi"
            value="sent"
          />
          <Tab
            icon={<InboxIcon />}
            iconPosition="start"
            label="Tôi nhận được"
            value="received"
          />
        </Tabs>
      </Paper>

      {/* Content with Pull-to-Refresh */}
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <YeuCauList
          key={refreshKey}
          onViewDetail={handleViewDetail}
          khoaOptions={khoaOptions}
        />
      </PullToRefreshWrapper>

      {/* Form Dialog */}
      <YeuCauFormDialog
        open={openForm}
        onClose={handleCloseForm}
        khoaOptions={khoaOptions}
      />
    </Container>
  );
}

export default YeuCauPage;
