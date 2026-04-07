import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import useDeployVersionInfo from "../hooks/useDeployVersionInfo";
import { useEnvironment } from "../hooks/useEnvironment";

function InfoCard({ icon, label, value, helperText }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        minWidth: 0,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            backgroundColor: "action.hover",
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>

      {helperText && (
        <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "text.secondary" }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

function VersionInfoDialog({ open, onClose }) {
  const theme = useTheme();
  const { env, label, color, icon } = useEnvironment();
  const { version, buildTimeVN, buildTimestamp, loading } = useDeployVersionInfo();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            color: "common.white",
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 45%, ${theme.palette.info.main} 100%)`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                backgroundColor: alpha(theme.palette.common.white, 0.16),
                backdropFilter: "blur(8px)",
                flexShrink: 0,
              }}
            >
              <RocketLaunchRoundedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Phiên bản ứng dụng
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Thông tin bản deploy hiện đang chạy trên giao diện này
              </Typography>
            </Box>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {loading ? (
          <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Đang tải thông tin phiên bản...
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.25}>
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3.5,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.16),
                background: `linear-gradient(160deg, ${alpha(
                  theme.palette.primary.main,
                  0.08,
                )} 0%, ${alpha(theme.palette.info.main, 0.06)} 52%, ${alpha(
                  theme.palette.background.paper,
                  0.8,
                )} 100%)`,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.75,
                      display: "grid",
                      placeItems: "center",
                      color: "primary.main",
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      flexShrink: 0,
                    }}
                  >
                    <VerifiedRoundedIcon sx={{ fontSize: 24 }} />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                      PHIÊN BẢN ĐANG CHẠY
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5, mt: 0.5 }}>
                      v{version}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                      {buildTimeVN ? `Build lúc ${buildTimeVN}` : "Đang đọc thời điểm build"}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "row", sm: "column" }}
                  spacing={1}
                  alignItems={{ xs: "center", sm: "flex-end" }}
                >
                  <Chip
                    label={`${icon} ${label}`}
                    color={color}
                    variant={env === "PROD" ? "filled" : "outlined"}
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    label="version.json"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      borderColor: alpha(theme.palette.text.primary, 0.12),
                      backgroundColor: alpha(theme.palette.background.paper, 0.72),
                    }}
                  />
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                gap: 1.5,
              }}
            >
              <InfoCard
                icon={<LayersRoundedIcon sx={{ fontSize: 16 }} />}
                label="Phiên bản"
                value={`v${version}`}
                helperText="Đồng bộ với file version.json của bản build"
              />
              <InfoCard
                icon={<AccessTimeRoundedIcon sx={{ fontSize: 16 }} />}
                label="Thời điểm build"
                value={buildTimeVN || "Chưa có dữ liệu"}
                helperText={buildTimestamp ? `Build timestamp: ${buildTimestamp}` : undefined}
              />
              <InfoCard
                icon={<RocketLaunchRoundedIcon sx={{ fontSize: 16 }} />}
                label="Môi trường"
                value={label}
                helperText={env === "PROD" ? "Đang chạy trên môi trường thật" : "Môi trường thử nghiệm"}
              />
            </Box>

            <Box
              sx={{
                p: 1.75,
                borderRadius: 2.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: "1px dashed",
                borderColor: alpha(theme.palette.primary.main, 0.18),
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                Gợi ý sử dụng
              </Typography>
              <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary", lineHeight: 1.7 }}>
                Khi cần xác nhận bản giao diện đang chạy sau mỗi lần release, mở mục <strong>Phiên bản</strong> trong menu người dùng để kiểm tra nhanh số version và thời điểm build.
              </Typography>
            </Box>

            <Divider />

            <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
              Mỗi lần deploy frontend, file <strong>version.json</strong> sẽ được cập nhật tự động. Dialog này chỉ giữ các thông tin cần thiết nhất để kiểm tra release, không hiển thị thêm URL API.
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VersionInfoDialog;