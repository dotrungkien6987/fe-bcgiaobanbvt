import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  ButtonGroup,
  Button,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import OpenTaskInNewTabButton from "../../../../../../components/OpenTaskInNewTabButton";
import {
  getStatusColor,
  getStatusText as getStatusLabel,
} from "../../../../../../utils/congViecUtils";
import { useSelector } from "react-redux";

/**
 * TaskListMini - Compact task table with filters
 * @param {Array} tasks - Task list from API
 * @param {Function} onViewTask - Callback when viewing task detail
 */
function TaskListMini({ tasks = [], onViewTask }) {
  const [filter, setFilter] = useState("all");
  const statusOverrides = useSelector((s) => s.colorConfig?.statusColors);

  const now = dayjs();

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    if (filter === "late") {
      return tasks.filter(
        (t) =>
          t.HoanThanhTreHan ||
          (t.TrangThai !== "HOAN_THANH" && dayjs(t.NgayHetHan).isBefore(now))
      );
    }
    if (filter === "active") {
      return tasks.filter((t) => t.TrangThai === "DANG_THUC_HIEN");
    }
    if (filter === "completed") {
      return tasks.filter((t) => t.TrangThai === "HOAN_THANH");
    }
    return tasks;
  }, [tasks, filter, now]);

  const counts = useMemo(() => {
    const late = tasks.filter(
      (t) =>
        t.HoanThanhTreHan ||
        (t.TrangThai !== "HOAN_THANH" && dayjs(t.NgayHetHan).isBefore(now))
    ).length;
    const active = tasks.filter((t) => t.TrangThai === "DANG_THUC_HIEN").length;
    const completed = tasks.filter((t) => t.TrangThai === "HOAN_THANH").length;
    return { late, active, completed };
  }, [tasks, now]);

  const formatDate = (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—");

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          📋 Danh sách công việc
        </Typography>
        <ButtonGroup size="small">
          <Button
            variant={filter === "all" ? "contained" : "outlined"}
            onClick={() => setFilter("all")}
          >
            Tất cả ({tasks.length})
          </Button>
          <Button
            variant={filter === "late" ? "contained" : "outlined"}
            onClick={() => setFilter("late")}
            color="error"
          >
            🔴 Trễ ({counts.late})
          </Button>
          <Button
            variant={filter === "active" ? "contained" : "outlined"}
            onClick={() => setFilter("active")}
            color="warning"
          >
            🟡 Đang làm ({counts.active})
          </Button>
          <Button
            variant={filter === "completed" ? "contained" : "outlined"}
            onClick={() => setFilter("completed")}
            color="success"
          >
            🟢 Hoàn ({counts.completed})
          </Button>
        </ButtonGroup>
      </Box>

      <TableContainer sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Mã</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 120 }}>
                Tiến độ
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Hạn chót</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Giờ trễ
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Không có công việc nào
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow
                  key={task._id}
                  hover
                  onClick={() => onViewTask?.(task._id)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="caption" fontWeight={600}>
                      {task.MaCongViec || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={task.TieuDe}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {task.TieuDe}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(task.TrangThai)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(
                          task.TrangThai,
                          statusOverrides
                        ),
                        color: "white",
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption">
                        {task.PhanTramTienDoTong}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={task.PhanTramTienDoTong}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: "#e5e7eb",
                          "& .MuiLinearProgress-bar": {
                            bgcolor:
                              task.PhanTramTienDoTong >= 80
                                ? "#10b981"
                                : task.PhanTramTienDoTong >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      color={
                        task.TrangThai !== "HOAN_THANH" &&
                        dayjs(task.NgayHetHan).isBefore(now)
                          ? "error"
                          : "inherit"
                      }
                    >
                      {formatDate(task.NgayHetHan)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {task.SoGioTre > 0 ? (
                      <Typography
                        variant="caption"
                        color="error"
                        fontWeight={600}
                      >
                        {task.SoGioTre.toFixed(1)}h
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <OpenTaskInNewTabButton
                      taskId={task._id}
                      size="small"
                      sx={{
                        "& .MuiIconButton-root": {
                          width: 32,
                          height: 32,
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default TaskListMini;
