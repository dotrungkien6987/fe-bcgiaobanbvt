/**
 * YeuCauStatusGrid - Mobile-friendly status grid
 *
 * Thay thế horizontal tabs bằng grid layout 2 cột
 * Chỉ hiển thị trên mobile (xs, sm)
 */
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Badge,
  Stack,
} from "@mui/material";

// Icon mapping
const getStatusIcon = (iconName) => {
  const icons = {
    HourglassEmpty: "⏳",
    Build: "🔧",
    RateReview: "⭐",
    CheckCircle: "✅",
    Cancel: "❌",
    Inbox: "📥",
    HourglassTop: "⌛",
    NotificationsActive: "🔔",
    AssignmentInd: "👤",
    Engineering: "⚙️",
    Block: "🚫",
    CallReceived: "📨",
    CallMade: "📤",
    Warning: "⚠️",
    Assessment: "📊",
  };
  return icons[iconName] || "📋";
};

// Color mapping
const getStatusColor = (color) => {
  const colorMap = {
    info: "#2196f3",
    warning: "#ff9800",
    success: "#4caf50",
    error: "#f44336",
    default: "#9e9e9e",
    primary: "#1976d2",
  };
  return colorMap[color] || colorMap.default;
};

function StatusCard({ item, count, selected, onClick }) {
  const bgColor = selected ? getStatusColor(item.color) : "transparent";
  const textColor = selected ? "#fff" : "text.primary";
  const borderColor = selected ? getStatusColor(item.color) : "divider";

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        border: 2,
        borderColor: borderColor,
        bgcolor: bgColor,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: getStatusColor(item.color),
          boxShadow: 2,
          transform: "translateY(-2px)",
        },
        "&:active": {
          transform: "translateY(0)",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" sx={{ color: textColor }}>
            {getStatusIcon(item.icon)}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            fontWeight={selected ? "bold" : "normal"}
            sx={{ color: textColor, fontSize: "0.875rem" }}
          >
            {item.label}
          </Typography>
          <Badge
            badgeContent={count || 0}
            color={item.badgeType === "urgent" ? "error" : "primary"}
            max={999}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.875rem",
                height: 24,
                minWidth: 24,
                fontWeight: "bold",
              },
            }}
          >
            <Box sx={{ width: 16 }} />
          </Badge>
        </Stack>
      </CardContent>
    </Card>
  );
}

function YeuCauStatusGrid({ tabs, activeTab, onTabChange, badgeCounts = {} }) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <Box
      sx={{
        display: { xs: "grid", md: "none" }, // Chỉ mobile
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 1.5,
        p: 2,
        pb: 1,
      }}
    >
      {tabs.map((tab) => (
        <StatusCard
          key={tab.key}
          item={tab}
          count={badgeCounts[tab.key] || 0}
          selected={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
        />
      ))}
    </Box>
  );
}

export default YeuCauStatusGrid;
