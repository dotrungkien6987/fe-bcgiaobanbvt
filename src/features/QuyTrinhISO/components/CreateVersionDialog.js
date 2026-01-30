import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
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
  const [copyFiles, setCopyFiles] = useState(true);
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
    setCopyFiles(true);
    setError("");
  };

  const handleSubmit = async () => {
    if (!newVersion.trim()) {
      setError("Vui lòng nhập phiên bản mới");
      return;
    }

    // Validate version format
    if (!/^[\d]+\.[\d]+$/.test(newVersion.trim())) {
      setError("Phiên bản phải có định dạng X.Y (ví dụ: 2.0, 1.5)");
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
        NgayHieuLuc: new Date().toISOString(),
        GhiChu: `Tạo từ phiên bản ${currentItem.PhienBan}`,
        KhoaPhanPhoi:
          currentItem.KhoaPhanPhoi?.map(
            (kp) => kp.KhoaID?._id || kp.KhoaID || kp,
          ) || [],
      };

      const created = await dispatch(createQuyTrinhISO(newData));

      if (!created?._id) {
        throw new Error("Không thể tạo phiên bản mới");
      }

      // Step 2: Copy files if requested
      if (copyFiles) {
        try {
          await dispatch(
            copyFilesFromVersion(created._id, currentItem._id, null),
          );
        } catch (copyError) {
          console.error("Copy files error:", copyError);
          toast.warning("Tạo phiên bản thành công nhưng không copy được file");
        }
      }

      toast.success(`Đã tạo phiên bản ${newVersion} thành công`);
      onClose();

      // Navigate to edit page of new version
      navigate(`/quytrinh-iso/${created._id}/edit`);
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
            helperText="Định dạng: X.Y (ví dụ: 2.0, 1.5)"
            autoFocus
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={copyFiles}
                onChange={(e) => setCopyFiles(e.target.checked)}
                disabled={loading}
              />
            }
            label={`Copy biểu mẫu từ phiên bản ${currentItem?.PhienBan}`}
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
