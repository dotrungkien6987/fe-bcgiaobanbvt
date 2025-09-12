import React, { useEffect, useMemo, useState } from "react";
import { fetchLopDaoTaoByYear, fetchHinhThucCapNhatMap } from "./api";
import { Box, Typography } from "@mui/material";
import FilterSection from "./FilterSection";
import OverviewSection from "./OverviewSection";
import GroupSection from "./GroupSection";
import { GROUPS, pivotForce } from "./constants";

export default function DashboardLopDaoTaoByYear() {
  const thisYear = new Date().getFullYear();
  const [fromYear, setFromYear] = useState(thisYear - 2);
  const [toYear, setToYear] = useState(thisYear);
  const [onlyCompleted, setOnlyCompleted] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [labelMap, setLabelMap] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      setError("");
      const res = await fetchLopDaoTaoByYear({
        fromYear,
        toYear,
        onlyCompleted,
      });
      setData(res?.data ?? res);
    } catch (e) {
      setError(e?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromYear, toYear, onlyCompleted]);

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
    const mergedLabels = { ...base.labels };
    for (const m of base.mas) {
      if (!mergedLabels[m] && labelMap[m]) mergedLabels[m] = labelMap[m];
      else if (labelMap[m]) mergedLabels[m] = labelMap[m];
    }
    return { ...base, labels: mergedLabels };
  }, [filtered, selectedCodes, allowedCodes, allowedCodesSet, labelMap]);

  const groupedResults = useMemo(() => {
    const results = [];
    const filteredData = filtered || [];
    const groupedCodeSet = new Set();
    Object.values(GROUPS).forEach((group) => {
      if (group && Array.isArray(group.codes)) {
        group.codes.forEach((c) => groupedCodeSet.add(c));
      }
    });

    for (const [name, group] of Object.entries(GROUPS)) {
      const codeSet = new Set(group.codes);
      const dataInGroup = filteredData.filter((d) =>
        codeSet.has(d.MaHinhThucCapNhat)
      );
      const base = pivotForce(dataInGroup, group.codes);
      const mergedLabels = { ...base.labels };
      for (const m of base.mas) {
        if (!mergedLabels[m] && labelMap[m]) mergedLabels[m] = labelMap[m];
        else if (labelMap[m]) mergedLabels[m] = labelMap[m];
      }
      results.push({
        name,
        group,
        ...base,
        labels: mergedLabels,
      });
    }

    const others = filteredData.filter(
      (d) => !groupedCodeSet.has(d.MaHinhThucCapNhat)
    );
    const othersBase = pivotForce(others);
    const othersMergedLabels = { ...othersBase.labels };
    for (const m of othersBase.mas) {
      if (!othersMergedLabels[m] && labelMap[m])
        othersMergedLabels[m] = labelMap[m];
      else if (labelMap[m]) othersMergedLabels[m] = labelMap[m];
    }

    return {
      groups: results,
      others: { ...othersBase, labels: othersMergedLabels },
    };
  }, [filtered, labelMap]);

  return (
    <Box sx={{ p: 3, bgcolor: "grey.50", minHeight: "100vh" }}>
      {/* <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #1976d2, #42a5f5)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          📊 Dashboard Lớp Đào Tạo Theo Năm
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Thống kê số lượng lớp đào tạo theo năm và nhóm mã hình thức cập nhật
        </Typography>
      </Box> */}

      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "error.light",
            color: "error.contrastText",
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          ⚠️ {error}
        </Box>
      )}

      <FilterSection
        fromYear={fromYear}
        setFromYear={setFromYear}
        toYear={toYear}
        setToYear={setToYear}
        onlyCompleted={onlyCompleted}
        setOnlyCompleted={setOnlyCompleted}
        selectedCodes={selectedCodes}
        setSelectedCodes={setSelectedCodes}
        filterOptions={filterOptions}
        loading={loading}
        onRefresh={load}
      />

      <OverviewSection rows={rows} mas={mas} labels={labels} years={years} />

      <GroupSection groupedResults={groupedResults} />
    </Box>
  );
}
