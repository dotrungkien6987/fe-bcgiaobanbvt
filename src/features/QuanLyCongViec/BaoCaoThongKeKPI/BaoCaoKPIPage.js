import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Stack,
  Typography,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import { Assessment as ReportIcon } from "@mui/icons-material";
import FilterPanel from "./components/FilterPanel";
import SummaryCards from "./components/SummaryCards";
import ChartsSection from "./components/ChartsSection";
import TopPerformersTable from "./components/TopPerformersTable";
import DetailedDataTable from "./components/DetailedDataTable";
import ExportButtons from "./components/ExportButtons";
import { getThongKeKPI } from "./baoCaoKPISlice";

function BaoCaoKPIPage() {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.baoCaoKPI);

  // Load dữ liệu thống kê khi filters thay đổi
  useEffect(() => {
    dispatch(getThongKeKPI(filters));
  }, [dispatch, filters]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Paper elevation={0} sx={{ p: 3, backgroundColor: "primary.lighter" }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ReportIcon sx={{ fontSize: 32, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} color="primary.darker">
                Báo cáo & Thống kê KPI
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Tổng hợp và phân tích kết quả đánh giá KPI của nhân viên
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Bộ lọc
          </Typography>
          <FilterPanel />
        </Paper>

        {/* Summary Cards */}
        <Box>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Tổng quan
          </Typography>
          <SummaryCards />
        </Box>

        <Divider />

        {/* Charts */}
        <Box>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Biểu đồ phân tích
          </Typography>
          <ChartsSection />
        </Box>

        <Divider />

        {/* Top Performers */}
        <Box>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Xếp hạng nhân viên
          </Typography>
          <TopPerformersTable />
        </Box>

        <Divider />

        {/* Detailed Table with Export */}
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              Chi tiết đánh giá
            </Typography>
            <ExportButtons />
          </Stack>
          <DetailedDataTable />
        </Box>
      </Stack>
    </Container>
  );
}

export default BaoCaoKPIPage;
