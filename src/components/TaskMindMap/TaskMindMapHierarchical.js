import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  Avatar,
  Paper,
  Collapse,
  IconButton,
  Badge,
  Container,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import dayjs from "dayjs";
// Dynamic tree (optional) imports
import {
  fetchRootTree,
  fetchChildren,
  selectRootTask,
  selectTaskById,
  selectChildrenOf,
  selectRootLoading,
  selectLoadingChildren,
  selectChildrenLoaded,
  congViecTreeActions,
  selectExpanded,
} from "../../features/QuanLyCongViec/TreeView/congViecTreeSlice";

// Styled components cho layout phân tầng
const NodeContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
}));

const ChildrenContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  gap: theme.spacing(3),
  marginTop: theme.spacing(4),
  paddingTop: theme.spacing(1),
  position: "relative",
  flexWrap: "wrap",
}));

// Đường kết nối giữa các node
const ConnectionLine = styled(Box)(({ theme }) => ({
  position: "absolute",
  backgroundColor: theme.palette.divider,
  zIndex: 0,
}));

const VerticalLine = styled(ConnectionLine)(({ theme }) => ({
  width: 2,
  height: 40,
  top: -40,
  left: "50%",
  transform: "translateX(-50%)",
}));

const HorizontalLine = styled(ConnectionLine)(({ theme, left, width }) => ({
  height: 2,
  width: width || "100%",
  top: -40,
  left: left || 0,
}));

// Task Card Component
const TaskCard = ({
  task,
  level = 0,
  hasChildren = false,
  onToggle,
  isExpanded,
}) => {
  const getStatusColor = (status) => {
    const colors = {
      TAO_MOI: "#9e9e9e",
      DA_GIAO: "#2196f3",
      DANG_THUC_HIEN: "#ff9800",
      CHO_DUYET: "#f44336",
      HOAN_THANH: "#4caf50",
    };
    return colors[status] || "#9e9e9e";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      THAP: "#4caf50",
      BINH_THUONG: "#2196f3",
      CAO: "#ff9800",
      KHAN_CAP: "#f44336",
    };
    return colors[priority] || "#2196f3";
  };

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

  const isOverdue =
    dayjs().isAfter(dayjs(task.NgayHetHan)) && task.TrangThai !== "HOAN_THANH";

  return (
    <Card
      elevation={level === 0 ? 8 : 3}
      sx={{
        p: 2,
        width: level === 0 ? 320 : 280,
        minHeight: 180,
        backgroundColor: level === 0 ? "primary.light" : "background.paper",
        border: level === 0 ? "3px solid" : "1px solid",
        borderColor:
          level === 0 ? "primary.main" : getStatusColor(task.TrangThai),
        position: "relative",
        zIndex: 1,
        transition: "all 0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 8,
        },
      }}
    >
      {/* Level Badge */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: level === 0 ? "primary.main" : "secondary.main",
          color: "white",
          px: 1.5,
          py: 0.5,
          borderRadius: 1.5,
          fontSize: 10,
          fontWeight: "bold",
          zIndex: 10,
          boxShadow: 2,
        }}
      >
        CẤP {level + 1}
      </Box>

      <Stack spacing={1.5}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Badge
            badgeContent={task.childrenCount || 0}
            color="primary"
            invisible={!task.childrenCount}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: 14,
                backgroundColor: getPriorityColor(task.MucDoUuTien),
              }}
            >
              {task.NguoiChinh?.charAt(0)}
            </Avatar>
          </Badge>

          <Box flex={1}>
            <Typography
              variant={level === 0 ? "subtitle1" : "subtitle2"}
              fontWeight={600}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {task.TieuDe}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {task.NguoiChinh}
            </Typography>
          </Box>

          {hasChildren && (
            <IconButton size="small" onClick={onToggle}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Stack>

        {/* Status & Priority */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          <Chip
            label={statusLabels[task.TrangThai]}
            size="small"
            sx={{
              backgroundColor: getStatusColor(task.TrangThai),
              color: "white",
              fontWeight: 600,
              fontSize: 11,
            }}
          />
          <Chip
            label={priorityLabels[task.MucDoUuTien]}
            size="small"
            variant="outlined"
            sx={{
              borderColor: getPriorityColor(task.MucDoUuTien),
              color: getPriorityColor(task.MucDoUuTien),
              fontWeight: 600,
              fontSize: 11,
            }}
          />
          {isOverdue && (
            <Chip
              label="QUÁ HẠN"
              size="small"
              color="error"
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          )}
        </Stack>

        {/* Timeline */}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            {dayjs(task.NgayTao).format("DD/MM")} →{" "}
            {dayjs(task.NgayHetHan).format("DD/MM")}
          </Typography>
        </Stack>

        {/* Progress */}
        <Box>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption">Tiến độ</Typography>
            <Typography
              variant="caption"
              fontWeight={600}
              color={task.TienDo === 100 ? "success.main" : "text.primary"}
            >
              {task.TienDo}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={task.TienDo}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
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
    </Card>
  );
};

// Recursive Tree Node Component
// Static tree node (legacy mock)
const TreeNode = ({ node, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <NodeContainer>
      {/* Vertical line từ parent */}
      {level > 0 && <VerticalLine />}

      {/* Task Card */}
      <TaskCard
        task={node.data}
        level={level}
        hasChildren={hasChildren}
        onToggle={() => setExpanded(!expanded)}
        isExpanded={expanded}
      />

      {/* Children nodes */}
      {hasChildren && (
        <Collapse in={expanded} timeout="auto">
          <ChildrenContainer>
            {/* Horizontal connecting line */}
            {node.children.length > 1 && (
              <HorizontalLine
                width={`${(node.children.length - 1) * 100}%`}
                left="50%"
                sx={{ transform: "translateX(-50%)" }}
              />
            )}

            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </ChildrenContainer>
        </Collapse>
      )}
    </NodeContainer>
  );
};

// Dynamic recursive branch (uses Redux store)
const DynamicBranch = ({ id, level = 0 }) => {
  const dispatch = useDispatch();
  const task = useSelector((s) => selectTaskById(s, id));
  const expanded = useSelector((s) => selectExpanded(s, id));
  const children = useSelector((s) => selectChildrenOf(s, id));
  const childrenLoaded = useSelector((s) => selectChildrenLoaded(s, id));
  const loadingChildren = useSelector((s) => selectLoadingChildren(s, id));
  const hasChildren = (task.ChildrenCount || children.length) > 0;
  const mapped = {
    TieuDe: task.TenCongViec || task.TieuDe || task.MaCongViec,
    NguoiChinh: task.PhuTrach?.map((p) => p.TenNhanVien).join(", ") || "--",
    NgayTao: task.NgayTao || task.createdAt || dayjs().toISOString(),
    NgayHetHan: task.HanHoanThanh || task.NgayHetHan,
    TienDo: task.PhanTramTienDoTong ?? task.TienDo ?? 0,
    TrangThai: task.TrangThaiLabel || task.TrangThai || "TAO_MOI",
    MucDoUuTien: task.DoUuTienLabel || task.MucDoUuTien || "BINH_THUONG",
    childrenCount: task.ChildrenCount || children.length,
  };
  const toggle = () => dispatch(congViecTreeActions.toggleExpanded(id));
  // Auto load children first time branch expands
  useEffect(() => {
    if (
      task &&
      hasChildren &&
      expanded &&
      !childrenLoaded &&
      !loadingChildren
    ) {
      dispatch(fetchChildren({ parentId: id }));
    }
  }, [
    task,
    expanded,
    hasChildren,
    childrenLoaded,
    loadingChildren,
    dispatch,
    id,
  ]);
  if (!task) return null;
  return (
    <NodeContainer>
      {level > 0 && <VerticalLine />}
      <TaskCard
        task={mapped}
        level={level}
        hasChildren={hasChildren}
        onToggle={hasChildren ? toggle : undefined}
        isExpanded={expanded}
      />
      {hasChildren && expanded && (
        <Collapse in={expanded} timeout="auto">
          <ChildrenContainer>
            {children.length > 1 && (
              <HorizontalLine
                width={`${(children.length - 1) * 100}%`}
                left="50%"
                sx={{ transform: "translateX(-50%)" }}
              />
            )}
            {children.map((c) => (
              <DynamicBranch key={c._id} id={c._id} level={level + 1} />
            ))}
            {!childrenLoaded && loadingChildren && (
              <CircularProgress size={24} />
            )}
          </ChildrenContainer>
        </Collapse>
      )}
    </NodeContainer>
  );
};

// Main Component
export default function TaskMindMapHierarchical({
  useDynamic = false,
  congViecId,
}) {
  const dispatch = useDispatch();
  const rootTask = useSelector(selectRootTask);
  const rootLoading = useSelector(selectRootLoading);
  // Mock data với cấu trúc cây 4 tầng (legacy fallback)
  const treeData = useMemo(
    () => ({
      id: "1",
      data: {
        TieuDe: "🚀 Dự án Nâng cấp Hệ thống Y tế",
        NguoiChinh: "Nguyễn Văn An",
        NgayTao: "2024-01-01",
        NgayHetHan: "2024-12-31",
        TienDo: 65,
        TrangThai: "DANG_THUC_HIEN",
        MucDoUuTien: "CAO",
        childrenCount: 3,
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
            childrenCount: 2,
          },
          children: [
            {
              id: "4",
              data: {
                TieuDe: "🔍 Khảo sát phòng khám",
                NguoiChinh: "Phạm Văn Dũng",
                NgayTao: "2024-01-01",
                NgayHetHan: "2024-02-15",
                TienDo: 100,
                TrangThai: "HOAN_THANH",
                MucDoUuTien: "BINH_THUONG",
                childrenCount: 3,
              },
              children: [
                {
                  id: "8",
                  data: {
                    TieuDe: "Khảo sát khoa Nội",
                    NguoiChinh: "Lê Thị Hoa",
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
                    TieuDe: "Khảo sát khoa Ngoại",
                    NguoiChinh: "Vũ Văn Khải",
                    NgayTao: "2024-01-10",
                    NgayHetHan: "2024-01-25",
                    TienDo: 100,
                    TrangThai: "HOAN_THANH",
                    MucDoUuTien: "THAP",
                  },
                },
                {
                  id: "12",
                  data: {
                    TieuDe: "Khảo sát khoa Sản",
                    NguoiChinh: "Mai Thị Lan",
                    NgayTao: "2024-01-12",
                    NgayHetHan: "2024-01-28",
                    TienDo: 90,
                    TrangThai: "CHO_DUYET",
                    MucDoUuTien: "BINH_THUONG",
                  },
                },
              ],
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
            childrenCount: 3,
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
                TieuDe: "🖥️ Phát triển giao diện",
                NguoiChinh: "Đỗ Thị Giang",
                NgayTao: "2024-03-01",
                NgayHetHan: "2024-07-01",
                TienDo: 25,
                TrangThai: "DANG_THUC_HIEN",
                MucDoUuTien: "BINH_THUONG",
              },
            },
            {
              id: "13",
              data: {
                TieuDe: "⚙️ Phát triển API",
                NguoiChinh: "Trần Văn Nam",
                NgayTao: "2024-03-15",
                NgayHetHan: "2024-06-15",
                TienDo: 60,
                TrangThai: "DANG_THUC_HIEN",
                MucDoUuTien: "CAO",
              },
            },
          ],
        },
        {
          id: "10",
          data: {
            TieuDe: "🚧 Triển khai hệ thống",
            NguoiChinh: "Ngô Văn Huy",
            NgayTao: "2024-06-01",
            NgayHetHan: "2024-11-30",
            TienDo: 10,
            TrangThai: "DA_GIAO",
            MucDoUuTien: "CAO",
            childrenCount: 2,
          },
          children: [
            {
              id: "11",
              data: {
                TieuDe: "🔧 Cài đặt máy chủ",
                NguoiChinh: "Bùi Văn Tâm",
                NgayTao: "2024-06-01",
                NgayHetHan: "2024-08-01",
                TienDo: 20,
                TrangThai: "DA_GIAO",
                MucDoUuTien: "BINH_THUONG",
              },
            },
            {
              id: "14",
              data: {
                TieuDe: "📱 Đào tạo người dùng",
                NguoiChinh: "Đinh Thị Oanh",
                NgayTao: "2024-09-01",
                NgayHetHan: "2024-11-15",
                TienDo: 0,
                TrangThai: "TAO_MOI",
                MucDoUuTien: "BINH_THUONG",
              },
            },
          ],
        },
      ],
    }),
    []
  );

  // Fetch root for dynamic mode
  useEffect(() => {
    if (useDynamic) dispatch(fetchRootTree(congViecId));
  }, [useDynamic, congViecId, dispatch]);

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        overflowX: "auto",
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          background: "white",
          borderRadius: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <AccountTreeIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              📊 Sơ Đồ Phân Cấp Công Việc
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hiển thị cấu trúc phân tầng từ trên xuống dưới theo level
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Legend */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 4,
          background: "white",
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          🔖 Chú thích:
        </Typography>
        <Stack direction="row" spacing={4} flexWrap="wrap">
          <Stack direction="row" spacing={1} alignItems="center">
            <GroupWorkIcon color="primary" />
            <Typography variant="body2">Công việc cha</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 40, height: 2, backgroundColor: "divider" }} />
            <Typography variant="body2">Quan hệ cha-con</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Badge badgeContent={3} color="primary">
              <Box sx={{ width: 20, height: 20 }} />
            </Badge>
            <Typography variant="body2">Số công việc con</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                backgroundColor: "primary.main",
                color: "white",
                borderRadius: 1.5,
                fontSize: 10,
                fontWeight: "bold",
                boxShadow: 2,
              }}
            >
              CẤP 1
            </Box>
            <Typography variant="body2">Cấp độ công việc</Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Tree Diagram (Dynamic or Static) */}
      <Container maxWidth={false}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
            minWidth: "max-content",
          }}
        >
          {useDynamic ? (
            rootLoading && !rootTask ? (
              <Stack alignItems="center" spacing={2}>
                <CircularProgress />
                <Typography variant="body2" color="white">
                  Đang tải cây công việc...
                </Typography>
              </Stack>
            ) : rootTask ? (
              <DynamicBranch id={rootTask._id} level={0} />
            ) : (
              <Typography variant="body2" color="white">
                Không tìm thấy dữ liệu
              </Typography>
            )
          ) : (
            <TreeNode node={treeData} level={0} />
          )}
        </Box>
      </Container>
    </Box>
  );
}
