import React, { useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Slide,
  Stack,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CongViecHierarchyTreeDynamic from "./CongViecHierarchyTreeDynamic";
import {
  fetchRootTree,
  selectRootTask,
  selectRootLoading,
  congViecTreeActions,
  selectViewMode,
} from "./congViecTreeSlice";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CongViecTreeDialog({
  open,
  onClose,
  congViec,
  enableViewDetail = true,
  keepCache = true,
}) {
  const dispatch = useDispatch();
  const rootTask = useSelector(selectRootTask);
  const loadingRoot = useSelector(selectRootLoading);
  const viewMode = useSelector(selectViewMode);

  const congViecId = congViec?._id;

  // Load root when dialog opens or congViec changes
  useEffect(() => {
    if (open && congViecId) {
      dispatch(fetchRootTree(congViecId));
    }
  }, [open, congViecId, dispatch]);

  // Bulk expand/collapse
  const expandAll = useCallback(() => {
    // naive: expand current loaded ids (entities in state)
    const state = window.__APP_STORE__?.getState?.();
    if (!state?.congViecTree) return;
    const ids = Object.keys(state.congViecTree.entities || {});
    dispatch(congViecTreeActions.setExpandedBulk({ ids, value: true }));
  }, [dispatch]);
  const collapseAll = useCallback(() => {
    const state = window.__APP_STORE__?.getState?.();
    if (!state?.congViecTree) return;
    const ids = Object.keys(state.congViecTree.entities || {});
    dispatch(congViecTreeActions.setExpandedBulk({ ids, value: false }));
    if (rootTask?._id)
      dispatch(
        congViecTreeActions.setExpandedBulk({
          ids: [rootTask._id],
          value: true,
        })
      );
  }, [dispatch, rootTask]);

  const reloadRoot = () => {
    if (congViecId) dispatch(fetchRootTree(congViecId));
  };

  const handleClose = () => {
    if (!keepCache) dispatch(congViecTreeActions.resetTree());
    onClose?.();
  };

  // Helper: sử dụng duy nhất field chuẩn từ BE (đã thống nhất)
  const extractAssigner = (t) => (t && t.NguoiGiaoViec ? t.NguoiGiaoViec : "");

  const title = useMemo(() => {
    // SUBTREE mode: show info of the passed congViec
    if (viewMode !== "FULLTREE") {
      if (!congViec) return "Cây công việc";
      const code = congViec.MaCongViec || "";
      const name = congViec.TenCongViec || congViec.TieuDe || "";
      // Ưu tiên dữ liệu từ prop; fallback sang rootTask đã load (vì rootTask chắc chắn đã populate Người giao)
      const assigner = extractAssigner(congViec) || extractAssigner(rootTask);
      return `${code ? code + " – " : ""}${name}${
        assigner ? " | Người giao: " + assigner : ""
      }`;
    }
    // FULLTREE mode: show info of global root (rootTask); fallback to congViec if rootTask missing or no assigner
    const base = rootTask || congViec;
    if (!base) return "Cây công việc";
    const code = base.MaCongViec || "";
    const name = base.TenCongViec || base.TieuDe || "";
    let assigner = extractAssigner(rootTask);
    if (!assigner && congViec && congViec !== rootTask) {
      // fallback: use original node's assigner if root data lacks it
      assigner = extractAssigner(congViec);
    }
    return `${code ? code + " – " : ""}${name}${
      assigner ? " | Người giao: " + assigner : ""
    }`;
  }, [congViec, rootTask, viewMode]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }} color="primary">
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography
            sx={{ ml: 2, flex: 1 }}
            variant="h6"
            component="div"
            noWrap
          >
            {title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Reload gốc">
              <span>
                <IconButton
                  color="inherit"
                  disabled={loadingRoot}
                  onClick={reloadRoot}
                >
                  {loadingRoot ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Expand tất cả (đã load)">
              <IconButton color="inherit" onClick={expandAll}>
                <UnfoldMoreIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Collapse tất cả">
              <IconButton color="inherit" onClick={collapseAll}>
                <UnfoldLessIcon />
              </IconButton>
            </Tooltip>
            {enableViewDetail && congViecId && (
              <Tooltip title="Xem chi tiết (tab mới)">
                <IconButton
                  color="inherit"
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`/congviec/${congViecId}`}
                >
                  <OpenInNewIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        {congViecId ? (
          <CongViecHierarchyTreeDynamic congViecId={congViecId} />
        ) : (
          <Box p={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Chưa chọn công việc
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
