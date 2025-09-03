// CLEAN REBUILD START
import React, { useEffect, useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  Avatar,
  Collapse,
  IconButton,
  Badge,
  CircularProgress,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import dayjs from "dayjs";
import {
  fetchRootTree,
  fetchChildren,
  fetchFullTree,
  selectRootTask,
  selectTaskById,
  selectChildrenOf,
  selectRootLoading,
  selectLoadingChildren,
  selectChildrenLoaded,
  congViecTreeActions,
  selectExpanded,
  selectTreeError,
  selectViewMode,
  selectOriginalNodeId,
} from "./congViecTreeSlice";
import CongViecDetailDialog from "../CongViec/CongViecDetailDialog";
import useAuth from "../../../hooks/useAuth";
import {
  checkNodeViewPermissionWithToast,
  checkNodeViewPermission,
  nodesToMap,
} from "./treePermissionUtils";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import {
  getStatusColor,
  getPriorityColor,
  getStatusText,
  PRIORITY_LABEL_MAP,
  EXT_DUE_LABEL_MAP,
  EXT_DUE_COLOR_MAP,
} from "../../../utils/congViecUtils";

const NodeContainer = styled(Box)(() => ({
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
const ConnectionLine = styled(Box)(({ theme }) => ({
  position: "absolute",
  backgroundColor: theme.palette.divider,
  zIndex: 0,
}));
const VerticalLine = styled(ConnectionLine)(() => ({
  width: 2,
  height: 40,
  top: -40,
  left: "50%",
  transform: "translateX(-50%)",
}));
const HorizontalLine = styled(ConnectionLine)(
  ({ width = "100%", left = 0 }) => ({
    height: 2,
    width,
    top: -40,
    left,
  })
);

function deriveDueStatus(task) {
  if (!task) return null;
  if (task.DueStatus) return task.DueStatus;
  const due = task.NgayHetHan;
  if (!due) return null;
  if (task.PhanTramTienDoTong >= 100) return null;
  const now = dayjs();
  const end = dayjs(due);
  if (now.isAfter(end)) return "QUA_HAN";
  const diff = end.diff(now, "day");
  if (diff <= 3) return "SAP_QUA_HAN";
  return "DUNG_HAN";
}

function PrettyTaskCard({
  task,
  level,
  hasChildren,
  isExpanded,
  onToggle,
  loadingChildren,
  onReload,
  onDoubleClick,
  highlighted,
  hasPermission = true,
}) {
  const statusColor = getStatusColor(task.TrangThai);
  const priorityColor = getPriorityColor(task.MucDoUuTien);
  const statusLabel = getStatusText(task.TrangThai) || task.TrangThai;
  const priorityLabel =
    PRIORITY_LABEL_MAP?.[task.MucDoUuTien] || task.MucDoUuTien;
  const dueCode = task.DueStatus || deriveDueStatus(task);
  const dueLabel = dueCode ? EXT_DUE_LABEL_MAP[dueCode] || dueCode : null;
  const dueColor = dueCode
    ? EXT_DUE_COLOR_MAP[dueCode] ||
      (dueCode === "QUA_HAN"
        ? "#D32F2F"
        : dueCode === "SAP_QUA_HAN"
        ? "#FB8C00"
        : "#2E7D32")
    : null;
  const isRoot = level === 0;

  return (
    <Card
      elevation={highlighted ? 12 : isRoot ? 8 : 3}
      data-node-id={task._id}
      sx={{
        p: 2,
        width: isRoot ? 400 : 360,
        minHeight: 188,
        backgroundColor: highlighted
          ? "warning.light"
          : isRoot
          ? "primary.light"
          : "background.paper",
        border: "2px solid",
        borderColor: highlighted
          ? "warning.main"
          : isRoot
          ? "primary.main"
          : statusColor,
        position: "relative",
        zIndex: highlighted ? 10 : 1,
        transition: "all 0.3s",
        cursor: hasPermission ? "pointer" : "not-allowed",
        userSelect: "none",
        transform: highlighted ? "scale(1.04)" : undefined,
        opacity: hasPermission ? 1 : 0.85,
        boxShadow: highlighted ? 12 : undefined,
        "&:hover": {
          transform: highlighted
            ? "scale(1.05)"
            : hasPermission
            ? "translateY(-4px)"
            : undefined,
          boxShadow: hasPermission ? 8 : undefined,
        },
      }}
      onDoubleClick={hasPermission ? onDoubleClick : undefined}
    >
      <Stack spacing={1.5}>
        <Tooltip
          title={
            hasPermission
              ? "Double-click để xem chi tiết"
              : "Bạn không có quyền xem công việc này"
          }
        >
          <Box sx={{ position: "absolute", top: 6, right: 6, opacity: 0.8 }}>
            {hasPermission ? (
              <LockOpenIcon fontSize="small" color="success" />
            ) : (
              <LockIcon fontSize="small" color="error" />
            )}
          </Box>
        </Tooltip>
        <Stack direction="row" spacing={1} alignItems="center">
          <Badge
            badgeContent={task.childrenCount || 0}
            color="primary"
            invisible={!task.childrenCount}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                fontSize: 15,
                bgcolor: priorityColor,
              }}
            >
              {(
                task.NguoiChinh ||
                task.TenCongViec ||
                task.MaCongViec ||
                "?"
              ).charAt(0)}
            </Avatar>
          </Badge>
          <Box flex={1} minWidth={0}>
            <Typography
              variant={isRoot ? "subtitle1" : "subtitle2"}
              fontWeight={600}
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {task.TenCongViec || task.TieuDe || "(Không có tiêu đề)"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {task.NguoiChinh || ""}
            </Typography>
          </Box>
          {hasChildren && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                size="small"
                onClick={onToggle}
                disabled={loadingChildren}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <Tooltip title="Tải lại con">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onReload?.()}
                    disabled={loadingChildren}
                  >
                    <RefreshIcon fontSize="inherit" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
        </Stack>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {task.MaCongViec && (
            <Chip
              label={task.MaCongViec}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          )}
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              bgcolor: statusColor,
              color: "white",
              fontWeight: 600,
              fontSize: 11,
            }}
          />
          <Chip
            label={priorityLabel}
            size="small"
            variant="outlined"
            sx={{
              borderColor: priorityColor,
              color: priorityColor,
              fontWeight: 600,
              fontSize: 11,
            }}
          />
          {dueLabel && (
            <Chip
              label={dueLabel}
              size="small"
              sx={{
                bgcolor: dueColor,
                color: "white",
                fontWeight: 600,
                fontSize: 11,
              }}
            />
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: -0.5 }}
        >
          <Chip
            size="small"
            variant="outlined"
            label={`BĐ ${
              task.NgayBatDau
                ? dayjs(task.NgayBatDau).format("DD/MM HH:mm")
                : "-"
            }`}
            sx={{ fontSize: 11 }}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`HH ${
              task.NgayHetHan
                ? dayjs(task.NgayHetHan).format("DD/MM HH:mm")
                : "-"
            }`}
            sx={{ fontSize: 11 }}
          />
          <Chip
            size="small"
            label={`HT ${
              task.NgayHoanThanh
                ? dayjs(task.NgayHoanThanh).format("DD/MM HH:mm")
                : "-"
            }`}
            sx={{
              bgcolor: "#455A64",
              color: "white",
              fontSize: 11,
              fontWeight: 500,
            }}
          />
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption">Tiến độ</Typography>
            <Typography
              variant="caption"
              fontWeight={600}
              color={
                task.PhanTramTienDoTong === 100
                  ? "success.main"
                  : "text.primary"
              }
            >
              {task.PhanTramTienDoTong}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={task.PhanTramTienDoTong}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                backgroundColor:
                  task.PhanTramTienDoTong === 100
                    ? "success.main"
                    : task.PhanTramTienDoTong >= 70
                    ? "primary.main"
                    : task.PhanTramTienDoTong >= 40
                    ? "warning.main"
                    : "error.main",
              },
            }}
          />
        </Box>
        {loadingChildren && (
          <LinearProgress sx={{ height: 4, borderRadius: 2 }} />
        )}
      </Stack>
    </Card>
  );
}
// CLEAN REBUILD END
// ---------------- Recursive Branch ----------------
function PrettyBranch({
  id,
  level = 0,
  onOpenDetail,
  highlightId,
  permissionMap,
  nhanVienId,
  allMap,
}) {
  const dispatch = useDispatch();
  const task = useSelector((s) => selectTaskById(s, id));
  const expanded = useSelector((s) => selectExpanded(s, id));
  const children = useSelector((s) => selectChildrenOf(s, id));
  const childrenLoaded = useSelector((s) => selectChildrenLoaded(s, id));
  const loadingChildren = useSelector((s) => selectLoadingChildren(s, id));
  const hasChildren = task
    ? (task.ChildrenCount || children.length) > 0
    : false;
  const hasPermission = task
    ? checkNodeViewPermission(nhanVienId, task, allMap)
    : false;

  const loadChildren = useCallback(
    (force = false) => {
      if (hasChildren && (!childrenLoaded || force) && !loadingChildren) {
        dispatch(fetchChildren({ parentId: id }));
      }
    },
    [hasChildren, childrenLoaded, loadingChildren, dispatch, id]
  );

  useEffect(() => {
    if (expanded && hasChildren && !childrenLoaded && !loadingChildren) {
      loadChildren();
    }
  }, [expanded, hasChildren, childrenLoaded, loadingChildren, loadChildren]);

  if (!task) return null;

  const cardTask = {
    _id: task._id,
    TenCongViec: task.TieuDe || task.TenCongViec,
    MaCongViec: task.MaCongViec,
    TrangThai: task.TrangThai,
    MucDoUuTien: task.MucDoUuTien || task.DoUuTienLabel,
    PhanTramTienDoTong: task.PhanTramTienDoTong ?? 0,
    NgayBatDau: task.NgayBatDau,
    NgayHetHan: task.NgayHetHan,
    NgayHoanThanh: task.NgayHoanThanh,
    NguoiChinh: (task.PhuTrach || []).map((p) => p.TenNhanVien).join(", "),
    childrenCount: task.ChildrenCount || children.length,
    DueStatus: task.TinhTrangThoiHan || task.DueStatus || null,
  };

  const toggle = () => dispatch(congViecTreeActions.toggleExpanded(id));
  const handleDoubleClick = () => onOpenDetail?.(id);

  return (
    <NodeContainer>
      {level > 0 && <VerticalLine />}
      <PrettyTaskCard
        task={cardTask}
        level={level}
        hasChildren={hasChildren}
        isExpanded={expanded}
        onToggle={hasChildren ? toggle : undefined}
        loadingChildren={loadingChildren}
        onReload={() => loadChildren(true)}
        onDoubleClick={handleDoubleClick}
        highlighted={highlightId === id}
        hasPermission={hasPermission}
      />
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
          <ChildrenContainer>
            {children.length > 1 && (
              <HorizontalLine
                width={`${(children.length - 1) * 100}%`}
                left="50%"
                sx={{ transform: "translateX(-50%)" }}
              />
            )}
            {children.map((c) => (
              <PrettyBranch
                key={c._id}
                id={c._id}
                level={level + 1}
                onOpenDetail={onOpenDetail}
                highlightId={highlightId}
                nhanVienId={nhanVienId}
                allMap={allMap}
              />
            ))}
            {!childrenLoaded && loadingChildren && (
              <CircularProgress size={28} />
            )}
          </ChildrenContainer>
        </Collapse>
      )}
    </NodeContainer>
  );
}

// ---------------- Root Component ----------------
export default function CongViecHierarchyTreeDynamic({ congViecId }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const rootTask = useSelector(selectRootTask);
  const loadingRoot = useSelector(selectRootLoading);
  const error = useSelector(selectTreeError);
  const viewMode = useSelector(selectViewMode);
  const originalNodeId = useSelector(selectOriginalNodeId);
  const allTasks = useSelector((s) =>
    Object.values(s.congViecTree.entities || {})
  );
  const allMap = nodesToMap(allTasks);
  const nhanVienId = user?.NhanVienID || null;
  const fullSubtreeLoaded = useSelector(
    (s) => s.congViecTree.fullSubtreeLoaded
  );
  const [detailId, setDetailId] = useState(null);
  const [refreshOnClose, setRefreshOnClose] = useState(false);
  const scrolledRef = useRef(false);

  // Load tree depending on view mode
  useEffect(() => {
    if (congViecId) {
      if (viewMode === "FULLTREE") {
        dispatch(congViecTreeActions.setOriginalNodeId(congViecId));
        dispatch(fetchFullTree(congViecId));
      } else {
        dispatch(fetchRootTree(congViecId));
      }
    }
  }, [dispatch, congViecId, viewMode]);

  // Khi ở SUBTREE: sau khi root load xong, tự động tải toàn bộ subtree (đệ quy) 1 lần
  useEffect(() => {
    if (
      viewMode === "SUBTREE" &&
      rootTask &&
      !loadingRoot &&
      !fullSubtreeLoaded
    ) {
      dispatch(require("./congViecTreeSlice").loadEntireSubtree(rootTask._id));
    }
  }, [viewMode, rootTask, loadingRoot, fullSubtreeLoaded, dispatch]);

  // Auto-scroll to highlighted node (no setTimeout). Retry via rAF until found or attempts exhausted.
  useEffect(() => {
    if (viewMode !== "FULLTREE" || !originalNodeId || !rootTask) return;
    if (scrolledRef.current) return;
    let attempts = 0;
    const maxAttempts = 30; // ~0.5s @ 60fps
    const tryScroll = () => {
      const el = document.querySelector(`[data-node-id='${originalNodeId}']`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        scrolledRef.current = true;
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) requestAnimationFrame(tryScroll);
    };
    requestAnimationFrame(tryScroll);
  }, [viewMode, originalNodeId, rootTask]);

  const handleViewModeChange = (e, mode) => {
    if (mode && mode !== viewMode) {
      dispatch(congViecTreeActions.setViewMode(mode));
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        overflowX: "auto",
        position: "relative",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          top: 80,
          right: 20,
          zIndex: 1000,
          p: 1,
          backgroundColor: "rgba(255,255,255,0.95)",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="caption" fontWeight={600} px={1}>
            Chế độ hiển thị
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            orientation="vertical"
            size="small"
            onChange={handleViewModeChange}
          >
            <ToggleButton value="SUBTREE">
              <Stack direction="row" spacing={1} alignItems="center">
                <SubdirectoryArrowRightIcon fontSize="inherit" />
                <Typography variant="caption" fontWeight={600}>
                  Cây con
                </Typography>
              </Stack>
            </ToggleButton>
            <ToggleButton value="FULLTREE">
              <Stack direction="row" spacing={1} alignItems="center">
                <AccountTreeIcon fontSize="inherit" />
                <Typography variant="caption" fontWeight={600}>
                  Cây đầy đủ
                </Typography>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
          {viewMode === "FULLTREE" && originalNodeId && (
            <Typography variant="caption" color="warning.main" px={1}>
              Highlight node gốc ban đầu
            </Typography>
          )}
        </Stack>
      </Paper>
      {loadingRoot && !rootTask && (
        <Stack alignItems="center" spacing={2} py={8}>
          <CircularProgress sx={{ color: "white" }} />
          <Typography variant="body2" color="white">
            Đang tải cây công việc...
          </Typography>
        </Stack>
      )}
      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}
      {rootTask && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 2,
            minWidth: "max-content",
          }}
        >
          <PrettyBranch
            id={rootTask._id}
            level={0}
            onOpenDetail={(id) => {
              const node = allMap[id];
              if (
                nhanVienId &&
                node &&
                checkNodeViewPermissionWithToast(nhanVienId, node, allMap)
              ) {
                setDetailId(id);
              }
            }}
            highlightId={viewMode === "FULLTREE" ? originalNodeId : null}
            nhanVienId={nhanVienId}
            allMap={allMap}
          />
        </Box>
      )}
      <CongViecDetailDialog
        open={Boolean(detailId)}
        congViecId={detailId}
        onClose={() => {
          setDetailId(null);
          if (refreshOnClose && congViecId) {
            if (viewMode === "FULLTREE") {
              dispatch(fetchFullTree(congViecId));
            } else {
              dispatch(fetchRootTree(congViecId));
            }
            setRefreshOnClose(false);
          }
        }}
        onEdit={() => setRefreshOnClose(true)}
      />
    </Box>
  );
}
