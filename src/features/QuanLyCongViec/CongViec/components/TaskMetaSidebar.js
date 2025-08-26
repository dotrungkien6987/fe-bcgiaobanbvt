import React from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Paper,
  Grid,
} from "@mui/material";
import {
  Person as PersonIcon,
  DateRange as CalendarIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

// Helper function for formatting datetime with relative time
const formatRel = (d) =>
  d ? `${dayjs(d).format("DD/MM/YYYY HH:mm")} · ${dayjs(d).fromNow()}` : "—";

const TaskMetaSidebar = ({ theme, congViec, overdue, cooperators = [] }) => {
  return (
    <>
      {/* Người giao việc */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 1.5, fontWeight: 600 }}
        >
          Người giao việc
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1.5,
            borderRadius: 2,
            backgroundColor: theme.palette.grey[50],
            border: `1px solid ${theme.palette.grey[200]}`,
          }}
        >
          <Avatar
            src={congViec.NguoiGiaoProfile?.AnhDaiDien}
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              backgroundColor: theme.palette.secondary.main,
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            {congViec.NguoiGiaoProfile?.Ten?.charAt(0) || <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {congViec.NguoiGiaoProfile?.Ten || "Chưa xác định"}
            </Typography>
            {congViec.NguoiGiaoProfile?.ChucVu && (
              <Typography variant="caption" color="text.secondary">
                {congViec.NguoiGiaoProfile.ChucVu}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Người thực hiện chính */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 1.5, fontWeight: 600 }}
        >
          Người thực hiện chính
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1.5,
            borderRadius: 2,
            backgroundColor: theme.palette.grey[50],
            border: `1px solid ${theme.palette.grey[200]}`,
          }}
        >
          <Avatar
            src={congViec.NguoiChinhProfile?.AnhDaiDien}
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              backgroundColor: theme.palette.primary.main,
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            {congViec.NguoiChinhProfile?.Ten?.charAt(0) || <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {congViec.NguoiChinhProfile?.Ten || "Chưa xác định"}
            </Typography>
            {congViec.NguoiChinhProfile?.ChucVu && (
              <Typography variant="caption" color="text.secondary">
                {congViec.NguoiChinhProfile.ChucVu}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Thành viên phối hợp */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            <GroupIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: 18 }} />
            Thành viên phối hợp
          </Typography>
          <Chip
            size="small"
            label={cooperators.length}
            sx={{
              minWidth: 32,
              height: 20,
              fontSize: "0.75rem",
              fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
              color: "white",
            }}
          />
        </Box>

        {cooperators?.length > 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.grey[200]}`,
            }}
          >
            {/* Avatar Group */}
            <AvatarGroup
              max={4}
              sx={{
                mb: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: `2px solid ${theme.palette.background.paper}`,
                },
              }}
            >
              {cooperators.map((u) => (
                <Tooltip title={u.name} key={u.id}>
                  <Avatar src={u.avatarUrl || undefined} alt={u.name}>
                    {u.name?.charAt(0) || "U"}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>

            {/* Danh sách chi tiết (hiển thị tối đa 3 người) */}
            <List dense disablePadding>
              {cooperators.slice(0, 3).map((u) => (
                <ListItem
                  key={u.id}
                  disableGutters
                  sx={{
                    py: 0.5,
                    px: 0,
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.04)",
                      borderRadius: 1,
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 36 }}>
                    <Avatar
                      src={u.avatarUrl || undefined}
                      alt={u.name}
                      sx={{ width: 28, height: 28, fontSize: "0.8rem" }}
                    >
                      {u.name?.charAt(0) || "U"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={u.name}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { fontWeight: 500 },
                    }}
                  />
                </ListItem>
              ))}
              {cooperators.length > 3 && (
                <ListItem disableGutters sx={{ py: 0.5, px: 0 }}>
                  <ListItemText
                    primary={`+${cooperators.length - 3} người khác`}
                    primaryTypographyProps={{
                      variant: "caption",
                      color: "text.secondary",
                      sx: { fontStyle: "italic", pl: 4.5 },
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: theme.palette.grey[25],
              border: `1px dashed ${theme.palette.grey[300]}`,
              textAlign: "center",
            }}
          >
            <GroupIcon
              sx={{
                fontSize: 32,
                color: theme.palette.grey[400],
                mb: 1,
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Chưa có thành viên phối hợp
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Timeline */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 1.5, fontWeight: 600 }}
        >
          <CalendarIcon sx={{ mr: 1, verticalAlign: "middle", fontSize: 18 }} />
          Timeline
        </Typography>
        <Grid container spacing={1}>
          {[
            {
              label: "Bắt đầu (kế hoạch)",
              v: congViec.NgayBatDau,
            },
            {
              label: "Hết hạn (kế hoạch)",
              v: congViec.NgayHetHan,
            },
            { label: "Giao việc", v: congViec.NgayGiaoViec },
            {
              label: "Tiếp nhận thực tế",
              v: congViec.NgayTiepNhanThucTe,
            },
            {
              label: "Hoàn thành tạm",
              v: congViec.NgayHoanThanhTam,
            },
            { label: "Hoàn thành", v: congViec.NgayHoanThanh },
          ].map((t) => (
            <Grid key={t.label} item xs={12}>
              <Box
                sx={{
                  p: 1.2,
                  border: `1px solid ${theme.palette.grey[200]}`,
                  borderRadius: 1.2,
                  backgroundColor: theme.palette.grey[50],
                  minHeight: 54,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                  }}
                >
                  {t.label}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {formatRel(t.v)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tags */}
      {congViec.Tags && congViec.Tags.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1.5, fontWeight: 600 }}
          >
            Tags
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.grey[200]}`,
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {congViec.Tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="filled"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default TaskMetaSidebar;
