/**
 * StatusGridSkeleton - Loading skeleton for status cards
 *
 * Shared skeleton component for status card grids
 *
 * @component
 */

import React from "react";
import { Grid, Card, CardContent, Stack, Skeleton } from "@mui/material";

export default function StatusGridSkeleton({ columns }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: columns }).map((_, i) => (
        <Grid item xs={6} sm={12 / columns} key={i}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={60} height={40} />
                <Skeleton variant="text" width={80} height={20} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
