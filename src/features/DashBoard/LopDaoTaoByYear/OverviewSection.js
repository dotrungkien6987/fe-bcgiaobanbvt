import React from "react";
import { Box, Card, CardContent, Grid, Paper, Typography } from "@mui/material";
import GroupChart from "./GroupChart";
import DataTable from "./DataTable";
import { createOverviewColorPalette } from "./constants";

export default function OverviewSection({ rows, mas, labels, years }) {
  const overviewColorPalette = createOverviewColorPalette();

  return (
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
                <GroupChart
                  rows={rows}
                  mas={mas}
                  labels={labels}
                  group={null} // Overview chart doesn't belong to a specific group
                  title=""
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
              <DataTable
                rows={rows}
                mas={mas}
                labels={labels}
                years={years}
                overviewColorPalette={overviewColorPalette}
                group={null} // Overview table
                showTotal={true}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}
