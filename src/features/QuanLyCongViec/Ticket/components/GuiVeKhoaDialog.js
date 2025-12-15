import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import { FormProvider, FTextField } from "../../../../components/form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";

const validationSchema = Yup.object().shape({
  GhiChu: Yup.string()
    .required("Vui lòng nhập lý do chuyển về khoa/phòng điều phối lại")
    .min(10, "Lý do phải có ít nhất 10 ký tự")
    .max(500, "Lý do không được vượt quá 500 ký tự"),
});

function GuiVeKhoaDialog({ open, onClose, onSubmit, isLoading = false }) {
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      GhiChu: "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      handleClose();
    } catch (error) {
      // Error handled by parent component
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        Chuyển về khoa/phòng điều phối lại
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={2.5}>
            <Alert severity="warning" sx={{ mb: 1 }}>
              Yêu cầu sẽ được chuyển về khoa/phòng ban đầu để điều phối viên
              phân công lại cho người xử lý khác. Vui lòng nhập lý do cụ thể.
            </Alert>

            <FTextField
              name="GhiChu"
              label="Lý do chuyển về điều phối lại"
              placeholder="Ví dụ: Không thuộc phạm vi công việc của tôi, cần chuyển cho phòng chức năng khác..."
              multiline
              rows={4}
              required
              helperText="Nhập lý do để giúp điều phối viên phân công phù hợp hơn (10-500 ký tự)"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={isLoading || isSubmitting}
          >
            Hủy
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            color="warning"
            loading={isLoading || isSubmitting}
          >
            Xác nhận chuyển về
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default GuiVeKhoaDialog;
