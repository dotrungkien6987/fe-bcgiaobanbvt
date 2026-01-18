/**
 * SkeletonLoader Components
 *
 * Reusable loading skeleton components for consistent loading states
 * Extracted patterns from existing dashboard implementations
 *
 * @module components/SkeletonLoader
 */

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

/**
 * CardSkeleton - Loading skeleton for card-based layouts
 *
 * @param {number} count - Number of skeleton cards to render
 * @param {object} spacing - MUI spacing prop for gap between cards
 * @example
 * <CardSkeleton count={3} spacing={2} />
 */
export function CardSkeleton({ count = 1, spacing = 2 }) {
  return (
    <Stack spacing={spacing}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            <Stack spacing={1.5}>
              {/* Title */}
              <Skeleton variant="text" width="60%" height={24} />
              {/* Subtitle */}
              <Skeleton variant="text" width="40%" height={16} />
              {/* Content */}
              <Box sx={{ pt: 1 }}>
                <Skeleton
                  variant="rectangular"
                  height={60}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              {/* Actions */}
              <Stack
                direction="row"
                spacing={1}
                justifyContent="flex-end"
                sx={{ pt: 1 }}
              >
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={36}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={36}
                  sx={{ borderRadius: 1 }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * TableSkeleton - Loading skeleton for table layouts
 *
 * @param {number} rows - Number of skeleton rows
 * @param {number} columns - Number of columns
 * @example
 * <TableSkeleton rows={5} columns={4} />
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableCell key={i}>
              <Skeleton variant="text" height={20} />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton variant="text" height={20} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * FormSkeleton - Loading skeleton for form layouts
 *
 * @param {number} fields - Number of form fields
 * @example
 * <FormSkeleton fields={5} />
 */
export function FormSkeleton({ fields = 5 }) {
  return (
    <Stack spacing={3}>
      {Array.from({ length: fields }).map((_, index) => (
        <Box key={index}>
          {/* Field label */}
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
          {/* Field input */}
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      ))}
      {/* Form actions */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ pt: 2 }}
      >
        <Skeleton
          variant="rectangular"
          width={100}
          height={42}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          width={100}
          height={42}
          sx={{ borderRadius: 1 }}
        />
      </Stack>
    </Stack>
  );
}

/**
 * StatusGridSkeleton - Loading skeleton for dashboard status cards
 * Pattern từ CongViecDashboard
 *
 * @param {number} columns - Number of status cards (4 or 5)
 * @example
 * <StatusGridSkeleton columns={4} />
 */
export function StatusGridSkeleton({ columns = 4 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: columns }).map((_, i) => (
        <Grid item xs={6} sm={12 / columns} key={i}>
          <Card>
            <CardContent>
              <Stack spacing={1} alignItems="center">
                {/* Icon placeholder */}
                <Skeleton variant="circular" width={40} height={40} />
                {/* Count */}
                <Skeleton variant="text" width={60} height={40} />
                {/* Label */}
                <Skeleton variant="text" width={80} height={20} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * ListSkeleton - Loading skeleton for list items (activities, notifications)
 * Pattern từ RecentActivitiesSection
 *
 * @param {number} items - Number of list items
 * @example
 * <ListSkeleton items={5} />
 */
export function ListSkeleton({ items = 3 }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: items }).map((_, i) => (
        <Stack key={i} direction="row" spacing={1.5}>
          {/* Avatar/Icon */}
          <Skeleton variant="circular" width={40} height={40} />
          {/* Content */}
          <Stack flex={1}>
            <Skeleton width="60%" height={20} />
            <Skeleton width="40%" height={16} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

/**
 * PageSkeleton - Full page loading skeleton
 * Combines multiple skeleton types for entire page
 *
 * @example
 * <PageSkeleton />
 */
export function PageSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Page title */}
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />

      {/* Stats cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Stack spacing={1} alignItems="center">
                  <Skeleton variant="circular" width={48} height={48} />
                  <Skeleton variant="text" width={60} height={32} />
                  <Skeleton variant="text" width={80} height={20} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Content area */}
      <Card>
        <CardContent>
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ borderRadius: 1 }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
