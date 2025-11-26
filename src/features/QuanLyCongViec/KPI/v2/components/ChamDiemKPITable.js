import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Collapse,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { Button } from "@mui/material";

// ✅ V2: Import calculation utilities
import { calculateNhiemVuScore } from "../../../../../utils/kpiCalculation";

// ✅ NEW: Import dashboard component for viewing tasks
import CongViecDashboard from "./dashboard/CongViecDashboard";

// ✅ NEW: Import dashboard data action
import { fetchCongViecDashboard } from "../../kpiSlice";

// ✅ NEW: Import QuickScoreDialog for batch scoring
import QuickScoreDialog from "./QuickScoreDialog";

/**
 * ScoreInput - Isolated input component with local state
 * Prevents re-render focus loss by using controlled local state
 * Only dispatches to Redux on blur/enter
 */
function ScoreInput({
  initialValue,
  min,
  max,
  unit,
  onCommit,
  disabled,
  isGiamDiem,
}) {
  const [localValue, setLocalValue] = useState(initialValue || 0);
  const inputRef = useRef(null);

  // Sync with prop changes from external updates
  useEffect(() => {
    setLocalValue(initialValue || 0);
  }, [initialValue]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    if (rawValue === "" || rawValue === null) {
      setLocalValue("");
      return;
    }
    const val = parseFloat(rawValue);
    if (!Number.isNaN(val)) {
      setLocalValue(val);
    }
  };

  const handleCommit = () => {
    let val = parseFloat(localValue);
    if (localValue === "" || Number.isNaN(val)) {
      val = min; // Default to min if empty
    }
    // Clamp to range
    if (val < min) val = min;
    if (val > max) val = max;

    setLocalValue(val);
    onCommit(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommit();
      inputRef.current?.blur(); // Unfocus after commit
    }
  };

  return (
    <Box>
      <TextField
        inputRef={inputRef}
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select()}
        disabled={disabled}
        inputProps={{
          min,
          max,
          step: 1,
          style: {
            textAlign: "center",
            padding: "6px 8px",
            fontSize: "0.85rem",
            fontWeight: "700",
          },
        }}
        sx={{
          width: 100,
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
            bgcolor: "white",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            },
            "&.Mui-focused": {
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            },
            // ✅ Improve visibility when disabled
            "&.Mui-disabled": {
              bgcolor: "#f5f5f5",
              "& input": {
                color: "#2c3e50", // Dark gray instead of default light gray
                WebkitTextFillColor: "#2c3e50", // Override browser default
                fontWeight: "700",
              },
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Typography
                variant="caption"
                color={disabled ? "text.primary" : "text.secondary"}
                fontWeight="600"
                sx={{
                  opacity: disabled ? 0.8 : 1, // Slightly transparent when disabled but still visible
                }}
              >
                {unit || "%"}
              </Typography>
            </InputAdornment>
          ),
        }}
      />
      {isGiamDiem && (
        <Chip
          label="−"
          size="small"
          sx={{
            mt: 0.5,
            height: 20,
            fontSize: "0.75rem",
            fontWeight: "700",
            bgcolor: "error.main",
            color: "white",
          }}
        />
      )}
    </Box>
  );
}

/**
 * ChamDiemKPITable - Compact table layout for KPI scoring
 *
 * Props:
 * - nhiemVuList: Array of DanhGiaNhiemVuThuongQuy objects
 * - onScoreChange: (nhiemVuId, tieuChiIndex, newScore) => void
 * - readOnly: Boolean (for approved KPI)
 * - diemTuDanhGiaMap: Object { NhiemVuThuongQuyID: DiemTuDanhGia } - V2 for calculation
 * - nhanVienID: String - Employee ID (for dashboard)
 * - chuKyDanhGiaID: String - Evaluation cycle ID (for dashboard)
 * - onQuickScoreAll: (percentage) => void - ✅ NEW: Quick score batch function
 */
function ChamDiemKPITable({
  nhiemVuList = [],
  onScoreChange,
  readOnly = false,
  diemTuDanhGiaMap = {},
  nhanVienID, // ✅ NEW: For dashboard
  chuKyDanhGiaID, // ✅ NEW: For dashboard
  onQuickScoreAll, // ✅ NEW: Quick score handler
}) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRowId, setExpandedRowId] = useState(null);
  // ✅ NEW: Track active tab per expanded row
  const [activeTabByRow, setActiveTabByRow] = useState({});
  // ✅ NEW: Quick Score Dialog state
  const [openQuickScoreDialog, setOpenQuickScoreDialog] = useState(false);
  const expandedRowRef = useRef(null);
  const tableContainerRef = useRef(null);

  // ✅ NEW: Get dashboard data from Redux for TaskCount
  const dashboardData = useSelector(
    (state) => state.kpi.congViecDashboard || {}
  );

  // ✅ NEW: Prefetch dashboard data for all duties on mount
  useEffect(() => {
    if (nhanVienID && chuKyDanhGiaID && nhiemVuList.length > 0) {
      nhiemVuList.forEach((nv) => {
        const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
        if (nvId) {
          const key = `${nvId}_${chuKyDanhGiaID}`;
          // Only fetch if not already loaded/loading
          if (!dashboardData[key]) {
            dispatch(
              fetchCongViecDashboard({
                nhiemVuThuongQuyID: nvId,
                nhanVienID,
                chuKyDanhGiaID,
              })
            );
          }
        }
      });
    }
  }, [nhanVienID, chuKyDanhGiaID, nhiemVuList, dispatch, dashboardData]);

  // ✅ NEW: Create TaskCount map from dashboard data
  const taskCountMap = useMemo(() => {
    const map = {};
    nhiemVuList.forEach((nv) => {
      const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
      if (nvId) {
        const key = `${nvId}_${chuKyDanhGiaID}`;
        const dashboard = dashboardData[key];
        if (dashboard?.data) {
          map[nvId] = dashboard.data.summary?.total || 0;
        } else if (dashboard?.isLoading) {
          map[nvId] = null; // null = đang tải
        } else {
          map[nvId] = 0; // default 0 if no data
        }
      }
    });
    return map;
  }, [dashboardData, nhiemVuList, chuKyDanhGiaID]);

  // Ensure expanded row is fully visible inside the scroll container
  const ensureExpandedRowVisible = () => {
    if (!expandedRowId || !expandedRowRef.current || !tableContainerRef.current)
      return;
    const container = tableContainerRef.current;
    const rowEl = expandedRowRef.current;
    const containerRect = container.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();

    // Distance of row bottom beyond container bottom
    const overflowBottom = rowRect.bottom - containerRect.bottom;
    // Distance of row top above container top
    const overflowTop = rowRect.top - containerRect.top;

    if (overflowBottom > 0) {
      container.scrollTop += overflowBottom + 24; // add some padding
    } else if (overflowTop < 0) {
      container.scrollTop += overflowTop - 24; // scroll up with padding
    }
  };

  // Run after expandedRow changes (initial expand)
  useEffect(() => {
    if (!expandedRowId) return;
    const timer = setTimeout(() => {
      ensureExpandedRowVisible();
    }, 180);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedRowId]);

  // Filter tasks by search
  const filteredList = useMemo(() => {
    if (!searchTerm) return nhiemVuList;
    const lower = searchTerm.toLowerCase();
    return nhiemVuList.filter((nv) =>
      nv.NhiemVuThuongQuyID?.TenNhiemVu?.toLowerCase().includes(lower)
    );
  }, [nhiemVuList, searchTerm]);

  // Get tiêu chí headers - backend đảm bảo tất cả rows có cùng structure
  const tieuChiHeaders = useMemo(() => {
    if (nhiemVuList.length === 0) return [];
    return nhiemVuList[0]?.ChiTietDiem || [];
  }, [nhiemVuList]);

  // ✅ FIX: Use useCallback and match by index only (no TieuChiID)
  const handleScoreChange = useCallback(
    (nhiemVuId, tieuChiIndex, newScore) => {
      if (!readOnly && onScoreChange) {
        onScoreChange(nhiemVuId, tieuChiIndex, newScore);
      }
    },
    [readOnly, onScoreChange]
  );

  const toggleExpandRow = (nhiemVuId) => {
    const idStr = String(nhiemVuId);
    setExpandedRowId((prev) => (prev === idStr ? null : idStr));
    // ✅ Initialize tab to 0 (Chấm điểm) when expanding
    if (!activeTabByRow[idStr]) {
      setActiveTabByRow((prev) => ({ ...prev, [idStr]: 0 }));
    }
  };

  // ✅ NEW: Handle tab change
  const handleTabChange = useCallback((rowId, newValue) => {
    setActiveTabByRow((prev) => ({ ...prev, [rowId]: newValue }));
  }, []);

  // ✅ V2: Calculate nhiệm vụ total with CORRECT formula (matches backend)
  const calculateNhiemVuTotal = useCallback(
    (nhiemVu) => {
      const nvId =
        nhiemVu.NhiemVuThuongQuyID?._id || nhiemVu.NhiemVuThuongQuyID;
      const diemTuDanhGia = diemTuDanhGiaMap[nvId?.toString()] || 0;

      const { diemNhiemVu } = calculateNhiemVuScore(nhiemVu, diemTuDanhGia);
      return diemNhiemVu;
    },
    [diemTuDanhGiaMap]
  );

  // ✅ V2: Calculate grand total (sum of all nhiệm vụ scores)
  const grandTotal = useMemo(() => {
    return nhiemVuList.reduce((sum, nv) => sum + calculateNhiemVuTotal(nv), 0);
  }, [nhiemVuList, calculateNhiemVuTotal]);

  // KPI % = grandTotal / 10 * 100
  const kpiPercent = useMemo(() => {
    return Math.round((grandTotal / 10) * 1000) / 10; // 1 chữ số thập phân
  }, [grandTotal]);

  if (nhiemVuList.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        Nhân viên này chưa được phân công nhiệm vụ thường quy nào.
      </Alert>
    );
  }

  // ✅ NEW: Handle Quick Score confirm
  const handleQuickScoreConfirm = (percentage) => {
    if (onQuickScoreAll) {
      onQuickScoreAll(percentage);
    }
  };

  // --- UI ---
  return (
    <Box>
      {/* Search Bar + Quick Score Button */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="🔍 Tìm kiếm nhiệm vụ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="medium"
          sx={{
            flex: 1,
            maxWidth: 500,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "#f8fafc",
              "&:hover": { bgcolor: "#f1f5f9" },
              "&.Mui-focused": { bgcolor: "white" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        {!readOnly && onQuickScoreAll && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<FlashOnIcon />}
            onClick={() => setOpenQuickScoreDialog(true)}
            sx={{
              minWidth: 150,
              boxShadow: 2,
              "&:hover": { boxShadow: 4 },
            }}
          >
            Chấm Nhanh
          </Button>
        )}
      </Box>

      {/* ✅ Quick Score Dialog */}
      <QuickScoreDialog
        open={openQuickScoreDialog}
        onClose={() => setOpenQuickScoreDialog(false)}
        onConfirm={handleQuickScoreConfirm}
        nhiemVuList={filteredList}
      />

      {/* Table Section */}
      <TableContainer
        ref={tableContainerRef}
        component={Paper}
        sx={{
          maxHeight: "calc(100vh - 380px)",
          borderRadius: 2,
          /* Allow vertical scrolling so expanded content is not cut off */
          overflowY: "auto",
          overflowX: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid",
          borderColor: "divider",
          scrollBehavior: "smooth",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: 60,
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  background: "#1939B7",
                  color: "white",
                  textAlign: "center",
                }}
              >
                STT
              </TableCell>
              <TableCell
                sx={{
                  width: 50,
                  fontWeight: "700",
                  background: "#1939B7",
                  color: "white",
                }}
              />
              <TableCell
                sx={{
                  minWidth: 280,
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  background: "#1939B7",
                  color: "white",
                }}
              >
                📋 NHIỆM VỤ THƯỜNG QUY
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  width: 100,
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  background: "#1939B7",
                  color: "white",
                }}
              >
                ⚡ Độ khó
              </TableCell>

              {/* 🆕 NEW COLUMN: Số lượng công việc */}
              <TableCell
                align="center"
                sx={{
                  width: 120,
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  background: "#6366f1",
                  color: "white",
                  borderLeft: "3px solid #4f46e5",
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={0.5}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    fontSize="0.85rem"
                  >
                    📋 Số CV
                  </Typography>
                  <Typography
                    variant="caption"
                    fontSize="0.7rem"
                    sx={{ opacity: 0.9 }}
                  >
                    (Đã gán)
                  </Typography>
                </Box>
              </TableCell>

              {/* 🆕 NEW COLUMN: Điểm tự đánh giá */}
              <TableCell
                align="center"
                sx={{
                  width: 140,
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  background: "#0ea5e9",
                  color: "white",
                  borderLeft: "3px solid #0284c7",
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={0.5}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    fontSize="0.85rem"
                  >
                    🎯 Điểm tự ĐG
                  </Typography>
                  <Typography
                    variant="caption"
                    fontSize="0.7rem"
                    sx={{ opacity: 0.9 }}
                  >
                    (Mức ĐHT)
                  </Typography>
                </Box>
              </TableCell>

              {/* Tiêu chí columns */}
              {tieuChiHeaders.map((tc, idx) => (
                <TableCell
                  key={idx}
                  align="center"
                  sx={{
                    width: 140,
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    background:
                      tc.LoaiTieuChi === "TANG_DIEM"
                        ? "#10b981"
                        : tc.LoaiTieuChi === "GIAM_DIEM"
                        ? "#ef4444"
                        : "#1939B7",
                    color: "white",
                  }}
                >
                  <Tooltip
                    title={
                      <Box>
                        <Typography
                          variant="body2"
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
                          <strong>Loại:</strong>{" "}
                          {tc.LoaiTieuChi === "TANG_DIEM"
                            ? "Tăng điểm ↑"
                            : "Giảm điểm ↓"}
                        </Typography>
                        <Typography variant="body2" display="block">
                          <strong>Thang đo:</strong> {tc.GiaTriMin}-
                          {tc.GiaTriMax}
                          {tc.DonVi || "%"}
                        </Typography>
                      </Box>
                    }
                    arrow
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="700"
                        sx={{ mb: 0.5 }}
                      >
                        {tc.LoaiTieuChi === "TANG_DIEM" ? "↑ " : "↓ "}
                        {tc.TenTieuChi}
                      </Typography>
                      <Typography variant="caption" display="block">
                        ({tc.GiaTriMin}-{tc.GiaTriMax}
                        {tc.DonVi || "%"})
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
              ))}

              <TableCell
                align="center"
                sx={{
                  width: 120,
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  background: "#f59e0b",
                  color: "white",
                }}
              >
                🎯 Tổng điểm
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredList.map((nhiemVu, index) => {
              // ✅ Use stable unique id per row: prefer assignment _id, fallback to task template id, then index
              const baseId =
                nhiemVu?._id || nhiemVu?.NhiemVuThuongQuyID?._id || index;
              const rowId = String(baseId);
              const isExpanded = expandedRowId === rowId;
              // ✅ V2: Check if scored by checking if any ChiTietDiem has DiemDat > 0
              const isScored =
                nhiemVu.ChiTietDiem?.some((tc) => tc.DiemDat > 0) || false;

              // ✅ V2: Get nvId for diemTuDanhGiaMap lookup
              const nvId =
                nhiemVu.NhiemVuThuongQuyID?._id || nhiemVu.NhiemVuThuongQuyID;

              return (
                <React.Fragment key={rowId}>
                  <TableRow
                    hover
                    sx={{
                      bgcolor: isScored
                        ? "rgba(16, 185, 129, 0.08)"
                        : "inherit",
                      "&:hover": {
                        bgcolor: isScored
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(0,0,0,0.04)",
                        transform: "scale(1.001)",
                      },
                      transition: "all 0.2s ease",
                      borderLeft: isScored
                        ? "4px solid"
                        : "4px solid transparent",
                      borderLeftColor: isScored
                        ? "success.main"
                        : "transparent",
                    }}
                  >
                    {/* STT */}
                    <TableCell align="center">
                      <Typography
                        variant="h6"
                        fontWeight="700"
                        color="text.secondary"
                      >
                        {index + 1}
                      </Typography>
                    </TableCell>

                    {/* Expand button */}
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpandRow(rowId)}
                        sx={{
                          transition: "all 0.3s ease",
                          "&:hover": {
                            bgcolor: "primary.lighter",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        {isExpanded ? (
                          <ExpandLessIcon fontSize="small" color="primary" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" color="action" />
                        )}
                      </IconButton>
                    </TableCell>

                    {/* Tên nhiệm vụ - COMPACT FONT */}
                    <TableCell sx={{ py: 0.75 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {isScored ? (
                          <CheckCircleIcon
                            sx={{
                              color: "success.main",
                              fontSize: "1.1rem",
                            }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{
                              color: "text.disabled",
                              fontSize: "1.1rem",
                            }}
                          />
                        )}
                        <Typography
                          variant="body1"
                          fontWeight="600"
                          sx={{
                            fontSize: "0.9rem",
                            lineHeight: 1.3,
                            color: isScored ? "text.primary" : "text.secondary",
                          }}
                        >
                          {nhiemVu.NhiemVuThuongQuyID?.TenNhiemVu || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Mức độ khó */}
                    <TableCell align="center" sx={{ py: 0.75 }}>
                      <Chip
                        label={nhiemVu.MucDoKho || 5}
                        size="small"
                        sx={{
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          height: 28,
                          minWidth: 36,
                          bgcolor:
                            (nhiemVu.MucDoKho || 5) >= 8
                              ? "error.main"
                              : (nhiemVu.MucDoKho || 5) >= 6
                              ? "warning.main"
                              : "info.main",
                          color: "white",
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    </TableCell>

                    {/* 🆕 NEW CELL: Số lượng công việc */}
                    <TableCell
                      align="center"
                      sx={{
                        py: 0.75,
                        px: 1.5,
                        bgcolor:
                          taskCountMap[nvId] > 0
                            ? "rgba(99, 102, 241, 0.08)"
                            : "rgba(0,0,0,0.02)",
                        borderLeft: "3px solid",
                        borderLeftColor:
                          taskCountMap[nvId] > 0
                            ? "#6366f1"
                            : "rgba(0,0,0,0.1)",
                      }}
                    >
                      {taskCountMap[nvId] === null ? (
                        <CircularProgress size={20} thickness={4} />
                      ) : taskCountMap[nvId] > 0 ? (
                        <Chip
                          label={taskCountMap[nvId]}
                          size="small"
                          sx={{
                            bgcolor: "#6366f1",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                            minWidth: 50,
                            height: 28,
                            boxShadow: "0 2px 6px rgba(99, 102, 241, 0.3)",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          fontStyle="italic"
                          fontSize="0.8rem"
                        >
                          0
                        </Typography>
                      )}
                    </TableCell>

                    {/* 🆕 NEW CELL: Điểm tự đánh giá - READ-ONLY */}
                    <TableCell
                      align="center"
                      sx={{
                        py: 0.75,
                        px: 1.5,
                        bgcolor:
                          diemTuDanhGiaMap[nvId?.toString()] > 0
                            ? "rgba(14, 165, 233, 0.08)"
                            : "rgba(0,0,0,0.02)",
                        borderLeft: "3px solid",
                        borderLeftColor:
                          diemTuDanhGiaMap[nvId?.toString()] > 0
                            ? "#0ea5e9"
                            : "rgba(0,0,0,0.1)",
                      }}
                    >
                      {diemTuDanhGiaMap[nvId?.toString()] > 0 ? (
                        <Chip
                          label={`${diemTuDanhGiaMap[nvId?.toString()]}%`}
                          size="small"
                          sx={{
                            bgcolor: "#0ea5e9",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "0.85rem",
                            minWidth: 65,
                            height: 28,
                            boxShadow: "0 2px 6px rgba(14, 165, 233, 0.3)",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          fontStyle="italic"
                          fontSize="0.8rem"
                        >
                          --
                        </Typography>
                      )}
                    </TableCell>

                    {/* Tiêu chí scores */}
                    {nhiemVu.ChiTietDiem?.map((tieuChi, tcIdx) => {
                      const giaTriMin = tieuChi.GiaTriMin;
                      const giaTriMax = tieuChi.GiaTriMax;
                      const isGiamDiem = tieuChi.LoaiTieuChi === "GIAM_DIEM";

                      return (
                        <TableCell
                          key={`${rowId}-tc-${tcIdx}`}
                          align="center"
                          sx={{
                            py: 0.75,
                            px: 1,
                            bgcolor: isGiamDiem
                              ? "rgba(239, 68, 68, 0.08)"
                              : "rgba(16, 185, 129, 0.08)",
                            borderRight: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <ScoreInput
                            initialValue={tieuChi.DiemDat}
                            min={giaTriMin}
                            max={giaTriMax}
                            unit={tieuChi.DonVi}
                            onCommit={(val) =>
                              handleScoreChange(baseId, tcIdx, val)
                            }
                            disabled={readOnly}
                            isGiamDiem={isGiamDiem}
                          />
                        </TableCell>
                      );
                    })}

                    {/* Tổng điểm */}
                    <TableCell
                      align="center"
                      sx={{
                        py: 0.75,
                        bgcolor: "rgba(245, 158, 11, 0.12)",
                        fontWeight: "bold",
                        borderLeft: "2px solid",
                        borderColor: "warning.main",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="800"
                        fontSize="1rem"
                        sx={{
                          color:
                            calculateNhiemVuTotal(nhiemVu) >= 8
                              ? "success.main"
                              : calculateNhiemVuTotal(nhiemVu) >= 5
                              ? "warning.main"
                              : "error.main",
                        }}
                      >
                        {calculateNhiemVuTotal(nhiemVu).toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {/* Expandable row for description */}
                  <TableRow ref={isExpanded ? expandedRowRef : null}>
                    <TableCell
                      colSpan={6 + tieuChiHeaders.length + 1}
                      sx={{
                        py: 0,
                        borderBottom: isExpanded ? 1 : 0,
                        bgcolor: isExpanded ? "#f1f5f9" : "inherit",
                      }}
                    >
                      <Collapse
                        in={isExpanded}
                        timeout="auto"
                        unmountOnExit
                        onEntered={ensureExpandedRowVisible}
                      >
                        {/* ✅ REDESIGNED: Card-Based Detail View */}
                        <Box sx={{ p: 2 }}>
                          <Card
                            elevation={3}
                            sx={{
                              borderRadius: 3,
                              overflow: "hidden",
                              background: "white",
                            }}
                          >
                            {/* Card Header with Tabs */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                px: 3,
                                pt: 2,
                                pb: 1,
                              }}
                            >
                              <Tabs
                                value={activeTabByRow[rowId] || 0}
                                onChange={(e, newValue) =>
                                  handleTabChange(rowId, newValue)
                                }
                                sx={{
                                  "& .MuiTabs-indicator": {
                                    display: "none",
                                  },
                                  "& .MuiTab-root": {
                                    fontWeight: 600,
                                    textTransform: "none",
                                    fontSize: "0.9rem",
                                    minHeight: 36,
                                    borderRadius: 2,
                                    px: 2,
                                    mr: 1,
                                    color: "text.secondary",
                                    bgcolor: "grey.100",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                      bgcolor: "grey.200",
                                    },
                                    "&.Mui-selected": {
                                      color: "primary.main",
                                      bgcolor: "primary.lighter",
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    },
                                  },
                                }}
                              >
                                <Tab label="✏️ Chấm điểm" />
                                <Tab
                                  label={
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <span>📋 Công việc</span>
                                      <Chip
                                        label={
                                          taskCountMap[nvId] === null
                                            ? "..."
                                            : taskCountMap[nvId] || 0
                                        }
                                        size="small"
                                        color="primary"
                                        sx={{
                                          height: 20,
                                          fontSize: "0.7rem",
                                          fontWeight: 700,
                                          "& .MuiChip-label": {
                                            px: 1,
                                          },
                                        }}
                                      />
                                    </Stack>
                                  }
                                />
                              </Tabs>
                              <Chip
                                label={`Độ khó: ${nhiemVu.MucDoKho || 5}`}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor:
                                    (nhiemVu.MucDoKho || 5) >= 8
                                      ? "error.lighter"
                                      : (nhiemVu.MucDoKho || 5) >= 6
                                      ? "warning.lighter"
                                      : "info.lighter",
                                  color:
                                    (nhiemVu.MucDoKho || 5) >= 8
                                      ? "error.dark"
                                      : (nhiemVu.MucDoKho || 5) >= 6
                                      ? "warning.dark"
                                      : "info.dark",
                                }}
                              />
                            </Box>
                            <Divider />

                            {/* Tab Panel 0: Scoring (redesigned) */}
                            {(activeTabByRow[rowId] === 0 ||
                              activeTabByRow[rowId] === undefined) && (
                              <CardContent sx={{ p: 3 }}>
                                {/* 2-COLUMN LAYOUT: Description (35%) + Formula (65%) */}
                                <Stack direction="row" spacing={3}>
                                  {/* LEFT COLUMN: Description */}
                                  <Box sx={{ flex: "0 0 35%" }}>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight="700"
                                      gutterBottom
                                      sx={{
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      📋 Mô tả nhiệm vụ
                                    </Typography>
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 2,
                                        bgcolor: "grey.50",
                                        borderLeft: "4px solid",
                                        borderLeftColor: "primary.main",
                                        height: "100%",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        color="text.primary"
                                        sx={{ lineHeight: 1.6 }}
                                      >
                                        {nhiemVu.NhiemVuThuongQuyID?.MoTa ||
                                          "Chưa có mô tả"}
                                      </Typography>
                                    </Paper>
                                  </Box>

                                  {/* RIGHT COLUMN: Calculation Breakdown */}
                                  <Box sx={{ flex: "0 0 65%" }}>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight="700"
                                      gutterBottom
                                      sx={{
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        fontSize: "0.75rem",
                                        mb: 2,
                                      }}
                                    >
                                      📊 Chi tiết công thức tính điểm
                                    </Typography>

                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: "grey.50",
                                      }}
                                    >
                                      <Stack spacing={1.5}>
                                        {/* Tự đánh giá (if exists) */}
                                        {diemTuDanhGiaMap[nvId?.toString()] >
                                          0 && (
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              p: 1,
                                              borderRadius: 1,
                                              bgcolor:
                                                "rgba(14, 165, 233, 0.08)",
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontWeight: 600,
                                                color: "#0ea5e9",
                                                minWidth: 180,
                                              }}
                                            >
                                              🎯 TỰ ĐG:
                                            </Typography>
                                            <Chip
                                              label={`${
                                                diemTuDanhGiaMap[
                                                  nvId?.toString()
                                                ]
                                              }%`}
                                              size="small"
                                              sx={{
                                                bgcolor:
                                                  "rgba(14, 165, 233, 0.15)",
                                                color: "#0284c7",
                                                fontWeight: 700,
                                                fontSize: "0.9rem",
                                              }}
                                            />
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: "text.secondary",
                                                mx: 1,
                                              }}
                                            >
                                              =
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontWeight: 700,
                                                color: "#0ea5e9",
                                                fontSize: "1rem",
                                              }}
                                            >
                                              {(
                                                diemTuDanhGiaMap[
                                                  nvId?.toString()
                                                ] / 100
                                              ).toFixed(2)}
                                            </Typography>
                                          </Box>
                                        )}

                                        {/* Các tiêu chí */}
                                        {nhiemVu.ChiTietDiem.map((tc, idx) => {
                                          const giaTriThucTe = tc.DiemDat || 0;
                                          const diemTuDanhGia =
                                            diemTuDanhGiaMap[
                                              nvId?.toString()
                                            ] || 0;
                                          const isGiamDiem =
                                            tc.LoaiTieuChi === "GIAM_DIEM";

                                          // V2 FORMULA
                                          let diemCuoiCung = giaTriThucTe;
                                          if (
                                            tc.IsMucDoHoanThanh &&
                                            diemTuDanhGia > 0
                                          ) {
                                            diemCuoiCung =
                                              (giaTriThucTe * 2 +
                                                diemTuDanhGia) /
                                              3;
                                          }

                                          const resultValue =
                                            (diemCuoiCung / 100) *
                                            (isGiamDiem ? -1 : 1);

                                          return (
                                            <Box
                                              key={idx}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                p: 1,
                                                borderRadius: 1,
                                                bgcolor: isGiamDiem
                                                  ? "rgba(239, 68, 68, 0.05)"
                                                  : "rgba(16, 185, 129, 0.05)",
                                              }}
                                            >
                                              {/* Icon + Tên */}
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  fontWeight: 600,
                                                  color: isGiamDiem
                                                    ? "error.main"
                                                    : "success.main",
                                                  minWidth: 180,
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 0.5,
                                                }}
                                              >
                                                {isGiamDiem ? "↓" : "↑"}{" "}
                                                {tc.TenTieuChi}:
                                              </Typography>

                                              {/* Công thức */}
                                              {tc.IsMucDoHoanThanh &&
                                              diemTuDanhGia > 0 ? (
                                                <>
                                                  <Chip
                                                    label={`${giaTriThucTe}%`}
                                                    size="small"
                                                    sx={{
                                                      bgcolor:
                                                        "rgba(25, 118, 210, 0.15)",
                                                      color: "#1565c0",
                                                      fontWeight: 600,
                                                      fontSize: "0.85rem",
                                                    }}
                                                  />
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      color: "text.secondary",
                                                      fontWeight: 600,
                                                    }}
                                                  >
                                                    ×2 +
                                                  </Typography>
                                                  <Chip
                                                    label={`${diemTuDanhGia}%`}
                                                    size="small"
                                                    sx={{
                                                      bgcolor:
                                                        "rgba(14, 165, 233, 0.15)",
                                                      color: "#0284c7",
                                                      fontWeight: 600,
                                                      fontSize: "0.85rem",
                                                    }}
                                                  />
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      color: "text.secondary",
                                                      fontWeight: 600,
                                                    }}
                                                  >
                                                    ÷ 3 ={" "}
                                                    {diemCuoiCung.toFixed(1)}%
                                                  </Typography>
                                                </>
                                              ) : (
                                                <Chip
                                                  label={`${giaTriThucTe}%`}
                                                  size="small"
                                                  sx={{
                                                    bgcolor: isGiamDiem
                                                      ? "rgba(239, 68, 68, 0.15)"
                                                      : "rgba(16, 185, 129, 0.15)",
                                                    color: isGiamDiem
                                                      ? "#c62828"
                                                      : "#2e7d32",
                                                    fontWeight: 600,
                                                    fontSize: "0.85rem",
                                                  }}
                                                />
                                              )}

                                              {/* Arrow + Result */}
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  color: "text.secondary",
                                                  mx: 0.5,
                                                }}
                                              >
                                                →
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  fontWeight: 700,
                                                  color: isGiamDiem
                                                    ? "error.main"
                                                    : "success.main",
                                                  fontSize: "1rem",
                                                }}
                                              >
                                                {isGiamDiem ? "" : "+"}
                                                {resultValue.toFixed(2)}
                                              </Typography>
                                            </Box>
                                          );
                                        })}

                                        {/* Divider */}
                                        <Divider sx={{ my: 1 }} />

                                        {/* Tổng */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            p: 1,
                                            bgcolor: "rgba(25, 57, 183, 0.08)",
                                            borderRadius: 1,
                                          }}
                                        >
                                          <Typography
                                            variant="body2"
                                            fontWeight={700}
                                            color="primary.main"
                                          >
                                            Tổng điểm tiêu chí:
                                          </Typography>
                                          <Typography
                                            variant="h6"
                                            fontWeight={800}
                                            color="primary.main"
                                          >
                                            {nhiemVu.ChiTietDiem.reduce(
                                              (sum, tc) => {
                                                const diemTuDanhGia =
                                                  diemTuDanhGiaMap[
                                                    nvId?.toString()
                                                  ] || 0;
                                                let diemCuoiCung =
                                                  tc.DiemDat || 0;

                                                if (
                                                  tc.IsMucDoHoanThanh &&
                                                  diemTuDanhGia > 0
                                                ) {
                                                  diemCuoiCung =
                                                    (tc.DiemDat * 2 +
                                                      diemTuDanhGia) /
                                                    3;
                                                }

                                                const scaled =
                                                  diemCuoiCung / 100;
                                                return (
                                                  sum +
                                                  (tc.LoaiTieuChi ===
                                                  "GIAM_DIEM"
                                                    ? -scaled
                                                    : scaled)
                                                );
                                              },
                                              0
                                            ).toFixed(2)}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                    </Paper>

                                    {/* Summary Footer Bar */}
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        mt: 3,
                                        p: 2,
                                        background:
                                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "rgba(255,255,255,0.9)",
                                            fontWeight: 600,
                                            display: "block",
                                            mb: 0.5,
                                          }}
                                        >
                                          KẾT QUẢ TỔNG HỢP
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "white",
                                            fontWeight: 500,
                                          }}
                                        >
                                          Tổng điểm tiêu chí (×{" "}
                                          {nhiemVu.MucDoKho || 5}) = Điểm nhiệm
                                          vụ
                                        </Typography>
                                      </Box>
                                      <Chip
                                        label={calculateNhiemVuTotal(
                                          nhiemVu
                                        ).toFixed(2)}
                                        sx={{
                                          bgcolor: "white",
                                          color: "#667eea",
                                          fontWeight: 800,
                                          fontSize: "1.25rem",
                                          height: 48,
                                          px: 2,
                                          "& .MuiChip-label": {
                                            px: 2,
                                          },
                                        }}
                                      />
                                    </Paper>
                                  </Box>
                                </Stack>
                              </CardContent>
                            )}

                            {/* Tab Panel 1: CongViec Dashboard */}
                            {activeTabByRow[rowId] === 1 && (
                              <CardContent sx={{ p: 2 }}>
                                <CongViecDashboard
                                  nhiemVuThuongQuyID={
                                    nhiemVu.NhiemVuThuongQuyID?._id ||
                                    nhiemVu.NhiemVuThuongQuyID
                                  }
                                  nhanVienID={nhanVienID}
                                  chuKyDanhGiaID={chuKyDanhGiaID}
                                  open={activeTabByRow[rowId] === 1}
                                  onViewTask={(taskId) => {
                                    console.log("View task:", taskId);
                                  }}
                                />
                              </CardContent>
                            )}
                          </Card>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary footer */}
      <Box
        sx={{
          mt: 3,
          p: 3,
          background: "#1939B7",
          borderRadius: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
          boxShadow: "0 4px 20px rgba(25, 57, 183, 0.4)",
        }}
      >
        <Typography variant="body1" fontWeight={600}>
          📋 Hiển thị: {filteredList.length}/{nhiemVuList.length} nhiệm vụ
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" fontWeight={800}>
            Tổng điểm: {grandTotal.toFixed(1)}
          </Typography>
          <Chip
            label={`KPI: ${kpiPercent}%`}
            sx={{
              bgcolor:
                kpiPercent >= 100
                  ? "success.main"
                  : kpiPercent >= 80
                  ? "info.main"
                  : kpiPercent >= 60
                  ? "warning.main"
                  : "error.main",
              color: "white",
              fontWeight: 800,
              fontSize: "1.1rem",
              height: 40,
              px: 2,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ChamDiemKPITable;
