import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getCongViecDetail, fetchMyRoutineTasks } from "./congViecSlice";
import SubtasksSection from "./components/SubtasksSection";
import TaskDialogHeader from "./components/TaskDialogHeader";
import useAuth from "hooks/useAuth";

dayjs.extend(relativeTime);

// NOTE: This is a minimal skeleton to host logic moved from the Dialog. We'll incrementally migrate.
export default function TaskDetailShell({ congViecId }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { congViecDetail, loading, error } = useSelector((s) => s.congViec);

  useEffect(() => {
    if (congViecId) {
      dispatch(getCongViecDetail(congViecId));
      dispatch(fetchMyRoutineTasks());
    }
  }, [congViecId, dispatch]);

  const congViec = congViecDetail || {};
  const nhanVienObjId = user?.NhanVien?._id;
  const currentNhanVienId = user?.NhanVienID || nhanVienObjId || user?._id;
  const congViecNguoiChinhId =
    typeof congViec?.NguoiChinhID === "object"
      ? congViec?.NguoiChinhID?._id || congViec?.NguoiChinhID?.id
      : congViec?.NguoiChinhID;
  const isMain = !!(
    currentNhanVienId &&
    congViecNguoiChinhId &&
    String(congViecNguoiChinhId) === String(currentNhanVienId)
  );

  // Simple header placeholder
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <TaskDialogHeader
          congViec={congViec}
          user={user}
          dueChips={[]}
          onClose={() => window.history.back()}
          onEdit={() => {}}
        />
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {loading && <Typography>Đang tải...</Typography>}
        {error && !loading && (
          <Typography color="error">Lỗi: {String(error)}</Typography>
        )}
        {!loading && !error && congViecDetail && (
          <>
            <SubtasksSection parent={congViec} isMain={isMain} open={true} />
            {/* TODO: Port remaining main content, comments, sidebar, history into responsive layout */}
          </>
        )}
      </Box>
    </Box>
  );
}
