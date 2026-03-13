import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add } from "iconsax-react";
import { toast } from "react-toastify";
import { createQuyTrinhISO, copyFilesFromVersion } from "../quyTrinhISOSlice";

/**
 * Dialog để tạo phiên bản mới từ quy trình hiện tại
 *
 * @param {Object} currentItem - Quy trình hiện tại (source)
 * @param {boolean} open - Trạng thái mở dialog
 * @param {Function} onClose - Callback đóng dialog
 */
function CreateVersionDialog({ currentItem, open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [newVersion, setNewVersion] = useState("");
  const [ngayHieuLuc, setNgayHieuLuc] = useState(dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset state when dialog opens
  const handleEnter = () => {
    // Suggest next version number
    const currentVer = currentItem?.PhienBan || "1.0";
    const parts = currentVer.split(".");
    if (parts.length >= 2) {
      const major = parseInt(parts[0], 10);
      const minor = parseInt(parts[1], 10);
      setNewVersion(`${major}.${minor + 1}`);
    } else {
      setNewVersion(`${currentVer}.1`);
    }
    setNgayHieuLuc(dayjs().format("YYYY-MM-DD"));
    setError("");
  };

  const handleSubmit = async () => {
    if (!newVersion.trim()) {
      setError("Vui lòng nhập phiên bản mới");
      return;
    }

    // Validate version format
    if (!/^[A-Za-z0-9._-]+$/.test(newVersion.trim())) {
      setError(
        "Phiên bản không hợp lệ. Chỉ dùng chữ, số, dấu chấm, gạch ngang (ví dụ: 2.0, 1.5, v2)",
      );
      return;
    }

    // Check if same as current
    if (newVersion.trim() === currentItem?.PhienBan) {
      setError("Phiên bản mới phải khác phiên bản hiện tại");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Create new quy trình với cùng thông tin, phiên bản mới
      const newData = {
        TenQuyTrinh: currentItem.TenQuyTrinh,
        MaQuyTrinh: currentItem.MaQuyTrinh,
        PhienBan: newVersion.trim(),
        KhoaXayDungID:
          currentItem.KhoaXayDungID?._id || currentItem.KhoaXayDungID,
        NgayHieuLuc: dayjs(ngayHieuLuc).toISOString(),
        GhiChu: `Tạo từ phiên bản ${currentItem.PhienBan}`,
        KhoaPhanPhoi:
          currentItem.KhoaPhanPhoi?.map((kp) => kp?._id || kp) || [],
      };

      const created = await dispatch(createQuyTrinhISO(newData));

      if (!created?._id) {
        throw new Error("Không thể tạo phiên bản mới");
      }

      // Copy biểu mẫu Word (bỏ qua PDF - phiên bản mới cần upload PDF riêng)
      try {
        await dispatch(
          copyFilesFromVersion(created._id, currentItem._id, "fileword"),
        );
      } catch (copyError) {
        console.error("Copy Word files error:", copyError);
        toast.warning(
          "Tạo phiên bản thành công nhưng không copy được biểu mẫu Word",
        );
      }

      toast.success(`Đã tạo phiên bản ${newVersion} thành công`);
      onClose();

      // Navigate to edit page of new version (fromCreate triggers banner + redirect-after-save)
      navigate(`/quytrinh-iso/${created._id}/edit`, {
        state: { fromCreate: true },
      });
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tạo phiên bản mới");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Add size={24} />
          <span>Tạo Phiên Bản Mới</span>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Mã quy trình
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {currentItem?.MaQuyTrinh}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Phiên bản hiện tại
            </Typography>
            <Typography variant="body1">v{currentItem?.PhienBan}</Typography>
          </Stack>

          <TextField
            label="Phiên bản mới *"
            value={newVersion}
            onChange={(e) => setNewVersion(e.target.value)}
            placeholder="Ví dụ: 2.0"
            fullWidth
            disabled={loading}
            helperText="Định dạng: X.Y (ví dụ: 2.0, 1.5) hoặc tùy chỉnh (v2, 2.0.1)"
            autoFocus
          />

          <TextField
            label="Ngày hiệu lực *"
            type="date"
            value={ngayHieuLuc}
            onChange={(e) => setNgayHieuLuc(e.target.value)}
            fullWidth
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            helperText="Ngày phiên bản này bắt đầu có hiệu lực"
          />

          <Alert severity="info" icon={false}>
            <Typography variant="body2">
              Sau khi tạo, bạn sẽ được chuyển đến trang chỉnh sửa để upload file
              PDF mới.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} /> : <Add size={20} />
          }
        >
          {loading ? "Đang tạo..." : "Tạo phiên bản"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateVersionDialog;
