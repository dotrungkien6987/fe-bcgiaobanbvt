/**
 * NotificationTemplateTable Component (Admin)
 * Lists notification templates with filters and actions
 *
 * Features:
 * - Search and filter by typeCode + enabled
 * - Edit/Test/Delete actions
 */

import React, { useEffect, useMemo } from "react";
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
  Close as CloseIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import {
  getTemplates,
  setFilters,
  deleteTemplate,
} from "./notificationTemplateSlice";

import { getTypes } from "./notificationTypeSlice";

const ENABLED_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "true", label: "Đang bật" },
  { value: "false", label: "Đã tắt" },
];

const NHOM_OPTIONS = [
  { value: "", label: "Tất cả nhóm" },
  { value: "Công việc", label: "Công việc" },
  { value: "Yêu cầu", label: "Yêu cầu" },
  { value: "KPI", label: "KPI" },
  { value: "Hệ thống", label: "Hệ thống" },
];

const NHOM_COLOR_MAP = {
  "Công việc": "primary",
  "Yêu cầu": "secondary",
  KPI: "success",
  "Hệ thống": "info",
};

/**
 * NotificationTemplateTable - Admin table for managing templates
 * @param {Function} onEdit - Edit template callback
 * @param {Function} onTest - Test template callback
 */
function NotificationTemplateTable({ onEdit, onTest }) {
  const dispatch = useDispatch();
  const { templates, total, filters, isLoading } = useSelector(
    (state) => state.notificationTemplate
  );
  const { types } = useSelector((state) => state.notificationType);

  useEffect(() => {
    dispatch(getTemplates());
    dispatch(getTypes({ isActive: true }));
  }, [dispatch]);

  // Get Nhom for a template by looking up its type
  const getTemplateNhom = (template) => {
    const type = types.find((t) => t.code === template.typeCode);
    return type?.Nhom || null;
  };

  // Filter types by selected Nhom
  const filteredTypes = useMemo(() => {
    if (!filters.Nhom) return types;
    return types.filter((t) => t.Nhom === filters.Nhom);
  }, [types, filters.Nhom]);

  // Apply client-side Nhom filtering
  const visibleTemplates = useMemo(() => {
    if (!filters.Nhom) return templates;
    return templates.filter((t) => {
      const nhom = getTemplateNhom(t);
      return nhom === filters.Nhom;
    });
  }, [templates, types, filters.Nhom]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.typeCode) count++;
    if (filters.isEnabled) count++;
    if (filters.Nhom) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleClearFilters = () => {
    dispatch(setFilters({ typeCode: "", isEnabled: "", search: "", Nhom: "" }));
  };

  const handleRemoveFilter = (field) => {
    dispatch(setFilters({ [field]: "" }));
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

      {/* Filters */}
      <Box px={2} pb={2}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            alignItems="center"
          >
            <TextField
              size="small"
              label="Tìm kiếm"
              placeholder="TypeCode hoặc tên..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <TextField
              select
              size="small"
              label="Nhóm"
              value={filters.Nhom || ""}
              onChange={(e) => handleFilterChange("Nhom", e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {NHOM_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Type"
              value={filters.typeCode || ""}
              onChange={(e) => handleFilterChange("typeCode", e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {filteredTypes.map((t) => (
                <MenuItem key={t._id} value={t.code}>
                  {t.code} - {t.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Trạng thái"
              value={filters.isEnabled || ""}
              onChange={(e) => handleFilterChange("isEnabled", e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {ENABLED_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            {activeFilterCount > 0 && (
              <Chip
                icon={<FilterListIcon />}
                label={`${activeFilterCount} bộ lọc`}
                size="small"
                onDelete={handleClearFilters}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {filters.search && (
                <Chip
                  size="small"
                  label={`Tìm kiếm: "${filters.search}"`}
                  onDelete={() => handleRemoveFilter("search")}
                  deleteIcon={<CloseIcon />}
                />
              )}
              {filters.Nhom && (
                <Chip
                  size="small"
                  label={`Nhóm: ${filters.Nhom}`}
                  onDelete={() => handleRemoveFilter("Nhom")}
                  deleteIcon={<CloseIcon />}
                  color={NHOM_COLOR_MAP[filters.Nhom] || "default"}
                />
              )}
              {filters.typeCode && (
                <Chip
                  size="small"
                  label={`Type: ${filters.typeCode}`}
                  onDelete={() => handleRemoveFilter("typeCode")}
                  deleteIcon={<CloseIcon />}
                />
              )}
              {filters.isEnabled && (
                <Chip
                  size="small"
                  label={`Trạng thái: ${
                    filters.isEnabled === "true" ? "Đang bật" : "Đã tắt"
                  }`}
                  onDelete={() => handleRemoveFilter("isEnabled")}
                  deleteIcon={<CloseIcon />}
                  color={filters.isEnabled === "true" ? "success" : "default"}
                />
              )}
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Type</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Icon</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleTemplates.map((template) => {
              const nhom = getTemplateNhom(template);
              return (
                <TableRow
                  key={template._id}
                  sx={{
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  <TableCell>
                    <Stack direction="column" spacing={0.5}>
                      <Typography variant="body2" fontFamily="monospace">
                        {template.typeCode}
                      </Typography>
                      {nhom && (
                        <Chip
                          label={nhom}
                          size="small"
                          color={NHOM_COLOR_MAP[nhom] || "default"}
                          sx={{ width: "fit-content" }}
                        />
                      )}
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
                      label={template.priority || "normal"}
                      size="small"
                      color={
                        template.priority === "urgent" ? "error" : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {(template.recipientConfig?.variables || []).join(", ") ||
                        "(Mặc định)"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.isEnabled ? "Enabled" : "Disabled"}
                      size="small"
                      color={template.isEnabled ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Sửa">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(template)}
                        >
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
                      {template.isEnabled && (
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
              );
            })}
            {visibleTemplates.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" py={3}>
                    {activeFilterCount > 0
                      ? "Không tìm thấy template nào phù hợp với bộ lọc"
                      : "Không có template nào"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box px={2} py={1}>
        <Typography variant="caption" color="text.secondary">
          {activeFilterCount > 0
            ? `Hiển thị: ${visibleTemplates.length} / Tổng: ${total}`
            : `Tổng: ${total}`}
        </Typography>
      </Box>
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
