/**
 * DieuPhoiDialog - Dialog điều phối yêu cầu đến nhân viên xử lý
 *
 * Cho phép người điều phối gán yêu cầu cho nhân viên cụ thể trong khoa
 */
import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
  Avatar,
} from "@mui/material";
import {
  AssignmentInd as AssignIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, FAutocomplete, FTextField } from "components/form";

// Validation
const dieuPhoiSchema = Yup.object().shape({
  NhanVienXuLyID: Yup.object()
    .nullable()
    .required("Vui lòng chọn nhân viên xử lý"),
  GhiChuDieuPhoi: Yup.string().max(500, "Ghi chú không quá 500 ký tự"),
});

/**
 * DieuPhoiDialog Component
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Callback khi đóng dialog
 * @param {function} onSubmit - Callback khi submit với { NhanVienXuLyID, GhiChuDieuPhoi }
 * @param {Array} nhanVienList - Danh sách nhân viên có thể gán
 * @param {boolean} loading - Loading state
 * @param {object} yeuCau - Thông tin yêu cầu đang điều phối
 */
function DieuPhoiDialog({
  open,
  onClose,
  onSubmit,
  nhanVienList = [],
  loading = false,
  yeuCau = null,
}) {
  const methods = useForm({
    resolver: yupResolver(dieuPhoiSchema),
    defaultValues: {
      NhanVienXuLyID: null,
      GhiChuDieuPhoi: "",
    },
  });

  const { handleSubmit, reset, watch } = methods;
  const selectedNhanVien = watch("NhanVienXuLyID");

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      reset({
        NhanVienXuLyID: null,
        GhiChuDieuPhoi: "",
      });
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      NhanVienXuLyID: data.NhanVienXuLyID._id,
      GhiChuDieuPhoi: data.GhiChuDieuPhoi?.trim() || undefined,
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
            <AssignIcon color="primary" />
            <span>Điều phối yêu cầu</span>
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

            {/* Chọn nhân viên */}
            <FAutocomplete
              name="NhanVienXuLyID"
              label="Chọn nhân viên xử lý *"
              options={nhanVienList}
              getOptionLabel={(option) =>
                option?.HoTen
                  ? `${option.HoTen}${
                      option.ChucDanh ? ` - ${option.ChucDanh}` : ""
                    }`
                  : ""
              }
              isOptionEqualToValue={(option, value) =>
                option?._id === value?._id
              }
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                    >
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{option.HoTen}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.ChucDanh || "Nhân viên"}
                      </Typography>
                    </Box>
                  </Stack>
                </li>
              )}
            />

            {/* Preview nhân viên được chọn */}
            {selectedNhanVien && (
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "primary.main",
                  borderRadius: 1,
                  bgcolor: "primary.lighter",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {selectedNhanVien.HoTen}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedNhanVien.ChucDanh || "Nhân viên"} -{" "}
                      {selectedNhanVien.Email || "Chưa có email"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* Ghi chú */}
            <FTextField
              name="GhiChuDieuPhoi"
              label="Ghi chú điều phối (không bắt buộc)"
              placeholder="VD: Ưu tiên xử lý gấp, liên hệ trước khi đến..."
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !selectedNhanVien}
          >
            {loading ? "Đang xử lý..." : "Xác nhận điều phối"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default DieuPhoiDialog;
