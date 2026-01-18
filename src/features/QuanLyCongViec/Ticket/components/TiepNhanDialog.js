/**
 * TiepNhanDialog - Dialog tiếp nhận yêu cầu
 *
 * Cho phép người dùng xác nhận tiếp nhận và đặt thời gian hẹn hoàn thành
 * - ThoiGianHen mặc định = now + ThoiGianDuKien (từ danh mục)
 * - Có thể điều chỉnh thời gian hẹn
 */
import React, { useEffect, useMemo } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Alert,
  TextField,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import dayjs from "dayjs";
import { FormProvider } from "components/form";
import BottomSheetDialog from "components/BottomSheetDialog";

// Validation schema
const tiepNhanSchema = Yup.object().shape({
  ThoiGianHen: Yup.string()
    .required("Vui lòng chọn thời gian hẹn")
    .test("is-future", "Thời gian hẹn phải sau thời điểm hiện tại", (value) => {
      if (!value) return false;
      return dayjs(value).isAfter(dayjs());
    }),
});

/**
 * TiepNhanDialog Component
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Callback khi đóng dialog
 * @param {function} onSubmit - Callback khi submit với { ThoiGianHen }
 * @param {boolean} loading - Loading state
 * @param {object} yeuCau - Thông tin yêu cầu (có SnapshotDanhMuc.ThoiGianDuKien)
 */
function TiepNhanDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  yeuCau = null,
}) {
  // Tính thời gian hẹn mặc định
  const defaultThoiGianHen = useMemo(() => {
    const thoiGianDuKien = yeuCau?.SnapshotDanhMuc?.ThoiGianDuKien || 60;
    const donVi = yeuCau?.SnapshotDanhMuc?.DonViThoiGian || "PHUT";

    // Convert đơn vị
    const unit = donVi === "GIO" ? "hour" : donVi === "NGAY" ? "day" : "minute";

    return dayjs().add(thoiGianDuKien, unit).format("YYYY-MM-DDTHH:mm");
  }, [yeuCau]);

  const methods = useForm({
    resolver: yupResolver(tiepNhanSchema),
    defaultValues: {
      ThoiGianHen: defaultThoiGianHen,
    },
  });

  const { handleSubmit, reset, control } = methods;

  // Reset form với default mới khi mở dialog
  useEffect(() => {
    if (open) {
      reset({
        ThoiGianHen: defaultThoiGianHen,
      });
    }
  }, [open, reset, defaultThoiGianHen]);

  const handleFormSubmit = (data) => {
    onSubmit({
      ThoiGianHen: data.ThoiGianHen,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Format hiển thị thời gian dự kiến
  const thoiGianDuKienText = useMemo(() => {
    const thoiGian = yeuCau?.SnapshotDanhMuc?.ThoiGianDuKien;
    const donVi = yeuCau?.SnapshotDanhMuc?.DonViThoiGian;

    if (!thoiGian) return "Không xác định";

    const donViLabel =
      donVi === "GIO" ? "giờ" : donVi === "NGAY" ? "ngày" : "phút";
    return `${thoiGian} ${donViLabel}`;
  }, [yeuCau]);

  return (
    <BottomSheetDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(handleFormSubmit)}
        id="tiep-nhan-form"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "success.lighter",
            color: "success.darker",
          }}
        >
          <CheckIcon />
          <Typography variant="h6">Tiếp nhận yêu cầu</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            {/* Thông tin yêu cầu */}
            {yeuCau && (
              <Alert severity="info" icon={false}>
                <Typography variant="subtitle2" gutterBottom>
                  Yêu cầu: {yeuCau.MaYeuCau}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Loại:{" "}
                  {yeuCau.SnapshotDanhMuc?.TenLoaiYeuCau || "Không xác định"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thời gian dự kiến: {thoiGianDuKienText}
                </Typography>
              </Alert>
            )}

            {/* Chọn thời gian hẹn */}
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TimeIcon color="action" fontSize="small" />
                <Typography variant="subtitle2">
                  Thời gian hẹn hoàn thành *
                </Typography>
              </Stack>

              <Controller
                name="ThoiGianHen"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    type="datetime-local"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: dayjs().format("YYYY-MM-DDTHH:mm"),
                    }}
                  />
                )}
              />

              <Typography variant="caption" color="text.secondary">
                💡 Mặc định: Thời điểm hiện tại + {thoiGianDuKienText}
              </Typography>
            </Stack>

            {/* Cảnh báo */}
            <Alert severity="warning">
              Sau khi tiếp nhận, bạn sẽ là người xử lý yêu cầu này và chịu trách
              nhiệm hoàn thành đúng thời gian hẹn.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{ p: 2, gap: 1, flexDirection: { xs: "column", sm: "row" } }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            size="large"
            fullWidth
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={loading}
            size="large"
            fullWidth
          >
            {loading ? "Đang xử lý..." : "Xác nhận tiếp nhận"}
          </Button>
        </DialogActions>
      </FormProvider>
    </BottomSheetDialog>
  );
}

export default TiepNhanDialog;
