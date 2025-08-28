import React, { useState } from "react";
import { Box, Typography, IconButton, Button, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubtasks } from "../congViecSlice";
import CongViecFormDialog from "../CongViecFormDialog";
import SubtasksTable from "./SubtasksTable";

/**
 * SubtasksSection – Slim Plan UI (flat list)
 * Props: parent (congViecDetail), isMain (boolean)
 */
export default function SubtasksSection({ parent, isMain, open }) {
  const dispatch = useDispatch();
  const parentId = parent?._id;
  const subtasksState = useSelector(
    (s) => s.congViec.subtasksByParent[parentId]
  );
  const entities = useSelector((s) => s.congViec.subtaskEntities);
  const loading = subtasksState?.loading;
  const loaded = subtasksState?.loaded;
  const ids = subtasksState?.ids || [];
  const items = ids.map((id) => entities[id]).filter(Boolean);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

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

  // Note: empty state handled inside SubtasksTable

  return (
    <Box mt={4}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Công việc con ({parent?.ChildrenCount || 0})
        </Typography>
        <IconButton size="small" onClick={handleRefresh} disabled={loading}>
          <RefreshIcon fontSize="inherit" />
        </IconButton>
        {parent?.AllChildrenDone &&
          parent.ChildrenCount > 0 &&
          parent.TrangThai === "DANG_THUC_HIEN" && (
            <Tooltip title="Tất cả công việc con đã hoàn thành">
              <TaskAltIcon color="success" fontSize="small" />
            </Tooltip>
          )}
        {parent?.ChildrenSummary &&
          parent.ChildrenSummary.active > 0 &&
          parent.TrangThai === "HOAN_THANH" && (
            <Tooltip title="Cha đã hoàn thành nhưng vẫn còn con hoạt động (dữ liệu có thể lệch)">
              <ErrorOutlineIcon color="warning" fontSize="small" />
            </Tooltip>
          )}
        <Box flexGrow={1} />
        {canAdd && (
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Thêm
          </Button>
        )}
      </Box>
      <SubtasksTable
        subtasks={items}
        loading={loading && !loaded}
        onView={handleView}
        onEdit={handleEdit}
      />
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
      />
    </Box>
  );
}
