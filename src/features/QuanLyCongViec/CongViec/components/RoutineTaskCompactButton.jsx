import React, { useState } from "react";
import { Button, Popover, Box, Chip, Stack, Typography } from "@mui/material";
import {
  Assignment as AssignmentIcon,
  ExpandMore as ExpandIcon,
} from "@mui/icons-material";
import RoutineTaskSelector from "./RoutineTaskSelector";

/**
 * Compact button hiển thị nhiệm vụ thường quy đã chọn
 * Click mở Popover với RoutineTaskSelector đầy đủ
 */
function RoutineTaskCompactButton({
  congViecDetail,
  myRoutineTasks,
  loadingRoutineTasks,
  myRoutineTasksError,
  isMain,
  handleSelectRoutine,
  dispatch,
  fetchMyRoutineTasks,
  availableCycles,
  selectedCycleId,
  onCycleChange,
  loadingCycles,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Lấy thông tin hiển thị
  const routineId =
    congViecDetail?.NhiemVuThuongQuyID || congViecDetail?.RoutineTaskID;
  const flagKhac = congViecDetail?.FlagNVTQKhac;

  const selectedTask = myRoutineTasks?.find((t) => t._id === routineId);
  const currentCycleInfo = selectedCycleId
    ? availableCycles?.find((c) => c._id === selectedCycleId)
    : availableCycles?.find((c) => !c.isDong);

  // Xác định text hiển thị
  const buttonText = (() => {
    if (flagKhac) return "Nhiệm vụ khác";
    if (selectedTask) return selectedTask.Ten || selectedTask.TenNhiemVu;
    return "Chưa chọn nhiệm vụ";
  })();

  const cycleText = currentCycleInfo?.TenChuKy || "Đang tải...";

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<AssignmentIcon />}
        endIcon={<ExpandIcon />}
        onClick={handleClick}
        disabled={!isMain}
        sx={{
          textTransform: "none",
          justifyContent: "space-between",
          minWidth: 280,
          maxWidth: 400,
          borderStyle: "dashed",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "grey.900" : "grey.50",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flex={1}
          sx={{ minWidth: 0 }}
        >
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: selectedTask ? 600 : 400,
              color: selectedTask ? "text.primary" : "text.secondary",
              flex: 1,
              minWidth: 0,
            }}
          >
            {buttonText}
          </Typography>

          {(flagKhac || selectedTask) && (
            <Chip
              label={flagKhac ? "Khác" : "KPI"}
              size="small"
              color={flagKhac ? "secondary" : "success"}
              sx={{ height: 20, fontSize: "0.7rem", flexShrink: 0 }}
            />
          )}
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ ml: 1, flexShrink: 0 }}
        >
          • {cycleText}
        </Typography>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            boxShadow: 3,
            maxWidth: 500,
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          {/* ✅ TÁI SỬ DỤNG 100% component RoutineTaskSelector */}
          <RoutineTaskSelector
            congViecDetail={congViecDetail}
            myRoutineTasks={myRoutineTasks}
            loadingRoutineTasks={loadingRoutineTasks}
            myRoutineTasksError={myRoutineTasksError}
            isMain={isMain}
            handleSelectRoutine={(taskId, options) => {
              handleSelectRoutine(taskId, options);
              // Close popover sau khi chọn
              setTimeout(() => handleClose(), 300);
            }}
            dispatch={dispatch}
            fetchMyRoutineTasks={fetchMyRoutineTasks}
            embedded={true}
            availableCycles={availableCycles}
            selectedCycleId={selectedCycleId}
            onCycleChange={onCycleChange}
            loadingCycles={loadingCycles}
          />
        </Box>
      </Popover>
    </>
  );
}

export default RoutineTaskCompactButton;
