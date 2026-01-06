# 📊 Analytics & Monitoring - Ticket System

**Version:** 1.0.0  
**Date:** December 26, 2025  
**Priority:** 🟢 LOW - Nice-to-Have  
**Estimated Effort:** 5-7 ngày

---

## 🎯 Mục Tiêu

Xây dựng hệ thống analytics toàn diện để:

- ✅ Identify bottlenecks trong workflow
- ✅ Track performance trends theo thời gian
- ✅ Understand device usage patterns (mobile vs desktop)
- ✅ Monitor push notification effectiveness
- ✅ Measure offline usage và sync success rates
- ✅ Provide actionable insights cho managers

---

## 📋 Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS DASHBOARD                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬──────────┐
│  BOTTLENECK     │  RESPONSE TIME  │  DEVICE MIX     │   SLA    │
│  ANALYSIS       │  TRENDS         │  BREAKDOWN      │ METRICS  │
├─────────────────┼─────────────────┼─────────────────┼──────────┤
│                                                                  │
│  📊 Tab "Chờ tiếp nhận": 15 yêu cầu (avg 2.3 ngày)             │
│      ▶ Khoa CNTT: 8 yêu cầu (bottleneck)                       │
│      ▶ Thiếu người xử lý → Suggest: Phân công lại             │
│                                                                  │
│  📈 Response Time: 4.2h (↓ 15% so với tuần trước)              │
│      Best: Khoa Hành chính (2.1h)                              │
│      Worst: Khoa CNTT (8.5h)                                   │
│                                                                  │
│  📱 Device Usage:                                               │
│      Mobile: 68% (↑ 12% vs last month)                         │
│      PWA Installs: 45% of mobile users                         │
│                                                                  │
│  ⏰ SLA Compliance:                                             │
│      On-time: 82% (target: 90%)                                │
│      Overdue: 18 tickets (need escalation)                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Backend Analytics Service

### 1.1 Analytics Data Model

**File:** `giaobanbv-be/modules/workmanagement/models/TicketAnalytics.js`

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Daily aggregated analytics
 * Computed once per day via cron job
 */
const ticketAnalyticsSchema = new Schema(
  {
    Date: {
      type: Date,
      required: true,
      index: true,
    },

    KhoaID: {
      type: Schema.ObjectId,
      ref: "Khoa",
      index: true,
    },

    // Volume metrics
    TotalCreated: { type: Number, default: 0 },
    TotalResolved: { type: Number, default: 0 },
    TotalClosed: { type: Number, default: 0 },
    TotalRejected: { type: Number, default: 0 },

    // Status breakdown
    StatusBreakdown: {
      MOI: { type: Number, default: 0 },
      DANG_XU_LY: { type: Number, default: 0 },
      DA_HOAN_THANH: { type: Number, default: 0 },
      DA_DONG: { type: Number, default: 0 },
      TU_CHOI: { type: Number, default: 0 },
    },

    // Time metrics (in hours)
    AvgTimeToAccept: Number, // MOI → DANG_XU_LY
    AvgTimeToResolve: Number, // DANG_XU_LY → DA_HOAN_THANH
    AvgTimeToClose: Number, // DA_HOAN_THANH → DA_DONG
    AvgTotalTime: Number, // MOI → DA_DONG

    // SLA metrics
    OnTimeCount: { type: Number, default: 0 },
    LateCount: { type: Number, default: 0 },
    SLAComplianceRate: Number, // percentage

    // Rating metrics
    AvgRating: Number,
    RatingBreakdown: {
      _1Star: { type: Number, default: 0 },
      _2Star: { type: Number, default: 0 },
      _3Star: { type: Number, default: 0 },
      _4Star: { type: Number, default: 0 },
      _5Star: { type: Number, default: 0 },
    },

    // Device metrics
    DeviceBreakdown: {
      Mobile: { type: Number, default: 0 },
      Desktop: { type: Number, default: 0 },
      Tablet: { type: Number, default: 0 },
    },

    // Notification metrics
    PushNotificationsSent: { type: Number, default: 0 },
    PushNotificationsDelivered: { type: Number, default: 0 },
    PushDeliveryRate: Number, // percentage

    // Offline metrics
    OfflineActionsQueued: { type: Number, default: 0 },
    OfflineActionsSynced: { type: Number, default: 0 },
    OfflineSyncSuccessRate: Number, // percentage
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ticketAnalyticsSchema.index({ Date: -1, KhoaID: 1 });

module.exports = mongoose.model("TicketAnalytics", ticketAnalyticsSchema);
```

### 1.2 Analytics Service

**File:** `giaobanbv-be/modules/workmanagement/services/analyticsService.js`

```javascript
const YeuCau = require("../models/YeuCau");
const LichSuYeuCau = require("../models/LichSuYeuCau");
const TicketAnalytics = require("../models/TicketAnalytics");
const UserFCMToken = require("../models/UserFCMToken");
const dayjs = require("dayjs");

class AnalyticsService {
  /**
   * Generate daily analytics for a specific date
   */
  async generateDailyAnalytics(date, khoaId = null) {
    const startOfDay = dayjs(date).startOf("day").toDate();
    const endOfDay = dayjs(date).endOf("day").toDate();

    const query = {
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    };

    if (khoaId) {
      query.KhoaDichID = khoaId;
    }

    // Volume metrics
    const created = await YeuCau.countDocuments(query);
    const resolved = await YeuCau.countDocuments({
      ...query,
      TrangThai: "DA_HOAN_THANH",
    });
    const closed = await YeuCau.countDocuments({
      ...query,
      TrangThai: "DA_DONG",
    });
    const rejected = await YeuCau.countDocuments({
      ...query,
      TrangThai: "TU_CHOI",
    });

    // Status breakdown (current state)
    const statusCounts = await YeuCau.aggregate([
      { $match: query },
      { $group: { _id: "$TrangThai", count: { $sum: 1 } } },
    ]);

    const statusBreakdown = {};
    statusCounts.forEach(({ _id, count }) => {
      statusBreakdown[_id] = count;
    });

    // Time metrics
    const timeMetrics = await this.calculateTimeMetrics(query);

    // SLA metrics
    const slaMetrics = await this.calculateSLAMetrics(query);

    // Rating metrics
    const ratingMetrics = await this.calculateRatingMetrics(query);

    // Device metrics (from user agents in LichSu)
    const deviceMetrics = await this.calculateDeviceMetrics(
      startOfDay,
      endOfDay
    );

    // Notification metrics
    const notificationMetrics = await this.calculateNotificationMetrics(
      startOfDay,
      endOfDay
    );

    // Save analytics
    const analytics = await TicketAnalytics.findOneAndUpdate(
      { Date: startOfDay, KhoaID: khoaId },
      {
        TotalCreated: created,
        TotalResolved: resolved,
        TotalClosed: closed,
        TotalRejected: rejected,
        StatusBreakdown: statusBreakdown,
        ...timeMetrics,
        ...slaMetrics,
        ...ratingMetrics,
        DeviceBreakdown: deviceMetrics,
        ...notificationMetrics,
      },
      { upsert: true, new: true }
    );

    return analytics;
  }

  /**
   * Calculate average time spent in each stage
   */
  async calculateTimeMetrics(query) {
    const tickets = await YeuCau.find(query).select("createdAt updatedAt");

    const histories = await LichSuYeuCau.find({
      YeuCauID: { $in: tickets.map((t) => t._id) },
    }).sort({ createdAt: 1 });

    const metrics = {
      AvgTimeToAccept: 0,
      AvgTimeToResolve: 0,
      AvgTimeToClose: 0,
      AvgTotalTime: 0,
    };

    let acceptCount = 0;
    let resolveCount = 0;
    let closeCount = 0;

    // Group histories by ticket
    const historyByTicket = {};
    histories.forEach((h) => {
      const key = h.YeuCauID.toString();
      if (!historyByTicket[key]) historyByTicket[key] = [];
      historyByTicket[key].push(h);
    });

    Object.values(historyByTicket).forEach((ticketHistory) => {
      const created = ticketHistory.find((h) => h.HanhDong === "TAO_MOI");
      const accepted = ticketHistory.find((h) => h.HanhDong === "TIEP_NHAN");
      const resolved = ticketHistory.find((h) => h.HanhDong === "HOAN_THANH");
      const closed = ticketHistory.find((h) => h.HanhDong === "DONG");

      if (created && accepted) {
        const hours = dayjs(accepted.createdAt).diff(
          created.createdAt,
          "hour",
          true
        );
        metrics.AvgTimeToAccept += hours;
        acceptCount++;
      }

      if (accepted && resolved) {
        const hours = dayjs(resolved.createdAt).diff(
          accepted.createdAt,
          "hour",
          true
        );
        metrics.AvgTimeToResolve += hours;
        resolveCount++;
      }

      if (resolved && closed) {
        const hours = dayjs(closed.createdAt).diff(
          resolved.createdAt,
          "hour",
          true
        );
        metrics.AvgTimeToClose += hours;
        closeCount++;
      }

      if (created && closed) {
        const hours = dayjs(closed.createdAt).diff(
          created.createdAt,
          "hour",
          true
        );
        metrics.AvgTotalTime += hours;
      }
    });

    if (acceptCount > 0) metrics.AvgTimeToAccept /= acceptCount;
    if (resolveCount > 0) metrics.AvgTimeToResolve /= resolveCount;
    if (closeCount > 0) metrics.AvgTimeToClose /= closeCount;
    if (tickets.length > 0) metrics.AvgTotalTime /= tickets.length;

    return metrics;
  }

  /**
   * Calculate SLA compliance
   */
  async calculateSLAMetrics(query) {
    const tickets = await YeuCau.find({
      ...query,
      ThoiGianHen: { $exists: true },
    }).select("ThoiGianHen ThoiGianHoanThanh");

    let onTime = 0;
    let late = 0;

    tickets.forEach((ticket) => {
      if (!ticket.ThoiGianHoanThanh) return;

      const deadline = dayjs(ticket.ThoiGianHen);
      const completed = dayjs(ticket.ThoiGianHoanThanh);

      if (completed.isBefore(deadline) || completed.isSame(deadline)) {
        onTime++;
      } else {
        late++;
      }
    });

    const total = onTime + late;
    const complianceRate = total > 0 ? (onTime / total) * 100 : 0;

    return {
      OnTimeCount: onTime,
      LateCount: late,
      SLAComplianceRate: complianceRate,
    };
  }

  /**
   * Calculate rating statistics
   */
  async calculateRatingMetrics(query) {
    const tickets = await YeuCau.find({
      ...query,
      "DanhGia.SoSao": { $exists: true },
    }).select("DanhGia");

    const ratingBreakdown = {
      _1Star: 0,
      _2Star: 0,
      _3Star: 0,
      _4Star: 0,
      _5Star: 0,
    };

    let totalRating = 0;

    tickets.forEach((ticket) => {
      const stars = ticket.DanhGia.SoSao;
      totalRating += stars;

      switch (stars) {
        case 1:
          ratingBreakdown._1Star++;
          break;
        case 2:
          ratingBreakdown._2Star++;
          break;
        case 3:
          ratingBreakdown._3Star++;
          break;
        case 4:
          ratingBreakdown._4Star++;
          break;
        case 5:
          ratingBreakdown._5Star++;
          break;
      }
    });

    const avgRating = tickets.length > 0 ? totalRating / tickets.length : 0;

    return {
      AvgRating: avgRating,
      RatingBreakdown: ratingBreakdown,
    };
  }

  /**
   * Calculate device usage from user agents
   */
  async calculateDeviceMetrics(startOfDay, endOfDay) {
    const histories = await LichSuYeuCau.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate("NguoiThucHienID");

    const devices = {
      Mobile: 0,
      Desktop: 0,
      Tablet: 0,
    };

    // Unique users per device (avoid double counting)
    const uniqueUsers = new Set();

    histories.forEach((h) => {
      const userDevice = `${h.NguoiThucHienID?._id}-${h.DeviceType}`;
      if (uniqueUsers.has(userDevice)) return;

      uniqueUsers.add(userDevice);

      // Simple heuristic (can be improved with actual UA parsing)
      const ua = h.DeviceInfo?.userAgent || "";
      if (/Mobile|Android|iPhone/.test(ua)) {
        devices.Mobile++;
      } else if (/Tablet|iPad/.test(ua)) {
        devices.Tablet++;
      } else {
        devices.Desktop++;
      }
    });

    return devices;
  }

  /**
   * Calculate push notification metrics
   */
  async calculateNotificationMetrics(startOfDay, endOfDay) {
    // This would require tracking in FCM service
    // For now, return placeholder
    return {
      PushNotificationsSent: 0,
      PushNotificationsDelivered: 0,
      PushDeliveryRate: 0,
    };
  }

  /**
   * Get bottleneck analysis
   */
  async getBottleneckAnalysis(khoaId = null, days = 7) {
    const since = dayjs().subtract(days, "day").startOf("day").toDate();

    const query = {
      TrangThai: { $in: ["MOI", "DANG_XU_LY"] },
      createdAt: { $lte: since },
    };

    if (khoaId) {
      query.KhoaDichID = khoaId;
    }

    // Find tickets stuck in each stage
    const stuckTickets = await YeuCau.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            TrangThai: "$TrangThai",
            KhoaDichID: "$KhoaDichID",
          },
          count: { $sum: 1 },
          avgDaysStuck: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), "$createdAt"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
          tickets: { $push: "$_id" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Populate Khoa names
    const bottlenecks = await Promise.all(
      stuckTickets.map(async (item) => {
        const Khoa = require("../../../models/Khoa");
        const khoa = await Khoa.findById(item._id.KhoaDichID).select("TenKhoa");

        return {
          trangThai: item._id.TrangThai,
          khoa: khoa?.TenKhoa || "Unknown",
          count: item.count,
          avgDaysStuck: Math.round(item.avgDaysStuck * 10) / 10,
          suggestion: this.getSuggestion(item._id.TrangThai, item.count),
        };
      })
    );

    return bottlenecks;
  }

  /**
   * Generate actionable suggestions
   */
  getSuggestion(trangThai, count) {
    if (trangThai === "MOI" && count > 10) {
      return "Thiếu người xử lý hoặc chưa phân công. Khuyến nghị: Phân công lại hoặc tuyển thêm nhân sự.";
    }

    if (trangThai === "DANG_XU_LY" && count > 15) {
      return "Khối lượng công việc quá tải. Khuyến nghị: Hỗ trợ thêm nguồn lực hoặc ưu tiên các ticket cũ.";
    }

    return "Tình trạng bình thường";
  }

  /**
   * Get response time trends
   */
  async getResponseTimeTrends(khoaId = null, days = 30) {
    const since = dayjs().subtract(days, "day").startOf("day").toDate();

    const analytics = await TicketAnalytics.find({
      Date: { $gte: since },
      ...(khoaId && { KhoaID: khoaId }),
    })
      .sort({ Date: 1 })
      .select("Date AvgTimeToAccept AvgTimeToResolve AvgTotalTime KhoaID")
      .populate("KhoaID", "TenKhoa");

    // Format for charts
    const trends = analytics.map((a) => ({
      date: dayjs(a.Date).format("YYYY-MM-DD"),
      khoa: a.KhoaID?.TenKhoa || "All",
      avgTimeToAccept: Math.round(a.AvgTimeToAccept * 10) / 10,
      avgTimeToResolve: Math.round(a.AvgTimeToResolve * 10) / 10,
      avgTotalTime: Math.round(a.AvgTotalTime * 10) / 10,
    }));

    return trends;
  }

  /**
   * Get device distribution
   */
  async getDeviceDistribution(days = 30) {
    const since = dayjs().subtract(days, "day").startOf("day").toDate();

    const analytics = await TicketAnalytics.aggregate([
      { $match: { Date: { $gte: since } } },
      {
        $group: {
          _id: null,
          totalMobile: { $sum: "$DeviceBreakdown.Mobile" },
          totalDesktop: { $sum: "$DeviceBreakdown.Desktop" },
          totalTablet: { $sum: "$DeviceBreakdown.Tablet" },
        },
      },
    ]);

    if (analytics.length === 0) {
      return { Mobile: 0, Desktop: 0, Tablet: 0 };
    }

    const { totalMobile, totalDesktop, totalTablet } = analytics[0];
    const total = totalMobile + totalDesktop + totalTablet;

    return {
      Mobile: { count: totalMobile, percentage: (totalMobile / total) * 100 },
      Desktop: {
        count: totalDesktop,
        percentage: (totalDesktop / total) * 100,
      },
      Tablet: { count: totalTablet, percentage: (totalTablet / total) * 100 },
    };
  }

  /**
   * Get PWA install rate
   */
  async getPWAInstallRate() {
    const totalMobileUsers = await UserFCMToken.distinct("NhanVienID", {
      DeviceType: { $in: ["ios", "android"] },
      IsActive: true,
    });

    // Heuristic: Users with active FCM tokens likely have PWA installed
    const pwaUsers = totalMobileUsers.length;

    // Get total active mobile users (would need tracking in User model)
    // For now, use FCM tokens as proxy
    const allMobileTokens = await UserFCMToken.countDocuments({
      DeviceType: { $in: ["ios", "android", "web"] },
      IsActive: true,
    });

    const installRate =
      allMobileTokens > 0 ? (pwaUsers / allMobileTokens) * 100 : 0;

    return {
      pwaUsers,
      totalUsers: allMobileTokens,
      installRate: Math.round(installRate * 10) / 10,
    };
  }
}

module.exports = new AnalyticsService();
```

### 1.3 Analytics API Routes

**File:** `giaobanbv-be/modules/workmanagement/routes/analytics.api.js`

```javascript
const express = require("express");
const router = express.Router();
const { loginRequired } = require("../../../middlewares/authentication");
const analyticsService = require("../services/analyticsService");
const { catchAsync, sendResponse } = require("../../../helpers/utils");

/**
 * @route GET /api/workmanagement/analytics/bottleneck
 * @desc Get bottleneck analysis
 */
router.get(
  "/bottleneck",
  loginRequired,
  catchAsync(async (req, res) => {
    const { khoaId, days = 7 } = req.query;

    const bottlenecks = await analyticsService.getBottleneckAnalysis(
      khoaId,
      parseInt(days)
    );

    sendResponse(res, 200, true, { bottlenecks }, null, "Bottleneck analysis");
  })
);

/**
 * @route GET /api/workmanagement/analytics/response-time-trends
 * @desc Get response time trends
 */
router.get(
  "/response-time-trends",
  loginRequired,
  catchAsync(async (req, res) => {
    const { khoaId, days = 30 } = req.query;

    const trends = await analyticsService.getResponseTimeTrends(
      khoaId,
      parseInt(days)
    );

    sendResponse(res, 200, true, { trends }, null, "Response time trends");
  })
);

/**
 * @route GET /api/workmanagement/analytics/device-distribution
 * @desc Get device usage distribution
 */
router.get(
  "/device-distribution",
  loginRequired,
  catchAsync(async (req, res) => {
    const { days = 30 } = req.query;

    const distribution = await analyticsService.getDeviceDistribution(
      parseInt(days)
    );

    sendResponse(res, 200, true, { distribution }, null, "Device distribution");
  })
);

/**
 * @route GET /api/workmanagement/analytics/pwa-install-rate
 * @desc Get PWA install rate
 */
router.get(
  "/pwa-install-rate",
  loginRequired,
  catchAsync(async (req, res) => {
    const installRate = await analyticsService.getPWAInstallRate();

    sendResponse(res, 200, true, { installRate }, null, "PWA install rate");
  })
);

/**
 * @route POST /api/workmanagement/analytics/generate-daily
 * @desc Generate daily analytics (admin only, or cron job)
 */
router.post(
  "/generate-daily",
  loginRequired,
  catchAsync(async (req, res) => {
    const { date, khoaId } = req.body;

    const analytics = await analyticsService.generateDailyAnalytics(
      date || new Date(),
      khoaId
    );

    sendResponse(res, 200, true, { analytics }, null, "Analytics generated");
  })
);

module.exports = router;
```

---

## 2️⃣ Frontend Analytics Dashboard

### 2.1 Analytics Dashboard Component

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/AnalyticsDashboard.js`

```javascript
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Devices as DevicesIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import apiService from "app/apiService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    bottlenecks: [],
    trends: [],
    deviceDistribution: {},
    pwaInstallRate: {},
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [bottlenecks, trends, devices, pwa] = await Promise.all([
        apiService.get("/workmanagement/analytics/bottleneck?days=7"),
        apiService.get(
          "/workmanagement/analytics/response-time-trends?days=30"
        ),
        apiService.get("/workmanagement/analytics/device-distribution?days=30"),
        apiService.get("/workmanagement/analytics/pwa-install-rate"),
      ]);

      setData({
        bottlenecks: bottlenecks.data.data.bottlenecks,
        trends: trends.data.data.trends,
        deviceDistribution: devices.data.data.distribution,
        pwaInstallRate: pwa.data.data.installRate,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  const deviceChartData = Object.entries(data.deviceDistribution).map(
    ([key, value]) => ({
      name: key,
      value: value.count,
      percentage: value.percentage,
    })
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        📊 Analytics Dashboard
      </Typography>

      {/* Bottleneck Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🚨 Bottleneck Analysis (Last 7 days)
            </Typography>

            {data.bottlenecks.length === 0 ? (
              <Alert severity="success">Không có bottleneck phát hiện</Alert>
            ) : (
              data.bottlenecks.map((bottleneck, idx) => (
                <Card key={idx} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <WarningIcon color="warning" />
                      <Box flexGrow={1}>
                        <Typography variant="subtitle1">
                          <strong>{bottleneck.khoa}</strong> -{" "}
                          {bottleneck.trangThai}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {bottleneck.count} yêu cầu tồn đọng (trung bình{" "}
                          {bottleneck.avgDaysStuck} ngày)
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          💡 {bottleneck.suggestion}
                        </Typography>
                      </Box>
                      <Button variant="outlined" size="small">
                        Xem chi tiết
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Response Time Trends */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📈 Response Time Trends (Last 30 days)
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgTimeToAccept"
                  stroke="#8884d8"
                  name="Time to Accept"
                />
                <Line
                  type="monotone"
                  dataKey="avgTimeToResolve"
                  stroke="#82ca9d"
                  name="Time to Resolve"
                />
                <Line
                  type="monotone"
                  dataKey="avgTotalTime"
                  stroke="#ffc658"
                  name="Total Time"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Device Distribution & PWA */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📱 Device Usage Distribution
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) =>
                    `${name}: ${percentage.toFixed(1)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🚀 PWA Install Rate
            </Typography>

            <Box textAlign="center" py={4}>
              <Typography variant="h2" color="primary">
                {data.pwaInstallRate.installRate}%
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                {data.pwaInstallRate.pwaUsers} /{" "}
                {data.pwaInstallRate.totalUsers} users
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Chip
                  label={
                    data.pwaInstallRate.installRate >= 60
                      ? "Tốt"
                      : data.pwaInstallRate.installRate >= 40
                      ? "Trung bình"
                      : "Cần cải thiện"
                  }
                  color={
                    data.pwaInstallRate.installRate >= 60
                      ? "success"
                      : data.pwaInstallRate.installRate >= 40
                      ? "warning"
                      : "error"
                  }
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
```

---

## 3️⃣ Cron Job for Daily Analytics

**File:** `giaobanbv-be/jobs/analyticsJob.js`

```javascript
const cron = require("node-cron");
const analyticsService = require("../modules/workmanagement/services/analyticsService");
const Khoa = require("../models/Khoa");
const dayjs = require("dayjs");

class AnalyticsJob {
  start() {
    // Run daily at 1 AM
    cron.schedule("0 1 * * *", async () => {
      console.log("[AnalyticsJob] Running daily analytics generation...");
      await this.generateDailyAnalytics();
    });
  }

  async generateDailyAnalytics() {
    const yesterday = dayjs().subtract(1, "day").toDate();

    try {
      // Generate overall analytics
      await analyticsService.generateDailyAnalytics(yesterday);
      console.log("[AnalyticsJob] ✅ Overall analytics generated");

      // Generate per-department analytics
      const departments = await Khoa.find({}).select("_id TenKhoa");

      for (const dept of departments) {
        await analyticsService.generateDailyAnalytics(yesterday, dept._id);
        console.log(
          `[AnalyticsJob] ✅ Analytics for ${dept.TenKhoa} generated`
        );
      }

      console.log("[AnalyticsJob] ✅ Daily analytics completed");
    } catch (error) {
      console.error("[AnalyticsJob] ❌ Failed:", error);
    }
  }
}

module.exports = new AnalyticsJob();
```

**Start in app.js:**

```javascript
const analyticsJob = require("./jobs/analyticsJob");
analyticsJob.start();
```

---

## ✅ Implementation Checklist

**Day 1: Backend Models & Service**

- [ ] Create TicketAnalytics model
- [ ] Create analyticsService.js
- [ ] Implement metric calculation methods
- [ ] Test analytics generation

**Day 2-3: API Routes & Cron**

- [ ] Create analytics API routes
- [ ] Create analyticsJob.js
- [ ] Test cron job execution
- [ ] Seed sample analytics data

**Day 4-5: Frontend Dashboard**

- [ ] Create AnalyticsDashboard.js
- [ ] Install recharts library
- [ ] Implement charts
- [ ] Add responsive layouts

**Day 6: Integration & Polish**

- [ ] Add analytics link to menu
- [ ] Test on mobile
- [ ] Optimize chart performance
- [ ] Add export to PDF/Excel

**Day 7: Testing & Documentation**

- [ ] End-to-end testing
- [ ] Performance testing (large datasets)
- [ ] Write user guide
- [ ] Deploy to production

---

## 📊 Success Metrics

**Dashboard Usage:**

- Managers access dashboard >= 3 times/week
- Average session time >= 5 minutes
- Export reports >= 10 times/month

**Actionable Insights:**

- Bottleneck resolution time: -40%
- Response time improvement: +15%
- Device optimization priorities identified

**Business Impact:**

- Decision making time: -30%
- Resource allocation efficiency: +25%

---

**Complete! 🎉** All 4 improvement documents created.
