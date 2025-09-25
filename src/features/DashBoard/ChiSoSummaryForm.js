import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  Paper,
  Fade,
  Zoom,
  Button,
  alpha,
  useTheme,
  useMediaQuery,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Slider,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReplayIcon from "@mui/icons-material/Replay";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { List, ListItemButton, ListItemText, Divider } from "@mui/material";

const ChiSoSummaryForm = ({ open, onClose, metrics = {}, currentDay }) => {
  const theme = useTheme();
  const compact = useMediaQuery("(max-width:1280px)");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [preScaleSegment, setPreScaleSegment] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingSegment, setPendingSegment] = useState(null);
  const [isPreDelay, setIsPreDelay] = useState(false);

  const VND = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const {
    chuaKT_ThangTruoc_RaVien = 0,
    chuaKT_ThangTruoc_ChuaRaVien = 0,
    chuaKT_ThangNay_RaVien = 0,
    chuaKT_ThangNay_ChuaRaVien = 0,
    tongDuyetKeToan = 0,
    tongTheoChiDinh = 0,
    tongTien3Khoa_RaVien_ThangTruoc = 0,
  } = metrics;

  // Debug log để kiểm tra giá trị tổng 3 khoa
  // (Có thể xoá sau khi xác nhận đúng dữ liệu)
  console.log(
    "tongTien3Khoa_RaVien_ThangTruoc",
    tongTien3Khoa_RaVien_ThangTruoc
  );

  // Cho phép bật/tắt tính doanh thu 3 khoa vào Khối 1
  const [include3Khoa, setInclude3Khoa] = useState(true);
  // Tỷ lệ chuyển đổi dự kiến (%) cho các khối 1..4
  const [conversionRate, setConversionRate] = useState(100); // mặc định 100%
  const clampRate = (val) => Math.max(0, Math.min(300, val));
  const handleRateInput = (e) => {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw)) return setConversionRate(0);
    setConversionRate(clampRate(raw));
  };
  const valueBlock1 = include3Khoa
    ? chuaKT_ThangTruoc_RaVien
    : Math.max(chuaKT_ThangTruoc_RaVien - tongTien3Khoa_RaVien_ThangTruoc, 0);

  const totalOldPending =
    chuaKT_ThangTruoc_RaVien + chuaKT_ThangTruoc_ChuaRaVien;
  const totalCurrentPending =
    chuaKT_ThangNay_RaVien + chuaKT_ThangNay_ChuaRaVien;
  let overlap = tongTheoChiDinh - totalCurrentPending;
  if (overlap < 0) overlap = 0;
  let transferred = tongDuyetKeToan - overlap;
  if (transferred < 0) transferred = 0;

  // Tổng giá trị bệnh viện đã thực hiện = 1 + 2 + 3 + 4 + 5 + 6 (dùng giá trị hiển thị hiện tại của Khối 1)
  const totalHospital =
    valueBlock1 +
    chuaKT_ThangTruoc_ChuaRaVien +
    chuaKT_ThangNay_RaVien +
    chuaKT_ThangNay_ChuaRaVien +
    transferred +
    overlap;

  // Tổng 1..4 (các khoản chưa duyệt KT) dùng cho tính dự kiến
  const pendingBlocksSum =
    valueBlock1 +
    chuaKT_ThangTruoc_ChuaRaVien +
    chuaKT_ThangNay_RaVien +
    chuaKT_ThangNay_ChuaRaVien;
  const predictedApproved =
    tongDuyetKeToan + (conversionRate / 100) * pendingBlocksSum;

  useEffect(() => {
    if (open) {
      setAnimationPhase(0);
      setSelectedSegment("");
      const timers = [300, 600, 900, 1200].map((d, i) =>
        setTimeout(() => setAnimationPhase(i + 1), d)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [open]);

  // Helper: start pre-scale / transition sequence
  const startPreScale = (segId) => {
    if (!segId) return;
    // Bước 1: dừng 0.5s (pre-delay) trước khi scale
    setIsPreDelay(true);
    setTimeout(() => {
      setIsPreDelay(false);
      // Bước 2: bật hiệu ứng scale 1.2 trong 0.8s
      setPreScaleSegment(segId);
      setTimeout(() => {
        // Bước 3: chuyển sang fly-in detail
        setPreScaleSegment("");
        setIsTransitioning(true);
        setSelectedSegment("");
        setTimeout(() => {
          setSelectedSegment(segId);
          setTimeout(() => setIsTransitioning(false), 50);
        }, 300);
      }, 800); // thời gian scale
    }, 500); // pre-delay 0.5s
  };

  // New interaction logic ensuring always return to overview first
  const handleSegmentChange = (newSegment) => {
    // If user chooses overview directly
    if (newSegment === "") {
      setPendingSegment(null);
      setSelectedSegment("");
      return;
    }
    // If clicking the same active detail -> close
    if (newSegment === selectedSegment) {
      setSelectedSegment("");
      return;
    }
    // If animation in progress: queue the request
    if (isPreDelay || preScaleSegment || isTransitioning) {
      setPendingSegment(newSegment);
      return;
    }
    // If currently in detail view: close first, then schedule pre-scale after overview paint
    if (selectedSegment) {
      setSelectedSegment("");
      setPendingSegment(newSegment); // queue it; effect will trigger when overview ready
      return;
    }
    // We are in overview & idle -> start pre-scale immediately
    startPreScale(newSegment);
  };

  // Effect: when idle in overview and there is a queued segment, start it
  useEffect(() => {
    if (
      !selectedSegment &&
      !preScaleSegment &&
      !isTransitioning &&
      pendingSegment
    ) {
      const seg = pendingSegment;
      setPendingSegment(null);
      startPreScale(seg);
    }
  }, [
    selectedSegment,
    preScaleSegment,
    isTransitioning,
    pendingSegment,
    isPreDelay,
  ]);

  const getPreScaleStyle = (id) =>
    preScaleSegment === id && !selectedSegment
      ? {
          transform: "scale(1.2)",
          zIndex: 20,
          boxShadow: "0 12px 32px -8px rgba(0,0,0,0.35)",
          transition:
            "transform .8s cubic-bezier(0.22,1,0.36,1), box-shadow .6s",
        }
      : { transition: "transform .4s, box-shadow .4s" };

  const segments = [
    {
      id: "s1",
      number: "1",
      label: "Chưa duyệt KT tháng trước (Đã ra viện)",
      value: valueBlock1,
      color: "#6366f1",
    },
    {
      id: "s2",
      number: "2",
      label: "Chưa duyệt KT tháng trước (Chưa ra viện)",
      value: chuaKT_ThangTruoc_ChuaRaVien,
      color: "#818cf8",
    },
    {
      id: "s3",
      number: "3",
      label: "Chỉ định tháng này chưa duyệt KT (Đã ra viện)",
      value: chuaKT_ThangNay_RaVien,
      color: "#f59e0b",
    },
    {
      id: "s4",
      number: "4",
      label: "Chỉ định tháng này chưa duyệt KT (Chưa ra viện)",
      value: chuaKT_ThangNay_ChuaRaVien,
      color: "#fbbf24",
    },
    {
      id: "s5",
      number: "5",
      label: "Chỉ định tháng trước, duyệt KT tháng này",
      value: transferred,
      color: "#8b5cf6",
    },
    {
      id: "s6",
      number: "6",
      label: "Chỉ định trong tháng",
      value: overlap,
      color: "#10b981",
    },
    {
      id: "rect_a",
      label: "A. Duyệt kế toán",
      value: tongDuyetKeToan,
      color: "#6366f1",
    },
    {
      id: "rect_b",
      label: "B. Theo chỉ định",
      value: tongTheoChiDinh,
      color: "#10b981",
    },
  ];

  // (Removed unused helper getSeg to satisfy lint)

  // Calculate fly-to-center animation
  const getFlyAnimation = (segmentId) => {
    if (selectedSegment !== segmentId || isTransitioning) return {};

    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) scale(2)",
      zIndex: 1000,
      transition: "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          background:
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 30% 20%,#1e293b 0%,#0f172a 100%)"
              : "linear-gradient(135deg,#f8fafc,#e2e8f0)",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2000,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(8px)",
            "&:hover": { bgcolor: alpha(theme.palette.background.paper, 0.9) },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Header (condensed) */}
        <Box
          sx={{
            p: compact ? 1.5 : 2.5,
            pt: compact ? 1.2 : 1.6,
            pb: compact ? 1.2 : 1.4,
            background: alpha(theme.palette.background.paper, 0.35),
            backdropFilter: "blur(14px)",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            opacity: selectedSegment ? 0.3 : 1,
            transition: "opacity 0.4s",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 0.5 }}
          >
            <Typography
              variant={compact ? "h6" : "h5"}
              sx={{
                fontWeight: 700,
                letterSpacing: 0.3,
                display: "flex",
                alignItems: "center",
                gap: 1,
                "&:before": {
                  content: '""',
                  width: 8,
                  height: 26,
                  borderRadius: 1.5,
                  background: "linear-gradient(180deg,#6366f1,#10b981)",
                  boxShadow: "0 0 0 1px rgba(99,102,241,0.3)",
                },
              }}
            >
              Phân tích dòng doanh thu
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Ngày: {currentDay || new Date().getDate()}/
              {new Date().getMonth() + 1}/{new Date().getFullYear()}
            </Typography>
          </Stack>
          {/* Điều khiển tính / loại 3 khoa */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.2,
              px: 2,
              py: 1.1,
              borderRadius: 2,
              background:
                theme.palette.mode === "dark"
                  ? alpha("#6366f1", 0.18)
                  : alpha("#6366f1", 0.1),
              boxShadow: `0 4px 14px -4px ${alpha("#6366f1", 0.45)}`,
              border: `1px solid ${alpha("#6366f1", 0.35)}`,
              backdropFilter: "blur(6px)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 600 }}
              color="text.secondary"
            >
              Doanh thu đã ra viện chưa duyệt KT các khoa (Truyền máu, Tư vấn,
              PK vệ tinh):
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#6366f1" }}
            >
              {VND.format(tongTien3Khoa_RaVien_ThangTruoc)}
            </Typography>
            <Tooltip
              arrow
              title={
                include3Khoa
                  ? "Bỏ chọn: loại doanh thu 3 khoa khỏi Khối 1"
                  : "Chọn: cộng lại doanh thu 3 khoa vào Khối 1"
              }
            >
              <FormControlLabel
                sx={{ m: 0, userSelect: "none" }}
                control={
                  <Checkbox
                    size="small"
                    checked={include3Khoa}
                    onChange={(e) => setInclude3Khoa(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {include3Khoa
                      ? "Đang tính vào Khối 1"
                      : "Đã loại khỏi Khối 1"}
                  </Typography>
                }
              />
            </Tooltip>
            {!include3Khoa && (
              <Typography
                variant="caption"
                sx={{ fontStyle: "italic", opacity: 0.8, width: "100%" }}
              >
                Khối 1 = Giá trị gốc -{" "}
                {VND.format(tongTien3Khoa_RaVien_ThangTruoc)}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            gap: 2,
            overflowY: "auto",
            overflowX: "hidden",
            px: compact ? 2.5 : 5,
            pt: 2,
            pb: 1,
          }}
        >
          {/* Sidebar controls vertical (List + Collapse) */}
          {sidebarCollapsed ? (
            <Box
              sx={{
                position: "sticky",
                top: compact ? 72 : 84,
                alignSelf: "flex-start",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Tooltip title="Mở sidebar" arrow>
                <IconButton
                  size="small"
                  onClick={() => setSidebarCollapsed(false)}
                  sx={{
                    border: `1px solid ${alpha("#6366f1", 0.4)}`,
                    background: alpha("#6366f1", 0.15),
                    backdropFilter: "blur(6px)",
                    "&:hover": { background: alpha("#6366f1", 0.25) },
                  }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                width: compact ? 150 : 170,
                flexShrink: 0,
                p: 1,
                pt: 1,
                borderRadius: 3,
                background: alpha(theme.palette.background.paper, 0.55),
                backdropFilter: "blur(10px)",
                height: "fit-content",
                position: "sticky",
                top: compact ? 72 : 84,
                alignSelf: "flex-start",
                opacity: selectedSegment ? 0.3 : 1,
                transition: "opacity .4s",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 0.5 }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, letterSpacing: 0.3 }}
                >
                  Khối
                </Typography>
                <Tooltip title="Thu gọn" arrow>
                  <IconButton
                    size="small"
                    onClick={() => setSidebarCollapsed(true)}
                    sx={{
                      width: 26,
                      height: 26,
                      border: `1px solid ${alpha("#64748b", 0.4)}`,
                      background: alpha("#64748b", 0.15),
                      "&:hover": { background: alpha("#64748b", 0.25) },
                    }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Divider sx={{ mb: 0.5 }} />
              <List
                dense
                disablePadding
                sx={{
                  "& .MuiListItemButton-root": {
                    borderRadius: 2,
                    mb: 0.5,
                    px: 1,
                    py: 0.6,
                    fontSize: 12,
                    border: `1px solid ${alpha("#64748b", 0.25)}`,
                  },
                }}
              >
                {[
                  { id: "", label: "Tổng quan" },
                  { id: "rect_a", label: "A. Duyệt kế toán" },
                  { id: "rect_b", label: "B. Theo chỉ định" },
                  ...segments
                    .filter((s) => s.number)
                    .map((s) => ({ id: s.id, label: s.number })),
                ].map((item) => {
                  const active =
                    selectedSegment === item.id ||
                    (!selectedSegment && item.id === "");
                  return (
                    <ListItemButton
                      key={item.id || "overview"}
                      selected={active}
                      onClick={() => handleSegmentChange(item.id)}
                      sx={{
                        ...(active && {
                          background: "linear-gradient(90deg,#6366f1,#10b981)",
                          color: "#fff",
                          fontWeight: 700,
                          boxShadow: "0 4px 12px -3px rgba(99,102,241,0.4)",
                          border: "1px solid #6366f1",
                        }),
                        "&:hover": {
                          background: active
                            ? "linear-gradient(90deg,#4f46e5,#059669)"
                            : alpha("#6366f1", 0.12),
                        },
                      }}
                    >
                      <ListItemText
                        primaryTypographyProps={{
                          fontSize: 12,
                          fontWeight: active ? 700 : 500,
                        }}
                        primary={item.label}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          )}

          {/* Main Visualization */}
          <Box
            sx={{
              position: "relative",
              flex: 1,
              mx: compact ? 2.5 : 5,
              mb: compact ? 2 : 3,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.65),
              backdropFilter: "blur(18px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
              overflow: "visible",
              minHeight: compact ? 540 : 600,
            }}
          >
            {/* Overlay shadow when item selected */}
            <Box
              sx={{
                position: "fixed",
                inset: 0,
                bgcolor: alpha("#000", 0.7),
                zIndex: selectedSegment ? 900 : -1,
                opacity: selectedSegment ? 1 : 0,
                transition: "all 0.4s",
                pointerEvents: selectedSegment ? "auto" : "none",
              }}
              onClick={() => setSelectedSegment("")}
            />

            {/* Timeline axis */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: selectedSegment ? 0.1 : 1,
                transition: "opacity 0.4s",
              }}
            >
              <svg
                width="100%"
                height="100%"
                style={{ position: "absolute", inset: 0 }}
              >
                <line
                  x1="10%"
                  x2="90%"
                  y1="75%"
                  y2="75%"
                  stroke={theme.palette.divider}
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  opacity={animationPhase >= 1 ? 0.55 : 0}
                  style={{ transition: "opacity .5s" }}
                />
                {animationPhase >= 1 && (
                  <g style={{ transition: "opacity .6s" }}>
                    <line
                      x1="25%"
                      x2="25%"
                      y1="72%"
                      y2="78%"
                      stroke={theme.palette.text.secondary}
                    />
                    <text
                      x="25%"
                      y="82%"
                      textAnchor="middle"
                      fill={theme.palette.text.secondary}
                      fontSize="11"
                    >
                      Tháng trước
                    </text>

                    <line
                      x1="50%"
                      x2="50%"
                      y1="70%"
                      y2="80%"
                      stroke={theme.palette.text.primary}
                      strokeWidth="3"
                    />
                    <text
                      x="50%"
                      y="85%"
                      textAnchor="middle"
                      fill={theme.palette.text.primary}
                      fontSize="12"
                      fontWeight="600"
                    >
                      01/{new Date().getMonth() + 1}
                    </text>

                    <line
                      x1="75%"
                      x2="75%"
                      y1="72%"
                      y2="78%"
                      stroke={theme.palette.text.secondary}
                    />
                    <text
                      x="75%"
                      y="82%"
                      textAnchor="middle"
                      fill={theme.palette.text.secondary}
                      fontSize="11"
                    >
                      {currentDay}/{new Date().getMonth() + 1}
                    </text>
                  </g>
                )}
              </svg>
            </Box>

            {/* Old pending blocks (1 & 2) */}
            <Zoom in={animationPhase >= 2 && !selectedSegment} timeout={600}>
              <Box
                sx={{
                  position: "absolute",
                  left: compact ? "12%" : "15%",
                  top: "30%",
                  width: compact ? 140 : 160,
                  height: 180,
                }}
              >
                {/* Group brace for Blocks 1 & 2 (old pending) */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -60,
                    left: 0,
                    width: "100%",
                    height: 48,
                    pointerEvents: "none",
                  }}
                >
                  <Box
                    component="svg"
                    viewBox="0 0 1000 200"
                    preserveAspectRatio="none"
                    sx={{ position: "absolute", inset: 0 }}
                  >
                    <path
                      d="M0 38 C90 38 90 8 180 8 C270 8 270 38 360 38 C450 38 450 8 540 8 C630 8 630 38 720 38 C810 38 810 8 900 8 C950 8 950 38 1000 38"
                      stroke={theme.palette.error.main}
                      strokeWidth={7}
                      fill="none"
                      strokeLinecap="round"
                      opacity={0.9}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      top: -6,
                      left: "50%",
                      transform: "translate(-50%, -100%)",
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      whiteSpace: "nowrap",
                      color: theme.palette.error.main,
                      background: alpha(theme.palette.background.paper, 0.85),
                      px: 1.1,
                      py: 0.45,
                      borderRadius: 1,
                      boxShadow: 1,
                    }}
                  >
                    Chưa duyệt kế toán tháng trước
                  </Typography>
                </Box>

                {/* Block 1 (Đã ra viện - cũ) */}
                <Box
                  onClick={() => handleSegmentChange("s1")}
                  sx={{
                    position: "relative",
                    height: "48%",
                    mb: "4%",
                    borderRadius: 2,
                    background: theme.palette.error.main,
                    border: `2px solid ${theme.palette.error.main}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                    opacity:
                      selectedSegment && selectedSegment !== "s1" ? 0.1 : 1,
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: `0 8px 24px -4px ${theme.palette.error.main}aa`,
                    },
                    ...getPreScaleStyle("s1"),
                  }}
                >
                  <Typography
                    sx={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      bgcolor: "rgba(0,0,0,0.35)",
                      px: 0.8,
                      py: "2px",
                      borderRadius: 1,
                    }}
                  >
                    1
                  </Typography>
                  <Box sx={{ textAlign: "center", color: "#fff", px: 1 }}>
                    <Typography variant="body1" fontWeight={700}>
                      {VND.format(valueBlock1)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.9, fontSize: 11 }}
                    >
                      Đã ra viện
                    </Typography>
                    {!include3Khoa && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.2,
                          fontSize: 10,
                          opacity: 0.75,
                          display: "block",
                        }}
                      >
                        Gốc: {VND.format(chuaKT_ThangTruoc_RaVien)} - Trừ:{" "}
                        {VND.format(tongTien3Khoa_RaVien_ThangTruoc)}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Block 2 (Chưa ra viện - cũ) */}
                <Box
                  onClick={() => handleSegmentChange("s2")}
                  sx={{
                    position: "relative",
                    height: "48%",
                    borderRadius: 2,
                    background: "#f59e0b",
                    border: "2px solid #f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                    opacity:
                      selectedSegment && selectedSegment !== "s2" ? 0.1 : 1,
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 8px 24px -4px #f59e0baa",
                    },
                    ...getPreScaleStyle("s2"),
                  }}
                >
                  <Typography
                    sx={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      bgcolor: "rgba(0,0,0,0.35)",
                      px: 0.8,
                      py: "2px",
                      borderRadius: 1,
                    }}
                  >
                    2
                  </Typography>
                  <Box sx={{ textAlign: "center", color: "#fff", px: 1 }}>
                    <Typography variant="body1" fontWeight={700}>
                      {VND.format(chuaKT_ThangTruoc_ChuaRaVien)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.9, fontSize: 11 }}
                    >
                      Chưa ra viện
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Zoom>

            {/* Highlighted Block 1 */}
            {selectedSegment === "s1" && (
              <Box
                sx={{
                  ...getFlyAnimation("s1"),
                  width: compact ? 280 : 320,
                  height: 180,
                  borderRadius: 3,
                  background: theme.palette.error.main,
                  border: `3px solid ${theme.palette.error.main}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 20px 60px -10px ${theme.palette.error.main}aa`,
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(0,0,0,0.25)",
                    px: 0.9,
                    py: "2px",
                    borderRadius: 1,
                  }}
                >
                  1
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="#fff"
                  gutterBottom
                  sx={{ fontSize: { xs: 20, md: 22 } }}
                >
                  {VND.format(valueBlock1)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="#fff"
                  sx={{ opacity: 0.92, fontWeight: 600, textAlign: "center" }}
                >
                  Chưa duyệt KT tháng trước (Đã ra viện)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.6,
                    color: "#fff",
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  Giá trị đã làm tháng trước, chưa được ghi nhận.
                </Typography>
                {!include3Khoa && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      color: "#fff",
                      opacity: 0.85,
                      textAlign: "center",
                    }}
                  >
                    Gốc {VND.format(chuaKT_ThangTruoc_RaVien)} - Trừ 3 khoa{" "}
                    {VND.format(tongTien3Khoa_RaVien_ThangTruoc)}
                  </Typography>
                )}
                <IconButton
                  onClick={() => setSelectedSegment("")}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: "#fff",
                    bgcolor: alpha("#fff", 0.2),
                    "&:hover": { bgcolor: alpha("#fff", 0.3) },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}

            {/* Highlighted Block 2 */}
            {selectedSegment === "s2" && (
              <Box
                sx={{
                  ...getFlyAnimation("s2"),
                  width: compact ? 280 : 320,
                  height: 180,
                  borderRadius: 3,
                  background: "#f59e0b",
                  border: "3px solid #f59e0b",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px -10px #f59e0baa",
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(0,0,0,0.25)",
                    px: 0.9,
                    py: "2px",
                    borderRadius: 1,
                  }}
                >
                  2
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="#fff"
                  gutterBottom
                  sx={{ fontSize: { xs: 20, md: 22 } }}
                >
                  {VND.format(chuaKT_ThangTruoc_ChuaRaVien)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="#fff"
                  sx={{ opacity: 0.92, fontWeight: 600, textAlign: "center" }}
                >
                  Chưa duyệt KT tháng trước (Chưa ra viện)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.6,
                    color: "#fff",
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  Giá trị đã làm tháng trước, chưa được ghi nhận.
                </Typography>
                <IconButton
                  onClick={() => setSelectedSegment("")}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: "#fff",
                    bgcolor: alpha("#fff", 0.2),
                    "&:hover": { bgcolor: alpha("#fff", 0.3) },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}

            {/* Main A & B rectangles */}
            <Fade in={animationPhase >= 3 && !selectedSegment} timeout={700}>
              <Box
                sx={{
                  position: "absolute",
                  left: "35%",
                  right: "15%",
                  top: "30%",
                  height: 200,
                }}
              >
                {/* Horizontal braces labeling Block A & B (outside, spanning widths) */}
                {animationPhase >= 4 && !selectedSegment && (
                  <>
                    {/* Horizontal brace for Block B (placed higher to avoid overlap) */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -105,
                        left: "30%", // starts where B begins
                        width: "70%",
                        height: 50,
                        pointerEvents: "none",
                      }}
                    >
                      <Box
                        component="svg"
                        viewBox="0 0 1000 200"
                        preserveAspectRatio="none"
                        sx={{ position: "absolute", inset: 0 }}
                      >
                        {/* Curly style brace pointing downward toward Block B */}
                        <path
                          d="M0 40 C120 40 120 5 240 5 C360 5 360 40 480 40 C600 40 600 5 720 5 C840 5 840 40 960 40"
                          stroke="#10b981"
                          strokeWidth={8}
                          fill="none"
                          strokeLinecap="round"
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSegmentChange("rect_b");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSegmentChange("rect_b");
                          }
                        }}
                        sx={{
                          position: "absolute",
                          top: -8,
                          left: "50%",
                          transform: "translate(-50%, -100%)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          color: "#10b981",
                          background: alpha(
                            theme.palette.background.paper,
                            0.85
                          ),
                          px: 1.2,
                          py: 0.5,
                          borderRadius: 1,
                          boxShadow: 1,
                          cursor: "pointer",
                          pointerEvents: "auto",
                          transition: "background .25s, transform .25s",
                          "&:hover": {
                            background: alpha(
                              theme.palette.background.paper,
                              0.95
                            ),
                            transform: "translate(-50%, -105%) scale(1.03)",
                          },
                          "&:active": {
                            transform: "translate(-50%, -100%) scale(0.97)",
                          },
                        }}
                      >
                        B: Theo chỉ định
                      </Typography>
                    </Box>

                    {/* Horizontal brace for Block A (near rectangles, full width, label left) */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -60,
                        left: 0,
                        width: "55%", // matches width of A
                        height: 44,
                        pointerEvents: "none",
                      }}
                    >
                      <Box
                        component="svg"
                        viewBox="0 0 1000 200"
                        preserveAspectRatio="none"
                        sx={{ position: "absolute", inset: 0 }}
                      >
                        <path
                          d="M0 30 C110 30 110 5 220 5 C330 5 330 30 440 30 C550 30 550 5 660 5 C770 5 770 30 880 30 C940 30 940 30 1000 30"
                          stroke="#6366f1"
                          strokeWidth={8}
                          fill="none"
                          strokeLinecap="round"
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSegmentChange("rect_a");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSegmentChange("rect_a");
                          }
                        }}
                        sx={{
                          position: "absolute",
                          top: -4,
                          left: 0,
                          transform: "translateY(-100%)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          color: "#6366f1",
                          background: alpha(
                            theme.palette.background.paper,
                            0.85
                          ),
                          px: 1.2,
                          py: 0.5,
                          borderRadius: 1,
                          boxShadow: 1,
                          cursor: "pointer",
                          pointerEvents: "auto",
                          transition: "background .25s, transform .25s",
                          "&:hover": {
                            background: alpha(
                              theme.palette.background.paper,
                              0.95
                            ),
                            transform: "translateY(-110%) scale(1.03)",
                          },
                          "&:active": {
                            transform: "translateY(-100%) scale(0.97)",
                          },
                        }}
                      >
                        A: Duyệt kế toán
                      </Typography>
                    </Box>

                    {/* Horizontal brace for Blocks 3 & 4 (current month pending) */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -60,
                        left: "65%", // right side area inside B rectangle (30% offset + 35% overlap = 65%)
                        width: "35%", // width of segments 3 & 4 area
                        height: 44,
                        pointerEvents: "none",
                      }}
                    >
                      <Box
                        component="svg"
                        viewBox="0 0 1000 200"
                        preserveAspectRatio="none"
                        sx={{ position: "absolute", inset: 0 }}
                      >
                        <path
                          d="M0 30 C110 30 110 5 220 5 C330 5 330 30 440 30 C550 30 550 5 660 5 C770 5 770 30 880 30 C940 30 940 30 1000 30"
                          stroke={theme.palette.warning.main}
                          strokeWidth={8}
                          fill="none"
                          strokeLinecap="round"
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          top: -4,
                          left: "50%",
                          transform: "translate(-50%, -100%)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          color: theme.palette.warning.main,
                          background: alpha(
                            theme.palette.background.paper,
                            0.85
                          ),
                          px: 1.2,
                          py: 0.5,
                          borderRadius: 1,
                          boxShadow: 1,
                        }}
                      >
                        Chưa duyệt kế toán tháng này
                      </Typography>
                    </Box>
                  </>
                )}
                {/* Rectangle A */}
                <Box
                  onClick={() => handleSegmentChange("rect_a")}
                  sx={{
                    position: "absolute",
                    left: 0,
                    width: "55%",
                    height: "100%",
                    borderRadius: 3,
                    border: `2px solid #6366f1`,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all .35s",
                    opacity:
                      selectedSegment &&
                      !["rect_a", "s5", "s6"].includes(selectedSegment)
                        ? 0.1
                        : 1,
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 8px 24px -6px #6366f1aa",
                    },
                    ...getPreScaleStyle("rect_a"),
                  }}
                >
                  {/* A label */}
                  <Typography
                    sx={{
                      position: "absolute",
                      top: -28,
                      left: 16,
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#6366f1",
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      px: 1.5,
                      py: 0.4,
                      borderRadius: 1,
                      boxShadow: 1,
                      zIndex: 10,
                    }}
                  >
                    A. Duyệt kế toán: {VND.format(tongDuyetKeToan)}
                  </Typography>

                  {/* Part 5 - A only (left side) */}
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSegmentChange("s5");
                    }}
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "45%",
                      background: "#8b5cf6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.4s",
                      "&:hover": {
                        filter: "brightness(1.1)",
                      },
                      ...getPreScaleStyle("s5"),
                    }}
                  >
                    {/* Badge 5 */}
                    <Typography
                      sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        bgcolor: "rgba(0,0,0,0.35)",
                        px: 0.8,
                        py: "2px",
                        borderRadius: 1,
                      }}
                    >
                      5
                    </Typography>
                    <Box sx={{ textAlign: "center", color: "#fff", px: 1 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {VND.format(transferred)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.9, fontSize: 10 }}
                      >
                        Chuyển kỳ
                      </Typography>
                    </Box>

                    {/* Label 5 */}
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        top: -35,
                        left: "50%",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                        fontSize: 10,
                        color: theme.palette.text.primary,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        boxShadow: 1,
                      }}
                    >
                      5. Chỉ định tháng trước, duyệt KT tháng này
                    </Typography>
                  </Box>

                  {/* Rest of A (right side) */}
                  <Box
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "55%",
                      background: "#6366f1",
                    }}
                  />
                </Box>

                {/* Rectangle B */}
                <Box
                  onClick={() => handleSegmentChange("rect_b")}
                  sx={{
                    position: "absolute",
                    left: "30%",
                    right: 0,
                    height: "100%",
                    borderRadius: 3,
                    border: `2px solid #10b981`,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all .35s",
                    opacity:
                      selectedSegment &&
                      !["rect_b", "s6", "s3", "s4"].includes(selectedSegment)
                        ? 0.1
                        : 1,
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 8px 24px -6px #10b981aa",
                    },
                    ...getPreScaleStyle("rect_b"),
                  }}
                >
                  {/* B label */}
                  <Typography
                    sx={{
                      position: "absolute",
                      top: -28,
                      right: 16,
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#10b981",
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      px: 1.5,
                      py: 0.4,
                      borderRadius: 1,
                      boxShadow: 1,
                      zIndex: 10,
                    }}
                  >
                    B. Theo chỉ định: {VND.format(tongTheoChiDinh)}
                  </Typography>

                  {/* Part 6 - Overlap (left part of B) */}
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSegmentChange("s6");
                    }}
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "35%",
                      background: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.4s",
                      "&:hover": {
                        filter: "brightness(1.1)",
                      },
                      ...getPreScaleStyle("s6"),
                    }}
                  >
                    {/* Badge 6 */}
                    <Typography
                      sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        bgcolor: "rgba(0,0,0,0.35)",
                        px: 0.8,
                        py: "2px",
                        borderRadius: 1,
                      }}
                    >
                      6
                    </Typography>
                    <Stack spacing={0.3} sx={{ textAlign: "center" }}>
                      <CheckCircle
                        sx={{
                          color: "#fff",
                          fontSize: 28,
                          alignSelf: "center",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "#fff", fontSize: 10 }}
                      >
                        A ∩ B
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "#fff" }}
                      >
                        {VND.format(overlap)}
                      </Typography>
                    </Stack>

                    {/* Label 6 */}
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        bottom: -30,
                        left: "50%",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                        fontSize: 10,
                        color: theme.palette.text.primary,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        boxShadow: 1,
                      }}
                    >
                      6. Chỉ định trong tháng
                    </Typography>
                  </Box>

                  {/* Part 3 & 4 - B only (right side) */}
                  <Box
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "65%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Brace & label for blocks 3 & 4 (current month pending) */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -60,
                        left: 0,
                        width: "100%",
                        height: 48,
                        pointerEvents: "none",
                      }}
                    >
                      <Box
                        component="svg"
                        viewBox="0 0 1000 200"
                        preserveAspectRatio="none"
                        sx={{ position: "absolute", inset: 0 }}
                      >
                        <path
                          d="M0 38 C90 38 90 8 180 8 C270 8 270 38 360 38 C450 38 450 8 540 8 C630 8 630 38 720 38 C810 38 810 8 900 8 C950 8 950 38 1000 38"
                          stroke={theme.palette.warning.dark}
                          strokeWidth={7}
                          fill="none"
                          strokeLinecap="round"
                          opacity={0.9}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          top: -6,
                          left: "50%",
                          transform: "translate(-50%, -100%)",
                          fontWeight: 700,
                          letterSpacing: 0.3,
                          whiteSpace: "nowrap",
                          color: theme.palette.warning.dark,
                          background: alpha(
                            theme.palette.background.paper,
                            0.88
                          ),
                          px: 1.1,
                          py: 0.45,
                          borderRadius: 1,
                          boxShadow: 1,
                        }}
                      >
                        Chưa duyệt kế toán tháng này
                      </Typography>
                    </Box>
                    {/* Part 3 */}
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSegmentChange("s3");
                      }}
                      sx={{
                        flex: 1,
                        background: theme.palette.error.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.4s",
                        "&:hover": {
                          filter: "brightness(1.1)",
                        },
                        position: "relative",
                        ...getPreScaleStyle("s3"),
                      }}
                    >
                      <Typography
                        sx={{
                          position: "absolute",
                          top: 4,
                          left: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#fff",
                          bgcolor: "rgba(0,0,0,0.35)",
                          px: 0.8,
                          py: "2px",
                          borderRadius: 1,
                        }}
                      >
                        3
                      </Typography>
                      <Box sx={{ textAlign: "center", color: "#fff", px: 1 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {VND.format(chuaKT_ThangNay_RaVien)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.9, fontSize: 9 }}
                        >
                          Đã ra viện
                        </Typography>
                      </Box>

                      {/* Label 3 removed (covered by group brace) */}
                    </Box>

                    {/* Part 4 */}
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSegmentChange("s4");
                      }}
                      sx={{
                        flex: 1,
                        background: "#f59e0b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.4s",
                        "&:hover": {
                          filter: "brightness(1.1)",
                        },
                        position: "relative",
                        ...getPreScaleStyle("s4"),
                      }}
                    >
                      <Typography
                        sx={{
                          position: "absolute",
                          top: 4,
                          left: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#fff",
                          bgcolor: "rgba(0,0,0,0.35)",
                          px: 0.8,
                          py: "2px",
                          borderRadius: 1,
                        }}
                      >
                        4
                      </Typography>
                      <Box sx={{ textAlign: "center", color: "#333", px: 1 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {VND.format(chuaKT_ThangNay_ChuaRaVien)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.8, fontSize: 9 }}
                        >
                          Chưa ra viện
                        </Typography>
                      </Box>

                      {/* Label 4 removed (covered by group brace) */}
                    </Box>
                  </Box>
                </Box>

                {/* Origin marker line at 30% */}
                <Box
                  sx={{
                    position: "absolute",
                    left: "30%",
                    top: -8,
                    bottom: -8,
                    width: 2,
                    bgcolor: theme.palette.error.main,
                    opacity: 0.5,
                  }}
                />
              </Box>
            </Fade>

            {/* Highlighted segments for A, B, 3-6 */}
            {selectedSegment === "rect_a" && (
              <Box
                sx={{
                  ...getFlyAnimation("rect_a"),
                  width: compact ? 400 : 500,
                  height: 250,
                  borderRadius: 4,
                  border: `3px solid #6366f1`,
                  background: alpha("#fff", 0.95),
                  boxShadow: "0 20px 60px -10px #6366f1aa",
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6366f1",
                    background: "rgba(99,102,241,0.12)",
                    px: 0.9,
                    py: "2px",
                    borderRadius: 1,
                  }}
                >
                  A
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="#6366f1"
                  gutterBottom
                  sx={{ fontSize: { xs: 18, md: 20 } }}
                >
                  A. Duyệt kế toán
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  gutterBottom
                  sx={{ fontSize: { xs: 22, md: 26 } }}
                >
                  {VND.format(tongDuyetKeToan)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", mt: -0.5 }}
                >
                  Tổng giá trị được ghi nhận trong tháng này.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1">
                        5. Chỉ định tháng trước, duyệt KT tháng này:
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        color="#8b5cf6"
                      >
                        {VND.format(transferred)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1">
                        6. Chỉ định và duyệt trong tháng (A ∩ B):
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        color="#10b981"
                      >
                        {VND.format(overlap)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <IconButton
                  onClick={() => setSelectedSegment("")}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: "#6366f1",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}

            {selectedSegment === "rect_b" && (
              <Box
                sx={{
                  ...getFlyAnimation("rect_b"),
                  width: compact ? 400 : 500,
                  height: 300,
                  borderRadius: 4,
                  border: `3px solid #10b981`,
                  background: alpha("#fff", 0.95),
                  boxShadow: "0 20px 60px -10px #10b981aa",
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#10b981",
                    background: "rgba(16,185,129,0.12)",
                    px: 0.9,
                    py: "2px",
                    borderRadius: 1,
                  }}
                >
                  B
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="#10b981"
                  gutterBottom
                  sx={{ fontSize: { xs: 18, md: 20 } }}
                >
                  B. Theo chỉ định
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  gutterBottom
                  sx={{ fontSize: { xs: 22, md: 26 } }}
                >
                  {VND.format(tongTheoChiDinh)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", mt: -0.5 }}
                >
                  Tổng giá trị đã thực hiện trong tháng này.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1">
                        6. Chỉ định và duyệt trong tháng (A ∩ B):
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        color="#10b981"
                      >
                        {VND.format(overlap)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1">
                        3. Chưa duyệt KT (Đã ra viện):
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        color="#f59e0b"
                      >
                        {VND.format(chuaKT_ThangNay_RaVien)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1">
                        4. Chưa duyệt KT (Chưa ra viện):
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        color="#fbbf24"
                      >
                        {VND.format(chuaKT_ThangNay_ChuaRaVien)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <IconButton
                  onClick={() => setSelectedSegment("")}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: "#10b981",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}

            {selectedSegment === "s3" && (
              <Box
                sx={{
                  ...getFlyAnimation("s3"),
                  width: compact ? 280 : 320,
                  height: 180,
                  borderRadius: 3,
                  background: theme.palette.error.main,
                  border: `3px solid ${theme.palette.error.main}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 20px 60px -10px ${theme.palette.error.main}aa`,
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(0,0,0,0.25)",
                    px: 0.9,
                    py: "2px",
                    borderRadius: 1,
                  }}
                >
                  3
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="#fff"
                  gutterBottom
                  sx={{ fontSize: { xs: 20, md: 22 } }}
                >
                  {VND.format(chuaKT_ThangNay_RaVien)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="#fff"
                  sx={{ opacity: 0.92, fontWeight: 600, textAlign: "center" }}
                >
                  Chỉ định tháng này chưa duyệt KT (Đã ra viện)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.6,
                    color: "#fff",
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  Giá trị đã làm tháng hiện tại, chưa được ghi nhận.
                </Typography>
                <IconButton
                  onClick={() => setSelectedSegment("")}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: "#fff",
                    bgcolor: alpha("#fff", 0.2),
                    "&:hover": { bgcolor: alpha("#fff", 0.3) },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}

            {selectedSegment === "s4" && (
              <Box
                sx={{
                  ...getFlyAnimation("s4"),
                  width: compact ? 280 : 320,
                  height: 180,
                  borderRadius: 3,
                  background: "#f59e0b",
                  border: "3px solid #f59e0b",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px -10px #f59e0baa",
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(0,0,0,0.25)",
                    px: 0.9,
                    py: "2px",
                    borderRadius: 1,
                  }}
                >
                  4
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="#fff"
                  gutterBottom
                  sx={{ fontSize: { xs: 20, md: 22 } }}
                >
                  {VND.format(chuaKT_ThangNay_ChuaRaVien)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="#fff"
                  sx={{ opacity: 0.92, fontWeight: 600, textAlign: "center" }}
                >
                  Chỉ định tháng này chưa duyệt KT (Chưa ra viện)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.6,
                    color: "#fff",
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  Giá trị đã làm tháng hiện tại, chưa được ghi nhận.
                </Typography>
                <IconButton
                  onClick={() => setSelectedSegment("")}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: "#333",
                    bgcolor: alpha("#000", 0.1),
                    "&:hover": { bgcolor: alpha("#000", 0.2) },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}

            {selectedSegment === "s5" && (
              <Box
                sx={{
                  ...getFlyAnimation("s5"),
                  width: compact ? 280 : 320,
                  height: 180,
                  borderRadius: 3,
                  background: "#8b5cf6",
                  border: "3px solid #8b5cf6",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px -10px #8b5cf6aa",
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(0,0,0,0.25)",
                    px: 0.9,
                    py: "2px",
                    borderRadius: 1,
                  }}
                >
                  5
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="#fff"
                  gutterBottom
                  sx={{ fontSize: { xs: 20, md: 22 } }}
                >
                  {VND.format(transferred)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="#fff"
                  sx={{ opacity: 0.92, fontWeight: 600, textAlign: "center" }}
                >
                  Chỉ định tháng trước, duyệt KT tháng này
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.6,
                    color: "#fff",
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  Giá trị đã làm tháng trước, tháng này mới ghi nhận.
                </Typography>
                <IconButton
                  onClick={() => setSelectedSegment("")}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: "#fff",
                    bgcolor: alpha("#fff", 0.2),
                    "&:hover": { bgcolor: alpha("#fff", 0.3) },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}

            {selectedSegment === "s6" && (
              <Box
                sx={{
                  ...getFlyAnimation("s6"),
                  width: compact ? 280 : 320,
                  height: 180,
                  borderRadius: 3,
                  background: "#10b981",
                  border: "3px solid #10b981",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px -10px #10b981aa",
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: 10,
                    left: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(0,0,0,0.25)",
                    px: 0.9,
                    py: "2px",
                    borderRadius: 1,
                  }}
                >
                  6
                </Typography>
                <CheckCircle sx={{ color: "#fff", fontSize: 48, mb: 1 }} />
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="#fff"
                  gutterBottom
                  sx={{ fontSize: { xs: 20, md: 22 } }}
                >
                  {VND.format(overlap)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="#fff"
                  sx={{ opacity: 0.92, fontWeight: 600, textAlign: "center" }}
                >
                  Chỉ định trong tháng (A ∩ B)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.6,
                    color: "#fff",
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  Giá trị đã làm tháng này, đã được ghi nhận.
                </Typography>
                <IconButton
                  onClick={() => setSelectedSegment("")}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: "#fff",
                    bgcolor: alpha("#fff", 0.2),
                    "&:hover": { bgcolor: alpha("#fff", 0.3) },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        {/* Điều khiển tỷ lệ chuyển đổi dự kiến (đặt trong vùng cuộn) */}
        <Box sx={{ px: compact ? 3 : 5, pt: 1.5, pb: 1 }}>
          <Accordion
            disableGutters
            sx={{
              background: alpha(theme.palette.background.paper, 0.4),
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              borderRadius: 2,
              boxShadow: "0 4px 18px -6px rgba(0,0,0,0.25)",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                  gap: 2,
                },
                py: 1.2,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Tùy chỉnh tỷ lệ chuyển đổi dự kiến
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hiện tại: {conversionRate}% → Dự kiến:{" "}
                {VND.format(predictedApproved)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
                sx={{ mb: 1.5 }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, minWidth: 210 }}
                  color="text.secondary"
                >
                  Tỷ lệ (%)
                </Typography>
                <Slider
                  value={conversionRate}
                  min={0}
                  max={300}
                  step={1}
                  onChange={(e, v) => setConversionRate(clampRate(v))}
                  sx={{ flex: 1 }}
                  valueLabelDisplay="auto"
                  color="info"
                />
                <TextField
                  label="%"
                  size="small"
                  type="number"
                  value={conversionRate}
                  onChange={handleRateInput}
                  inputProps={{ min: 0, max: 300 }}
                  sx={{ width: 90 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setConversionRate(100)}
                  startIcon={<ReplayIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    px: 1.6,
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(90deg,#0284c7,#0ea5e9)"
                        : "linear-gradient(90deg,#0ea5e9,#38bdf8)",
                    boxShadow: "0 4px 12px -2px rgba(14,165,233,0.45)",
                    "&:hover": {
                      background: (theme) =>
                        theme.palette.mode === "dark"
                          ? "linear-gradient(90deg,#0369a1,#0284c7)"
                          : "linear-gradient(90deg,#0891b2,#0ea5e9)",
                    },
                  }}
                >
                  Reset 100%
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                Công thức: A + (Tỷ lệ * (1+2+3+4)). Sử dụng để mô phỏng doanh
                thu duyệt kế toán tiềm năng.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: compact ? 3 : 5,
            py: 2,
            background: alpha(theme.palette.background.paper, 0.3),
            backdropFilter: "blur(12px)",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            alignItems: "center",
            opacity: selectedSegment ? 0.3 : 1,
            transition: "opacity 0.4s",
          }}
        >
          <FooterStat
            label="Tổng giá trị BV đã thực hiện (1→6)"
            value={VND.format(totalHospital)}
            color="#6366f1"
          />
          <FooterStat
            label="Tổng chưa duyệt"
            value={VND.format(totalOldPending + totalCurrentPending)}
            color="#f59e0b"
          />
          <FooterStat
            label="Hiệu suất xử lý (6/B)"
            value={`${(tongTheoChiDinh
              ? (overlap / tongTheoChiDinh) * 100
              : 0
            ).toFixed(1)}%`}
            color="#10b981"
          />
          <FooterStat
            label="Tỷ lệ chuyển kỳ (5/A)"
            value={`${(tongDuyetKeToan
              ? (transferred / tongDuyetKeToan) * 100
              : 0
            ).toFixed(1)}%`}
            color="#8b5cf6"
          />
          <FooterStat
            label="Tổng 3 khoa (1006,127,75) - đã ra viện TTrước"
            value={VND.format(tongTien3Khoa_RaVien_ThangTruoc)}
            color="#6366f1"
          />
          <FooterStat
            label={`Dự kiến doanh thu duyệt KT (${conversionRate}% x (1→4) + A)`}
            value={VND.format(predictedApproved)}
            color="#0ea5e9"
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            onClick={onClose}
            sx={{ textTransform: "none" }}
          >
            Đóng
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const FooterStat = ({ label, value, color }) => (
  <Stack direction="row" spacing={1.1} alignItems="center">
    <Box
      sx={{
        width: 8,
        height: 42,
        borderRadius: 2,
        background: `linear-gradient(180deg,${color},${color}55)`,
        boxShadow: `0 4px 14px -4px ${color}AA`,
      }}
    />
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

export default ChiSoSummaryForm;
