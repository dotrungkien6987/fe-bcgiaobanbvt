import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubtasks, deleteSubtask } from "../congViecSlice";
import CongViecFormDialog from "../CongViecFormDialog";
import SubtasksTable from "./SubtasksTable";
import ConfirmDialog from "components/ConfirmDialog";

/**
 * SubtasksSection – Slim Plan UI (flat list)
 * Props: parent (congViecDetail), isMain (boolean)
 */
export default function SubtasksSection({
  parent,
  isMain,
  open,
  // NEW props:
  currentUserRole,
  currentUserNhanVienId,
  onOpenTree,
}) {
  const dispatch = useDispatch();
  const parentId = parent?._id;
  const subtasksState = useSelector(
    (s) => s.congViec.subtasksByParent[parentId]
  );
  const entities = useSelector((s) => s.congViec.subtaskEntities);
  const updatingId = useSelector((s) => s.congViec.updatingSubtaskId);
  const deletingId = useSelector((s) => s.congViec.deletingSubtaskId);
  const loading = subtasksState?.loading;
  const loaded = subtasksState?.loaded;
  const ids = subtasksState?.ids || [];
  const items = ids.map((id) => entities[id]).filter(Boolean);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    target: null,
  });

  const canAdd = isMain && parent && parent.TrangThai !== "HOAN_THANH";

  const handleRefresh = () => {
    if (parentId) dispatch(fetchSubtasks(parentId, { force: true }));
  };

  // Fetch on open (initial & each reopen). Track previous open state.
  const prevOpenRef = React.useRef(false);
  React.useEffect(() => {
    if (!parentId) return;
    const wasOpen = prevOpenRef.current;
    if (open && !wasOpen) {
      const force = !!subtasksState?.loaded; // if already loaded before, force refresh on reopen
      dispatch(fetchSubtasks(parentId, force ? { force: true } : undefined));
    }
    prevOpenRef.current = open;
  }, [open, parentId, subtasksState, dispatch]);

  const handleOpenCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditing(null);
  };

  const handleView = (id) => {
    // Placeholder: integrate with detail dialog navigation if needed
    // e.g., dispatch(getCongViecDetail(id)); or emit event
    console.debug("View subtask", id);
  };
  const handleEdit = (task) => {
    setEditing(task);
    setOpenForm(true);
  };

  const handleDelete = (task) => {
    setConfirmDelete({ open: true, target: task });
  };
  const handleConfirmDelete = async () => {
    const tgt = confirmDelete.target;
    if (!tgt) return;
    try {
      await dispatch(deleteSubtask(parentId, tgt._id));
      setConfirmDelete({ open: false, target: null });
    } catch (_) {
      // error toast handled in thunk
    }
  };
  const handleCloseConfirm = () =>
    setConfirmDelete({ open: false, target: null });

  // Note: empty state handled inside SubtasksTable

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        mb: 3,
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          p: 2,
          borderBottom: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TaskAltIcon sx={{ fontSize: 26 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "white",
              fontSize: { xs: "1.1rem", sm: "1.2rem" },
            }}
          >
            Công việc con ({parent?.ChildrenCount || 0})
          </Typography>
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={loading}
            sx={{ color: "white" }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          {parent?.AllChildrenDone &&
            parent.ChildrenCount > 0 &&
            parent.TrangThai === "DANG_THUC_HIEN" && (
              <Tooltip title="Tất cả công việc con đã hoàn thành">
                <TaskAltIcon
                  sx={{ fontSize: 18, color: "rgba(255,255,255,0.9)" }}
                />
              </Tooltip>
            )}
          {parent?.ChildrenSummary &&
            parent.ChildrenSummary.active > 0 &&
            parent.TrangThai === "HOAN_THANH" && (
              <Tooltip title="Cha đã hoàn thành nhưng vẫn còn con hoạt động (dữ liệu có thể lệch)">
                <ErrorOutlineIcon sx={{ fontSize: 18, color: "#fbbf24" }} />
              </Tooltip>
            )}
        </Box>
        {canAdd && (
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            Thêm
          </Button>
        )}
      </Box>
      <CardContent sx={{ p: 3 }}>
        <SubtasksTable
          subtasks={items}
          loading={loading && !loaded}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          updatingId={updatingId}
          deletingId={deletingId}
          currentUserRole={currentUserRole}
          currentUserNhanVienId={currentUserNhanVienId}
        />
      </CardContent>
      <CongViecFormDialog
        open={openForm}
        onClose={handleCloseForm}
        isEdit={!!editing}
        congViec={editing}
        parentId={!editing ? parentId : null}
        nhanVienId={
          editing
            ? editing.NguoiChinhID || editing.NguoiChinhID?._id
            : parent?.NguoiChinhID || parent?.NguoiChinhID?._id || null
        }
        // Khi chỉnh sửa subtask, không được fetch detail và ghi đè congViecDetail cha
        skipGlobalDetailFetch={!!editing}
      />
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Xóa công việc con"
        message={`Bạn chắc chắn muốn xóa: ${
          confirmDelete.target?.TieuDe || ""
        }?`}
        confirmText="Xóa"
        confirmColor="error"
        loading={deletingId === confirmDelete.target?._id}
      />
    </Card>
  );
}
