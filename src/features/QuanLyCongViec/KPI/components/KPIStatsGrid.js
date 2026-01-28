/**
 * KPIStatsGrid - Responsive stats cards for KPI Evaluation
 *
 * Layout:
 * - Mobile (xs): 2x2 grid
 * - Desktop (md+): 1x4 grid
 */
import React from "react";
import { Grid, Card, CardContent, Stack, Box, Typography } from "@mui/material";
import {
  People as PeopleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  PendingActions as PendingActionsIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

const STAT_CONFIGS = [
  {
    key: "total",
    label: "Tổng nhân viên",
    icon: PeopleIcon,
    color: "primary",
  },
  {
    key: "evaluated",
    label: "Đã duyệt",
    icon: AssignmentTurnedInIcon,
    color: "success",
  },
  {
    key: "pending",
    label: "Chưa duyệt",
    icon: PendingActionsIcon,
    color: "warning",
  },
  {
    key: "avgScore",
    label: "Điểm TB",
    icon: TrendingUpIcon,
    color: "info",
    format: (val) => (val ? val.toFixed(1) : "—"),
  },
];

function KPIStatsGrid({ stats = {} }) {
  return (
    <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
      {STAT_CONFIGS.map((config) => {
        const Icon = config.icon;
        const rawValue = stats[config.key] ?? 0;
        const value = config.format ? config.format(rawValue) : rawValue;

        return (
          <Grid item xs={6} md={3} key={config.key}>
            <Card
              sx={{
                bgcolor: `${config.color}.lighter`,
                border: 1,
                borderColor: `${config.color}.light`,
              }}
            >
              <CardContent
                sx={{ py: { xs: 1.5, md: 2 }, px: { xs: 1.5, md: 2 } }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 40, md: 48 },
                      height: { xs: 40, md: 48 },
                      borderRadius: 2,
                      bgcolor: `${config.color}.main`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      sx={{ color: "white", fontSize: { xs: 22, md: 28 } }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      color={`${config.color}.dark`}
                      sx={{
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        fontWeight: 700,
                      }}
                    >
                      {value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      {config.label}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default KPIStatsGrid;
