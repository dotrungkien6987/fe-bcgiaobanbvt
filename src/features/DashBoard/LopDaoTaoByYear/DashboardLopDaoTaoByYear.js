import React, { useEffect, useMemo, useState } from "react";
import { fetchLopDaoTaoByYear, fetchHinhThucCapNhatMap } from "./api";
import {
  Box,
  Button,
  Checkbox,
  Card,
  CardContent,
  Chip,
  Grid,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import CodeMultiSelect from "./CodeMultiSelect";

// Nhóm mã cần hiển thị theo yêu cầu với màu sắc riêng biệt
const GROUPS = {
  "Nhóm đề tài": {
    codes: ["NCKH011", "NCKH012", "NCKH013", "NCKH014"],
    color: "#1976d2",
    bgColor: "#e3f2fd",
    icon: "🎯",
  },
  "Nhóm Sáng kiến": {
    codes: ["NCKH015", "NCKH016", "NCKH017", "NCKH018"],
    color: "#388e3c",
    bgColor: "#e8f5e8",
    icon: "💡",
  },
  "Nhóm Đăng báo": {
    codes: ["NCKH02", "NCKH03"],
    color: "#f57c00",
    bgColor: "#fff3e0",
    icon: "📰",
  },
  "Nhóm Khác": {
    codes: ["NCKH06", "NCKH07"],
    color: "#7b1fa2",
    bgColor: "#f3e5f5",
    icon: "📊",
  },
};

// pivot() removed; use pivotForce everywhere to ensure forced columns show with zeros

// pivot but force columns (mas) to include forceMas even if missing in data
function pivotForce(data, forceMas = []) {
  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
  // include any year even if no data? if no years present, try to infer from data (empty)
  const masSet = new Set(data.map((d) => d.MaHinhThucCapNhat));
  (forceMas || []).forEach((m) => masSet.add(m));
  const mas = Array.from(masSet).sort((a, b) => a.localeCompare(b));
  const labels = Object.fromEntries(
    // prefer TenBenhVien, fallback Ten, then code
    data.map((d) => [
      d.MaHinhThucCapNhat,
      d.TenBenhVien || d.Ten || d.MaHinhThucCapNhat,
    ])
  );
  // ensure labels exist for forced mas
  forceMas.forEach((m) => {
    if (!labels[m]) labels[m] = m;
  });

  const rows = years.map((y) => {
    const row = { year: y };
    mas.forEach((m) => {
      row[m] =
        data.find((d) => d.year === y && d.MaHinhThucCapNhat === m)?.count || 0;
    });
    return row;
  });
  return { rows, mas, labels, years };
}

export default function DashboardLopDaoTaoByYear() {
  const thisYear = new Date().getFullYear();
  const [fromYear, setFromYear] = useState(thisYear - 2);
  const [toYear, setToYear] = useState(thisYear);
  const [onlyCompleted, setOnlyCompleted] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCodes, setSelectedCodes] = useState([]); // [] = tất cả
  const [labelMap, setLabelMap] = useState({}); // { Ma: TenBenhVien }

  const load = async () => {
    setLoading(true);
    try {
      setError("");
      const res = await fetchLopDaoTaoByYear({
        fromYear,
        toYear,
        onlyCompleted,
      });
      setData(res?.data ?? res); // { data: [...] } or [...]
    } catch (e) {
      setError(e?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Only show codes that belong to defined groups
  const allowedCodes = useMemo(() => {
    const s = new Set();
    Object.values(GROUPS).forEach((group) => {
      if (group && group.codes && Array.isArray(group.codes)) {
        group.codes.forEach((c) => s.add(c));
      }
    });
    return Array.from(s);
  }, []);
  const allowedCodesSet = useMemo(() => new Set(allowedCodes), [allowedCodes]);

  const allCodes = useMemo(() => {
    const set = new Set();
    (data || []).forEach((d) => {
      if (allowedCodesSet.has(d.MaHinhThucCapNhat))
        set.add(d.MaHinhThucCapNhat);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data, allowedCodesSet]);

  // Tự động tải dữ liệu khi vào trang và khi thay đổi bộ lọc năm/trạng thái
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromYear, toYear, onlyCompleted]);

  // Load label map once
  useEffect(() => {
    (async () => {
      try {
        const map = await fetchHinhThucCapNhatMap();
        setLabelMap(map || {});
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const filterOptions = useMemo(
    () =>
      allCodes.map((c) => ({
        value: c,
        label: data.find((d) => d.MaHinhThucCapNhat === c)?.TenBenhVien || c,
      })),
    [allCodes, data]
  );

  const filtered = useMemo(() => {
    const base = (data || []).filter((d) =>
      allowedCodesSet.has(d.MaHinhThucCapNhat)
    );
    if (!selectedCodes?.length) return base;
    const chosen = new Set(selectedCodes.filter((c) => allowedCodesSet.has(c)));
    return base.filter((d) => chosen.has(d.MaHinhThucCapNhat));
  }, [data, selectedCodes, allowedCodesSet]);

  const { rows, mas, labels, years } = useMemo(() => {
    const forced = selectedCodes?.length
      ? selectedCodes.filter((c) => allowedCodesSet.has(c))
      : allowedCodes;
    const base = pivotForce(filtered || [], forced);
    // merge backend/inferred labels with global labelMap to ensure TenBenhVien for zero-count series
    const mergedLabels = { ...base.labels };
    for (const m of base.mas) {
      if (!mergedLabels[m] && labelMap[m]) mergedLabels[m] = labelMap[m];
      else if (labelMap[m]) mergedLabels[m] = labelMap[m];
    }
    return { ...base, labels: mergedLabels };
  }, [filtered, selectedCodes, allowedCodes, allowedCodesSet, labelMap]);

  // Tính toán theo nhóm
  const groupedResults = useMemo(() => {
    const results = [];
    const filteredData = filtered || [];
    const groupedCodeSet = new Set();
    Object.values(GROUPS).forEach((group) => {
      if (group && Array.isArray(group.codes)) {
        group.codes.forEach((c) => groupedCodeSet.add(c));
      }
    });

    // Các nhóm được định nghĩa
    for (const [name, group] of Object.entries(GROUPS)) {
      const codeSet = new Set(group.codes);
      const dataInGroup = filteredData.filter((d) =>
        codeSet.has(d.MaHinhThucCapNhat)
      );
      // use pivotForce so forced codes appear as columns (with 0) even if missing
      const p = pivotForce(dataInGroup, group.codes);
      const merged = { ...p, labels: { ...p.labels } };
      group.codes.forEach((m) => {
        if (labelMap[m]) merged.labels[m] = labelMap[m];
      });
      results.push({ name, group, codes: group.codes, ...merged });
    }

    // Nhóm còn lại
    const others = filteredData.filter(
      (d) => !groupedCodeSet.has(d.MaHinhThucCapNhat)
    );
    const pOthers = pivotForce(others, []);
    const mergedOthers = { ...pOthers, labels: { ...pOthers.labels } };
    Object.keys(mergedOthers.labels).forEach((m) => {
      if (labelMap[m]) mergedOthers.labels[m] = labelMap[m];
    });
    return { groups: results, others: mergedOthers };
  }, [filtered, labelMap]);

  return (
    <Box sx={{ p: 3, bgcolor: "grey.50", minHeight: "100vh" }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Box sx={{ fontSize: 32 }}>📊</Box>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Thống kê Lớp Đào Tạo
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Theo năm và mã hình thức cập nhật
            </Typography>
          </Box>
        </Stack>

        {!!error && (
          <Paper
            elevation={1}
            sx={{ p: 2, bgcolor: "error.light", color: "white", mb: 2 }}
          >
            <Typography variant="body2">{String(error)}</Typography>
          </Paper>
        )}

        {/* Controls */}
        <Card variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Bộ lọc dữ liệu
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              label="Từ năm"
              type="number"
              size="small"
              value={fromYear}
              onChange={(e) =>
                setFromYear(parseInt(e.target.value || thisYear, 10))
              }
              sx={{ width: 140 }}
              variant="outlined"
            />
            <TextField
              label="Đến năm"
              type="number"
              size="small"
              value={toYear}
              onChange={(e) =>
                setToYear(parseInt(e.target.value || thisYear, 10))
              }
              sx={{ width: 140 }}
              variant="outlined"
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={onlyCompleted}
                  onChange={(e) => setOnlyCompleted(e.target.checked)}
                />
              }
              label="Chỉ lớp hoàn thành"
            />
            <CodeMultiSelect
              options={filterOptions}
              value={selectedCodes}
              onChange={setSelectedCodes}
              label="Mã hình thức"
            />
            <Button
              onClick={load}
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 120, height: 40 }}
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </Button>
          </Stack>
        </Card>
      </Paper>

      {/* Overview Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box sx={{ fontSize: 24, mr: 2 }}>📈</Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Tổng quan
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card variant="outlined" sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Biểu đồ cột
                </Typography>
                {rows.length > 0 && mas.length > 0 ? (
                  <BarChart
                    dataset={rows}
                    xAxis={[{ scaleType: "band", dataKey: "year" }]}
                    series={mas.map((m) => ({
                      dataKey: m,
                      label: labels[m] || m,
                      stack: "a",
                    }))}
                    height={320}
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 320,
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body1">
                      Không có dữ liệu trong khoảng năm đã chọn
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card variant="outlined" sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Bảng số liệu
                </Typography>
                <TableContainer sx={{ maxHeight: 320 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Năm</TableCell>
                        {mas.map((m) => (
                          <TableCell
                            key={m}
                            align="right"
                            sx={{ fontWeight: 600 }}
                          >
                            {labels[m] || m}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {years.map((y) => (
                        <TableRow key={y} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{y}</TableCell>
                          {mas.map((m) => (
                            <TableCell key={m} align="right">
                              {rows.find((r) => r.year === y)?.[m] || 0}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Grouped Sections */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Box sx={{ fontSize: 24 }}>📊</Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Chi tiết theo nhóm
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {groupedResults.groups.map((g, index) => (
            <Grid item xs={12} key={g.name}>
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `2px solid ${g.group.color}`,
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
              >
                {/* Group Header */}
                <Box
                  sx={{
                    bgcolor: g.group.bgColor,
                    p: 2,
                    borderBottom: `1px solid ${g.group.color}30`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ fontSize: 28 }}>{g.group.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: g.group.color }}
                      >
                        {g.name}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={1}>
                        {g.group.codes.map((code) => (
                          <Chip
                            key={code}
                            label={labelMap[code] || code}
                            size="small"
                            sx={{
                              bgcolor: g.group.color + "20",
                              color: g.group.color,
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                {/* Group Content */}
                <CardContent sx={{ p: 3 }}>
                  {g.rows.length > 0 && g.mas.length > 0 ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={7}>
                        <Card variant="outlined" sx={{ height: 400 }}>
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              sx={{ mb: 2, fontWeight: 600 }}
                            >
                              📈 Biểu đồ cột
                            </Typography>
                            <BarChart
                              dataset={g.rows}
                              xAxis={[{ scaleType: "band", dataKey: "year" }]}
                              series={g.mas.map((m, idx) => ({
                                dataKey: m,
                                label: g.labels[m] || m,
                                stack: "a",
                                color: `${g.group.color}${80 + idx * 20}`,
                              }))}
                              height={320}
                            />
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={5}>
                        <Card variant="outlined" sx={{ height: 400 }}>
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              sx={{ mb: 2, fontWeight: 600 }}
                            >
                              📋 Bảng chi tiết
                            </Typography>
                            <TableContainer sx={{ maxHeight: 320 }}>
                              <Table size="small" stickyHeader>
                                <TableHead>
                                  <TableRow>
                                    <TableCell
                                      sx={{
                                        fontWeight: 600,
                                        bgcolor: g.group.bgColor,
                                      }}
                                    >
                                      Năm
                                    </TableCell>
                                    {g.mas.map((m) => (
                                      <TableCell
                                        key={m}
                                        align="right"
                                        sx={{
                                          fontWeight: 600,
                                          bgcolor: g.group.bgColor,
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        {g.labels[m] || m}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {g.years.map((y) => (
                                    <TableRow key={y} hover>
                                      <TableCell sx={{ fontWeight: 500 }}>
                                        {y}
                                      </TableCell>
                                      {g.mas.map((m) => (
                                        <TableCell key={m} align="right">
                                          <Chip
                                            label={
                                              g.rows.find(
                                                (r) => r.year === y
                                              )?.[m] || 0
                                            }
                                            size="small"
                                            sx={{
                                              bgcolor: g.group.color + "15",
                                              color: g.group.color,
                                              fontWeight: 600,
                                              minWidth: 40,
                                            }}
                                          />
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box
                      sx={{
                        p: 4,
                        textAlign: "center",
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        border: "2px dashed",
                        borderColor: "grey.300",
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ fontSize: 16 }}
                      >
                        📊 Không có dữ liệu cho nhóm này
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Ẩn các mã còn lại theo yêu cầu */}
    </Box>
  );
}
