import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// data: [{ year, hoSo, thanhVien }]
export default function BarWithMembers({
  title = "Biểu đồ số đoàn (cột) + thành viên (nhãn)",
  data = [],
  barColor = "#1e88e5",
  height = 360,
  // Customizations for reuse
  barYAxisTitle = "Số đoàn",
  barSeriesName = "Số đoàn",
  labelPrefix = "Thành viên",
  tooltipFormatter, // (val, tv) => string
  membersColor = "#9c27b0", // màu hiển thị cho cột Thành viên trong bảng
}) {
  const { categories, barSeries, members } = useMemo(() => {
    const cats = (data || []).map((x) => x.year);
    const bar = (data || []).map((x) => x.hoSo ?? 0);
    const mem = (data || []).map((x) => x.thanhVien ?? 0);
    return { categories: cats, barSeries: bar, members: mem };
  }, [data]);

  const options = useMemo(
    () => ({
      chart: { type: "bar", toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: "55%", borderRadius: 4 } },
      dataLabels: {
        enabled: true,
        style: { fontSize: "11px" },
        formatter: (val, opts) => {
          const idx = opts?.dataPointIndex ?? 0;
          const tvRaw = members[idx];
          const tv = Number.isFinite(Number(tvRaw)) ? Number(tvRaw) : 0;
          return `${labelPrefix}: ${tv}`;
        },
        offsetY: -6,
      },
      xaxis: { categories, labels: { rotate: 0 } },
      yaxis: {
        title: { text: barYAxisTitle },
        labels: { formatter: (v) => Math.round(v) },
      },
      tooltip: {
        y: {
          formatter: (val, { dataPointIndex }) => {
            const tvRaw = members[dataPointIndex];
            const tv = Number.isFinite(Number(tvRaw)) ? Number(tvRaw) : 0;
            return tooltipFormatter
              ? tooltipFormatter(val, tv)
              : `${barSeriesName}: ${val} | ${labelPrefix}: ${tv}`;
          },
        },
      },
      legend: { show: false },
      colors: [barColor],
      grid: { strokeDashArray: 4 },
    }),
    [
      categories,
      members,
      barColor,
      barYAxisTitle,
      barSeriesName,
      labelPrefix,
      tooltipFormatter,
    ]
  );

  const series = useMemo(
    () => [{ name: barSeriesName, data: barSeries }],
    [barSeries, barSeriesName]
  );

  const { totalBar, totalMembers } = useMemo(() => {
    const tb = (barSeries || []).reduce((sum, v) => {
      const n = Number(v);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    const tm = (members || []).reduce((sum, v) => {
      const n = Number(v);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    return { totalBar: tb, totalMembers: tm };
  }, [barSeries, members]);

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardHeader title={title} />
      <CardContent>
        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={8} lg={8} xl={8}>
            <div style={{ width: "100%", height: height }}>
              <ReactApexChart
                key={`${title}-${(categories || []).join(",")}-${(
                  members || []
                ).join(",")}`}
                options={options}
                series={series}
                type="bar"
                height="100%"
              />
            </div>
            {/* Legend phụ: hiển thị số thành viên theo năm */}
            <Stack
              direction="row"
              flexWrap="wrap"
              spacing={1}
              useFlexGap
              sx={{ mt: 2 }}
            >
              {categories.map((y, i) => (
                <Chip
                  key={y}
                  size="small"
                  label={`${y}: ${labelPrefix} ${
                    Number.isFinite(Number(members[i])) ? Number(members[i]) : 0
                  }`}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} md={4} lg={4} xl={4}>
            {/* Bảng chi tiết theo năm (không có cột tổng) */}
            <TableContainer sx={{ mt: { xs: 2, md: 0 }, maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        bgcolor: "grey.100",
                        textAlign: "center",
                      }}
                    >
                      Năm
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, bgcolor: "grey.100" }}
                    >
                      {barSeriesName}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, bgcolor: "grey.100" }}
                    >
                      {labelPrefix}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((y, i) => {
                    const hoSo = Number.isFinite(Number(barSeries[i]))
                      ? Number(barSeries[i])
                      : 0;
                    const tv = Number.isFinite(Number(members[i]))
                      ? Number(members[i])
                      : 0;
                    return (
                      <TableRow key={`row-${y}`} hover>
                        <TableCell
                          sx={{ fontWeight: 500, textAlign: "center" }}
                        >
                          {y}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={hoSo}
                            size="small"
                            sx={{
                              bgcolor: `${barColor}20`,
                              color: barColor,
                              fontWeight: 600,
                              minWidth: 40,
                              border: `1px solid ${barColor}40`,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={tv}
                            size="small"
                            sx={{
                              bgcolor: `${membersColor}20`,
                              color: membersColor,
                              fontWeight: 600,
                              minWidth: 40,
                              border: `1px solid ${membersColor}40`,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {/* Hàng tổng cộng cuối cùng */}
                <TableBody>
                  <TableRow hover>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: "center",
                        bgcolor: "grey.50",
                      }}
                    >
                      Tổng
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: "grey.50" }}>
                      <Chip
                        label={totalBar}
                        size="small"
                        sx={{
                          bgcolor: `${barColor}20`,
                          color: barColor,
                          fontWeight: 700,
                          minWidth: 48,
                          border: `1px solid ${barColor}40`,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: "grey.50" }}>
                      <Chip
                        label={totalMembers}
                        size="small"
                        sx={{
                          bgcolor: `${membersColor}20`,
                          color: membersColor,
                          fontWeight: 700,
                          minWidth: 48,
                          border: `1px solid ${membersColor}40`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
