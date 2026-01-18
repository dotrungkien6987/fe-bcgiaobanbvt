/**
 * StarRatingDialog - Dialog đánh giá sao khi đóng yêu cầu
 *
 * Hiển thị form cho người dùng đánh giá từ 1-5 sao và ghi chú
 * - NhanXet (GhiChuDanhGia) BẮT BUỘC khi đánh giá dưới 3 sao
 */
import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  Rating,
  TextField,
  Stack,
  Alert,
} from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";
import BottomSheetDialog from "components/BottomSheetDialog";

const RATING_LABELS = {
  1: "Rất không hài lòng",
  2: "Không hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Rất hài lòng",
};

/**
 * StarRatingDialog Component
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Callback khi đóng dialog
 * @param {function} onSubmit - Callback khi submit với { DiemDanhGia, GhiChuDanhGia }
 * @param {boolean} loading - Loading state
 * @param {string} title - Tiêu đề dialog
 */
function StarRatingDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  title = "Đánh giá yêu cầu",
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(-1);
  const [ghiChu, setGhiChu] = useState("");
  const [error, setError] = useState("");

  // Kiểm tra xem có cần nhập ghi chú không (rating < 3)
  const isLowRating = rating < 3;
  const isGhiChuRequired = isLowRating;
  const canSubmit = rating && (!isGhiChuRequired || ghiChu.trim().length >= 10);

  const handleSubmit = () => {
    // Validate
    if (isGhiChuRequired && ghiChu.trim().length < 10) {
      setError("Vui lòng nhập lý do đánh giá thấp (ít nhất 10 ký tự)");
      return;
    }

    setError("");
    onSubmit({
      DanhGia: {
        SoSao: rating,
        NhanXet: ghiChu.trim() || undefined,
      },
    });
  };

  const handleClose = () => {
    // Reset state khi đóng
    setRating(5);
    setGhiChu("");
    setError("");
    onClose();
  };

  const handleRatingChange = (event, newValue) => {
    setRating(newValue || 5);
    // Clear error khi thay đổi rating
    if (newValue >= 3) {
      setError("");
    }
  };

  const handleGhiChuChange = (e) => {
    setGhiChu(e.target.value);
    // Clear error khi nhập ghi chú
    if (e.target.value.trim().length >= 10) {
      setError("");
    }
  };

  const getLabelText = (value) => {
    return RATING_LABELS[value] || "";
  };

  return (
    <BottomSheetDialog
      open={open}
      onClose={handleClose}
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <StarIcon color="warning" />
          <span>{title}</span>
        </Stack>
      }
      actions={
        <>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            color="warning"
          >
            {loading ? "Đang xử lý..." : "Xác nhận đánh giá"}
          </Button>
        </>
      }
    >
      <Stack spacing={3} sx={{ pt: 2 }}>
        {/* Rating stars */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body1" gutterBottom>
            Bạn đánh giá mức độ hài lòng với việc xử lý yêu cầu này?
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Rating
              name="star-rating"
              value={rating}
              size="large"
              onChange={handleRatingChange}
              onChangeActive={(event, newHover) => {
                setHover(newHover);
              }}
              getLabelText={getLabelText}
              sx={{
                fontSize: "3rem",
                "& .MuiRating-iconFilled": {
                  color: "warning.main",
                },
              }}
            />
          </Box>
          {rating !== null && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {RATING_LABELS[hover !== -1 ? hover : rating]}
            </Typography>
          )}
        </Box>

        {/* Comment - required if low rating */}
        <TextField
          label={
            isLowRating ? "Lý do đánh giá thấp *" : "Ghi chú (không bắt buộc)"
          }
          placeholder={
            isLowRating
              ? "Vui lòng cho biết lý do bạn không hài lòng (ít nhất 10 ký tự)..."
              : "Nhập nhận xét của bạn về việc xử lý yêu cầu..."
          }
          multiline
          rows={3}
          value={ghiChu}
          onChange={handleGhiChuChange}
          fullWidth
          error={!!error}
          helperText={error}
          color={isLowRating ? "warning" : "primary"}
        />

        {isLowRating && (
          <Alert severity="warning" sx={{ mt: -1 }}>
            Khi đánh giá dưới 3 sao, vui lòng nhập lý do để chúng tôi cải thiện
            chất lượng dịch vụ.
          </Alert>
        )}
      </Stack>
    </BottomSheetDialog>
  );
}

export default StarRatingDialog;
