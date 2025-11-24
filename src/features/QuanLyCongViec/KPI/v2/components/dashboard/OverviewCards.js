import React from "react";
import { Grid, Box, Typography, Chip } from "@mui/material";
import StatCard from "./StatCard";

/**
 * RichTooltip - Structured tooltip component with visual formatting
 */
const RichTooltip = ({
  title,
  description,
  formula,
  example,
  thresholds,
  note,
}) => (
  <Box sx={{ maxWidth: 360 }}>
    {/* Title */}
    {title && (
      <Typography
        variant="subtitle2"
        sx={{ color: "primary.light", fontWeight: 700, mb: 1 }}
      >
        {title}
      </Typography>
    )}

    {/* Description */}
    {description && (
      <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
        {description}
      </Typography>
    )}

    {/* Formula */}
    {formula && (
      <Box
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.1)",
          p: 1,
          borderRadius: 1,
          mb: 1.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.85rem",
            color: "text.primary",
          }}
        >
          {formula}
        </Typography>
      </Box>
    )}

    {/* Example */}
    {example && (
      <Box
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.05)",
          p: 1,
          borderRadius: 1,
          mb: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
          {example}
        </Typography>
      </Box>
    )}

    {/* Thresholds */}
    {thresholds && thresholds.length > 0 && (
      <Box sx={{ mb: 1.5 }}>
        {thresholds.map((threshold, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
          >
            <Chip
              label={threshold.label}
              color={threshold.color}
              size="small"
              sx={{ mr: 1, minWidth: 100 }}
            />
            <Typography variant="caption">{threshold.condition}</Typography>
          </Box>
        ))}
      </Box>
    )}

    {/* Note */}
    {note && (
      <Box
        sx={{
          bgcolor: "warning.dark",
          color: "warning.contrastText",
          p: 1,
          borderRadius: 1,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          ⚠️ {note}
        </Typography>
      </Box>
    )}
  </Box>
);

/**
 * OverviewCards - 8 stat cards in 2x4 grid
 * @param {Object} summary - Summary metrics from API
 * @param {Object} collaboration - Collaboration metrics from API
 */
function OverviewCards({ summary = {}, collaboration = {} }) {
  const {
    total = 0,
    completed = 0,
    completionRate = 0,
    late = 0,
    lateRate = 0,
    active = 0,
    overdue = 0,
    avgProgress = 0,
    onTimeRate = 0,
  } = summary;

  const { avgTeamSize = 0, avgComments = 0 } = collaboration;

  // Color logic
  const getCompletionColor = (rate) => {
    if (rate >= 0.8) return "success";
    if (rate >= 0.6) return "warning";
    return "error";
  };

  const getLateColor = (rate) => {
    if (rate < 0.1) return "success";
    if (rate < 0.2) return "warning";
    return "error";
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return "success";
    if (progress >= 50) return "warning";
    return "error";
  };

  return (
    <Grid container spacing={2}>
      {/* Row 1 */}
      <Grid item xs={6} sm={3}>
        <StatCard
          icon="📝"
          label="Tổng số công việc"
          value={`${total} cv`}
          subtitle="trong chu kỳ"
          color="info"
          tooltip={
            <RichTooltip
              title="Tổng số công việc trong chu kỳ"
              description="Tất cả công việc được giao trong khoảng thời gian đánh giá (lọc theo createdAt)."
              formula="Tổng = TAO_MOI + DA_GIAO + DANG_THUC_HIEN + CHO_DUYET + HOAN_THANH"
              example="15 công việc (bao gồm tất cả trạng thái)"
            />
          }
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatCard
          icon="✅"
          label="Đã hoàn thành"
          value={`${completed}/${total}`}
          subtitle={`${Math.round(completionRate * 100)}% tổng số • ${
            completionRate >= 0.8
              ? "Tốt"
              : completionRate >= 0.6
              ? "Khá"
              : "Cần cải thiện"
          }`}
          color={getCompletionColor(completionRate)}
          tooltip={
            <RichTooltip
              title="Tỷ lệ hoàn thành công việc"
              description="Số công việc ở trạng thái HOÀN_THANH trong tổng số công việc được giao."
              formula="completionRate = số hoàn thành / tổng số"
              example="12 hoàn thành / 15 tổng = 80%"
              thresholds={[
                { label: "Tốt", color: "success", condition: "≥ 80%" },
                { label: "Khá", color: "warning", condition: "60-79%" },
                { label: "Cần cải thiện", color: "error", condition: "< 60%" },
              ]}
            />
          }
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatCard
          icon="⏰"
          label="Hoàn thành trễ hạn"
          value={completed > 0 ? `${late}/${completed}` : `${late}`}
          subtitle={`${Math.round(lateRate * 100)}% đã hoàn thành • ${
            lateRate < 0.1
              ? "Tốt"
              : lateRate < 0.2
              ? "Cảnh báo"
              : "Nghiêm trọng"
          }`}
          color={getLateColor(lateRate)}
          tooltip={
            <RichTooltip
              title="Công việc hoàn thành muộn deadline"
              description="Số công việc hoàn thành SAU hạn chót (NgayHoanThanh > NgayHetHan). Chỉ tính trong công việc ĐÃ HOÀN THÀNH. Phản ánh kỷ luật thời gian."
              formula="lateRate = số trễ hạn / tổng hoàn thành"
              example="2 trễ hạn / 12 đã hoàn thành = 17%"
              thresholds={[
                { label: "Tốt", color: "success", condition: "< 10%" },
                { label: "Cảnh báo", color: "warning", condition: "10-19%" },
                { label: "Nghiêm trọng", color: "error", condition: "≥ 20%" },
              ]}
              note="Khác với 'Quá hạn': Đây là ĐÃ XONG nhưng muộn"
            />
          }
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatCard
          icon="🔄"
          label="Đang thực hiện"
          value={`${active} cv`}
          subtitle={
            overdue > 0 ? `${overdue}/${active} cv quá hạn` : `Không quá hạn`
          }
          color={overdue > 0 ? "warning" : "info"}
          tooltip={
            <RichTooltip
              title="Công việc đang làm dở"
              description="Công việc ở trạng thái DANG_THUC_HIEN. 'Quá hạn' = CHƯA XONG VÀ đã qua NgayHetHan."
              example="3 đang làm, trong đó 1 quá hạn → Màu vàng (cảnh báo)"
              thresholds={[
                {
                  label: "Bình thường",
                  color: "info",
                  condition: "Không quá hạn",
                },
                {
                  label: "Cảnh báo",
                  color: "warning",
                  condition: "Có quá hạn",
                },
              ]}
              note="Khác với 'Trễ hạn': Đây là CHƯA XONG và muộn"
            />
          }
        />
      </Grid>

      {/* Row 2 */}
      <Grid item xs={6} sm={3}>
        <StatCard
          icon="⚡"
          label="Hoàn thành đúng hạn"
          value={`${onTimeRate}%`}
          subtitle={
            onTimeRate >= 75
              ? "Tốt"
              : onTimeRate >= 50
              ? "Khá"
              : "Cần cải thiện"
          }
          color={getProgressColor(onTimeRate)}
          tooltip={
            <RichTooltip
              title="Tỷ lệ tuân thủ deadline"
              description="Tỷ lệ % công việc hoàn thành ĐÚNG hoặc TRƯỚC hạn chót (HoanThanhTreHan = false). Chỉ tính trong công việc ĐÃ HOÀN THÀNH."
              formula="onTimeRate = (1 - lateRate) × 100"
              example="10 đúng hạn / 12 hoàn thành = 83%"
              thresholds={[
                { label: "Tốt", color: "success", condition: "≥ 75%" },
                { label: "Khá", color: "warning", condition: "50-74%" },
                { label: "Cần cải thiện", color: "error", condition: "< 50%" },
              ]}
            />
          }
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatCard
          icon="📊"
          label="Tiến độ trung bình"
          value={`${avgProgress}%`}
          subtitle={
            avgProgress >= 75 ? "Tốt" : avgProgress >= 50 ? "Khá" : "Thấp"
          }
          color={getProgressColor(avgProgress)}
          tooltip={
            <RichTooltip
              title="Tiến độ thực tế của tất cả công việc"
              description="Trung bình % tiến độ hoàn thành của TẤT CẢ công việc (kể cả đang làm dở)."
              formula="avgProgress = SUM(PhanTramTienDoTong) / số công việc"
              example={
                <>
                  CV A: 100% (xong)
                  <br />
                  CV B: 50% (đang làm)
                  <br />
                  CV C: 80% (đang làm)
                  <br />→ TB = (100+50+80)/3 = 76.7%
                </>
              }
              thresholds={[
                { label: "Tốt", color: "success", condition: "≥ 75%" },
                { label: "Khá", color: "warning", condition: "50-74%" },
                { label: "Thấp", color: "error", condition: "< 50%" },
              ]}
            />
          }
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatCard
          icon="👥"
          label="Quy mô nhóm TB"
          value={avgTeamSize > 0 ? avgTeamSize.toFixed(1) : "0.0"}
          subtitle="người/công việc"
          color="info"
          tooltip={
            <RichTooltip
              title="Mức độ làm việc nhóm"
              description="Trung bình số người tham gia mỗi công việc (field NguoiThamGia array)."
              formula="avgTeamSize = SUM(số người) / số công việc"
              example={
                <>
                  CV1: 3 người (nhóm)
                  <br />
                  CV2: 1 người (độc lập)
                  <br />
                  CV3: 4 người (nhóm lớn)
                  <br />→ TB = (3+1+4)/3 = 2.7
                </>
              }
              note="Cao = Công việc phức tạp cần phối hợp | Thấp = Công việc độc lập"
            />
          }
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <StatCard
          icon="💬"
          label="Tương tác trung bình"
          value={avgComments > 0 ? avgComments.toFixed(1) : "0.0"}
          subtitle="bình luận/công việc"
          color="info"
          tooltip={
            <RichTooltip
              title="Mức độ giao tiếp và báo cáo"
              description="Trung bình số bình luận trên mỗi công việc. Dữ liệu từ collection 'binhluans'."
              formula="avgComments = tổng bình luận / số công việc"
              example={
                <>
                  CV1: 5 comments (tương tác nhiều)
                  <br />
                  CV2: 0 comments (im lặng)
                  <br />
                  CV3: 9 comments (rất nhiều)
                  <br />→ TB = (5+0+9)/3 = 4.7
                </>
              }
              note="Nhiều = Giao tiếp tốt, báo cáo thường xuyên | Ít = Im lặng, ít cập nhật"
            />
          }
        />
      </Grid>
    </Grid>
  );
}

export default OverviewCards;
