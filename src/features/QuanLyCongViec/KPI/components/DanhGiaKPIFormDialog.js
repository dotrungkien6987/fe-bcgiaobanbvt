import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { createDanhGiaKPI } from "../kpiSlice";

/**
 * DanhGiaKPIFormDialog - Form tạo đánh giá KPI
 *
 * Flow:
 * 1. Chọn chu kỳ
 * 2. Chọn nhân viên
 * 3. Xác nhận tạo (backend sẽ auto-create DanhGiaNhiemVu)
 *
 * Props:
 * - open: Boolean
 * - handleClose: Function
 * - nhanviens: Array
 * - chuKyDanhGias: Array (only DANG_DIEN_RA)
 * - nhiemVuThuongQuys: Array
 */

const DanhGiaKPIFormDialog = ({
  open,
  handleClose,
  nhanviens = [],
  chuKyDanhGias = [],
  nhiemVuThuongQuys = [],
}) => {
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedChuKy, setSelectedChuKy] = useState("");
  const [selectedNhanVien, setSelectedNhanVien] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = ["Chọn chu kỳ", "Chọn nhân viên", "Xác nhận"];

  const handleNext = () => {
    // Validation
    if (activeStep === 0 && !selectedChuKy) {
      setError("Vui lòng chọn chu kỳ đánh giá");
      return;
    }
    if (activeStep === 1 && !selectedNhanVien) {
      setError("Vui lòng chọn nhân viên");
      return;
    }

    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      await dispatch(
        createDanhGiaKPI({
          ChuKyDanhGiaID: selectedChuKy,
          NhanVienID: selectedNhanVien,
        })
      ).unwrap();

      // Reset and close
      handleDialogClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tạo đánh giá KPI");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setActiveStep(0);
    setSelectedChuKy("");
    setSelectedNhanVien("");
    setError("");
    handleClose();
  };

  const selectedChuKyInfo = chuKyDanhGias.find(
    (ck) => ck._id === selectedChuKy
  );
  const selectedNhanVienInfo = nhanviens.find(
    (nv) => nv._id === selectedNhanVien
  );
  const nhiemVuCount = nhiemVuThuongQuys.length;

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5">Tạo đánh giá KPI mới</Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Stepper */}
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error">{error}</Alert>}

          {/* Step Content */}
          {activeStep === 0 && (
            <Stack spacing={2}>
              <Typography variant="body1">Chọn chu kỳ đánh giá:</Typography>
              {chuKyDanhGias.length === 0 ? (
                <Alert severity="warning">
                  Không có chu kỳ nào đang diễn ra. Vui lòng tạo chu kỳ mới
                  trước.
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {chuKyDanhGias.map((chuKy) => (
                    <Button
                      key={chuKy._id}
                      variant={
                        selectedChuKy === chuKy._id ? "contained" : "outlined"
                      }
                      onClick={() => setSelectedChuKy(chuKy._id)}
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        p: 2,
                      }}
                    >
                      <Stack>
                        <Typography variant="subtitle1">
                          {chuKy.TenChuKy}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(chuKy.NgayBatDau).toLocaleDateString(
                            "vi-VN"
                          )}{" "}
                          -{" "}
                          {new Date(chuKy.NgayKetThuc).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Typography>
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              )}
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack spacing={2}>
              <Typography variant="body1">
                Chọn nhân viên cần đánh giá:
              </Typography>
              <Alert severity="info">
                Tìm kiếm hoặc chọn nhân viên từ danh sách bên dưới
              </Alert>

              {/* Simple list for now - can be enhanced with search/filter */}
              <Stack spacing={1} sx={{ maxHeight: 400, overflow: "auto" }}>
                {nhanviens.map((nv) => (
                  <Button
                    key={nv._id}
                    variant={
                      selectedNhanVien === nv._id ? "contained" : "outlined"
                    }
                    onClick={() => setSelectedNhanVien(nv._id)}
                    sx={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      p: 2,
                    }}
                  >
                    <Stack>
                      <Typography variant="subtitle1">{nv.Ten}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {nv.MaNhanVien} | {nv.KhoaID?.TenKhoa || "N/A"}
                      </Typography>
                    </Stack>
                  </Button>
                ))}
              </Stack>
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={2}>
              <Alert severity="success">
                <Typography variant="subtitle2" gutterBottom>
                  Sẵn sàng tạo đánh giá KPI
                </Typography>
              </Alert>

              <Stack spacing={2}>
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Chu kỳ:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedChuKyInfo?.TenChuKy}
                  </Typography>
                </Stack>

                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Nhân viên:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedNhanVienInfo?.Ten} (
                    {selectedNhanVienInfo?.MaNhanVien})
                  </Typography>
                </Stack>

                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Số nhiệm vụ thường quy:
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {nhiemVuCount} nhiệm vụ
                  </Typography>
                </Stack>
              </Stack>

              <Alert severity="info">
                <Typography variant="body2">
                  Sau khi tạo, hệ thống sẽ tự động tạo đánh giá cho{" "}
                  <strong>{nhiemVuCount}</strong> nhiệm vụ thường quy. Bạn có
                  thể chấm điểm cho từng nhiệm vụ sau.
                </Typography>
              </Alert>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleDialogClose}
          color="inherit"
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={isSubmitting}>
            Quay lại
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained">
            Tiếp theo
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo đánh giá KPI"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DanhGiaKPIFormDialog;
