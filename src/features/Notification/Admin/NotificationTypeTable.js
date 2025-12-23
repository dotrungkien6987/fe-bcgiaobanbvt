/**
 * NotificationTypeTable Component (Admin)
 * Lists notification types with filters and actions
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
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { getTypes, setFilters, deleteType } from "./notificationTypeSlice";

const ACTIVE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Đã vô hiệu" },
];

const NHOM_OPTIONS = [
  { value: "", label: "Tất cả nhóm" },
  { value: "Công việc", label: "Công việc" },
  { value: "Yêu cầu", label: "Yêu cầu" },
  { value: "KPI", label: "KPI" },
  { value: "Hệ thống", label: "Hệ thống" },
];

const NHOM_COLORS = {
  "Công việc": "primary",
  "Yêu cầu": "secondary",
  KPI: "success",
  "Hệ thống": "info",
};

function NotificationTypeTable({ onEdit }) {
  const dispatch = useDispatch();
  const { types, filters, isLoading } = useSelector(
    (state) => state.notificationType
  );

  useEffect(() => {
    dispatch(getTypes());
  }, [dispatch]);

  const visibleTypes = useMemo(() => {
    const q = (filters.search || "").trim().toLowerCase();
    if (!q) return types;
    return types.filter((t) => {
      const code = (t.code || "").toLowerCase();
      const name = (t.name || "").toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }, [types, filters.search]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleDelete = (type) => {
    const ok = window.confirm(
      "Xác nhận vô hiệu hóa notification type?\n(Lưu ý: chỉ thực hiện được nếu chưa có template sử dụng.)"
    );
    if (ok) dispatch(deleteType(type._id));
  };

  return (
    <Card>
      <CardHeader
        title="Quản lý Notification Types"
        action={
          <Tooltip title="Làm mới">
            <IconButton onClick={() => dispatch(getTypes())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Filters */}
      <Box px={2} pb={2}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField
            size="small"
            label="Tìm kiếm"
            placeholder="Code hoặc tên..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            sx={{ minWidth: 220 }}
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
            label="Trạng thái"
            value={filters.isActive || ""}
            onChange={(e) => handleFilterChange("isActive", e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {ACTIVE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Code</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Nhóm</TableCell>
              <TableCell>Variables</TableCell>
              <TableCell>Recipient candidates</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleTypes.map((type) => {
              const vars = type.variables || [];
              const recipients = vars.filter((v) => v.isRecipientCandidate);
              return (
                <TableRow
                  key={type._id}
                  sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {type.code}
                    </Typography>
                  </TableCell>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={type.Nhom || "N/A"}
                      size="small"
                      color={NHOM_COLORS[type.Nhom] || "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{vars.length}</TableCell>
                  <TableCell>{recipients.length}</TableCell>
                  <TableCell>
                    <Chip
                      label={type.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={type.isActive ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Sửa">
                        <IconButton size="small" onClick={() => onEdit(type)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {type.isActive && (
                        <Tooltip title="Vô hiệu hóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(type)}
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

            {visibleTypes.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" py={3}>
                    Không có notification type nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default NotificationTypeTable;
