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
  ToggleButtonGroup,
  ToggleButton,
  Button,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircle from "@mui/icons-material/CheckCircle";

const ChiSoSummaryForm = ({ open, onClose, metrics = {}, currentDay }) => {
  const theme = useTheme();
  const compact = useMediaQuery("(max-width:1280px)");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  const VND = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const {
    tongDuyetKeToan = 0,
    tongTheoChiDinh = 0,
    chuaKT_ThangTruoc_RaVien = 0,
    chuaKT_ThangTruoc_ChuaRaVien = 0,
    chuaKT_ThangNay_RaVien = 0,
    chuaKT_ThangNay_ChuaRaVien = 0,
  } = metrics;

  const totalOldPending = chuaKT_ThangTruoc_RaVien + chuaKT_ThangTruoc_ChuaRaVien;
  const totalCurrentPending = chuaKT_ThangNay_RaVien + chuaKT_ThangNay_ChuaRaVien;
  let overlap = tongTheoChiDinh - totalCurrentPending;
  if (overlap < 0) overlap = 0;
  let transferred = tongDuyetKeToan - overlap;
  if (transferred < 0) transferred = 0;

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

  // Handle segment change with transition
  const handleSegmentChange = (newSegment) => {
    if (newSegment === selectedSegment) {
      setSelectedSegment("");
      return;
    }

    if (selectedSegment && newSegment) {
      // Transition through empty state first
      setIsTransitioning(true);
      setSelectedSegment("");
      setTimeout(() => {
        setSelectedSegment(newSegment);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 300);
    } else {
      setSelectedSegment(newSegment);
    }
  };

  const segments = [
    {
      id: "s1",
      number: "1",
      label: "Chưa duyệt KT tháng trước (Đã ra viện)",
      value: chuaKT_ThangTruoc_RaVien,
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

  const getSeg = (id) => segments.find((s) => s.id === id);

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

        {/* Header */}
        <Box
          sx={{
            p: compact ? 3 : 5,
            pb: 3,
            background: alpha(theme.palette.background.paper, 0.35),
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            opacity: selectedSegment ? 0.3 : 1,
            transition: "opacity 0.4s",
          }}
        >
          <Typography
            variant={compact ? "h4" : "h3"}
            sx={{
              fontWeight: 800,
              background:
                "linear-gradient(90deg,#6366f1 0%,#8b5cf6 30%,#10b981 60%,#f59e0b 90%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 1,
            }}
          >
            Phân tích dòng doanh thu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ngày báo cáo: {currentDay || new Date().getDate()}/
            {new Date().getMonth() + 1}/{new Date().getFullYear()}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Highlight Controls */}
          <Box sx={{ px: compact ? 2.5 : 5, pt: 2, pb: 1, opacity: selectedSegment ? 0.3 : 1, transition: "opacity 0.4s" }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                background: alpha(theme.palette.background.paper, 0.55),
                backdropFilter: "blur(12px)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Click để xem chi tiết:
              </Typography>
              <ToggleButtonGroup
                value={selectedSegment}
                exclusive
                onChange={(e, v) => handleSegmentChange(v || "")}
                size="small"
                sx={{ flexWrap: "wrap", gap: 0.5 }}
              >
                <ToggleButton value="" sx={{ textTransform: "none" }}>
                  Xem tổng quan
                </ToggleButton>
                <ToggleButton value="rect_a" sx={{ textTransform: "none" }}>
                  Khối A
                </ToggleButton>
                <ToggleButton value="rect_b" sx={{ textTransform: "none" }}>
                  Khối B
                </ToggleButton>
                {segments.filter((s) => s.number).map((s) => (
                  <ToggleButton
                    key={s.id}
                    value={s.id}
                    sx={{ textTransform: "none" }}
                  >
                    {s.number}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Paper>
          </Box>

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
                    <line x1="25%" x2="25%" y1="72%" y2="78%" stroke={theme.palette.text.secondary} />
                    <text x="25%" y="82%" textAnchor="middle" fill={theme.palette.text.secondary} fontSize="11">
                      Tháng trước
                    </text>

                    <line x1="50%" x2="50%" y1="70%" y2="80%" stroke={theme.palette.text.primary} strokeWidth="3" />
                    <text x="50%" y="85%" textAnchor="middle" fill={theme.palette.text.primary} fontSize="12" fontWeight="600">
                      01/{new Date().getMonth() + 1}
                    </text>

                    <line x1="75%" x2="75%" y1="72%" y2="78%" stroke={theme.palette.text.secondary} />
                    <text x="75%" y="82%" textAnchor="middle" fill={theme.palette.text.secondary} fontSize="11">
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
                {/* Block 1 */}
                <Box
                  onClick={() => handleSegmentChange("s1")}
                  sx={{
                    position: "relative",
                    height: "48%",
                    mb: "4%",
                    borderRadius: 2,
                    background: "#6366f1",
                    border: "2px solid #6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                    opacity: selectedSegment && selectedSegment !== "s1" ? 0.1 : 1,
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 8px 24px -4px #6366f1aa",
                    },
                  }}
                >
                  <Box sx={{ textAlign: "center", color: "#fff", px: 1 }}>
                    <Typography variant="body1" fontWeight={700}>
                      {VND.format(chuaKT_ThangTruoc_RaVien)}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 11 }}>
                      Đã ra viện
                    </Typography>
                  </Box>

                  {/* Label */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      left: -8,
                      top: "50%",
                      transform: "translate(-100%, -50%)",
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
                    1. Chưa duyệt KT tháng trước (ĐRV)
                  </Typography>
                </Box>

                {/* Block 2 */}
                <Box
                  onClick={() => handleSegmentChange("s2")}
                  sx={{
                    position: "relative",
                    height: "48%",
                    borderRadius: 2,
                    background: "#818cf8",
                    border: "2px solid #818cf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                    opacity: selectedSegment && selectedSegment !== "s2" ? 0.1 : 1,
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 8px 24px -4px #818cf8aa",
                    },
                  }}
                >
                  <Box sx={{ textAlign: "center", color: "#fff", px: 1 }}>
                    <Typography variant="body1" fontWeight={700}>
                      {VND.format(chuaKT_ThangTruoc_ChuaRaVien)}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 11 }}>
                      Chưa ra viện
                    </Typography>
                  </Box>

                  {/* Label */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      left: -8,
                      top: "50%",
                      transform: "translate(-100%, -50%)",
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
                    2. Chưa duyệt KT tháng trước (CRV)
                  </Typography>
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
                  background: "#6366f1",
                  border: "3px solid #6366f1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px -10px #6366f1aa",
                }}
              >
                <Typography variant="h4" fontWeight={700} color="#fff" gutterBottom>
                  {VND.format(chuaKT_ThangTruoc_RaVien)}
                </Typography>
                <Typography variant="subtitle1" color="#fff" sx={{ opacity: 0.9 }}>
                  Chưa duyệt KT tháng trước (Đã ra viện)
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

            {/* Highlighted Block 2 */}
            {selectedSegment === "s2" && (
              <Box
                sx={{
                  ...getFlyAnimation("s2"),
                  width: compact ? 280 : 320,
                  height: 180,
                  borderRadius: 3,
                  background: "#818cf8",
                  border: "3px solid #818cf8",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px -10px #818cf8aa",
                }}
              >
                <Typography variant="h4" fontWeight={700} color="#fff" gutterBottom>
                  {VND.format(chuaKT_ThangTruoc_ChuaRaVien)}
                </Typography>
                <Typography variant="subtitle1" color="#fff" sx={{ opacity: 0.9 }}>
                  Chưa duyệt KT tháng trước (Chưa ra viện)
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
                    opacity: selectedSegment && !["rect_a", "s5", "s6"].includes(selectedSegment) ? 0.1 : 1,
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 8px 24px -6px #6366f1aa",
                    },
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
                    }}
                  >
                    <Box sx={{ textAlign: "center", color: "#fff", px: 1 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {VND.format(transferred)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 10 }}>
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
                    opacity: selectedSegment && !["rect_b", "s6", "s3", "s4"].includes(selectedSegment) ? 0.1 : 1,
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 8px 24px -6px #10b981aa",
                    },
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
                    }}
                  >
                    <Stack spacing={0.3} sx={{ textAlign: "center" }}>
                      <CheckCircle sx={{ color: "#fff", fontSize: 28, alignSelf: "center" }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "#fff", fontSize: 10 }}>
                        A ∩ B
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff" }}>
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
                    {/* Part 3 */}
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSegmentChange("s3");
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
                      }}
                    >
                      <Box sx={{ textAlign: "center", color: "#fff", px: 1 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {VND.format(chuaKT_ThangNay_RaVien)}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 9 }}>
                          Đã RV
                        </Typography>
                      </Box>

                      {/* Label 3 */}
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          right: -8,
                          top: "25%",
                          transform: "translate(100%, -50%)",
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
                        3. Chỉ định tháng này chưa duyệt KT (ĐRV)
                      </Typography>
                    </Box>

                    {/* Part 4 */}
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSegmentChange("s4");
                      }}
                      sx={{
                        flex: 1,
                        background: "#fbbf24",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.4s",
                        "&:hover": {
                          filter: "brightness(1.1)",
                        },
                      }}
                    >
                      <Box sx={{ textAlign: "center", color: "#333", px: 1 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {VND.format(chuaKT_ThangNay_ChuaRaVien)}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: 9 }}>
                          Chưa RV
                        </Typography>
                      </Box>

                      {/* Label 4 */}
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          right: -8,
                          top: "75%",
                          transform: "translate(100%, -50%)",
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
                        4. Chỉ định tháng này chưa duyệt KT (CRV)
                      </Typography>
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
                <Typography variant="h5" fontWeight={700} color="#6366f1" gutterBottom>
                  A. Duyệt kế toán
                </Typography>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {VND.format(tongDuyetKeToan)}
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body1">5. Chỉ định tháng trước, duyệt KT tháng này:</Typography>
                      <Typography variant="body1" fontWeight={700} color="#8b5cf6">
                        {VND.format(transferred)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body1">6. Chỉ định trong tháng (A ∩ B):</Typography>
                      <Typography variant="body1" fontWeight={700} color="#10b981">
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
                <Typography variant="h5" fontWeight={700} color="#10b981" gutterBottom>
                  B. Theo chỉ định
                </Typography>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {VND.format(tongTheoChiDinh)}
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body1">6. Chỉ định trong tháng (A ∩ B):</Typography>
                      <Typography variant="body1" fontWeight={700} color="#10b981">
                        {VND.format(overlap)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body1">3. Chưa duyệt KT (Đã ra viện):</Typography>
                      <Typography variant="body1" fontWeight={700} color="#f59e0b">
                        {VND.format(chuaKT_ThangNay_RaVien)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body1">4. Chưa duyệt KT (Chưa ra viện):</Typography>
                      <Typography variant="body1" fontWeight={700} color="#fbbf24">
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
                  background: "#f59e0b",
                  border: "3px solid #f59e0b",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px -10px #f59e0baa",
                }}
              >
                <Typography variant="h4" fontWeight={700} color="#fff" gutterBottom>
                  {VND.format(chuaKT_ThangNay_RaVien)}
                </Typography>
                <Typography variant="subtitle1" color="#fff" sx={{ opacity: 0.9 }}>
                  Chỉ định tháng này chưa duyệt KT (Đã ra viện)
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
                  background: "#fbbf24",
                  border: "3px solid #fbbf24",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px -10px #fbbf24aa",
                }}
              >
                <Typography variant="h4" fontWeight={700} color="#333" gutterBottom>
                  {VND.format(chuaKT_ThangNay_ChuaRaVien)}
                </Typography>
                <Typography variant="subtitle1" color="#333" sx={{ opacity: 0.9 }}>
                  Chỉ định tháng này chưa duyệt KT (Chưa ra viện)
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
                <Typography variant="h4" fontWeight={700} color="#fff" gutterBottom>
                  {VND.format(transferred)}
                </Typography>
                <Typography variant="subtitle1" color="#fff" sx={{ opacity: 0.9 }}>
                  Chỉ định tháng trước, duyệt KT tháng này
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
                <CheckCircle sx={{ color: "#fff", fontSize: 48, mb: 1 }} />
                <Typography variant="h4" fontWeight={700} color="#fff" gutterBottom>
                  {VND.format(overlap)}
                </Typography>
                <Typography variant="subtitle1" color="#fff" sx={{ opacity: 0.9 }}>
                  Chỉ định trong tháng (A ∩ B)
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
            label="Tổng chưa duyệt"
            value={VND.format(totalOldPending + totalCurrentPending)}
            color="#f59e0b"
          />
          <FooterStat
            label="Hiệu suất xử lý (6/B)"
            value={`${(tongTheoChiDinh ? (overlap / tongTheoChiDinh) * 100 : 0).toFixed(1)}%`}
            color="#10b981"
          />
          <FooterStat
            label="Tỷ lệ chuyển kỳ (5/A)"
            value={`${(tongDuyetKeToan ? (transferred / tongDuyetKeToan) * 100 : 0).toFixed(1)}%`}
            color="#8b5cf6"
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