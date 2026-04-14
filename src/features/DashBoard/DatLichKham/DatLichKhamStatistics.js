import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  CheckCircle as CheckCircleIcon,
  Loop as LoopIcon,
  VerifiedUser as VerifiedUserIcon,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";

const CARDS = [
  {
    key: "tongDatLich",
    label: "Tổng đặt lịch",
    icon: PeopleIcon,
    color: "#1976d2",
    bg: "#e3f2fd",
  },
  {
    key: "coKham",
    label: "Có khám",
    icon: HospitalIcon,
    color: "#2e7d32",
    bg: "#e8f5e9",
  },
  {
    key: "vong1",
    label: "CK có tiền",
    icon: CheckCircleIcon,
    color: "#ed6c02",
    bg: "#fff3e0",
  },
  {
    key: "dichvuLt100k",
    label: "CK 0 đ",
    icon: CheckCircleIcon,
    color: "#ef5350",
    bg: "#ffebee",
  },
  {
    key: "trungNgay",
    label: "Đặt trong ngày",
    icon: DateRangeIcon,
    color: "#00897b",
    bg: "#e0f2f1",
  },
  {
    key: "soManTinh",
    label: "Mãn tính",
    icon: LoopIcon,
    color: "#9c27b0",
    bg: "#f3e5f5",
  },
  {
    key: "manTinhDungTuyen",
    label: "MT đúng tuyến",
    icon: LoopIcon,
    color: "#1b5e20",
    bg: "#e8f5e9",
    tooltip: "Ca đã đánh dấu mãn tính và mã CSKCB ban đầu bằng 25001.",
  },
  {
    key: "manTinhChuyenTuyen",
    label: "MT chuyển tuyến",
    icon: LoopIcon,
    color: "#e65100",
    bg: "#fff3e0",
    tooltip: "Ca đã đánh dấu mãn tính và mã CSKCB ban đầu khác 25001.",
  },
  {
    key: "hopLe",
    label: "Hợp lệ",
    icon: VerifiedUserIcon,
    color: "#0288d1",
    bg: "#e1f5fe",
    decimal: true,
  },
];

function formatVND(num) {
  if (num == null) return "0";
  return Number(num).toLocaleString("vi-VN");
}

function DatLichKhamStatistics({ thongKe = {}, loading = false }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Grid container spacing={2}>
        {CARDS.map((c) => {
          const Icon = c.icon;
          const cardContent = (
            <Card
              sx={{
                bgcolor: c.bg,
                borderLeft: `4px solid ${c.color}`,
                height: "100%",
                cursor: c.tooltip ? "help" : "default",
              }}
              variant="outlined"
            >
              <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Icon sx={{ color: c.color, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {c.label}
                  </Typography>
                </Box>
                {loading ? (
                  <Skeleton width={60} height={32} />
                ) : (
                  <Typography variant="h5" fontWeight="bold" color={c.color}>
                    {c.decimal
                      ? Number(thongKe[c.key] || 0).toLocaleString("vi-VN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : formatVND(thongKe[c.key] || 0)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );

          return (
            <Grid item xs={6} sm={4} md key={c.key}>
              {c.tooltip ? (
                <Tooltip title={c.tooltip} arrow placement="top">
                  {cardContent}
                </Tooltip>
              ) : (
                cardContent
              )}
            </Grid>
          );
        })}

        {/* Tổng tiền card */}
        <Grid item xs={12} sm={4} md>
          <Card
            sx={{
              bgcolor: "#fbe9e7",
              borderLeft: "4px solid #d32f2f",
              height: "100%",
            }}
            variant="outlined"
          >
            <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tổng tiền
              </Typography>
              {loading ? (
                <Skeleton width={100} height={32} />
              ) : (
                <Typography variant="h5" fontWeight="bold" color="#d32f2f">
                  {formatVND(thongKe.tongTien)} ₫
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DatLichKhamStatistics;
