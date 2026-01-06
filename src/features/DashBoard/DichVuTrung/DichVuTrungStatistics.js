/**
 * @fileoverview Statistics Cards cho Dịch Vụ Trùng
 * @module features/DashBoard/DichVuTrung/DichVuTrungStatistics
 */

import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Warning as WarningIcon,
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { formatCurrency } from "utils/formatNumber";

/**
 * Component hiển thị 4 thẻ thống kê: Tổng DV trùng, BN ảnh hưởng, Top DV, Top khoa
 */
function DichVuTrungStatistics({
  statistics,
  loading,
  onServiceClick,
  onDepartmentClick,
}) {
  const {
    totalDuplicates = 0,
    affectedPatients = 0,
    totalCost = 0,
    topServices = [],
    topDepartments = [],
  } = statistics;

  // Format top services as array for vertical chip display
  const topServicesData = useMemo(() => {
    if (!topServices || topServices.length === 0) return [];
    return topServices.slice(0, 5).map((svc, idx) => ({
      label: `${idx + 1}. ${svc.servicepricename}`,
      servicepricename: svc.servicepricename,
      count: svc.duplicate_count,
    }));
  }, [topServices]);

  // Format top departments as array for vertical chip display
  const topDepartmentsData = useMemo(() => {
    if (!topDepartments || topDepartments.length === 0) return [];
    return topDepartments.slice(0, 5).map((dept, idx) => ({
      label: `${idx + 1}. ${dept.departmentgroupname || "N/A"}`,
      departmentgroupname: dept.departmentgroupname,
      patientCount: dept.affected_patients || 0,
      duplicateCount: dept.duplicate_count || 0,
    }));
  }, [topDepartments]);

  // Cards configuration
  const cards = [
    {
      title: "Tổng Dịch Vụ Trùng",
      value: totalDuplicates,
      subValue: `Tổng tiền: ${formatCurrency(totalCost)}`,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: "#ff9800", // Orange warning
      bgColor: "#fff3e0",
    },
    {
      title: "Bệnh Nhân Bị Ảnh Hưởng",
      value: affectedPatients,
      subValue: "bệnh nhân",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2", // Blue
      bgColor: "#e3f2fd",
    },
    {
      title: "Top 5 Dịch Vụ",
      data: topServicesData,
      valueType: "chipList",
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
    },
    {
      title: "Top 5 Khoa",
      data: topDepartmentsData,
      valueType: "chipList",
      icon: <HospitalIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
    },
  ];

  if (loading) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((n) => (
          <Grid item xs={12} sm={6} md={3} key={n}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="text" width="80%" height={50} />
                <Skeleton variant="text" width="40%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card, index) => {
        const gridSize =
          index < 2 ? { xs: 12, sm: 6, md: 2.5 } : { xs: 12, sm: 6, md: 3.5 };

        return (
          <Grid item {...gridSize} key={index}>
            <Card
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${card.bgColor} 0%, white 100%)`,
                border: `1px solid ${card.color}30`,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    {card.title}
                  </Typography>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Stack>

                {card.valueType === "chipList" ? (
                  <Stack
                    spacing={0.5}
                    sx={{ maxHeight: 150, overflowY: "auto" }}
                  >
                    {card.data && card.data.length > 0 ? (
                      card.data.map((item, idx) => {
                        const isTopKhoa = card.title === "Top 5 Khoa";
                        const isTopDichVu = card.title === "Top 5 Dịch Vụ";

                        return (
                          <Chip
                            key={idx}
                            label={
                              isTopKhoa
                                ? `${item.label} - ${item.patientCount} BN / ${item.duplicateCount} Chỉ định`
                                : `${item.label} (${
                                    item.count || item.duplicateCount
                                  })`
                            }
                            size="small"
                            onClick={() => {
                              if (isTopKhoa && onDepartmentClick) {
                                onDepartmentClick(item.departmentgroupname);
                              } else if (isTopDichVu && onServiceClick) {
                                onServiceClick(item.servicepricename);
                              }
                            }}
                            sx={{
                              justifyContent: "flex-start",
                              bgcolor: "grey.100",
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "auto",
                              cursor:
                                isTopKhoa || isTopDichVu
                                  ? "pointer"
                                  : "default",
                              transition: "all 0.2s",
                              "&:hover": {
                                bgcolor:
                                  isTopKhoa || isTopDichVu
                                    ? "primary.light"
                                    : "grey.100",
                                transform:
                                  isTopKhoa || isTopDichVu
                                    ? "scale(1.02)"
                                    : "none",
                              },
                              "& .MuiChip-label": {
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                              },
                            }}
                          />
                        );
                      })
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Không có dữ liệu
                      </Typography>
                    )}
                  </Stack>
                ) : card.valueType === "text" ? (
                  <Tooltip title={card.value} placement="top">
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.primary",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: 40,
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Tooltip>
                ) : (
                  <>
                    <Typography
                      variant="h4"
                      sx={{
                        color: card.color,
                        fontWeight: 700,
                        mb: 0.5,
                        wordBreak: "break-word",
                      }}
                    >
                      {card.value.toLocaleString("vi-VN")}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        wordBreak: "break-word",
                        display: "block",
                      }}
                    >
                      {card.subValue}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default DichVuTrungStatistics;
