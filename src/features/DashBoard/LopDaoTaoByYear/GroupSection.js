import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import GroupChart from "./GroupChart";
import DataTable from "./DataTable";

export default function GroupSection({ groupedResults }) {
  if (!groupedResults.groups.length) {
    return null;
  }

  return (
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
                  bgcolor: g.group.color,
                  color: "white",
                  p: 2,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ fontSize: 24 }}>{g.group.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {g.name}
                    </Typography>
                  </Stack>
                  <Box>
                    <Stack direction="row" spacing={1}>
                      {g.group.codes.map((code, idx) => (
                        <Chip
                          key={code}
                          label={code}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "white",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Group Content */}
              <Box sx={{ p: 3 }}>
                {g.rows.length > 0 && g.mas.length > 0 ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={7}>
                      <Card variant="outlined" sx={{ height: 400 }}>
                        <CardContent>
                          <GroupChart
                            rows={g.rows}
                            mas={g.mas}
                            labels={g.labels}
                            group={g.group}
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
                          <DataTable
                            rows={g.rows}
                            mas={g.mas}
                            labels={g.labels}
                            years={g.years}
                            group={g.group}
                            showTotal={true}
                          />
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
                    <Typography variant="body1" color="text.secondary">
                      Không có dữ liệu cho nhóm này trong khoảng thời gian đã
                      chọn
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
