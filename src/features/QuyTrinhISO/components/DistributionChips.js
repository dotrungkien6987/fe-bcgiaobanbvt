import { Chip, Stack, Tooltip, Typography } from "@mui/material";

/**
 * DistributionChips - Hiển thị chips khoa phân phối
 *
 * Props:
 * - khoaList: Array<{ _id, TenKhoa, MaKhoa }>
 * - maxDisplay: number (default: 2)
 * - size: "small" | "medium" (default: "small")
 */
function DistributionChips({ khoaList = [], maxDisplay = 2, size = "small" }) {
  if (!khoaList || khoaList.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        Chưa phân phối
      </Typography>
    );
  }

  const displayList = khoaList.slice(0, maxDisplay);
  const remaining = khoaList.length - maxDisplay;

  const tooltipContent = khoaList.map((k) => k.TenKhoa).join(", ");

  return (
    <Tooltip title={tooltipContent} arrow>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {displayList.map((khoa) => (
          <Chip
            key={khoa._id}
            label={khoa.MaKhoa || khoa.TenKhoa}
            size={size}
            variant="outlined"
            sx={{ maxWidth: 100 }}
          />
        ))}
        {remaining > 0 && (
          <Chip
            label={`+${remaining}`}
            size={size}
            color="primary"
            variant="filled"
          />
        )}
      </Stack>
    </Tooltip>
  );
}

/**
 * DistributionCount - Hiển thị số khoa phân phối dạng chip đơn
 */
export function DistributionCount({ count = 0, onClick }) {
  return (
    <Chip
      label={`${count} khoa`}
      size="small"
      color={count > 0 ? "primary" : "default"}
      variant={count > 0 ? "filled" : "outlined"}
      onClick={onClick}
      sx={{ cursor: onClick ? "pointer" : "default" }}
    />
  );
}

export default DistributionChips;
