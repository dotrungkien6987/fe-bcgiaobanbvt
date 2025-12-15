/**
 * MoLaiDialog - Dialog mở lại yêu cầu đã đóng
 *
 * Cho phép mở lại yêu cầu trong vòng 7 ngày kể từ ngày đóng
 * - Bắt buộc nhập LyDoMoLai
 * - Hiển thị số ngày còn lại để mở lại
 */
import React, { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Alert,
  Chip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import dayjs from "dayjs";
import { FormProvider, FTextField } from "components/form";

// Validation schema
const moLaiSchema = Yup.object().shape({
  LyDoMoLai: Yup.string()
    .required("Vui lòng nhập lý do mở lại")
    .min(10, "Lý do phải có ít nhất 10 ký tự")
    .max(500, "Lý do không quá 500 ký tự"),
});

// Số ngày tối đa được phép mở lại
const MAX_REOPEN_DAYS = 7;

/**
 * MoLaiDialog Component
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Callback khi đóng dialog
 * @param {function} onSubmit - Callback khi submit với { LyDoMoLai }
 * @param {boolean} loading - Loading state
 * @param {object} yeuCau - Thông tin yêu cầu (cần NgayDong để tính số ngày)
 */
function MoLaiDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  yeuCau = null,
}) {
  const methods = useForm({
    resolver: yupResolver(moLaiSchema),
    defaultValues: {
      LyDoMoLai: "",
    },
  });

  const { handleSubmit, reset } = methods;

  // Tính số ngày còn lại để mở lại
  const { ngayConLai, coTheMoLai, ngayDongFormatted } = useMemo(() => {
    if (!yeuCau?.NgayDong) {
      return { ngayConLai: 0, coTheMoLai: false, ngayDongFormatted: "" };
    }

    const ngayDong = dayjs(yeuCau.NgayDong);
    const ngayHetHan = ngayDong.add(MAX_REOPEN_DAYS, "day");
    const homNay = dayjs();

    const ngayConLai = ngayHetHan.diff(homNay, "day");
    const coTheMoLai = ngayConLai > 0;
    const ngayDongFormatted = ngayDong.format("DD/MM/YYYY HH:mm");

    return { ngayConLai, coTheMoLai, ngayDongFormatted };
  }, [yeuCau]);

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      reset({
        LyDoMoLai: "",
      });
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      LyDoMoLai: data.LyDoMoLai.trim(),
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <FormProvider methods={methods} onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <RefreshIcon color="primary" />
            <span>Mở lại yêu cầu</span>
          </Stack>
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
                  {yeuCau.TieuDe}
                </Typography>
              </Alert>
            )}

            {/* Thông tin thời hạn */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <ScheduleIcon color="action" />
              <Stack>
                <Typography variant="body2" color="text.secondary">
                  Đóng ngày: {ngayDongFormatted}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2">Thời hạn mở lại:</Typography>
                  <Chip
                    size="small"
                    label={coTheMoLai ? `Còn ${ngayConLai} ngày` : "Đã hết hạn"}
                    color={
                      coTheMoLai
                        ? ngayConLai <= 2
                          ? "warning"
                          : "success"
                        : "error"
                    }
                  />
                </Stack>
              </Stack>
            </Stack>

            {/* Form nhập lý do */}
            {coTheMoLai ? (
              <>
                <FTextField
                  name="LyDoMoLai"
                  label="Lý do mở lại *"
                  placeholder="Vui lòng mô tả lý do cần mở lại yêu cầu này..."
                  multiline
                  rows={4}
                />

                <Alert severity="info">
                  Sau khi mở lại, yêu cầu sẽ quay về trạng thái{" "}
                  <strong>Đã hoàn thành</strong> để người xử lý tiếp tục xem
                  xét.
                </Alert>
              </>
            ) : (
              <Alert severity="error">
                Yêu cầu này đã đóng quá {MAX_REOPEN_DAYS} ngày, không thể mở
                lại. Vui lòng tạo yêu cầu mới nếu cần hỗ trợ thêm.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {coTheMoLai ? "Hủy" : "Đóng"}
          </Button>
          {coTheMoLai && (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận mở lại"}
            </Button>
          )}
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default MoLaiDialog;
