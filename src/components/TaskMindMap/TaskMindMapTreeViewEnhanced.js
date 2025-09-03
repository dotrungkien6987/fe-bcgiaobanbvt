import React, { useState } from "react";
import { TreeView, TreeItem } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { getStatusColor, getPriorityColor } from "../../utils/congViecUtils";

// Styled TreeItem với connecting lines
const StyledTreeItem = styled(TreeItem)(({ theme, level = 0 }) => ({
  "& .MuiTreeItem-content": {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.5, 0),
    borderRadius: theme.spacing(1),
    backgroundColor: level === 0 ? theme.palette.primary.light : "transparent",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    "& .MuiTreeItem-label": {
      padding: 0,
      width: "100%",
    },
  },
  "& .MuiTreeItem-group": {
    marginLeft: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    borderLeft: `2px dashed ${theme.palette.divider}`,
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: -8,
      left: -1,
      width: 20,
      height: 20,
      border: `2px dashed ${theme.palette.divider}`,
      borderTop: "none",
      borderRight: "none",
    },
  },
}));

// Enhanced status và priority mappings
const statusConfig = {
  TAO_MOI: { label: "Tạo mới", icon: AssignmentIcon, color: "default" },
  DA_GIAO: { label: "Đã giao", icon: WorkIcon, color: "info" },
  DANG_THUC_HIEN: {
    label: "Đang thực hiện",
    icon: AccountTreeIcon,
    color: "primary",
  },
  CHO_DUYET: { label: "Chờ duyệt", icon: WorkIcon, color: "warning" },
  HOAN_THANH: { label: "Hoàn thành", icon: CheckCircleIcon, color: "success" },
};

const priorityConfig = {
  THAP: { label: "Thấp", color: "default" },
  BINH_THUONG: { label: "Bình thường", color: "primary" },
  CAO: { label: "Cao", color: "warning" },
  KHAN_CAP: { label: "Khẩn cấp", color: "error" },
};

function TaskNodeTreeCard({ task, level = 0, childrenCount = 0 }) {
  const statusInfo = statusConfig[task.TrangThai] || statusConfig.TAO_MOI;
  const priorityInfo =
    priorityConfig[task.MucDoUuTien] || priorityConfig.BINH_THUONG;
  const StatusIcon = statusInfo.icon;

  const isOverdue =
    dayjs().isAfter(dayjs(task.NgayHetHan)) && task.TrangThai !== "HOAN_THANH";
  const daysLeft = dayjs(task.NgayHetHan).diff(dayjs(), "day");

  return (
    <Paper
      elevation={level === 0 ? 4 : 1}
      sx={{
        p: 2,
        my: 1,
        width: "100%",
        maxWidth: 600,
        backgroundColor: level === 0 ? "primary.light" : "background.paper",
        border: level === 0 ? "2px solid" : "1px solid",
        borderColor: level === 0 ? "primary.main" : "divider",
        position: "relative",
      }}
    >
      {/* Level indicator */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "primary.main",
          color: "white",
          borderRadius: "50%",
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: "bold",
        }}
      >
        L{level + 1}
      </Box>

      <Stack spacing={1.5}>
        {/* Header với icon và người chính */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Badge
            badgeContent={childrenCount}
            color="primary"
            invisible={childrenCount === 0}
            sx={{ "& .MuiBadge-badge": { fontSize: 10 } }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                fontSize: 14,
                backgroundColor:
                  level === 0 ? "primary.main" : "secondary.main",
              }}
            >
              {task.NguoiChinh?.split(" ").pop()?.charAt(0)}
            </Avatar>
          </Badge>

          <Box flex={1}>
            <Typography
              variant={level === 0 ? "h6" : "subtitle1"}
              fontWeight={level === 0 ? 700 : 600}
              color={level === 0 ? "primary.main" : "text.primary"}
            >
              {task.TieuDe}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              👤 {task.NguoiChinh}
            </Typography>
          </Box>

          <Tooltip title={statusInfo.label}>
            <IconButton size="small" color={statusInfo.color}>
              <StatusIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Divider />

        {/* Status và Priority chips */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            icon={<StatusIcon />}
            label={statusInfo.label}
            size="small"
            sx={{
              backgroundColor: getStatusColor(task.TrangThai),
              color: "white",
              fontWeight: 600,
            }}
          />
          <Chip
            label={priorityInfo.label}
            size="small"
            variant="outlined"
            sx={{
              backgroundColor: getPriorityColor(task.MucDoUuTien),
              color: "white",
              borderColor: getPriorityColor(task.MucDoUuTien),
              fontWeight: 600,
            }}
          />

          {/* Due date indicator */}
          {isOverdue ? (
            <Chip
              label="QUÁ HẠN"
              size="small"
              color="error"
              sx={{ fontWeight: 600 }}
            />
          ) : daysLeft <= 3 && daysLeft >= 0 ? (
            <Chip
              label={`Còn ${daysLeft} ngày`}
              size="small"
              color="warning"
              sx={{ fontWeight: 600 }}
            />
          ) : null}
        </Stack>

        {/* Timeline */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack>
            <Typography variant="caption" color="text.secondary">
              📅 Bắt đầu
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {dayjs(task.NgayTao).format("DD/MM/YYYY")}
            </Typography>
          </Stack>

          <Box sx={{ textAlign: "center", px: 1 }}>
            <Typography variant="caption" color="text.secondary">
              →
            </Typography>
          </Box>

          <Stack>
            <Typography variant="caption" color="text.secondary">
              🎯 Hết hạn
            </Typography>
            <Typography
              variant="body2"
              fontWeight={500}
              color={isOverdue ? "error.main" : "text.primary"}
            >
              {dayjs(task.NgayHetHan).format("DD/MM/YYYY")}
            </Typography>
          </Stack>
        </Stack>

        {/* Progress với visual enhancements */}
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={0.5}
          >
            <Typography variant="caption" color="text.secondary">
              📊 Tiến độ thực hiện
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              color={task.TienDo === 100 ? "success.main" : "primary.main"}
            >
              {task.TienDo}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={task.TienDo}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                backgroundColor:
                  task.TienDo === 100
                    ? "success.main"
                    : task.TienDo >= 70
                    ? "primary.main"
                    : task.TienDo >= 40
                    ? "warning.main"
                    : "error.main",
              },
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

function renderEnhancedTree(nodes, level = 0) {
  return nodes.map((node) => {
    const childrenCount = node.children ? node.children.length : 0;

    return (
      <StyledTreeItem
        key={node.id}
        nodeId={node.id}
        level={level}
        label={
          <TaskNodeTreeCard
            task={node.data}
            level={level}
            childrenCount={childrenCount}
          />
        }
      >
        {node.children && renderEnhancedTree(node.children, level + 1)}
      </StyledTreeItem>
    );
  });
}

export default function TaskMindMapTreeViewEnhanced() {
  const [expanded, setExpanded] = useState(["1", "2", "3"]);

  // Enhanced mock data với cấu trúc cây rõ ràng
  const treeData = [
    {
      id: "1",
      data: {
        TieuDe: "🚀 Dự án Nâng cấp Hệ thống CNTT",
        NguoiChinh: "Nguyễn Văn An",
        NgayTao: "2024-01-01",
        NgayHetHan: "2024-12-31",
        TienDo: 65,
        TrangThai: "DANG_THUC_HIEN",
        MucDoUuTien: "CAO",
      },
      children: [
        {
          id: "2",
          data: {
            TieuDe: "📋 Phân tích yêu cầu hệ thống",
            NguoiChinh: "Trần Thị Bình",
            NgayTao: "2024-01-01",
            NgayHetHan: "2024-03-31",
            TienDo: 100,
            TrangThai: "HOAN_THANH",
            MucDoUuTien: "CAO",
          },
          children: [
            {
              id: "4",
              data: {
                TieuDe: "🔍 Khảo sát hiện trạng phòng IT",
                NguoiChinh: "Phạm Văn Dũng",
                NgayTao: "2024-01-01",
                NgayHetHan: "2024-02-15",
                TienDo: 100,
                TrangThai: "HOAN_THANH",
                MucDoUuTien: "BINH_THUONG",
              },
            },
            {
              id: "5",
              data: {
                TieuDe: "📝 Thu thập yêu cầu từ các khoa",
                NguoiChinh: "Hoàng Thị Em",
                NgayTao: "2024-01-15",
                NgayHetHan: "2024-03-01",
                TienDo: 100,
                TrangThai: "HOAN_THANH",
                MucDoUuTien: "CAO",
              },
            },
          ],
        },
        {
          id: "3",
          data: {
            TieuDe: "🎨 Thiết kế và phát triển",
            NguoiChinh: "Lê Văn Cường",
            NgayTao: "2024-02-01",
            NgayHetHan: "2024-08-30",
            TienDo: 45,
            TrangThai: "DANG_THUC_HIEN",
            MucDoUuTien: "KHAN_CAP",
          },
          children: [
            {
              id: "6",
              data: {
                TieuDe: "💾 Thiết kế Database",
                NguoiChinh: "Vũ Văn Phúc",
                NgayTao: "2024-02-15",
                NgayHetHan: "2024-05-01",
                TienDo: 90,
                TrangThai: "CHO_DUYET",
                MucDoUuTien: "CAO",
              },
            },
            {
              id: "7",
              data: {
                TieuDe: "🖥️ Phát triển giao diện người dùng",
                NguoiChinh: "Đỗ Thị Giang",
                NgayTao: "2024-03-01",
                NgayHetHan: "2024-07-01",
                TienDo: 25,
                TrangThai: "DANG_THUC_HIEN",
                MucDoUuTien: "BINH_THUONG",
              },
            },
          ],
        },
      ],
    },
  ];

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  return (
    <Box
      sx={{
        p: 3,
        height: "100%",
        overflow: "auto",
        backgroundColor: "grey.50",
      }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{ p: 2, mb: 3, backgroundColor: "primary.main", color: "white" }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <AccountTreeIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              📊 Sơ đồ Cây Công Việc
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Hiển thị cấu trúc phân cấp và mối quan hệ giữa các công việc
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Legend */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          🔖 Chú thích:
        </Typography>
        <Stack direction="row" spacing={3} flexWrap="wrap">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              L1
            </Box>
            <Typography variant="caption">Cấp độ công việc</Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Badge
              badgeContent={2}
              color="primary"
              sx={{ "& .MuiBadge-badge": { fontSize: 10 } }}
            >
              <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>A</Avatar>
            </Badge>
            <Typography variant="caption">Số công việc con</Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 20,
                height: 6,
                backgroundColor: "success.main",
                borderRadius: 1,
              }}
            />
            <Typography variant="caption">Tiến độ hoàn thành</Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Enhanced TreeView */}
      <TreeView
        expanded={expanded}
        onNodeToggle={handleToggle}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{
          flexGrow: 1,
          "& .MuiTreeView-root": {
            backgroundColor: "transparent",
          },
        }}
      >
        {renderEnhancedTree(treeData)}
      </TreeView>
    </Box>
  );
}
