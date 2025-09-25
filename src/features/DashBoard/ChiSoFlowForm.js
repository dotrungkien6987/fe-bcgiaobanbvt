import React, { useMemo, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  LinearProgress,
  Grid,
  alpha,
  useTheme,
  Button,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  Zoom,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalance from "@mui/icons-material/AccountBalance";
import ReceiptLong from "@mui/icons-material/ReceiptLong";
import TrendingUp from "@mui/icons-material/TrendingUp";
import WarningAmber from "@mui/icons-material/WarningAmber";
import CheckCircle from "@mui/icons-material/CheckCircle";
import AccessTime from "@mui/icons-material/AccessTime";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

// Transition phase delays
const phaseDelays = [200, 600, 1050, 1500];

const ChiSoFlowForm = ({ open, onClose, metrics = {}, currentDay }) => {
  const theme = useTheme();
  const compact = useMediaQuery("(max-width:1280px)");
  const [step, setStep] = useState(0);
  const [activeNode, setActiveNode] = useState("");
  // NEW: tab + timeline highlight state
  const [tabValue, setTabValue] = useState(0); // 0 = Flow Dashboard (cũ), 1 = Timeline Diagram (mới)
  const [selectedSegment, setSelectedSegment] = useState("");

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

  const totalOldPending =
    chuaKT_ThangTruoc_RaVien + chuaKT_ThangTruoc_ChuaRaVien;
  const totalCurrentPending =
    chuaKT_ThangNay_RaVien + chuaKT_ThangNay_ChuaRaVien;

  let overlap = tongTheoChiDinh - totalCurrentPending;
  if (overlap < 0) overlap = 0;
  let transferred = tongDuyetKeToan - overlap;
  if (transferred < 0) transferred = 0;

  useEffect(() => {
    if (open) {
      setStep(0);
      const timers = phaseDelays.map((d, i) =>
        setTimeout(() => setStep(i + 1), d)
      );
      return () => timers.forEach(clearTimeout);
    } else {
      setActiveNode("");
    }
  }, [open]);

  const nodes = [
    {
      id: "old_pending",
      title: "Chỉ định tháng trước",
      subtitle: "Chưa duyệt",
      value: totalOldPending,
      detail: [
        {
          label: "Đã ra viện",
          val: chuaKT_ThangTruoc_RaVien,
          color: "#3b82f6",
        },
        {
          label: "Chưa ra viện",
          val: chuaKT_ThangTruoc_ChuaRaVien,
          color: "#60a5fa",
        },
      ],
      color: "#6366f1",
      icon: <AccessTime />,
      info: "Dịch vụ phát sinh tháng trước chưa được duyệt trong kỳ hiện tại.",
    },
    {
      id: "transferred",
      title: "Chuyển kỳ",
      subtitle: "Duyệt tháng này",
      value: transferred,
      color: "#8b5cf6",
      icon: <TrendingUp />,
      info: "Doanh thu của các chỉ định tháng trước được duyệt trong tháng này.",
    },
    {
      id: "overlap",
      title: "Hoàn thành trong tháng",
      subtitle: "Chỉ định & duyệt",
      value: overlap,
      color: "#10b981",
      icon: <CheckCircle />,
      highlight: true,
      info: "Dịch vụ phát sinh và duyệt ngay trong cùng tháng.",
    },
    {
      id: "current_pending",
      title: "Chỉ định tháng này",
      subtitle: "Chưa duyệt",
      value: totalCurrentPending,
      detail: [
        { label: "Đã ra viện", val: chuaKT_ThangNay_RaVien, color: "#d97706" },
        {
          label: "Chưa ra viện",
          val: chuaKT_ThangNay_ChuaRaVien,
          color: "#fbbf24",
          dark: true,
        },
      ],
      color: "#f59e0b",
      icon: <WarningAmber />,
      info: "Chỉ định trong tháng chưa duyệt – sẽ chuyển sang đã duyệt khi hoàn tất.",
    },
  ];

  const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : "0.0");

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
          overflow: "hidden",
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
            zIndex: 20,
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
            p: 5,
            pb: 3,
            zIndex: 5,
            background: alpha(theme.palette.background.paper, 0.35),
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background:
                "linear-gradient(90deg,#6366f1 0%,#8b5cf6 30%,#10b981 60%,#f59e0b 90%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 1,
              letterSpacing: ".5px",
            }}
          >
            Dòng doanh thu tháng {new Date().getMonth() + 1}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ngày báo cáo: {currentDay || new Date().getDate()}/
            {new Date().getMonth() + 1}/{new Date().getFullYear()}
          </Typography>
        </Box>
        {/* Tabs chọn chế độ hiển thị */}
        <Box
          sx={{
            px: 5,
            pt: 1,
            pb: 0.5,
            bgcolor: alpha(theme.palette.background.paper, 0.25),
            backdropFilter: "blur(10px)",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, v) => {
              setTabValue(v);
              setSelectedSegment("");
              setActiveNode("");
            }}
            variant="standard"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minWidth: 160,
              },
            }}
          >
            <Tab label="Flow Dashboard" />
            <Tab label="Timeline Diagram" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <>
            {/* KPI strip */}
            <Box sx={{ px: compact ? 3 : 5, pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <KpiCard
                    icon={<AccountBalance />}
                    label="Đã duyệt kế toán"
                    value={tongDuyetKeToan}
                    mainColor="#6366f1"
                    accent="#8b5cf6"
                    subLabel={`Trong tháng duyệt ngay: ${pct(
                      overlap,
                      tongDuyetKeToan
                    )}%`}
                    progress={
                      tongDuyetKeToan ? (overlap / tongDuyetKeToan) * 100 : 0
                    }
                    VND={VND}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <KpiCard
                    icon={<ReceiptLong />}
                    label="Theo chỉ định"
                    value={tongTheoChiDinh}
                    mainColor="#10b981"
                    accent="#f59e0b"
                    subLabel={`Chưa duyệt: ${pct(
                      totalCurrentPending,
                      tongTheoChiDinh
                    )}%`}
                    progress={
                      tongTheoChiDinh
                        ? (totalCurrentPending / tongTheoChiDinh) * 100
                        : 0
                    }
                    invert
                    VND={VND}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Flow area (giữ nguyên) */}
            <Box
              sx={{
                flex: 1,
                position: "relative",
                mt: 3,
                mb: 4,
                px: compact ? 3 : 5,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.25,
                  background:
                    "radial-gradient(circle at 70% 30%,#6366f144,transparent 70%)",
                }}
              />
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 4,
                  flexWrap: "nowrap",
                }}
              >
                {nodes.map((n, idx) => {
                  const show = step >= idx + 1;
                  return (
                    <FlowNode
                      key={n.id}
                      node={n}
                      show={show}
                      active={activeNode === n.id}
                      compact={compact}
                      onClick={() =>
                        setActiveNode((p) => (p === n.id ? "" : n.id))
                      }
                      VND={VND}
                    />
                  );
                })}
              </Box>
              <svg
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  mixBlendMode: "screen",
                }}
              >
                {step >= 2 && (
                  <>
                    <FlowPath
                      d="M12% 55% C 22% 35%, 30% 35%, 40% 55%"
                      stroke="url(#grad1)"
                    />
                    <FlowPath
                      d="M40% 55% C 50% 30%, 58% 30%, 66% 55%"
                      stroke="url(#grad2)"
                    />
                    <FlowPath
                      d="M66% 55% C 74% 35%, 82% 35%, 90% 55%"
                      stroke="url(#grad3)"
                    />
                    <defs>
                      <linearGradient id="grad1">
                        <stop
                          offset="0%"
                          stopColor="#6366f1"
                          stopOpacity="0.1"
                        />
                        <stop
                          offset="50%"
                          stopColor="#8b5cf6"
                          stopOpacity="0.5"
                        />
                        <stop
                          offset="100%"
                          stopColor="#8b5cf6"
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                      <linearGradient id="grad2">
                        <stop
                          offset="0%"
                          stopColor="#8b5cf6"
                          stopOpacity="0.1"
                        />
                        <stop
                          offset="50%"
                          stopColor="#10b981"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                      <linearGradient id="grad3">
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity="0.1"
                        />
                        <stop
                          offset="50%"
                          stopColor="#f59e0b"
                          stopOpacity="0.5"
                        />
                        <stop
                          offset="100%"
                          stopColor="#f59e0b"
                          stopOpacity="0.15"
                        />
                      </linearGradient>
                    </defs>
                  </>
                )}
              </svg>
              {activeNode && (
                <DetailPanel
                  node={nodes.find((x) => x.id === activeNode)}
                  VND={VND}
                  onClose={() => setActiveNode("")}
                />
              )}
            </Box>
          </>
        )}

        {tabValue === 1 && (
          <TimelineDiagramTab
            metrics={metrics}
            VND={VND}
            currentDay={currentDay}
            selectedSegment={selectedSegment}
            setSelectedSegment={setSelectedSegment}
            compact={compact}
          />
        )}

        {/* Footer stats */}
        <Box
          sx={{
            px: compact ? 3 : 5,
            py: 2.5,
            background: alpha(theme.palette.background.paper, 0.3),
            backdropFilter: "blur(12px)",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Grid container spacing={2}>
            <Stat
              label="Hiệu suất duyệt"
              color="#10b981"
              value={`${pct(overlap, tongTheoChiDinh)}%`}
            />
            <Stat
              label="Chuyển kỳ"
              color="#8b5cf6"
              value={`${pct(transferred, tongDuyetKeToan)}%`}
            />
            <Stat
              label="Chỉ định chưa duyệt"
              color="#f59e0b"
              value={VND.format(totalOldPending + totalCurrentPending)}
            />
            <Stat
              label="Ngày báo cáo"
              color="#6366f1"
              value={`${currentDay || new Date().getDate()}/${
                new Date().getMonth() + 1
              }`}
            />
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const FlowNode = ({ node, show, active, onClick, VND }) => {
  const scale = active ? 1.1 : 1;
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        width: node.highlight ? 190 : 160,
        height: node.highlight ? 190 : 160,
        opacity: show ? 1 : 0,
        transform: show ? `scale(${scale})` : "scale(0.4)",
        transition:
          "opacity .6s cubic-bezier(.4,0,.2,1), transform .6s cubic-bezier(.4,0,.2,1)",
        cursor: "pointer",
      }}
    >
      <Paper
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 25%,rgba(255,255,255,.1),rgba(255,255,255,.02))`,
          border: `3px solid ${node.color}`,
          boxShadow: active
            ? `0 0 0 4px rgba(255,255,255,.15),0 12px 36px -8px ${node.color}AA`
            : `0 0 0 2px ${node.color}55,0 10px 28px -10px ${node.color}99`,
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          color: "#fff",
          transition: "all .45s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <Box
          sx={{ fontSize: 40, display: "flex", alignItems: "center", mb: 1 }}
        >
          {node.icon}
        </Box>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            textAlign: "center",
            lineHeight: 1.15,
            fontWeight: 600,
            letterSpacing: 0.3,
            textShadow: "0 1px 2px #000",
          }}
        >
          {node.title}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            mt: 0.6,
            fontWeight: 700,
            fontSize: 15,
            textShadow: "0 1px 2px #0008",
          }}
        >
          {VND.format(node.value)}
        </Typography>
        {node.subtitle && (
          <Chip
            label={node.subtitle}
            size="small"
            sx={{
              mt: 1,
              fontWeight: 600,
              bgcolor: "rgba(0,0,0,0.25)",
              color: "#fff",
              backdropFilter: "blur(4px)",
            }}
          />
        )}
        {node.detail && (
          <Stack spacing={0.4} sx={{ mt: 1.2, px: 1.2, width: "100%" }}>
            {node.detail.map((d) => (
              <Typography
                key={d.label}
                variant="caption"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  fontSize: 10.5,
                  opacity: 0.9,
                }}
              >
                <span>{d.label}</span>
                <span style={{ color: d.color }}>{VND.format(d.val)}</span>
              </Typography>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

const DetailPanel = ({ node, VND, onClose }) => {
  if (!node) return null;
  return (
    <Paper
      sx={{
        position: "absolute",
        left: "50%",
        bottom: 32,
        transform: "translateX(-50%)",
        width: 440,
        px: 3.5,
        py: 3,
        borderRadius: 4,
        background:
          "linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))",
        backdropFilter: "blur(16px)",
        border: `1px solid ${node.color}77`,
        boxShadow: `0 10px 40px -10px ${node.color}B0`,
        color: "#fff",
      }}
    >
      <Stack direction="row" justifyContent="space-between" mb={1.5}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: node.color,
              boxShadow: `0 0 0 4px ${node.color}44`,
            }}
          />
          {node.title}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {VND.format(node.value)}{" "}
        {node.subtitle && (
          <Chip
            label={node.subtitle}
            size="small"
            sx={{
              ml: 1,
              bgcolor: `${node.color}22`,
              color: node.color,
              fontWeight: 600,
            }}
          />
        )}
      </Typography>
      {node.detail && (
        <Stack spacing={0.6} mb={1.5}>
          {node.detail.map((d) => (
            <Typography
              key={d.label}
              variant="body2"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span>{d.label}</span>
              <span style={{ color: d.color, fontWeight: 600 }}>
                {VND.format(d.val)}
              </span>
            </Typography>
          ))}
        </Stack>
      )}
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        <InfoOutlined sx={{ fontSize: 18, mt: "2px", color: node.color }} />
        <Typography
          variant="caption"
          sx={{ lineHeight: 1.4, fontSize: 12.5, opacity: 0.9 }}
        >
          {node.info}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1.5} mt={2}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ textTransform: "none", borderColor: "#ffffff55" }}
        >
          Đóng
        </Button>
      </Stack>
    </Paper>
  );
};

const KpiCard = ({
  icon,
  label,
  value,
  subLabel,
  progress,
  mainColor,
  accent,
  invert,
  VND,
}) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 4,
      position: "relative",
      overflow: "hidden",
      background: invert
        ? `linear-gradient(135deg,${accent} 0%, ${mainColor} 100%)`
        : `linear-gradient(135deg,${mainColor} 0%, ${accent} 100%)`,
      color: "#fff",
      boxShadow: `0 10px 26px -8px ${mainColor}99`,
    }}
  >
    <Box sx={{ position: "absolute", inset: 0, opacity: 0.15 }}>
      <Box
        sx={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          top: -60,
          right: -60,
          bgcolor: "rgba(255,255,255,0.15)",
        }}
      />
    </Box>
    <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: "rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px -4px #0008",
        }}
      >
        {React.cloneElement(icon, { fontSize: "medium" })}
      </Box>
      <Box>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, letterSpacing: 0.5, opacity: 0.9 }}
        >
          {label}
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, lineHeight: 1.1, mt: 0.5 }}
        >
          {VND.format(value)}
        </Typography>
      </Box>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 8,
        borderRadius: 4,
        bgcolor: "rgba(255,255,255,0.25)",
        "& .MuiLinearProgress-bar": { bgcolor: "#fff", borderRadius: 4 },
      }}
    />
    <Typography
      variant="caption"
      sx={{ mt: 1, display: "block", opacity: 0.95, fontWeight: 500 }}
    >
      {subLabel}
    </Typography>
  </Paper>
);

const Stat = ({ label, value, color }) => (
  <Grid item xs={6} md={3}>
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        sx={{
          width: 8,
          height: 48,
          borderRadius: 2,
          background: `linear-gradient(180deg,${color},${color}55)`,
          boxShadow: `0 4px 14px -4px ${color}AA`,
        }}
      />
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.3 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  </Grid>
);

const FlowPath = ({ d, stroke }) => (
  <path
    d={convertPercentPath(d)}
    stroke={stroke}
    strokeWidth={4}
    fill="none"
    style={{
      strokeDasharray: 1600,
      strokeDashoffset: 1600,
      animation: `dash 1.6s ease forwards`,
      filter: "drop-shadow(0 0 6px rgba(255,255,255,0.15))",
      opacity: 0.85,
    }}
  />
);

function convertPercentPath(d) {
  return d
    .replace(/(\d+)%/g, (_, p1) => (Number(p1) * 10).toString())
    .replace(/(\d+)%/g, (_, p1) => (Number(p1) * 6).toString());
}

const globalStyles = `@keyframes dash { to { stroke-dashoffset: 0; } }`;
if (
  typeof document !== "undefined" &&
  !document.getElementById("flow-dash-kf")
) {
  const style = document.createElement("style");
  style.id = "flow-dash-kf";
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

export default ChiSoFlowForm;

// ================= New Timeline Diagram Tab =================
const TimelineDiagramTab = ({
  metrics,
  VND,
  currentDay,
  selectedSegment,
  setSelectedSegment,
  compact,
}) => {
  const theme = useTheme();
  const [animationPhase, setAnimationPhase] = useState(0);

  const {
    tongDuyetKeToan = 0,
    tongTheoChiDinh = 0,
    chuaKT_ThangTruoc_RaVien = 0,
    chuaKT_ThangTruoc_ChuaRaVien = 0,
    chuaKT_ThangNay_RaVien = 0,
    chuaKT_ThangNay_ChuaRaVien = 0,
  } = metrics;
  const totalOldPending =
    chuaKT_ThangTruoc_RaVien + chuaKT_ThangTruoc_ChuaRaVien;
  const totalCurrentPending =
    chuaKT_ThangNay_RaVien + chuaKT_ThangNay_ChuaRaVien;
  let overlap = tongTheoChiDinh - totalCurrentPending;
  if (overlap < 0) overlap = 0;
  let transferred = tongDuyetKeToan - overlap;
  if (transferred < 0) transferred = 0;

  useEffect(() => {
    const timers = [300, 600, 900, 1200, 1500].map((d, i) =>
      setTimeout(() => setAnimationPhase(i + 1), d)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const segments = [
    {
      id: "old_pending",
      label: "Chỉ định tháng trước (chưa duyệt)",
      value: totalOldPending,
      color: "#6366f1",
      details: [
        { label: "Đã ra viện", value: chuaKT_ThangTruoc_RaVien },
        { label: "Chưa ra viện", value: chuaKT_ThangTruoc_ChuaRaVien },
      ],
      description: "Dịch vụ phát sinh tháng trước, đang chờ duyệt.",
    },
    {
      id: "transferred",
      label: "Chuyển kỳ (duyệt tháng này)",
      value: transferred,
      color: "#8b5cf6",
      description: "Phần chỉ định cũ được duyệt tháng này.",
    },
    {
      id: "overlap",
      label: "Hoàn thành trong tháng",
      value: overlap,
      color: "#10b981",
      description: "Chỉ định & duyệt ngay trong tháng – hiệu suất tối ưu.",
      glow: true,
    },
    {
      id: "current_pending",
      label: "Chỉ định tháng này (chưa duyệt)",
      value: totalCurrentPending,
      color: "#f59e0b",
      details: [
        { label: "Đã ra viện", value: chuaKT_ThangNay_RaVien },
        { label: "Chưa ra viện", value: chuaKT_ThangNay_ChuaRaVien },
      ],
      description: "Phát sinh mới đang chờ duyệt.",
    },
  ];

  const getSeg = (id) => segments.find((s) => s.id === id);

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        px: compact ? 2.5 : 5,
        py: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Highlight control */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          background: alpha(theme.palette.background.paper, 0.55),
          backdropFilter: "blur(12px)",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Highlight khối:
        </Typography>
        <ToggleButtonGroup
          value={selectedSegment}
          exclusive
          onChange={(e, v) => setSelectedSegment(v || "")}
          size="small"
          sx={{ flexWrap: "wrap" }}
        >
          <ToggleButton value="" sx={{ textTransform: "none" }}>
            Không
          </ToggleButton>
          {segments.map((s) => (
            <ToggleButton
              key={s.id}
              value={s.id}
              sx={{ textTransform: "none" }}
            >
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          flex: 1,
          borderRadius: 4,
          background: alpha(theme.palette.background.paper, 0.65),
          backdropFilter: "blur(18px)",
          overflow: "hidden",
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
          minHeight: compact ? 520 : 580,
        }}
      >
        {/* Axis */}
        <Box sx={{ position: "absolute", inset: 0 }}>
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
              opacity={animationPhase >= 1 ? 0.6 : 0}
              style={{ transition: "opacity .5s" }}
            />
            {animationPhase >= 1 && (
              <g style={{ transition: "opacity .6s" }}>
                <line
                  x1="30%"
                  x2="30%"
                  y1="72%"
                  y2="78%"
                  stroke={theme.palette.text.secondary}
                />
                <text
                  x="30%"
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
                  strokeWidth={3}
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
                  x1="70%"
                  x2="70%"
                  y1="72%"
                  y2="78%"
                  stroke={theme.palette.text.secondary}
                />
                <text
                  x="70%"
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

        {/* Old pending block */}
        <Zoom in={animationPhase >= 2} timeout={600}>
          <Box
            sx={{
              position: "absolute",
              left: compact ? "6%" : "12%",
              top: compact ? "10%" : "16%",
              transform:
                selectedSegment === "old_pending" ? "scale(1.12)" : "scale(1)",
              transition: "all .35s",
              opacity:
                selectedSegment && selectedSegment !== "old_pending" ? 0.25 : 1,
            }}
          >
            <RevenueBlock
              segment={getSeg("old_pending")}
              VND={VND}
              onClick={() =>
                setSelectedSegment(
                  selectedSegment === "old_pending" ? "" : "old_pending"
                )
              }
              selected={selectedSegment === "old_pending"}
            />
          </Box>
        </Zoom>

        {/* Current pending block */}
        <Zoom in={animationPhase >= 2} timeout={600}>
          <Box
            sx={{
              position: "absolute",
              right: compact ? "6%" : "12%",
              top: compact ? "10%" : "16%",
              transform:
                selectedSegment === "current_pending"
                  ? "scale(1.12)"
                  : "scale(1)",
              transition: "all .35s",
              opacity:
                selectedSegment && selectedSegment !== "current_pending"
                  ? 0.25
                  : 1,
            }}
          >
            <RevenueBlock
              segment={getSeg("current_pending")}
              VND={VND}
              onClick={() =>
                setSelectedSegment(
                  selectedSegment === "current_pending" ? "" : "current_pending"
                )
              }
              selected={selectedSegment === "current_pending"}
            />
          </Box>
        </Zoom>

        {/* Overlapping rectangles A & B */}
        <Fade in={animationPhase >= 3} timeout={700}>
          <Box
            sx={{
              position: "absolute",
              left: compact ? "16%" : "22%",
              right: compact ? "16%" : "22%",
              top: compact ? "30%" : "34%",
              height: compact ? 210 : 240,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: compact ? 34 : 40,
                width: compact ? "56%" : "60%",
                height: compact ? 140 : 160,
                borderRadius: 3,
                background: "linear-gradient(135deg,#6366f1dd,#8b5cf6aa)",
                border: "2px solid #6366f1",
                boxShadow:
                  selectedSegment === "transferred" ||
                  selectedSegment === "overlap"
                    ? "0 0 0 4px #6366f155,0 12px 30px -8px #6366f188"
                    : "0 4px 20px -6px #6366f166",
                transition: "all .35s",
                transform:
                  selectedSegment === "transferred"
                    ? "scale(1.05)"
                    : "scale(1)",
                opacity:
                  selectedSegment &&
                  !["transferred", "overlap"].includes(selectedSegment)
                    ? 0.25
                    : 1,
                cursor: "pointer",
              }}
              onClick={() =>
                setSelectedSegment(
                  selectedSegment === "transferred" ? "" : "transferred"
                )
              }
            >
              <Stack spacing={1} sx={{ p: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#fff" }}
                >
                  A. Duyệt kế toán
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#fff" }}
                >
                  {VND.format(tongDuyetKeToan)}
                </Typography>
                <Chip
                  label={`Chuyển kỳ: ${VND.format(transferred)}`}
                  size="small"
                  sx={{
                    width: "fit-content",
                    bgcolor:
                      selectedSegment === "transferred" ? "#fff" : "#ffffff33",
                    color:
                      selectedSegment === "transferred" ? "#6366f1" : "#fff",
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Box>
            <Box
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                width: compact ? "56%" : "60%",
                height: compact ? 170 : 200,
                borderRadius: 3,
                background: "linear-gradient(135deg,#10b981dd,#f59e0baa)",
                border: "2px solid #10b981",
                boxShadow:
                  selectedSegment === "current_pending" ||
                  selectedSegment === "overlap"
                    ? "0 0 0 4px #10b98155,0 12px 30px -8px #10b98188"
                    : "0 4px 20px -6px #10b98166",
                transition: "all .35s",
                transform:
                  selectedSegment === "current_pending"
                    ? "scale(1.05)"
                    : "scale(1)",
                opacity:
                  selectedSegment &&
                  !["current_pending", "overlap"].includes(selectedSegment)
                    ? 0.25
                    : 1,
              }}
            >
              <Stack spacing={1} sx={{ p: 2, alignItems: "flex-end" }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#fff" }}
                >
                  B. Theo chỉ định
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#fff" }}
                >
                  {VND.format(tongTheoChiDinh)}
                </Typography>
                <Chip
                  label={`Chưa duyệt: ${VND.format(totalCurrentPending)}`}
                  size="small"
                  sx={{
                    width: "fit-content",
                    bgcolor:
                      selectedSegment === "current_pending"
                        ? "#fff"
                        : "#ffffff33",
                    color:
                      selectedSegment === "current_pending"
                        ? "#f59e0b"
                        : "#fff",
                    fontWeight: 600,
                  }}
                  onClick={() =>
                    setSelectedSegment(
                      selectedSegment === "current_pending"
                        ? ""
                        : "current_pending"
                    )
                  }
                />
              </Stack>
            </Box>
            {/* Overlap dashed frame */}
            {overlap > 0 && (
              <Box
                onClick={() =>
                  setSelectedSegment(
                    selectedSegment === "overlap" ? "" : "overlap"
                  )
                }
                sx={{
                  position: "absolute",
                  left: "25%",
                  right: "25%",
                  top: compact ? 16 : 20,
                  bottom: compact ? 16 : 20,
                  border: "3px dashed #10b981",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "auto",
                  transition: "all .4s",
                  backdropFilter:
                    selectedSegment === "overlap" ? "blur(2px)" : "none",
                  boxShadow:
                    selectedSegment === "overlap"
                      ? "0 0 0 6px #10b98133,0 0 40px -4px #10b981aa"
                      : "none",
                  transform:
                    selectedSegment === "overlap" ? "scale(1.05)" : "scale(1)",
                  cursor: "pointer",
                  background:
                    selectedSegment === "overlap"
                      ? "linear-gradient(135deg,#10b98122,#ffffff05)"
                      : "transparent",
                }}
              >
                <Stack
                  spacing={0.5}
                  sx={{ textAlign: "center", position: "relative" }}
                >
                  <CheckCircle sx={{ color: "#10b981", fontSize: 44 }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, letterSpacing: 0.5, color: "#fff" }}
                  >
                    A ∩ B
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "#fff" }}
                  >
                    {VND.format(overlap)}
                  </Typography>
                  <Chip
                    label="Hoàn thành trong tháng"
                    size="small"
                    color="success"
                  />
                  {selectedSegment === "overlap" && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                      }}
                    >
                      {/* pulsing ring */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          border: "3px solid #10b981",
                          transform: "translate(-50%,-50%)",
                          animation: "pulseRing 1.8s ease-out infinite",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: 54,
                          height: 54,
                          borderRadius: "50%",
                          border: "2px solid #10b98188",
                          transform: "translate(-50%,-50%)",
                          animation: "pulseRing 2.2s ease-out .4s infinite",
                        }}
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Fade>

        {/* Description / detail panel */}
        {selectedSegment && (
          <Fade in timeout={300}>
            <Paper
              elevation={12}
              sx={{
                position: "absolute",
                bottom: compact ? 16 : 24,
                left: "50%",
                transform: "translateX(-50%)",
                width: compact ? 400 : 500,
                p: 3,
                borderRadius: 3,
                background: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: "blur(16px)",
                border: `2px solid ${getSeg(selectedSegment)?.color}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    background: getSeg(selectedSegment)?.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  {getSeg(selectedSegment)?.label?.slice(0, 1)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {getSeg(selectedSegment)?.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getSeg(selectedSegment)?.description}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setSelectedSegment("")}>
                  {" "}
                  <CloseIcon />{" "}
                </IconButton>
              </Stack>
              {getSeg(selectedSegment)?.details && (
                <Stack spacing={0.6} sx={{ mt: 1.5 }}>
                  {getSeg(selectedSegment).details.map((d) => (
                    <Typography
                      key={d.label}
                      variant="body2"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                      }}
                    >
                      <span>{d.label}</span>
                      <span style={{ fontWeight: 600 }}>
                        {VND.format(d.value)}
                      </span>
                    </Typography>
                  ))}
                </Stack>
              )}
            </Paper>
          </Fade>
        )}
      </Paper>
    </Box>
  );
};

const RevenueBlock = ({ segment, VND, onClick, selected }) => {
  if (!segment) return null;
  return (
    <Paper
      onClick={onClick}
      elevation={selected ? 16 : 6}
      sx={{
        width: 190,
        p: 2.2,
        borderRadius: 3,
        background: `linear-gradient(135deg,${alpha(
          segment.color,
          0.9
        )},${alpha(segment.color, 0.6)})`,
        border: `2px solid ${segment.color}`,
        cursor: "pointer",
        color: "#fff",
        textAlign: "center",
        transition: "all .35s",
        boxShadow: selected
          ? `0 12px 32px -10px ${segment.color}AA,0 0 0 4px ${segment.color}55`
          : `0 8px 24px -10px ${segment.color}88`,
        "&:hover": { transform: "translateY(-6px) scale(1.03)" },
      }}
    >
      <AccessTime sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, letterSpacing: 0.4, display: "block", mb: 0.5 }}
      >
        {segment.label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
        {VND.format(segment.value)}
      </Typography>
      {segment.details && (
        <Stack spacing={0.4}>
          {segment.details.map((d) => (
            <Typography
              key={d.label}
              variant="caption"
              sx={{
                opacity: 0.85,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{d.label}</span>
              <span>{VND.format(d.value)}</span>
            </Typography>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

// keyframes for pulse rings
const pulseKF = `@keyframes pulseRing {0%{transform:translate(-50%,-50%) scale(.4);opacity:.9}70%{opacity:0}100%{transform:translate(-50%,-50%) scale(1.8);opacity:0}}`;
if (
  typeof document !== "undefined" &&
  !document.getElementById("pulse-ring-kf")
) {
  const style = document.createElement("style");
  style.id = "pulse-ring-kf";
  style.textContent = pulseKF;
  document.head.appendChild(style);
}
