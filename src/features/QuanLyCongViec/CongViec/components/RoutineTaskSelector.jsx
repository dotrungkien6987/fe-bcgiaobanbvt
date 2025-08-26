// RoutineTaskSelector – v2 (2025-08-27)
// Fix: Không còn hiển thị sai "Chưa gán" khi đã có NhiemVuThuongQuyID nhưng list chưa load.
// Logic chính:
//  - normalized: gom mọi kiểu BE có thể trả (string id, object populate, fallback key dự phòng)
//  - isLinked = có routineId & không phải 'Khác' -> luôn coi là đã gán (kể cả option chưa tới)
//  - Placeholder (__placeholder) để render "Đã gán (đang tải...)" thay vì "Chưa gán nhiệm vụ"
//  - Avatar & cảnh báo dùng isLinked, tránh phụ thuộc resolvedOptions
//  - Optimistic update giữ nguyên, tự xoá khi BE phản hồi trùng
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Stack,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Clear as ClearIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

const RoutineTaskSelector = ({
  congViecDetail,
  myRoutineTasks,
  loadingRoutineTasks,
  myRoutineTasksError,
  isMain,
  handleSelectRoutine,
  dispatch,
  fetchMyRoutineTasks,
  embedded = false, // nếu true: bỏ margin ngoài để hòa vào khối mô tả
}) => {
  console.log("RoutineTaskSelector - New Card-based UI loaded!");
  const [menuAnchor, setMenuAnchor] = useState(null);
  // Optimistic local override so UI updates instantly (tránh phải chờ BE trả về congViecDetail mới)
  // null = theo props; object = đang chờ xác nhận
  const [optimistic, setOptimistic] = useState(null);
  const [showInfo, setShowInfo] = useState(false); // dialog giải thích KPI
  const [confirmClear, setConfirmClear] = useState(false); // xác nhận bỏ liên kết

  const khacOption = useMemo(
    () => ({
      _id: "__KHAC__",
      Ten: "Khác",
      MoTa: "Nhiệm vụ không có trong danh sách thường quy",
    }),
    []
  );

  // legacy options mapping removed (we use resolvedOptions below)

  const handleMenuOpen = (event) => {
    if (!isMain) return;
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleSelectOption = (option) => {
    handleMenuClose();
    // Thiết lập optimistic state để UI đổi ngay
    if (option === null) {
      setOptimistic({ NhiemVuThuongQuyID: null, FlagNVTQKhac: false });
      Promise.resolve(handleSelectRoutine(null, { isClear: true })).catch(() =>
        setOptimistic(null)
      );
    } else if (option._id === "__KHAC__") {
      setOptimistic({ NhiemVuThuongQuyID: null, FlagNVTQKhac: true });
      Promise.resolve(handleSelectRoutine(null, { isKhac: true })).catch(() =>
        setOptimistic(null)
      );
    } else {
      setOptimistic({ NhiemVuThuongQuyID: option._id, FlagNVTQKhac: false });
      Promise.resolve(handleSelectRoutine(option._id)).catch(() =>
        setOptimistic(null)
      );
    }
  };

  // Khi props đã cập nhật trùng với optimistic => bỏ override
  useEffect(() => {
    if (!optimistic) return;
    const match =
      String(congViecDetail?.NhiemVuThuongQuyID || "") ===
        String(optimistic.NhiemVuThuongQuyID || "") &&
      !!congViecDetail?.FlagNVTQKhac === !!optimistic.FlagNVTQKhac;
    if (match) setOptimistic(null);
  }, [
    optimistic,
    congViecDetail?.NhiemVuThuongQuyID,
    congViecDetail?.FlagNVTQKhac,
  ]);

  // Không early-return trước khi khai báo hooks phía dưới để tránh vi phạm rules of hooks
  const detailMissing = !congViecDetail;

  // Chuẩn hoá routineId & flagKhac (bao quát các khả năng BE trả về):
  // - String ID
  // - Object populated { _id, TenNhiemVu | Ten, MoTa }
  // - Trường phụ (phòng hờ) như RoutineTaskID, RoutineTask (nếu trong tương lai đổi tên)
  const normalized = useMemo(() => {
    const flagKhac = optimistic
      ? optimistic.FlagNVTQKhac
      : congViecDetail.FlagNVTQKhac;

    // Ưu tiên optimistic nếu đang chờ cập nhật
    let raw = optimistic
      ? optimistic.NhiemVuThuongQuyID
      : congViecDetail.NhiemVuThuongQuyID;

    // Fallback phòng trường hợp backend đổi key hoặc populate khác tên
    if (!raw) {
      raw = congViecDetail.RoutineTaskID || congViecDetail.RoutineTask || null;
    }

    let id = null;
    let populated = null;
    if (raw && typeof raw === "object") {
      // Nếu là object nhưng chứa _id hoặc id
      populated = raw;
      id = raw._id || raw.id || null;
    } else if (typeof raw === "string") {
      const trimmed = raw.trim();
      id = trimmed.length ? trimmed : null;
    } else {
      id = raw || null;
    }

    // Chuẩn hóa id hợp lệ (ObjectId 24 hex) – nếu khác định dạng vẫn coi là liên kết tạm thời
    if (typeof id === "string" && id.trim().length === 0) id = null;

    return { routineId: id, populated, flagKhac };
  }, [
    optimistic,
    congViecDetail?.NhiemVuThuongQuyID,
    congViecDetail?.FlagNVTQKhac,
    congViecDetail?.RoutineTaskID,
    congViecDetail?.RoutineTask,
  ]);
  // Bổ sung populated object vào danh sách để tìm được ngay lần render đầu
  const resolvedOptions = useMemo(() => {
    const base = Array.isArray(myRoutineTasks) ? myRoutineTasks.slice() : [];
    if (normalized.populated && normalized.populated._id) {
      if (!base.some((o) => o._id === normalized.populated._id)) {
        base.push({
          _id: normalized.populated._id,
          Ten:
            normalized.populated.Ten ||
            normalized.populated.TenNhiemVu ||
            "Nhiệm vụ",
          MoTa: normalized.populated.MoTa || "",
        });
      }
    }
    base.push(khacOption);
    return base;
  }, [myRoutineTasks, normalized.populated, khacOption]);

  const selectedValue = useMemo(() => {
    if (normalized.flagKhac) return khacOption;
    if (normalized.routineId) {
      // Tìm trong danh sách đã load
      const found = resolvedOptions.find((o) => o._id === normalized.routineId);
      if (found) return found;
      // Placeholder chờ dữ liệu thực sự xuất hiện trong options
      return {
        _id: normalized.routineId,
        Ten: "Đang tải...",
        MoTa: "Đang tải thông tin nhiệm vụ thường quy",
        __placeholder: true,
      };
    }
    return null;
  }, [normalized.flagKhac, normalized.routineId, resolvedOptions, khacOption]);

  // Biến cờ cho biết đã liên kết (kể cả khi option chưa load đầy đủ)
  const isLinked = !!(!normalized.flagKhac && normalized.routineId);

  const getStatusText = () => {
    if (normalized.flagKhac) {
      return {
        primary: "Nhiệm vụ khác",
        secondary: "Không thuộc danh mục thường quy",
      };
    }
    if (isLinked) {
      if (selectedValue && !selectedValue.__placeholder) {
        return {
          primary: selectedValue.Ten,
          secondary: selectedValue.MoTa || "Nhiệm vụ thường quy đã chọn",
        };
      }
      return {
        primary: "Đã gán (đang tải...)",
        secondary: "Đang tải thông tin nhiệm vụ",
      };
    }
    return {
      primary: "Chưa gán nhiệm vụ",
      secondary: "Nhấn để chọn nhiệm vụ thường quy",
    };
  };

  const statusText = getStatusText();

  if (detailMissing) return null;

  return (
    <Card
      variant="outlined"
      sx={{
        mx: embedded ? 0 : 2,
        mt: embedded ? 0 : 0,
        mb: embedded ? 0 : 2,
        borderStyle: "dashed",
        borderColor: "divider",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "grey.900" : "grey.50",
      }}
    >
      <CardContent sx={{ py: 2, px: 2.5, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: (() => {
                const flagKhac = optimistic
                  ? optimistic.FlagNVTQKhac
                  : congViecDetail.FlagNVTQKhac;
                const routineId = optimistic
                  ? optimistic.NhiemVuThuongQuyID
                  : congViecDetail.NhiemVuThuongQuyID ||
                    congViecDetail.RoutineTaskID;
                if (routineId) return "success.main";
                if (flagKhac) return "secondary.main";
                return "action.disabled";
              })(),
              transition: "background-color 0.25s",
              position: "relative",
            }}
          >
            <AssignmentIcon fontSize="small" />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: selectedValue ? "text.primary" : "text.secondary",
              }}
            >
              {statusText.primary}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                mt: 0.25,
              }}
            >
              {statusText.secondary}
            </Typography>
          </Box>

          {(selectedValue || normalized.routineId || normalized.flagKhac) && (
            <Chip
              size="small"
              label={normalized.flagKhac ? "Khác" : "KPI"}
              color={normalized.flagKhac ? "secondary" : "success"}
              variant="filled"
              sx={{
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {isMain && (
              <>
                <Tooltip title="Thay đổi nhiệm vụ">
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    disabled={loadingRoutineTasks}
                    sx={{
                      color: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {(selectedValue ||
                  normalized.routineId ||
                  normalized.flagKhac) && (
                  <Tooltip title="Bỏ liên kết">
                    <IconButton
                      size="small"
                      onClick={() => setConfirmClear(true)}
                      sx={{
                        color: "error.main",
                        "&:hover": {
                          bgcolor: "error.main",
                          color: "error.contrastText",
                        },
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                <Tooltip title="Giải thích KPI">
                  <IconButton
                    size="small"
                    onClick={() => setShowInfo(true)}
                    sx={{ color: "info.main" }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Làm mới danh sách">
                  <IconButton
                    size="small"
                    onClick={() =>
                      dispatch(fetchMyRoutineTasks({ force: true }))
                    }
                    disabled={loadingRoutineTasks}
                    sx={{ color: "text.secondary" }}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {!isMain && (
              <Chip
                size="small"
                label="Chỉ đọc"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 24 }}
              />
            )}
          </Box>
        </Stack>

        {!normalized.flagKhac && !isLinked && !loadingRoutineTasks && (
          <Alert
            severity="warning"
            icon={<InfoIcon fontSize="small" />}
            sx={{
              mt: 2,
              py: 0.5,
              "& .MuiAlert-message": { fontSize: "0.78rem" },
            }}
          >
            Chưa gán nhiệm vụ thường quy. Việc liên kết nhiệm vụ thường quy là
            bắt buộc để đánh giá KPI chính xác.
          </Alert>
        )}

        {myRoutineTasksError && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: "error.light", borderRadius: 1 }}>
            <Typography variant="caption" color="error.dark">
              {myRoutineTasksError}
            </Typography>
          </Box>
        )}

        {loadingRoutineTasks && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Đang tải danh sách nhiệm vụ...
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Selection Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 320,
            mt: 0.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleSelectOption(null)}>
          <ListItemIcon>
            <ClearIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Bỏ chọn"
            secondary="Không gán nhiệm vụ thường quy"
          />
        </MenuItem>

        <Divider />

        {resolvedOptions.map((option) => {
          const isSelected = selectedValue?._id === option._id;
          const isKhac = option._id === "__KHAC__";

          return (
            <MenuItem
              key={option._id}
              onClick={() => handleSelectOption(option)}
              selected={isSelected}
            >
              <ListItemIcon>
                {isSelected ? (
                  <CheckIcon
                    fontSize="small"
                    color={isKhac ? "secondary" : "success"}
                  />
                ) : (
                  <UncheckedIcon fontSize="small" color="action" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={option.Ten}
                secondary={option.MoTa}
                sx={{
                  "& .MuiListItemText-secondary": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>

      {/* Dialog giải thích KPI */}
      <Dialog
        open={showInfo}
        onClose={() => setShowInfo(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Vì sao phải gán Nhiệm Vụ Thường Quy?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" gutterBottom>
            1. Hệ thống dùng nhiệm vụ thường quy của bạn để giúp quản lý đánh
            giá KPI và đối chiếu khối lượng công việc chuẩn.
          </Typography>
          <Typography variant="body2" gutterBottom>
            2. Khi không gán, công việc này có thể bị coi là ngoại lệ và KHÔNG
            được tính đầy đủ vào thống kê KPI.
          </Typography>
          <Typography variant="body2" gutterBottom>
            3. Chọn "Khác" chỉ dùng khi công việc không nằm trong bất kỳ danh
            mục thường quy nào.
          </Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            Hãy ưu tiên gán nhiệm vụ thường quy chính xác trước khi lưu/đóng.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInfo(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận bỏ liên kết */}
      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận bỏ liên kết</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Bạn có chắc muốn bỏ gán nhiệm vụ thường quy cho công việc này? Hành
            động này có thể ảnh hưởng tới tính toán KPI.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Huỷ</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setConfirmClear(false);
              handleSelectOption(null);
            }}
          >
            Bỏ liên kết
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default RoutineTaskSelector;
