import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Typography,
  Stack,
  Avatar,
} from "@mui/material";
import dayjs from "dayjs";

// Custom node component
const TaskNode = ({ data }) => {
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

  const statusLabel = {
    TAO_MOI: "Tạo mới",
    DA_GIAO: "Đã giao",
    DANG_THUC_HIEN: "Đang thực hiện",
    CHO_DUYET: "Chờ duyệt",
    HOAN_THANH: "Hoàn thành",
  };

  const priorityLabel = {
    THAP: "Thấp",
    BINH_THUONG: "Bình thường",
    CAO: "Cao",
    KHAN_CAP: "Khẩn cấp",
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card
        sx={{
          p: 2,
          minWidth: 280,
          backgroundColor: data.level === 0 ? "#e3f2fd" : "white",
          border: data.level === 0 ? "2px solid #1976d2" : "1px solid #ddd",
        }}
      >
        <Stack spacing={1}>
          {/* Header với avatar và tên người chính */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
              {data.NguoiChinh?.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {data.NguoiChinh}
            </Typography>
          </Stack>

          {/* Tên công việc */}
          <Typography variant="subtitle2" fontWeight={600}>
            {data.TieuDe}
          </Typography>

          {/* Chips trạng thái và ưu tiên */}
          <Stack direction="row" spacing={1}>
            <Chip
              label={statusLabel[data.TrangThai]}
              size="small"
              color={getStatusColor(data.TrangThai)}
            />
            <Chip
              label={priorityLabel[data.MucDoUuTien]}
              size="small"
              color={getPriorityColor(data.MucDoUuTien)}
              variant="outlined"
            />
          </Stack>

          {/* Ngày */}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Bắt đầu: {dayjs(data.NgayTao).format("DD/MM")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hết hạn: {dayjs(data.NgayHetHan).format("DD/MM")}
            </Typography>
          </Stack>

          {/* Progress bar */}
          <Box>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption">Tiến độ</Typography>
              <Typography variant="caption" fontWeight={600}>
                {data.TienDo}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={data.TienDo}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        </Stack>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const nodeTypes = {
  taskNode: TaskNode,
};

// Auto layout helper function
const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 300;
  const nodeHeight = 200;

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 120,
    nodesep: 80,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function TaskMindMapComponent() {
  // Mock data không cần position - dagre sẽ tự động layout
  const initialNodes = [
    // Tầng 0 - Root
    {
      id: "1",
      type: "taskNode",
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
    },
    // Tầng 1
    {
      id: "2",
      type: "taskNode",
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
    },
    {
      id: "3",
      type: "taskNode",
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
    },
    // Tầng 2
    {
      id: "4",
      type: "taskNode",
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
    },
    {
      id: "5",
      type: "taskNode",
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
    {
      id: "6",
      type: "taskNode",
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
      type: "taskNode",
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
    // Tầng 3
    {
      id: "8",
      type: "taskNode",
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
      type: "taskNode",
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
  ];

  // Mock edges
  const initialEdges = [
    { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
    { id: "e1-3", source: "1", target: "3", type: "smoothstep" },
    { id: "e2-4", source: "2", target: "4", type: "smoothstep" },
    { id: "e2-5", source: "2", target: "5", type: "smoothstep" },
    { id: "e3-6", source: "3", target: "6", type: "smoothstep" },
    { id: "e3-7", source: "3", target: "7", type: "smoothstep" },
    { id: "e4-8", source: "4", target: "8", type: "smoothstep" },
    { id: "e4-9", source: "4", target: "9", type: "smoothstep" },
  ];

  // Auto layout các nodes và edges
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(initialNodes, initialEdges);
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onNodeClick = useCallback((event, node) => {
    console.log("Clicked node:", node);
    // Có thể mở CongViecDetailDialog tại đây
  }, []);

  return (
    <Box sx={{ width: "100%", height: "calc(100vh - 100px)" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          minZoom={0.2}
          maxZoom={2}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.data?.level === 0) return "#1976d2";
              return "#666";
            }}
            nodeColor={(n) => {
              if (n.data?.level === 0) return "#e3f2fd";
              return "#fff";
            }}
            nodeBorderRadius={2}
            pannable={false}
            zoomable={false}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </Box>
  );
}

export default TaskMindMapComponent;
