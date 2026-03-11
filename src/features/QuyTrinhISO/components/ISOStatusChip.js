import { Chip } from "@mui/material";
import { STATUS_CONFIG } from "../theme/isoTokens";

/**
 * ISOStatusChip — Single source of truth cho trạng thái quy trình ISO
 *
 * @param {Object} props
 * @param {'DRAFT'|'ACTIVE'|'INACTIVE'} props.status
 * @param {'small'|'medium'} props.size
 * @param {'filled'|'outlined'} props.variant - MUI Chip variant
 */
function ISOStatusChip({ status, size = "small", variant = "filled" }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <Chip
      label={config.label}
      size={size}
      color={config.color === "default" ? undefined : config.color}
      variant={variant}
      sx={{
        ...config.chipSx,
        ...(variant === "outlined" && config.color !== "default"
          ? { fontWeight: 600 }
          : {}),
      }}
    />
  );
}

export default ISOStatusChip;
