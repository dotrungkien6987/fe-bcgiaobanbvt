import React, { useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Box,
  Checkbox,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { computeVariables } from "../utils/formulaVariables";
import {
  evaluatePipeline,
  ensurePipeline,
  pipelineToText,
  STEP_TYPE_LABELS,
} from "../utils/formulaEvaluator";
import { batchCreateManTinh, fetchDanhSachManTinh } from "../datLichKhamSlice";
import LichSuKhamDialog from "../Tab2_ChiTiet/LichSuKhamDialog";

function parseLichSu(lichsu_kham) {
  if (!lichsu_kham) return [];
  if (typeof lichsu_kham === "string") {
    try {
      return JSON.parse(lichsu_kham);
    } catch {
      return [];
    }
  }
  return Array.isArray(lichsu_kham) ? lichsu_kham : [];
}

/**
 * Dialog hiển thị kết quả chạy công thức + xác nhận đánh dấu
 *
 * @param {boolean} open
 * @param {Function} onClose
 * @param {Object} congThuc - Công thức đang chạy (có dieuKien, tenCongThuc)
 * @param {Array} vong1Data - Dữ liệu đã enrich (từ ManTinhTable)
 * @param {Set<string>} chronicCodeSet - Set mã ICD mãn tính
 * @param {Object} danhSachManTinh - Map đã đánh dấu
 * @param {Function} onDone - Callback sau khi đánh dấu xong
 */
function KetQuaCongThucDialog({
  open,
  onClose,
  congThuc,
  vong1Data = [],
  chronicCodeSet = new Set(),
  danhSachManTinh = {},
  onDone,
}) {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [lichSuPatient, setLichSuPatient] = useState(null);

  // Evaluate pipeline on all patients
  const results = useMemo(() => {
    if (!congThuc || !vong1Data.length) return [];

    const pl = ensurePipeline(congThuc);
    if (!pl.length) return [];

    return vong1Data
      .map((row) => {
        const variables = computeVariables(row, chronicCodeSet);
        const { matched, stepResults } = evaluatePipeline(pl, variables);
        const isAlreadyMarked = Boolean(danhSachManTinh[row.dangkykhamid]);

        return {
          ...row,
          variables,
          matched,
          stepResults,
          isAlreadyMarked,
        };
      })
      .filter((r) => r.matched);
  }, [congThuc, vong1Data, chronicCodeSet, danhSachManTinh]);

  // Auto-select unmark patients on results change
  useMemo(() => {
    const newSet = new Set(
      results.filter((r) => !r.isAlreadyMarked).map((r) => r.dangkykhamid),
    );
    setSelected(newSet);
  }, [results]);

  const unmarkedResults = results.filter((r) => !r.isAlreadyMarked);
  const alreadyMarkedCount = results.filter((r) => r.isAlreadyMarked).length;

  const handleToggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selected.size === unmarkedResults.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(unmarkedResults.map((r) => r.dangkykhamid)));
    }
  }, [unmarkedResults, selected.size]);

  const handleConfirm = useCallback(async () => {
    const toMark = results.filter(
      (r) => !r.isAlreadyMarked && selected.has(r.dangkykhamid),
    );
    if (toMark.length === 0) return;

    setSaving(true);
    const items = toMark.map((r) => ({
      dangkykhamid: r.dangkykhamid,
      patientid_old: r.patientid_old,
      vienphiid: r.vienphiid,
      nguoigioithieuid: r.nguoigioithieuid,
      ghiChu: `[Công thức: ${congThuc.tenCongThuc}] ${(r.stepResults || []).map((sr) => `[${sr.tenStep || sr.loaiStep}] ${sr.explanations.join(", ")}`).join(" → ")}`,

      snapshot: {
        patientname: r.patientname,
        birthday: r.birthday,
        chandoanravien: r.chandoanravien,
        chandoanravien_code: r.chandoanravien_code,
        ten_ngt: r.ten_ngt,
        dangkykhamdate: r.dangkykhamdate,
      },
    }));

    const ok = await dispatch(batchCreateManTinh(items));
    setSaving(false);

    if (ok) {
      // Re-fetch to sync
      const allIds = vong1Data.map((r) => r.dangkykhamid);
      dispatch(fetchDanhSachManTinh(allIds));
      onDone?.();
      onClose();
    }
  }, [results, selected, congThuc, vong1Data, dispatch, onDone, onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <AppBar sx={{ position: "relative" }} color="secondary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Stack sx={{ ml: 2, flex: 1 }}>
            <Typography variant="h6">
              Kết quả lọc mãn tính theo công thức
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Công thức: <strong>{congThuc?.tenCongThuc}</strong>
            </Typography>
          </Stack>
          {unmarkedResults.length > 0 && (
            <Button
              variant="contained"
              color="inherit"
              sx={{ color: "secondary.main" }}
              startIcon={<CheckIcon />}
              onClick={handleConfirm}
              disabled={selected.size === 0 || saving}
            >
              Xác nhận đánh dấu {selected.size} bệnh nhân
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <DialogContent dividers>
        {saving && <LinearProgress sx={{ mb: 1 }} />}

        {/* Pipeline description */}
        <Typography
          variant="caption"
          sx={{
            bgcolor: "grey.100",
            p: 0.5,
            borderRadius: 0.5,
            mb: 1,
            display: "block",
            whiteSpace: "pre-wrap",
          }}
        >
          {congThuc ? pipelineToText(ensurePipeline(congThuc)) : ""}
        </Typography>

        {/* Summary */}
        <Alert
          severity={results.length > 0 ? "success" : "info"}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            Tìm thấy <strong>{results.length}</strong> bệnh nhân khớp công thức
            {alreadyMarkedCount > 0 && (
              <>
                {" "}
                (trong đó <strong>{alreadyMarkedCount}</strong> đã được đánh dấu
                trước đó)
              </>
            )}
            {unmarkedResults.length > 0 && (
              <>
                {" "}
                — Đã chọn <strong>{selected.size}</strong> /{" "}
                {unmarkedResults.length} để đánh dấu mới
              </>
            )}
          </Typography>
        </Alert>

        {results.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              Không tìm thấy bệnh nhân nào khớp công thức.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: "calc(100vh - 380px)" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ width: 42 }}>
                    <Checkbox
                      indeterminate={
                        selected.size > 0 &&
                        selected.size < unmarkedResults.length
                      }
                      checked={
                        unmarkedResults.length > 0 &&
                        selected.size === unmarkedResults.length
                      }
                      onChange={handleSelectAll}
                      disabled={unmarkedResults.length === 0}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: 50 }}>
                    STT
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: 80 }}>
                    Mã BN
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: 150 }}>
                    Bệnh nhân
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: 130 }}>
                    Khoa khám
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: 130 }}>
                    Phòng khám
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", width: 70 }}
                    align="center"
                  >
                    SL khám
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: 120 }}>
                    Mã bệnh chính
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Diễn giải</TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", width: 100 }}
                    align="center"
                  >
                    LS Khám
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", width: 90 }}
                    align="center"
                  >
                    Trạng thái
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, idx) => (
                  <TableRow
                    key={row.dangkykhamid}
                    hover
                    sx={
                      row.isAlreadyMarked
                        ? { bgcolor: "#f3e5f5", opacity: 0.7 }
                        : {}
                    }
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.has(row.dangkykhamid)}
                        onChange={() => handleToggle(row.dangkykhamid)}
                        disabled={row.isAlreadyMarked}
                      />
                    </TableCell>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row.patientid_old || "—"}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {row.patientname}
                        </Typography>
                        {row.birthday && (
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(row.birthday).format("DD/MM/YYYY")}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{row.vp_departmentgroupname || "—"}</TableCell>
                    <TableCell>{row.vp_departmentname || "—"}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.variables?.soLanKham || 0}
                        size="small"
                        color={
                          (row.variables?.soLanKham || 0) >= 3
                            ? "warning"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {row.variables?.maBenhTrung_maxCode ? (
                        <Tooltip
                          title={`${row.variables.maBenhTrung_maxCode} × ${row.variables.maBenhTrung_max} lần`}
                        >
                          <Chip
                            label={row.variables.maBenhTrung_maxCode}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {(row.stepResults || []).map((sr, si) => (
                          <Box key={si}>
                            <Chip
                              label={`${sr.tenStep || `B${si + 1}`} (${STEP_TYPE_LABELS[sr.loaiStep]?.label || sr.loaiStep})`}
                              size="small"
                              color={sr.matched ? "success" : "default"}
                              variant="outlined"
                              sx={{ mb: 0.25, fontSize: "0.65rem" }}
                            />
                            {sr.explanations.map((exp, i) => (
                              <Typography
                                key={i}
                                variant="caption"
                                sx={{
                                  display: "block",
                                  pl: 1,
                                  color: exp.includes("✓")
                                    ? "success.dark"
                                    : "error.dark",
                                }}
                              >
                                {exp}
                              </Typography>
                            ))}
                          </Box>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Chip
                          label={`${parseLichSu(row.lichsu_kham).length} lần`}
                          size="small"
                          color={
                            parseLichSu(row.lichsu_kham).length >= 3
                              ? "warning"
                              : "default"
                          }
                          variant={
                            parseLichSu(row.lichsu_kham).length >= 3
                              ? "filled"
                              : "outlined"
                          }
                        />
                        {row.lichsu_kham && (
                          <Tooltip title="Xem lịch sử">
                            <IconButton
                              size="small"
                              onClick={() => setLichSuPatient(row)}
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      {row.isAlreadyMarked ? (
                        <Chip
                          label="Đã đánh dấu"
                          size="small"
                          color="secondary"
                        />
                      ) : (
                        <Chip
                          label="Chưa đánh dấu"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>

      {/* Lịch sử khám dialog */}
      <LichSuKhamDialog
        open={Boolean(lichSuPatient)}
        onClose={() => setLichSuPatient(null)}
        patient={lichSuPatient}
      />
    </Dialog>
  );
}

export default KetQuaCongThucDialog;
