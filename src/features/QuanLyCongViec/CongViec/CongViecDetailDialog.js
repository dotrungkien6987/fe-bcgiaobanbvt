import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Tooltip,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  DateRange as CalendarIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  formatDateTime,
  getStatusColor,
  getPriorityColor,
  isOverdue,
} from "../../../utils/congViecUtils";
import {
  getCongViecDetail,
  updateCongViecStatus,
  addCongViecComment,
} from "./congViecSlice";

const CongViecDetailDialog = ({ open, onClose, congViecId, onEdit }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();

  const { congViecDetail, loading, error } = useSelector(
    (state) => state.congViec
  );

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (open && congViecId) {
      dispatch(getCongViecDetail(congViecId));
    }
  }, [open, congViecId, dispatch]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await dispatch(addCongViecComment({ congViecId, noiDung: newComment }));
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(
        updateCongViecStatus({ congViecId, trangThai: newStatus })
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (!congViecDetail && !loading) return null;

  const congViec = congViecDetail || {};
  const overdue = isOverdue(congViec.NgayHetHan);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: { minHeight: "80vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Chi tiết công việc
        </Typography>
        <Box>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              onClick={() => onEdit(congViec)}
              size="small"
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography>Đang tải...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error">Có lỗi xảy ra: {error}</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  {/* Header Info */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, flex: 1 }}
                      >
                        {congViec.TieuDe || "Tiêu đề công việc"}
                      </Typography>
                      <Chip
                        label={congViec.TrangThai || "Mới"}
                        color={getStatusColor(congViec.TrangThai)}
                        size="small"
                      />
                    </Box>

                    <Box
                      sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}
                    >
                      <Chip
                        icon={<FlagIcon />}
                        label={congViec.MucDoUuTien || "Bình thường"}
                        color={getPriorityColor(congViec.MucDoUuTien)}
                        variant="outlined"
                        size="small"
                      />
                      {overdue && (
                        <Chip label="Quá hạn" color="error" size="small" />
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Description */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Mô tả công việc
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "pre-wrap",
                        backgroundColor: theme.palette.grey[50],
                        p: 2,
                        borderRadius: 1,
                        minHeight: 100,
                      }}
                    >
                      {congViec.MoTa || "Không có mô tả"}
                    </Typography>
                  </Box>

                  {/* Progress */}
                  {congViec.TienDo !== undefined && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Tiến độ: {congViec.TienDo}%
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          height: 8,
                          backgroundColor: theme.palette.grey[200],
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${congViec.TienDo}%`,
                            height: "100%",
                            backgroundColor: theme.palette.primary.main,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {congViec.TrangThai !== "Hoàn thành" && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleStatusChange("Hoàn thành")}
                        size="small"
                      >
                        Hoàn thành
                      </Button>
                    )}
                    {congViec.TrangThai === "Mới" && (
                      <Button
                        variant="outlined"
                        startIcon={<RadioButtonUncheckedIcon />}
                        onClick={() => handleStatusChange("Đang thực hiện")}
                        size="small"
                      >
                        Bắt đầu
                      </Button>
                    )}
                    {congViec.TrangThai === "Đang thực hiện" && (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<ScheduleIcon />}
                        onClick={() => handleStatusChange("Tạm dừng")}
                        size="small"
                      >
                        Tạm dừng
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    <CommentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Bình luận ({congViec.BinhLuans?.length || 0})
                  </Typography>

                  {/* Add Comment */}
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Thêm bình luận..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleAddComment}
                              disabled={!newComment.trim() || submittingComment}
                              color="primary"
                            >
                              <SendIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Comments Timeline */}
                  <List sx={{ mt: 2 }}>
                    {(congViec.BinhLuans || []).map((comment, index) => (
                      <ListItem
                        key={comment._id || index}
                        alignItems="flex-start"
                        sx={{ px: 0 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {comment.NguoiBinhLuan?.Ten?.charAt(0) || "U"}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600 }}
                              >
                                {comment.NguoiBinhLuan?.Ten || "Người dùng"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDateTime(comment.NgayTao)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {comment.NoiDung}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>

                  {(!congViec.BinhLuans || congViec.BinhLuans.length === 0) && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 3 }}
                    >
                      Chưa có bình luận nào
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Thông tin chi tiết
                  </Typography>

                  {/* Người giao việc */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Người giao việc
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="body2">
                        {congViec.NguoiGiaoViec?.Ten || "Chưa xác định"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Người thực hiện chính */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Người thực hiện chính
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="body2">
                        {congViec.NguoiChinh?.Ten || "Chưa xác định"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Thời gian */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      <CalendarIcon
                        sx={{ mr: 1, verticalAlign: "middle", fontSize: 16 }}
                      />
                      Thời gian
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Ngày tạo:</strong>{" "}
                      {formatDateTime(congViec.NgayTao)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Ngày bắt đầu:</strong>{" "}
                      {formatDateTime(congViec.NgayBatDau)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: overdue ? theme.palette.error.main : "inherit",
                        fontWeight: overdue ? 600 : 400,
                      }}
                    >
                      <strong>Hạn hoàn thành:</strong>{" "}
                      {formatDateTime(congViec.NgayHetHan)}
                    </Typography>
                  </Box>

                  {/* Tags */}
                  {congViec.Tags && congViec.Tags.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        Tags
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {congViec.Tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CongViecDetailDialog;
