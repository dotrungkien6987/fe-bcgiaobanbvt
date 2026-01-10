/**
 * @fileoverview Main Dashboard Container cho Dịch Vụ Trùng
 * @module features/DashBoard/DichVuTrung/DichVuTrungDashboard
 */

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { toast } from "react-toastify";

// Redux
import {
  fetchAllData,
  selectDuplicates,
  selectPagination,
  selectStatistics,
  selectIsLoading,
  selectLoadingDuplicates,
  selectLoadingStats,
} from "./dichvutrungSlice";

// Components
import DichVuTrungFilters from "./DichVuTrungFilters";
import DichVuTrungStatistics from "./DichVuTrungStatistics";
import DichVuTrungTable from "./DichVuTrungTable";

/**
 * Main dashboard container quản lý state và orchestrate các components
 */
function DichVuTrungDashboard() {
  const dispatch = useDispatch();

  // Redux selectors
  const duplicates = useSelector(selectDuplicates);
  const pagination = useSelector(selectPagination);
  const statistics = useSelector(selectStatistics);
  const isLoading = useSelector(selectIsLoading);
  const loadingDuplicates = useSelector(selectLoadingDuplicates);
  const loadingStats = useSelector(selectLoadingStats);

  // Local state for filters
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, "day"));
  const [toDate, setToDate] = useState(dayjs());
  const [serviceTypes, setServiceTypes] = useState([
    "04CDHA",
    "03XN",
    "05TDCN",
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(50);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // AbortController ref để cancel request cũ khi có request mới
  const abortControllerRef = useRef(null);

  // Debounce search text (1000ms delay - 1 giây)
  // Tăng từ 500ms để user có thời gian gõ đủ từ khóa trước khi trigger API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 1000); // 1 giây

    return () => clearTimeout(timer);
  }, [searchText]);

  // Auto-fetch when debounced search changes
  // Triggers both when user types AND when user clears search (empty string)
  useEffect(() => {
    // Skip on initial mount (let handleSearch in mount effect run first)
    if (debouncedSearch === searchText) {
      setCurrentPage(1); // Reset to page 1 when searching/clearing
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Auto-load data on mount (optional - comment out if want manual search only)
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = run once on mount

  // Cleanup: Cancel pending request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper function to fetch data with current filters
  const fetchData = () => {
    // Cancel previous request nếu còn pending (prevent race condition)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController cho request mới
    abortControllerRef.current = new AbortController();

    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");

    dispatch(
      fetchAllData({
        fromDate: fromDateStr,
        toDate: toDateStr,
        serviceTypes,
        page: currentPage,
        limit: currentLimit,
        filterByService: selectedService,
        filterByDepartment: selectedDepartment,
        searchText: debouncedSearch || null,
      })
    );
  };

  // Handle search/refresh button click
  const handleSearch = () => {
    // Validate inputs
    if (!fromDate || !toDate) {
      toast.error("Vui lòng chọn khoảng thời gian");
      return;
    }

    if (toDate.isBefore(fromDate)) {
      toast.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
      return;
    }

    if (serviceTypes.length === 0) {
      toast.error("Vui lòng chọn ít nhất một loại dịch vụ");
      return;
    }

    // Reset page to 1 and clear filters on new search
    setCurrentPage(1);
    setSelectedService(null);
    setSelectedDepartment(null);

    // Fetch data with toast enabled for manual search
    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");

    dispatch(
      fetchAllData({
        fromDate: fromDateStr,
        toDate: toDateStr,
        serviceTypes,
        page: 1,
        limit: currentLimit,
        filterByService: null,
        filterByDepartment: null,
        searchText: debouncedSearch || null,
        showToast: true, // Hiện toast cho manual search
      })
    );
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (isLoading) return; // Prevent multiple calls
    setCurrentPage(newPage);

    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");

    dispatch(
      fetchAllData({
        fromDate: fromDateStr,
        toDate: toDateStr,
        serviceTypes,
        page: newPage,
        limit: currentLimit,
        filterByService: selectedService,
        filterByDepartment: selectedDepartment,
        searchText: debouncedSearch || null,
      })
    );
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    if (isLoading) return; // Prevent multiple calls
    setCurrentLimit(newLimit);
    setCurrentPage(1);

    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");

    dispatch(
      fetchAllData({
        fromDate: fromDateStr,
        toDate: toDateStr,
        serviceTypes,
        page: 1,
        limit: newLimit,
        filterByService: selectedService,
        filterByDepartment: selectedDepartment,
        searchText: debouncedSearch || null,
      })
    );
  };

  // Handle reset to default values
  const handleReset = () => {
    setFromDate(dayjs().subtract(7, "day"));
    setToDate(dayjs());
    setServiceTypes(["04CDHA", "03XN", "05TDCN"]);
    setCurrentPage(1);
    setCurrentLimit(50);
    setSelectedService(null);
    setSelectedDepartment(null);
    setSearchText("");
    setDebouncedSearch("");
  };

  // Handle service click from Top 5 card
  const handleServiceClick = (serviceName) => {
    if (isLoading) return; // Prevent multiple calls
    setSelectedService(serviceName);
    setSelectedDepartment(null);
    setCurrentPage(1);

    // Call API with server-side filter
    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");

    dispatch(
      fetchAllData({
        fromDate: fromDateStr,
        toDate: toDateStr,
        serviceTypes,
        page: 1,
        limit: currentLimit,
        filterByService: serviceName,
        filterByDepartment: null,
        searchText: debouncedSearch || null,
      })
    );
  };

  // Handle department click from Top 5 card
  const handleDepartmentClick = (departmentName) => {
    if (isLoading) return; // Prevent multiple calls
    setSelectedDepartment(departmentName);
    setSelectedService(null);
    setCurrentPage(1);

    // Call API with server-side filter
    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");

    dispatch(
      fetchAllData({
        fromDate: fromDateStr,
        toDate: toDateStr,
        serviceTypes,
        page: 1,
        limit: currentLimit,
        filterByService: null,
        filterByDepartment: departmentName,
        searchText: debouncedSearch || null,
      })
    );
  };

  // Clear filters
  const handleClearFilters = () => {
    if (isLoading) return; // Prevent multiple calls
    setSelectedService(null);
    setSelectedDepartment(null);
    setCurrentPage(1);

    // Reload data without filters
    const fromDateStr = fromDate.format("YYYY-MM-DD");
    const toDateStr = toDate.format("YYYY-MM-DD");

    dispatch(
      fetchAllData({
        fromDate: fromDateStr,
        toDate: toDateStr,
        serviceTypes,
        page: 1,
        limit: currentLimit,
        searchText: debouncedSearch || null,
      })
    );
  };

  return (
    <Container maxWidth={false} sx={{ py: 3, px: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
        >
          Phát Hiện Dịch Vụ Trùng Lặp
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Phát hiện các dịch vụ CĐHA/XN/TDCN được chỉ định trùng lặp bởi nhiều
          khoa cho cùng một bệnh nhân
        </Typography>
      </Box>

      {/* Filters */}
      <DichVuTrungFilters
        fromDate={fromDate}
        toDate={toDate}
        serviceTypes={serviceTypes}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onServiceTypesChange={setServiceTypes}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={isLoading}
      />

      {/* Statistics Cards */}
      <DichVuTrungStatistics
        statistics={statistics}
        loading={loadingStats}
        onServiceClick={handleServiceClick}
        onDepartmentClick={handleDepartmentClick}
      />

      {/* Table */}
      <DichVuTrungTable
        duplicates={duplicates}
        pagination={pagination}
        loading={loadingDuplicates}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        selectedService={selectedService}
        selectedDepartment={selectedDepartment}
        onClearFilters={handleClearFilters}
        searchText={searchText}
        onSearchChange={setSearchText}
        isSearching={searchText !== debouncedSearch}
        onGetExportParams={() => ({
          fromDate: fromDate.format("YYYY-MM-DD"),
          toDate: toDate.format("YYYY-MM-DD"),
          serviceTypes,
        })}
      />
    </Container>
  );
}

export default DichVuTrungDashboard;
