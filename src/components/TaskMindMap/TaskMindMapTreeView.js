import React from "react";
import { TreeView, TreeItem } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  Avatar,
  Container,
} from "@mui/material";
import dayjs from "dayjs";

const statusLabels = {
  TAO_MOI: "Tạo mới",
  DA_GIAO: "Đã giao",
  DANG_THUC_HIEN: "Đang thực hiện",
  CHO_DUYET: "Chờ duyệt",
  HOAN_THANH: "Hoàn thành",
};

const priorityLabels = {
  THAP: "Thấp",
  BINH_THUONG: "Bình thường",
  CAO: "Cao",
  KHAN_CAP: "Khẩn cấp",
};

const getStatusColor = (status) => {
  const colors = {
    TAO_MOI: "default",
    DA_GIAO: "info",
    DANG_THUC_HIEN: "primary",
    CHO_DUYET: "warning",
    HOAN_THANH: "success",
  };
  return colors[status] || "default";
};

const getPriorityColor = (priority) => {
  const colors = {
    THAP: "default",
    BINH_THUONG: "primary",
    CAO: "warning",
    KHAN_CAP: "error",
  };
  return colors[priority] || "default";
};

function TaskNodeContent({ task }) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        my: 0.8,
        width: "100%",
        backgroundColor: task.level === 0 ? "#e3f2fd" : "white",
        border: task.level === 0 ? "2px solid #1976d2" : "1px solid #ddd",
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
            {task.NguoiChinh?.charAt(0)}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {task.NguoiChinh}
          </Typography>
        </Stack>

        <Typography variant="subtitle2" fontWeight={600}>
          {task.TieuDe}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label={statusLabels[task.TrangThai]}
            size="small"
            color={getStatusColor(task.TrangThai)}
          />
          <Chip
            label={priorityLabels[task.MucDoUuTien]}
            size="small"
            color={getPriorityColor(task.MucDoUuTien)}
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            Bắt đầu: {dayjs(task.NgayTao).format("DD/MM/YYYY")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hết hạn: {dayjs(task.NgayHetHan).format("DD/MM/YYYY")}
          </Typography>
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption">Tiến độ</Typography>
            <Typography variant="caption" fontWeight={600}>
              {task.TienDo}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={task.TienDo}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      </Stack>
    </Card>
  );
}

function renderTree(nodes) {
  return nodes.map((node) => (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      label={<TaskNodeContent task={node.data} />}
    >
      {node.children && renderTree(node.children)}
    </TreeItem>
  ));
}

export default function TaskMindMapTreeView() {
  // Mock data dạng tree hierarchy
  const treeData = [
    {
      id: "1",
      data: {
        level: 0,
        TieuDe: "Dự án Nâng cấp Hệ thống CNTT",
        NguoiChinh: "Nguyễn Văn A",
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
            level: 1,
            TieuDe: "Phân tích yêu cầu",
            NguoiChinh: "Trần Thị B",
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
                level: 2,
                TieuDe: "Khảo sát hiện trạng",
                NguoiChinh: "Phạm Văn D",
                NgayTao: "2024-01-01",
                NgayHetHan: "2024-02-15",
                TienDo: 100,
                TrangThai: "HOAN_THANH",
                MucDoUuTien: "BINH_THUONG",
              },
              children: [
                {
                  id: "8",
                  data: {
                    level: 3,
                    TieuDe: "Khảo sát phòng IT",
                    NguoiChinh: "Ngô Văn H",
                    NgayTao: "2024-01-05",
                    NgayHetHan: "2024-01-20",
                    TienDo: 100,
                    TrangThai: "HOAN_THANH",
                    MucDoUuTien: "THAP",
                  },
                },
                {
                  id: "9",
                  data: {
                    level: 3,
                    TieuDe: "Khảo sát phòng Kế toán",
                    NguoiChinh: "Bùi Thị I",
                    NgayTao: "2024-01-10",
                    NgayHetHan: "2024-01-25",
                    TienDo: 100,
                    TrangThai: "HOAN_THANH",
                    MucDoUuTien: "THAP",
                  },
                },
              ],
            },
            {
              id: "5",
              data: {
                level: 2,
                TieuDe: "Thu thập yêu cầu",
                NguoiChinh: "Hoàng Thị E",
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
            level: 1,
            TieuDe: "Thiết kế hệ thống",
            NguoiChinh: "Lê Văn C",
            NgayTao: "2024-02-01",
            NgayHetHan: "2024-06-30",
            TienDo: 85,
            TrangThai: "DANG_THUC_HIEN",
            MucDoUuTien: "BINH_THUONG",
          },
          children: [
            {
              id: "6",
              data: {
                level: 2,
                TieuDe: "Thiết kế Database",
                NguoiChinh: "Vũ Văn F",
                NgayTao: "2024-02-15",
                NgayHetHan: "2024-05-01",
                TienDo: 90,
                TrangThai: "DANG_THUC_HIEN",
                MucDoUuTien: "CAO",
              },
            },
            {
              id: "7",
              data: {
                level: 2,
                TieuDe: "Thiết kế UI/UX",
                NguoiChinh: "Đỗ Thị G",
                NgayTao: "2024-03-01",
                NgayHetHan: "2024-06-01",
                TienDo: 75,
                TrangThai: "DANG_THUC_HIEN",
                MucDoUuTien: "BINH_THUONG",
              },
            },
          ],
        },
      ],
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 3, height: "calc(100vh - 100px)", overflow: "auto" }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Sơ đồ Tổ chức Công việc (Dạng Cây)
        </Typography>

        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          defaultExpanded={["1", "2", "3"]}
          sx={{
            flexGrow: 1,
            "& .MuiTreeItem-content": {
              padding: 0,
              "& .MuiTreeItem-label": {
                padding: 0,
                width: "100%",
              },
            },
            "& .MuiTreeItem-group": {
              marginLeft: 2,
              paddingLeft: 2,
              borderLeft: "1px dashed #ccc",
            },
          }}
        >
          {renderTree(treeData)}
        </TreeView>
      </Box>
    </Container>
  );
}
