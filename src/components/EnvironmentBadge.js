import React from "react";
import { Chip, Tooltip, keyframes } from "@mui/material";
import { Storage as StorageIcon } from "@mui/icons-material";
import { useEnvironment } from "../hooks/useEnvironment";

// Animation nhấp nháy cho Production
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
`;

/**
 * Component Badge hiển thị environment hiện tại
 *
 * @param {Object} props
 * @param {"small" | "medium"} props.size - Kích thước badge
 * @param {boolean} props.showIcon - Hiển thị icon server hay không
 * @param {boolean} props.showUrl - Hiển thị URL trong tooltip
 */
function EnvironmentBadge({ size = "small", showIcon = true, showUrl = true }) {
  const { env, label, color, icon, baseUrl, isProduction } = useEnvironment();

  const tooltipContent = (
    <div>
      <div>
        <strong>Environment:</strong> {env}
      </div>
      {showUrl && (
        <div style={{ fontSize: "0.85em", marginTop: 4, opacity: 0.9 }}>
          <strong>Server:</strong> {baseUrl || "N/A"}
        </div>
      )}
      {isProduction && (
        <div
          style={{
            marginTop: 8,
            padding: "4px 8px",
            backgroundColor: "rgba(255,0,0,0.2)",
            borderRadius: 4,
            fontSize: "0.85em",
          }}
        >
          ⚠️ Thao tác sẽ ảnh hưởng dữ liệu thật!
        </div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent} arrow placement="bottom">
      <Chip
        icon={showIcon ? <StorageIcon fontSize="small" /> : undefined}
        label={
          <span>
            {icon} {label}
          </span>
        }
        color={color}
        size={size}
        variant={isProduction ? "filled" : "outlined"}
        sx={{
          fontWeight: 600,
          fontSize: size === "small" ? "0.75rem" : "0.875rem",
          cursor: "help",
          // Animation cho Production
          ...(isProduction && {
            animation: `${pulse} 2s infinite`,
          }),
          // Responsive: ẩn text trên màn hình nhỏ
          "& .MuiChip-label": {
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 0.5,
          },
          // Chỉ hiện icon trên mobile
          minWidth: { xs: 32, sm: "auto" },
          "& .MuiChip-icon": {
            marginLeft: { xs: "4px", sm: "5px" },
            marginRight: { xs: "-4px", sm: "5px" },
          },
        }}
      />
    </Tooltip>
  );
}

export default EnvironmentBadge;
