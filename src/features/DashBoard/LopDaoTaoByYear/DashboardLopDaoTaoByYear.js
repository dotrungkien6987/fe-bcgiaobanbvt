import React, { useEffect, useMemo, useState } from "react";
import {
  fetchLopDaoTaoByYear,
  fetchHinhThucCapNhatMap,
  fetchDoanRaByYear,
  fetchDoanVaoByYear,
  fetchTapSanByYear,
  fetchTapSanBaiBaoByYear,
} from "./api";
import { Box } from "@mui/material";
import FilterSection from "./FilterSection";
import OverviewSection from "./OverviewSection";
import GroupSection from "./GroupSection";
import { GROUPS, pivotForce } from "./constants";
import BarWithMembers from "./BarWithMembers";
import DualAxisBarLine from "./DualAxisBarLine";

export default function DashboardLopDaoTaoByYear() {
  const thisYear = new Date().getFullYear();
  const [fromYear, setFromYear] = useState(thisYear - 2);
  const [toYear, setToYear] = useState(thisYear);
  const [onlyCompleted, setOnlyCompleted] = useState(false);
  const [data, setData] = useState([]);
  const [doanRa, setDoanRa] = useState([]);
  const [doanVao, setDoanVao] = useState([]);
  const [tapSan, setTapSan] = useState([]);
  const [tapSanBaiBao, setTapSanBaiBao] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [labelMap, setLabelMap] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      setError("");
      const [res, dr, dv, ts, tsbb] = await Promise.all([
        fetchLopDaoTaoByYear({
          fromYear,
          toYear,
          onlyCompleted,
        }),
        fetchDoanRaByYear({ fromYear, toYear }),
        fetchDoanVaoByYear({ fromYear, toYear }),
        fetchTapSanByYear({ fromYear, toYear }),
        fetchTapSanBaiBaoByYear({ fromYear, toYear }),
      ]);
      setData(res?.data ?? res);
      setDoanRa(dr || []);
      setDoanVao(dv || []);
      setTapSan(ts || []);
      setTapSanBaiBao(tsbb || []);
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

  // Build pivoted overviews for new datasets
  const drMap = useMemo(() => {
    const m = { HoSo: [], ThanhVien: [] };
    (doanRa || []).forEach((i) => {
      const k = i.Key || i.key || i.type || "";
      if (k === "HoSo" || k === "ThanhVien") {
        m[k].push({ year: i.year, count: i.count });
      }
    });
    return m;
  }, [doanRa]);

  const dvMap = useMemo(() => {
    const m = { HoSo: [], ThanhVien: [] };
    (doanVao || []).forEach((i) => {
      const k = i.Key || i.key || i.type || "";
      if (k === "HoSo" || k === "ThanhVien") {
        m[k].push({ year: i.year, count: i.count });
      }
    });
    return m;
  }, [doanVao]);

  const tsMap = useMemo(() => {
    const m = { TTT: [], YHTH: [] };
    (tapSan || []).forEach((i) => {
      const k = i.Key || i.Loai || i.type || "";
      if (k === "TTT" || k === "YHTH") {
        m[k].push({ year: i.year, count: i.count });
      }
    });
    return m;
  }, [tapSan]);

  const tsbbMap = useMemo(() => {
    const m = { TTT: [], YHTH: [] };
    (tapSanBaiBao || []).forEach((i) => {
      const k = i.Key || i.Loai || i.type || "";
      if (k === "TTT" || k === "YHTH") {
        m[k].push({ year: i.year, count: i.count });
      }
    });
    return m;
  }, [tapSanBaiBao]);

  // Chuẩn hóa cho BarWithMembers: [{ year, hoSo, thanhVien }]
  const drBarData = useMemo(() => {
    const byYear = new Map();
    (doanRa || []).forEach((x) => {
      const y = x.year;
      const o = byYear.get(y) || { year: y, hoSo: 0, thanhVien: 0 };
      if ((x.Key || x.key) === "HoSo") o.hoSo = x.count || 0;
      if ((x.Key || x.key) === "ThanhVien") o.thanhVien = x.count || 0;
      byYear.set(y, o);
    });
    for (let y = fromYear; y <= toYear; y++) {
      if (!byYear.has(y)) byYear.set(y, { year: y, hoSo: 0, thanhVien: 0 });
    }
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  }, [doanRa, fromYear, toYear]);

  const dvBarData = useMemo(() => {
    const byYear = new Map();
    (doanVao || []).forEach((x) => {
      const y = x.year;
      const o = byYear.get(y) || { year: y, hoSo: 0, thanhVien: 0 };
      if ((x.Key || x.key) === "HoSo") o.hoSo = x.count || 0;
      if ((x.Key || x.key) === "ThanhVien") o.thanhVien = x.count || 0;
      byYear.set(y, o);
    });
    for (let y = fromYear; y <= toYear; y++) {
      if (!byYear.has(y)) byYear.set(y, { year: y, hoSo: 0, thanhVien: 0 });
    }
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  }, [doanVao, fromYear, toYear]);

  // Helper: build [{year, hoSo, thanhVien}] for TapSan where
  // hoSo = số tạp san (from tapSan), thanhVien = số bài báo (from tapSanBaiBao) of the SAME type
  const buildTapSanWithArticles = (type) => {
    const byYear = new Map();
    (tapSan || [])
      .filter((x) => (x.Key || x.Loai) === type)
      .forEach((x) => {
        const y = x.year;
        const o = byYear.get(y) || { year: y, hoSo: 0, thanhVien: 0 };
        o.hoSo = x.count || 0; // số tạp san
        byYear.set(y, o);
      });
    (tapSanBaiBao || [])
      .filter((x) => (x.Key || x.Loai) === type)
      .forEach((x) => {
        const y = x.year;
        const o = byYear.get(y) || { year: y, hoSo: 0, thanhVien: 0 };
        o.thanhVien = x.count || 0; // số bài báo
        byYear.set(y, o);
      });
    for (let y = fromYear; y <= toYear; y++) {
      if (!byYear.has(y)) byYear.set(y, { year: y, hoSo: 0, thanhVien: 0 });
    }
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  };

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

    
      {/* Biểu đồ 2 trục cho Đoàn vào */}
      {/* <DualAxisBarLine
        title="Đoàn vào: Số đoàn (bar) & Số thành viên (line)"
        barName="Số đoàn vào"
        lineName="Số thành viên"
        barColor="#43a047"
        lineColor="#2e7d32"
        data={(() => {
          const ys = Array.from(
            new Set([...dvMap.HoSo, ...dvMap.ThanhVien].map((i) => i.year))
          ).sort((a, b) => a - b);
          return ys.map((y) => ({
            year: y,
            hoSo: dvMap.HoSo.find((i) => i.year === y)?.count || 0,
            thanhVien: dvMap.ThanhVien.find((i) => i.year === y)?.count || 0,
          }));
        })()}
      /> */}

      <GroupSection groupedResults={groupedResults} />

        {/* Biểu đồ cột bình thường, hiển thị số đoàn (cột) và gắn nhãn số thành viên */}
      <BarWithMembers
        title="Đoàn ra"
        data={drBarData}
        barColor="#1e88e5"
      />
      <BarWithMembers
        title="Đoàn vào"
        data={dvBarData}
        barColor="#43a047"
      />


      {/* Tạp san Thuốc (TTT): cột = số tạp san TTT, nhãn = số bài báo TTT */}
      <BarWithMembers
        title="Tạp san thông tin thuốc "
        data={buildTapSanWithArticles("TTT")}
        barColor="#8e24aa"
        barYAxisTitle="Số tạp san TTT"
        barSeriesName="TTT"
        labelPrefix="Bài báo"
        tooltipFormatter={(val, tv) => `TTT: ${val} | Bài báo: ${tv}`}
      />

      {/* Tạp san Y học thực hành (YHTH): cột = số tạp san YHTH, nhãn = số bài báo YHTH */}
      <BarWithMembers
        title="Tạp san y học thực hành "
        data={buildTapSanWithArticles("YHTH")}
        barColor="#6d4c41"
        barYAxisTitle="Số tạp san YHTH"
        barSeriesName="YHTH"
        labelPrefix="Bài báo"
        tooltipFormatter={(val, tv) => `YHTH: ${val} | Bài báo: ${tv}`}
      />
    </Box>
  );
}
