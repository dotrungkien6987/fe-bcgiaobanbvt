import React from "react";
import { Grid, Card, CardContent, CardHeader } from "@mui/material";
import BarChartByDepartment from "./BarChartByDepartment";
import PieChartStatus from "./PieChartStatus";
import DistributionChart from "./DistributionChart";
import TrendLineChart from "./TrendLineChart";

function ChartsSection() {
  return (
    <Grid container spacing={3}>
      {/* Biểu đồ cột - Điểm TB theo khoa */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader
            title="Điểm trung bình theo Khoa/Phòng"
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
          />
          <CardContent>
            <BarChartByDepartment />
          </CardContent>
        </Card>
      </Grid>

      {/* Biểu đồ tròn - Trạng thái duyệt */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader
            title="Tình trạng phê duyệt"
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
          />
          <CardContent>
            <PieChartStatus />
          </CardContent>
        </Card>
      </Grid>

      {/* Phân bổ mức điểm */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Phân bổ mức điểm"
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
          />
          <CardContent>
            <DistributionChart />
          </CardContent>
        </Card>
      </Grid>

      {/* Xu hướng theo tháng */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Xu hướng điểm theo tháng"
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
          />
          <CardContent>
            <TrendLineChart />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default ChartsSection;
