/**
 * AppealDialog - Dialog khiếu nại khi yêu cầu bị từ chối
 *
 * Cho phép người gửi khiếu nại quyết định từ chối
 * - Hiển thị lý do từ chối cũ
 * - Bắt buộc nhập LyDoAppeal
 */
import React, { useEffect } from "react";
import { Button, Typography, Stack, Alert, Box } from "@mui/material";
import {
  Report as ReportIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, FTextField } from "components/form";
import BottomSheetDialog from "components/BottomSheetDialog";

// Validation schema
const appealSchema = Yup.object().shape({
  LyDoAppeal: Yup.string()
    .required("Vui lòng nhập lý do khiếu nại")
    .min(10, "Lý do khiếu nại phải có ít nhất 10 ký tự")
    .max(1000, "Lý do khiếu nại không quá 1000 ký tự"),
});

/**
 * AppealDialog Component
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Callback khi đóng dialog
 * @param {function} onSubmit - Callback khi submit với { LyDoAppeal }
 * @param {boolean} loading - Loading state
 * @param {object} yeuCau - Thông tin yêu cầu (có LyDoTuChoi, GhiChuTuChoi)
 */
function AppealDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  yeuCau = null,
}) {
  const methods = useForm({
    resolver: yupResolver(appealSchema),
    defaultValues: {
      LyDoAppeal: "",
    },
  });

  const { handleSubmit, reset } = methods;

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      reset({
        LyDoAppeal: "",
      });
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      LyDoAppeal: data.LyDoAppeal.trim(),
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Lấy thông tin lý do từ chối
  const lyDoTuChoi = yeuCau?.LyDoTuChoiID?.TenLyDo || "Không xác định";
  const ghiChuTuChoi = yeuCau?.GhiChuTuChoi;

  return (
    <BottomSheetDialog
      open={open}
      onClose={handleClose}
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <ReportIcon color="warning" />
          <span>Khiếu nại từ chối</span>
        </Stack>
      }
      actions={
        <>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Gửi khiếu nại"}
          </Button>
        </>
      }
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(handleFormSubmit)}>
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

          {/* Lý do từ chối cũ */}
          <Box
            sx={{
              p: 2,
              bgcolor: "error.lighter",
              borderRadius: 1,
              border: 1,
              borderColor: "error.light",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <CancelIcon color="error" fontSize="small" sx={{ mt: 0.25 }} />
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="error.dark">
                  Lý do từ chối:
                </Typography>
                <Typography variant="body2">{lyDoTuChoi}</Typography>
                {ghiChuTuChoi && (
                  <>
                    <Typography
                      variant="subtitle2"
                      color="error.dark"
                      sx={{ mt: 1 }}
                    >
                      Ghi chú:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ghiChuTuChoi}
                    </Typography>
                  </>
                )}
              </Stack>
            </Stack>
          </Box>

          {/* Form nhập lý do khiếu nại */}
          <FTextField
            name="LyDoAppeal"
            label="Lý do khiếu nại *"
            placeholder="Vui lòng giải thích tại sao bạn cho rằng yêu cầu không nên bị từ chối..."
            multiline
            rows={4}
          />

          {/* Thông tin */}
          <Alert severity="info">
            Sau khi gửi khiếu nại, yêu cầu sẽ quay về trạng thái{" "}
            <strong>Mới</strong> để được xem xét lại. Người điều phối sẽ nhận
            được thông báo về khiếu nại của bạn.
          </Alert>
        </Stack>
      </FormProvider>
    </BottomSheetDialog>
  );
}

export default AppealDialog;
