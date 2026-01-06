/**
 * TuChoiDialog - Dialog từ chối yêu cầu
 *
 * Cho phép người dùng từ chối yêu cầu với lý do cụ thể
 * - Bắt buộc chọn LyDoTuChoiID từ danh mục
 * - Nếu chọn "Lý do khác" thì GhiChuTuChoi bắt buộc
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
} from "@mui/material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, FAutocomplete, FTextField } from "components/form";
import BottomSheetDialog from "./BottomSheetDialog";

// Danh sách lý do từ chối mặc định (sẽ fetch từ API sau)
const DEFAULT_LY_DO_TU_CHOI = [
  {
    _id: "1",
    TenLyDo: "Không thuộc phạm vi xử lý",
    MaLyDo: "KHONG_THUOC_PHAM_VI",
  },
  { _id: "2", TenLyDo: "Thiếu thông tin cần thiết", MaLyDo: "THIEU_THONG_TIN" },
  { _id: "3", TenLyDo: "Yêu cầu trùng lặp", MaLyDo: "TRUNG_LAP" },
  { _id: "4", TenLyDo: "Không đủ nguồn lực", MaLyDo: "KHONG_DU_NGUON_LUC" },
  { _id: "5", TenLyDo: "Lý do khác", MaLyDo: "LY_DO_KHAC" },
];

// Helper function for validation
const isLyDoKhacForValidation = (lyDo) => {
  if (!lyDo) return false;
  return (
    lyDo.TenLyDo?.toLowerCase().includes("lý do khác") ||
    lyDo.MaLyDo === "LY_DO_KHAC"
  );
};

// Validation schema
const tuChoiSchema = Yup.object().shape({
  LyDoTuChoiID: Yup.object().nullable().required("Vui lòng chọn lý do từ chối"),
  GhiChuTuChoi: Yup.string().when("LyDoTuChoiID", {
    is: isLyDoKhacForValidation,
    then: (schema) => schema.required("Vui lòng nhập chi tiết lý do"),
    otherwise: (schema) => schema.max(1000, "Ghi chú không quá 1000 ký tự"),
  }),
});

/**
 * TuChoiDialog Component
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Callback khi đóng dialog
 * @param {function} onSubmit - Callback khi submit với { LyDoTuChoiID, GhiChuTuChoi }
 * @param {Array} lyDoList - Danh sách lý do từ chối (từ API)
 * @param {boolean} loading - Loading state
 * @param {object} yeuCau - Thông tin yêu cầu đang từ chối
 */
function TuChoiDialog({
  open,
  onClose,
  onSubmit,
  lyDoList = DEFAULT_LY_DO_TU_CHOI,
  loading = false,
  yeuCau = null,
}) {
  const methods = useForm({
    resolver: yupResolver(tuChoiSchema),
    defaultValues: {
      LyDoTuChoiID: null,
      GhiChuTuChoi: "",
    },
  });

  const { handleSubmit, reset, watch } = methods;
  const selectedLyDo = watch("LyDoTuChoiID");

  // Robust detection for "Lý do khác" - works with both API data and hardcoded data
  const isLyDoKhac = useMemo(() => {
    if (!selectedLyDo) return false;

    // Check by TenLyDo (primary, works with API data)
    const byName = selectedLyDo.TenLyDo?.toLowerCase().includes("lý do khác");

    // Fallback to MaLyDo (for hardcoded data compatibility)
    const byCode = selectedLyDo.MaLyDo === "LY_DO_KHAC";

    return byName || byCode;
  }, [selectedLyDo]);

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      reset({
        LyDoTuChoiID: null,
        GhiChuTuChoi: "",
      });
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      LyDoTuChoiID: data.LyDoTuChoiID._id,
      GhiChuTuChoi: data.GhiChuTuChoi?.trim() || undefined,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
        id="tu-choi-form"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "error.lighter",
            color: "error.darker",
          }}
        >
          <CancelIcon />
          <Typography variant="h6">Từ chối yêu cầu</Typography>
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

            {/* Chọn lý do từ chối */}
            <FAutocomplete
              name="LyDoTuChoiID"
              label="Lý do từ chối *"
              options={lyDoList}
              getOptionLabel={(option) => option?.TenLyDo || ""}
              isOptionEqualToValue={(option, value) =>
                option?._id === value?._id
              }
            />

            {/* Ghi chú - bắt buộc nếu chọn "Lý do khác" */}
            <FTextField
              name="GhiChuTuChoi"
              label={
                isLyDoKhac ? "Chi tiết lý do *" : "Ghi chú (không bắt buộc)"
              }
              placeholder={
                isLyDoKhac
                  ? "Vui lòng mô tả chi tiết lý do từ chối..."
                  : "Nhập ghi chú bổ sung nếu cần..."
              }
              multiline
              rows={3}
            />

            {isLyDoKhac && (
              <Alert severity="warning" sx={{ mt: -1 }}>
                Khi chọn "Lý do khác", bạn cần nhập chi tiết lý do từ chối.
              </Alert>
            )}
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
            color="error"
            disabled={loading}
            size="large"
            fullWidth
          >
            {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
          </Button>
        </DialogActions>
      </FormProvider>
    </BottomSheetDialog>
  );
}

export default TuChoiDialog;
