import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
} from "@mui/material";
import { CheckCircle, TrendingUp } from "@mui/icons-material";
import { fetchAssignmentsByEmployee } from "../giaoNhiemVuSlice";
import dayjs from "dayjs";

const ViewAssignmentsDialog = ({ open, employee, onClose }) => {
  const dispatch = useDispatch();
  const { assignments, isLoading } = useSelector((s) => s.giaoNhiemVu);

  useEffect(() => {
    if (open && employee?._id) {
      dispatch(fetchAssignmentsByEmployee(employee._id));
    }
  }, [open, employee, dispatch]);

  const totalScore = assignments.reduce((sum, a) => {
    const duty =
      typeof a.NhiemVuThuongQuyID === "object" ? a.NhiemVuThuongQuyID : null;
    return sum + (duty?.MucDoKho || 0);
  }, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            Chi tiết nhiệm vụ: {employee?.Ten}
          </Typography>
          <Chip
            label={employee?.TenKhoa || "N/A"}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={2} mb={2}>
              <Chip
                icon={<CheckCircle />}
                label={`Tổng: ${assignments.length} nhiệm vụ`}
                color="success"
                variant="filled"
              />
              <Chip
                icon={<TrendingUp />}
                label={`Điểm: ${totalScore.toFixed(1)}`}
                color="primary"
                variant="filled"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {assignments.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                py={4}
              >
                Chưa có nhiệm vụ nào được gán
              </Typography>
            ) : (
              <List>
                {assignments.map((assignment, index) => {
                  const duty =
                    typeof assignment.NhiemVuThuongQuyID === "object"
                      ? assignment.NhiemVuThuongQuyID
                      : null;
                  const nguoiGan =
                    typeof assignment.NguoiGanID === "object"
                      ? assignment.NguoiGanID
                      : null;

                  return (
                    <ListItem
                      key={assignment._id}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {index + 1}. {duty?.TenNhiemVu || "N/A"}
                            </Typography>
                            <Chip
                              label={`Mức độ: ${duty?.MucDoKho || 0}`}
                              size="small"
                              color="primary"
                            />
                          </Stack>
                        }
                        secondary={
                          <Box mt={0.5}>
                            {duty?.MoTa && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {duty.MoTa}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={2} mt={0.5}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Ngày gán:{" "}
                                {assignment.NgayGan
                                  ? dayjs(assignment.NgayGan).format(
                                      "DD/MM/YYYY"
                                    )
                                  : "N/A"}
                              </Typography>
                              {nguoiGan && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Người gán: {nguoiGan.Ten}
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewAssignmentsDialog;
