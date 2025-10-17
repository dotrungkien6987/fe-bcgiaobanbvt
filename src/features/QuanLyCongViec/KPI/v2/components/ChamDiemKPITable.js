import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Collapse,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

/**
 * ChamDiemKPITable - Compact table layout for KPI scoring
 *
 * Props:
 * - nhiemVuList: Array of DanhGiaNhiemVuThuongQuy objects
 * - onScoreChange: (nhiemVuId, tieuChiIndex, newScore) => void
 * - readOnly: Boolean (for approved KPI)
 */
function ChamDiemKPITable({
  nhiemVuList = [],
  onScoreChange,
  readOnly = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const expandedRowRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Ensure expanded row is fully visible inside the scroll container
  const ensureExpandedRowVisible = () => {
    if (!expandedRow || !expandedRowRef.current || !tableContainerRef.current)
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
    if (!expandedRow) return;
    const timer = setTimeout(() => {
      ensureExpandedRowVisible();
    }, 180);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedRow]);

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
    setExpandedRow(expandedRow === nhiemVuId ? null : nhiemVuId);
  };

  // Calculate tiêu chí score with correct formula
  const calculateTieuChiScore = useMemo(() => {
    return (tieuChi) => {
      const giaTriThucTe = tieuChi.DiemDat || 0;

      // Tất cả chia 100
      const baseScore = giaTriThucTe / 100;

      // GIAM_DIEM thì dấu âm (-)
      if (tieuChi.LoaiTieuChi === "GIAM_DIEM") {
        return -baseScore;
      }

      // TANG_DIEM thì dấu dương (+)
      return baseScore;
    };
  }, []);

  // Calculate nhiệm vụ total with correct formula
  const calculateNhiemVuTotal = useMemo(() => {
    return (nhiemVu) => {
      if (!nhiemVu?.ChiTietDiem?.length) return 0;

      // Cộng trừ theo dấu +/-
      const tongDiemTieuChi = nhiemVu.ChiTietDiem.reduce((sum, tc) => {
        return sum + calculateTieuChiScore(tc);
      }, 0);

      const mucDoKho = nhiemVu.MucDoKho || 5;

      // Nhân với độ khó
      return tongDiemTieuChi * mucDoKho;
    };
  }, [calculateTieuChiScore]);

  // Calculate grand total
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

  // --- UI ---
  return (
    <Box>
      {/* Search Bar Only */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="🔍 Tìm kiếm nhiệm vụ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="medium"
          fullWidth
          sx={{
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
      </Box>

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
        <Table stickyHeader size="medium">
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
              const isExpanded = expandedRow === nhiemVu._id;
              const isScored = nhiemVu.TongDiemTieuChi > 0;

              return (
                <React.Fragment key={nhiemVu._id}>
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
                        onClick={() => toggleExpandRow(nhiemVu._id)}
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
                    <TableCell sx={{ py: 1.2 }}>
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
                    <TableCell align="center" sx={{ py: 1.2 }}>
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

                    {/* Tiêu chí scores */}
                    {nhiemVu.ChiTietDiem.map((tieuChi, tcIdx) => {
                      const giaTriMin = tieuChi.GiaTriMin;
                      const giaTriMax = tieuChi.GiaTriMax;
                      const isGiamDiem = tieuChi.LoaiTieuChi === "GIAM_DIEM";
                      // ✅ FIX: Unique input id/name for React to track focus
                      const inputId = `score-${nhiemVu._id}-${tcIdx}`;

                      return (
                        <TableCell
                          key={`${nhiemVu._id}-tc-${tcIdx}`}
                          align="center"
                          sx={{
                            py: 1.2,
                            px: 1,
                            bgcolor: isGiamDiem
                              ? "rgba(239, 68, 68, 0.08)"
                              : "rgba(16, 185, 129, 0.08)",
                            borderRight: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <TextField
                            // ✅ FIX: Add unique id and name
                            id={inputId}
                            name={inputId}
                            type="number"
                            value={tieuChi.DiemDat || 0}
                            onChange={(e) => {
                              const rawValue = e.target.value;

                              // ✅ FIX: Allow empty input (when user deletes all)
                              if (rawValue === "" || rawValue === null) {
                                handleScoreChange(nhiemVu._id, tcIdx, 0);
                                return;
                              }

                              let val = parseFloat(rawValue);

                              // Skip if not a valid number
                              if (Number.isNaN(val)) return;

                              // Clamp to min/max range
                              if (val < giaTriMin) val = giaTriMin;
                              if (val > giaTriMax) val = giaTriMax;

                              handleScoreChange(nhiemVu._id, tcIdx, val);
                            }}
                            onBlur={(e) => {
                              // On blur, ensure value is within min/max range
                              const rawValue = e.target.value;
                              let val = parseFloat(rawValue);

                              // If empty or invalid, set to min
                              if (rawValue === "" || Number.isNaN(val)) {
                                handleScoreChange(
                                  nhiemVu._id,
                                  tcIdx,
                                  giaTriMin
                                );
                                return;
                              }

                              // Clamp to range
                              if (val < giaTriMin) val = giaTriMin;
                              if (val > giaTriMax) val = giaTriMax;

                              if (val !== tieuChi.DiemDat) {
                                handleScoreChange(nhiemVu._id, tcIdx, val);
                              }
                            }}
                            // ✅ FIX: Auto-select on focus for better UX
                            onFocus={(e) => e.target.select()}
                            disabled={readOnly}
                            inputProps={{
                              min: giaTriMin,
                              max: giaTriMax,
                              step: 1, // Integer step for cleaner input
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
                                  boxShadow:
                                    "0 4px 12px rgba(102, 126, 234, 0.3)",
                                },
                              },
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight="600"
                                  >
                                    {tieuChi.DonVi || "%"}
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
                        </TableCell>
                      );
                    })}

                    {/* Tổng điểm */}
                    <TableCell
                      align="center"
                      sx={{
                        py: 1.2,
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
                      colSpan={4 + tieuChiHeaders.length + 1}
                      sx={{
                        py: 0,
                        borderBottom: isExpanded ? 1 : 0,
                        bgcolor: isExpanded ? "#f8fafc" : "inherit",
                      }}
                    >
                      <Collapse
                        in={isExpanded}
                        timeout="auto"
                        unmountOnExit
                        onEntered={ensureExpandedRowVisible}
                      >
                        <Box
                          sx={{
                            p: 3,
                            background:
                              "linear-gradient(to bottom, #ffffff 0%, #f1f5f9 100%)",
                            borderRadius: 2,
                            m: 2,
                            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)",
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="700"
                            gutterBottom
                            sx={{
                              color: "primary.main",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            📋 Mô tả nhiệm vụ
                          </Typography>
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                              pl: 3,
                              py: 1,
                              borderLeft: "3px solid",
                              borderColor: "primary.main",
                              bgcolor: "white",
                              borderRadius: 1,
                              mb: 3,
                            }}
                          >
                            {nhiemVu.NhiemVuThuongQuyID?.MoTa ||
                              "Chưa có mô tả"}
                          </Typography>

                          {/* Show detailed score breakdown with formula */}
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="700"
                              gutterBottom
                              sx={{
                                color: "primary.main",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              📊 Chi tiết công thức tính điểm
                            </Typography>

                            <TableContainer
                              component={Paper}
                              variant="outlined"
                              sx={{
                                mt: 1,
                                borderRadius: 2,
                                overflow: "hidden",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              }}
                            >
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ bgcolor: "grey.100" }}>
                                    <TableCell sx={{ fontWeight: "700" }}>
                                      Tiêu chí
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{ fontWeight: "700" }}
                                    >
                                      Công thức
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{ fontWeight: "700" }}
                                    >
                                      Điểm
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {nhiemVu.ChiTietDiem.map((tc, idx) => {
                                    const score = calculateTieuChiScore(tc);
                                    const sign =
                                      tc.LoaiTieuChi === "GIAM_DIEM"
                                        ? "−"
                                        : "+";
                                    const giaTriThucTe = tc.DiemDat || 0;

                                    return (
                                      <TableRow
                                        key={idx}
                                        sx={{
                                          bgcolor:
                                            tc.LoaiTieuChi === "GIAM_DIEM"
                                              ? "error.lighter"
                                              : "success.lighter",
                                        }}
                                      >
                                        <TableCell>
                                          <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                          >
                                            <Typography variant="body2">
                                              {tc.TenTieuChi}
                                            </Typography>
                                            {tc.LoaiTieuChi === "GIAM_DIEM" && (
                                              <Chip
                                                label="GIẢM ĐIỂM"
                                                size="small"
                                                color="error"
                                              />
                                            )}
                                          </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography
                                            variant="body2"
                                            fontFamily="monospace"
                                          >
                                            {sign}
                                            {giaTriThucTe} ÷ 100
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            color={
                                              tc.LoaiTieuChi === "GIAM_DIEM"
                                                ? "error.main"
                                                : "success.main"
                                            }
                                          >
                                            {sign}
                                            {Math.abs(score).toFixed(4)}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}

                                  {/* Sum row */}
                                  <TableRow sx={{ bgcolor: "primary.lighter" }}>
                                    <TableCell colSpan={2}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                      >
                                        Tổng điểm tiêu chí
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                      >
                                        {nhiemVu.ChiTietDiem.reduce(
                                          (sum, tc) =>
                                            sum + calculateTieuChiScore(tc),
                                          0
                                        ).toFixed(4)}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>

                                  {/* Final calculation row */}
                                  <TableRow sx={{ bgcolor: "warning.lighter" }}>
                                    <TableCell colSpan={2}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                      >
                                        Điểm nhiệm vụ (× Độ khó{" "}
                                        {nhiemVu.MucDoKho})
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                        color="primary.main"
                                      >
                                        {calculateNhiemVuTotal(nhiemVu).toFixed(
                                          2
                                        )}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
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
