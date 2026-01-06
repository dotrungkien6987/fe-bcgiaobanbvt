/**
 * YeuCau Validation Rules & Schema
 *
 * Single source of truth cho validation rules
 * Đồng bộ với backend: giaobanbv-be/models/YeuCau.js
 */
import * as Yup from "yup";

// Validation constants - Match backend schema
export const YEUCAU_VALIDATION_RULES = {
  TIEU_DE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255, // Match backend model
  },
  MO_TA: {
    MAX_LENGTH: 5000, // Match backend model
  },
  GHI_CHU: {
    MAX_LENGTH: 1000,
  },
  LY_DO: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
};

/**
 * Main form validation schema
 */
export const yeuCauValidationSchema = Yup.object().shape({
  TieuDe: Yup.string()
    .required("Tiêu đề không được để trống")
    .min(
      YEUCAU_VALIDATION_RULES.TIEU_DE.MIN_LENGTH,
      `Tiêu đề phải có ít nhất ${YEUCAU_VALIDATION_RULES.TIEU_DE.MIN_LENGTH} ký tự`
    )
    .max(
      YEUCAU_VALIDATION_RULES.TIEU_DE.MAX_LENGTH,
      `Tiêu đề không được vượt quá ${YEUCAU_VALIDATION_RULES.TIEU_DE.MAX_LENGTH} ký tự`
    )
    .trim(),

  MoTa: Yup.string()
    .max(
      YEUCAU_VALIDATION_RULES.MO_TA.MAX_LENGTH,
      `Mô tả không được vượt quá ${YEUCAU_VALIDATION_RULES.MO_TA.MAX_LENGTH} ký tự`
    )
    .trim(),

  KhoaDichID: Yup.string().required("Vui lòng chọn khoa xử lý"),

  DanhMucYeuCauID: Yup.string().required("Vui lòng chọn loại yêu cầu"),

  MucDoUuTien: Yup.string().oneOf(
    ["THAP", "TRUNG_BINH", "CAO", "KHAN_CAP"],
    "Mức độ ưu tiên không hợp lệ"
  ),
});

/**
 * Validation cho dialog Từ chối
 */
export const tuChoiValidationSchema = Yup.object().shape({
  LyDoTuChoiID: Yup.string().required("Vui lòng chọn lý do từ chối"),
  GhiChuTuChoi: Yup.string()
    .min(
      YEUCAU_VALIDATION_RULES.LY_DO.MIN_LENGTH,
      `Ghi chú phải có ít nhất ${YEUCAU_VALIDATION_RULES.LY_DO.MIN_LENGTH} ký tự`
    )
    .max(
      YEUCAU_VALIDATION_RULES.LY_DO.MAX_LENGTH,
      `Ghi chú không được vượt quá ${YEUCAU_VALIDATION_RULES.LY_DO.MAX_LENGTH} ký tự`
    ),
});

/**
 * Validation cho dialog Mở lại
 */
export const moLaiValidationSchema = Yup.object().shape({
  LyDoMoLai: Yup.string()
    .required("Vui lòng nhập lý do mở lại")
    .min(
      YEUCAU_VALIDATION_RULES.LY_DO.MIN_LENGTH,
      `Lý do phải có ít nhất ${YEUCAU_VALIDATION_RULES.LY_DO.MIN_LENGTH} ký tự`
    )
    .max(
      YEUCAU_VALIDATION_RULES.LY_DO.MAX_LENGTH,
      `Lý do không được vượt quá ${YEUCAU_VALIDATION_RULES.LY_DO.MAX_LENGTH} ký tự`
    ),
});

/**
 * Validation cho dialog Khiếu nại (Appeal)
 */
export const appealValidationSchema = Yup.object().shape({
  LyDoAppeal: Yup.string()
    .required("Vui lòng nhập lý do khiếu nại")
    .min(
      YEUCAU_VALIDATION_RULES.LY_DO.MIN_LENGTH,
      `Lý do phải có ít nhất ${YEUCAU_VALIDATION_RULES.LY_DO.MIN_LENGTH} ký tự`
    )
    .max(
      YEUCAU_VALIDATION_RULES.LY_DO.MAX_LENGTH,
      `Lý do không được vượt quá ${YEUCAU_VALIDATION_RULES.LY_DO.MAX_LENGTH} ký tự`
    ),
});

/**
 * Validation cho dialog Đánh giá
 */
export const danhGiaValidationSchema = Yup.object().shape({
  SoSao: Yup.number()
    .required("Vui lòng chọn số sao")
    .min(1, "Số sao tối thiểu là 1")
    .max(5, "Số sao tối đa là 5"),
  NhanXet: Yup.string().max(
    YEUCAU_VALIDATION_RULES.GHI_CHU.MAX_LENGTH,
    `Nhận xét không được vượt quá ${YEUCAU_VALIDATION_RULES.GHI_CHU.MAX_LENGTH} ký tự`
  ),
});
