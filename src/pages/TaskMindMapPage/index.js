import React from "react";
import { Box, Container, Typography, Breadcrumbs, Link } from "@mui/material";
import TaskMindMapComponent from "../../components/TaskMindMap/TaskMindMapComponent";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const TaskMindMapPage = () => {
  return (
    <Box sx={{ py: 3, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            color="inherit"
            href="/"
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Trang chủ
          </Link>
          <Link
            color="inherit"
            href="/cong-viec"
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Quản lý Công việc
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Sơ đồ Cây Công việc
          </Typography>
        </Breadcrumbs>

        {/* Page Title */}
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📊 Sơ đồ Cây Công việc
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Trực quan hóa cấu trúc phân cấp, tiến độ và mối quan hệ giữa các công
          việc trong dự án
        </Typography>

        {/* Mind Map Component */}
        <TaskMindMapComponent />
      </Container>
    </Box>
  );
};

export default TaskMindMapPage;
