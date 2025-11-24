import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

/**
 * Reusable button component for opening a task in a new browser tab
 *
 * @component
 * @example
 * // Basic usage
 * <OpenTaskInNewTabButton taskId="507f1f77bcf86cd799439011" />
 *
 * @example
 * // With custom handler
 * <OpenTaskInNewTabButton
 *   taskId={task._id}
 *   onClick={(taskId) => console.log('Opening task:', taskId)}
 * />
 *
 * @example
 * // Customized size and tooltip
 * <OpenTaskInNewTabButton
 *   taskId={task._id}
 *   size="medium"
 *   tooltip="Xem trong tab mới"
 *   disabled={!task._id}
 * />
 */
const OpenTaskInNewTabButton = ({
  taskId,
  size = "small",
  tooltip = "Mở tab mới",
  onClick = null,
  disabled = false,
  sx = {},
}) => {
  const handleClick = (e) => {
    // Prevent event propagation to parent elements (e.g., table row clicks)
    e.stopPropagation();

    if (disabled || !taskId) return;

    // Call custom handler if provided
    if (onClick) {
      onClick(taskId);
      return;
    }

    // Default behavior: open task in new tab
    const url = `/congviec/${taskId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Tooltip title={tooltip} arrow>
      <span>
        <IconButton
          size={size}
          onClick={handleClick}
          disabled={disabled || !taskId}
          sx={{
            color: "primary.main",
            "&:hover": {
              backgroundColor: "primary.lighter",
            },
            ...sx,
          }}
        >
          <OpenInNewIcon fontSize={size === "small" ? "small" : "inherit"} />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default OpenTaskInNewTabButton;
