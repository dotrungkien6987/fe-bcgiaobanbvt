/**
 * NotificationTemplateTable Component (Admin)
 * Lists notification templates with filters and actions
 *
 * Features:
 * - Search and filter by category
 * - Pagination
 * - Edit/Test/Delete actions
 * - Auto-created warning alerts
 */

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  TextField,
  MenuItem,
  Tooltip,
  Typography,
  Alert,
  TablePagination,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  Science as TestIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  NotificationsOutlined as NotificationIcon,
  CheckCircleOutlined as CheckIcon,
  WarningAmberOutlined as WarningAmberIcon,
  InfoOutlined as InfoIcon,
  ErrorOutlineOutlined as ErrorIcon,
  AssignmentOutlined as TaskIcon,
  AssessmentOutlined as KPIIcon,
  DescriptionOutlined as TicketIcon,
  SystemUpdateAltOutlined as SystemIcon,
} from "@mui/icons-material";
import {
  getTemplates,
  setFilters,
  deleteTemplate,
} from "./notificationTemplateSlice";

const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "task", label: "Công việc" },
  { value: "kpi", label: "KPI" },
  { value: "ticket", label: "Yêu cầu" },
  { value: "system", label: "Hệ thống" },
  { value: "other", label: "Khác" },
];

const CATEGORY_COLORS = {
  task: "primary",
  kpi: "secondary",
  ticket: "info",
  system: "warning",
  other: "default",
};

/**
 * NotificationTemplateTable - Admin table for managing templates
 * @param {Function} onEdit - Edit template callback
 * @param {Function} onTest - Test template callback
 */
function NotificationTemplateTable({ onEdit, onTest }) {
  const dispatch = useDispatch();
  const { templates, pagination, stats, filters, isLoading } = useSelector(
    (state) => state.notificationTemplate
  );

  useEffect(() => {
    dispatch(getTemplates());
  }, [dispatch]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handlePageChange = (event, newPage) => {
    dispatch(getTemplates({ page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    dispatch(
      getTemplates({ limit: parseInt(event.target.value, 10), page: 1 })
    );
  };

  const handleDelete = (template) => {
    if (window.confirm("Xác nhận vô hiệu hóa template?")) {
      dispatch(deleteTemplate(template._id));
    }
  };

  return (
    <Card>
      <CardHeader
        title="Quản lý Notification Templates"
        action={
          <Tooltip title="Làm mới">
            <IconButton onClick={() => dispatch(getTemplates())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Stats Alert */}
      {stats.autoCreated > 0 && (
        <Box px={2}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ⚠️ Có <strong>{stats.autoCreated}</strong> template được tự động
              tạo cần được cấu hình nội dung.
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Filters */}
      <Box px={2} pb={2}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            label="Tìm kiếm"
            placeholder="Type hoặc tên..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <TextField
            select
            size="small"
            label="Category"
            value={filters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Auto-created"
            value={filters.isAutoCreated || ""}
            onChange={(e) =>
              handleFilterChange("isAutoCreated", e.target.value)
            }
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="true">⚠️ Cần config</MenuItem>
            <MenuItem value="false">Đã config</MenuItem>
          </TextField>
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Type</TableCell>
              <TableCell>Tên</TableCell> <TableCell>Icon</TableCell>{" "}
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Sử dụng</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow
                key={template._id}
                sx={{
                  backgroundColor: template.isAutoCreated
                    ? "#fff3e0"
                    : "transparent",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {template.isAutoCreated && (
                      <Tooltip title="Auto-created - Cần cấu hình">
                        <WarningIcon color="warning" fontSize="small" />
                      </Tooltip>
                    )}
                    <Typography variant="body2" fontFamily="monospace">
                      {template.type}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{template.name}</TableCell>
                <TableCell>
                  <Tooltip title={template.icon || "notification"}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getIconComponent(template.icon)}
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={template.category || "other"}
                    size="small"
                    color={CATEGORY_COLORS[template.category] || "default"}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={template.defaultPriority}
                    size="small"
                    color={
                      template.defaultPriority === "urgent"
                        ? "error"
                        : "default"
                    }
                  />
                </TableCell>
                <TableCell>{template.usageCount || 0}</TableCell>
                <TableCell>
                  <Chip
                    label={template.isActive ? "Active" : "Inactive"}
                    size="small"
                    color={template.isActive ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="flex-end"
                  >
                    <Tooltip title="Sửa">
                      <IconButton size="small" onClick={() => onEdit(template)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Test">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onTest(template)}
                      >
                        <TestIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {template.isActive && (
                      <Tooltip title="Vô hiệu hóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(template)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {templates.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" py={3}>
                    Không có template nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page - 1}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.limit}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Số hàng:"
      />
    </Card>
  );
}

// Helper function to get icon component by name
function getIconComponent(iconName) {
  const iconMap = {
    notification: <NotificationIcon fontSize="small" color="action" />,
    check: <CheckIcon fontSize="small" color="success" />,
    warning: <WarningAmberIcon fontSize="small" color="warning" />,
    info: <InfoIcon fontSize="small" color="info" />,
    error: <ErrorIcon fontSize="small" color="error" />,
    task: <TaskIcon fontSize="small" color="primary" />,
    kpi: <KPIIcon fontSize="small" color="secondary" />,
    ticket: <TicketIcon fontSize="small" color="primary" />,
    system: <SystemIcon fontSize="small" color="action" />,
  };
  return (
    iconMap[iconName] || <NotificationIcon fontSize="small" color="action" />
  );
}

export default NotificationTemplateTable;
