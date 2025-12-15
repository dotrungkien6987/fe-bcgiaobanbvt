/**
 * YeuCauActionButtons - Các button hành động cho yêu cầu
 *
 * Hiển thị các button tương ứng với actions có thể thực hiện
 */
import React from "react";
import {
  Stack,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  SwapHoriz as SwapIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  MoreVert as MoreIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

import { HANH_DONG } from "../yeuCau.constants";

// Map action to config
const ACTION_CONFIG = {
  [HANH_DONG.SUA]: {
    label: "Sửa",
    icon: <EditIcon />,
    color: "info",
    variant: "outlined",
  },
  [HANH_DONG.XOA]: {
    label: "Xóa",
    icon: <DeleteIcon />,
    color: "error",
    variant: "outlined",
  },
  [HANH_DONG.TIEP_NHAN]: {
    label: "Tiếp nhận",
    icon: <CheckIcon />,
    color: "success",
    variant: "contained",
    primary: true,
  },
  [HANH_DONG.TU_CHOI]: {
    label: "Từ chối",
    icon: <CloseIcon />,
    color: "error",
    variant: "outlined",
  },
  [HANH_DONG.DIEU_PHOI]: {
    label: "Phân công",
    icon: <PersonIcon />,
    color: "info",
    variant: "outlined",
  },
  [HANH_DONG.GUI_VE_KHOA]: {
    label: "Chuyển về khoa/phòng điều phối lại",
    icon: <SwapIcon />,
    color: "warning",
    variant: "outlined",
  },
  [HANH_DONG.HOAN_THANH]: {
    label: "Hoàn thành",
    icon: <CheckIcon />,
    color: "success",
    variant: "contained",
    primary: true,
  },
  [HANH_DONG.DONG]: {
    label: "Đóng",
    icon: <LockIcon />,
    color: "inherit",
    variant: "outlined",
  },
  [HANH_DONG.MO_LAI]: {
    label: "Mở lại",
    icon: <RefreshIcon />,
    color: "warning",
    variant: "outlined",
  },
  [HANH_DONG.YEU_CAU_XU_LY_TIEP]: {
    label: "Yêu cầu xử lý tiếp",
    icon: <RefreshIcon />,
    color: "warning",
    variant: "outlined",
  },
  [HANH_DONG.HUY_TIEP_NHAN]: {
    label: "Hủy tiếp nhận",
    icon: <CloseIcon />,
    color: "warning",
    variant: "outlined",
  },
  [HANH_DONG.DOI_THOI_GIAN_HEN]: {
    label: "Đổi thời gian hẹn",
    icon: <ScheduleIcon />,
    color: "info",
    variant: "outlined",
  },
  [HANH_DONG.DANH_GIA]: {
    label: "Đánh giá",
    icon: <StarIcon />,
    color: "warning",
    variant: "contained",
    primary: true,
  },
  [HANH_DONG.NHAC_LAI]: {
    label: "Nhắc lại",
    icon: <WarningIcon />,
    color: "warning",
    variant: "outlined",
  },
  [HANH_DONG.BAO_QUAN_LY]: {
    label: "Báo quản lý",
    icon: <WarningIcon />,
    color: "error",
    variant: "outlined",
  },
  [HANH_DONG.APPEAL]: {
    label: "Khiếu nại",
    icon: <WarningIcon />,
    color: "error",
    variant: "outlined",
  },
};

// Actions ẩn trong menu "More"
const SECONDARY_ACTIONS = [
  HANH_DONG.SUA,
  HANH_DONG.XOA,
  HANH_DONG.HUY_TIEP_NHAN,
  HANH_DONG.DOI_THOI_GIAN_HEN,
  HANH_DONG.MO_LAI,
  HANH_DONG.NHAC_LAI,
  HANH_DONG.BAO_QUAN_LY,
];

function YeuCauActionButtons({
  availableActions = [],
  onAction,
  loading = false,
  loadingAction = null,
  size = "medium",
  variant = "buttons", // 'buttons' | 'menu' | 'compact' | 'scroll'
}) {
  const [menuAnchor, setMenuAnchor] = React.useState(null);

  if (availableActions.length === 0) return null;

  // Loại bỏ BINH_LUAN vì xử lý riêng
  const actions = availableActions.filter((a) => a !== HANH_DONG.BINH_LUAN);

  // Chia thành primary và secondary actions
  const primaryActions = actions.filter((a) => !SECONDARY_ACTIONS.includes(a));
  const secondaryActions = actions.filter((a) => SECONDARY_ACTIONS.includes(a));

  const handleAction = (action) => {
    setMenuAnchor(null);
    onAction?.(action);
  };

  // Compact variant - chỉ hiện icon buttons
  if (variant === "compact") {
    return (
      <Stack direction="row" spacing={0.5}>
        {actions.slice(0, 3).map((action) => {
          const config = ACTION_CONFIG[action];
          if (!config) return null;
          return (
            <Tooltip key={action} title={config.label}>
              <IconButton
                size="small"
                color={config.color}
                onClick={() => handleAction(action)}
                disabled={loading}
              >
                {config.icon}
              </IconButton>
            </Tooltip>
          );
        })}
        {actions.length > 3 && (
          <>
            <IconButton
              size="small"
              color="inherit"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              {actions.slice(3).map((action) => {
                const config = ACTION_CONFIG[action];
                if (!config) return null;
                return (
                  <MenuItem
                    key={action}
                    onClick={() => handleAction(action)}
                    disabled={loading}
                  >
                    <ListItemIcon>{config.icon}</ListItemIcon>
                    <ListItemText>{config.label}</ListItemText>
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        )}
      </Stack>
    );
  }

  // Menu variant - tất cả trong dropdown
  if (variant === "menu") {
    return (
      <>
        <Button
          variant="outlined"
          endIcon={<MoreIcon />}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          disabled={loading}
          size={size}
        >
          Hành động
        </Button>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          {actions.map((action) => {
            const config = ACTION_CONFIG[action];
            if (!config) return null;
            return (
              <MenuItem
                key={action}
                onClick={() => handleAction(action)}
                disabled={loading && loadingAction === action}
              >
                <ListItemIcon sx={{ color: `${config.color}.main` }}>
                  {config.icon}
                </ListItemIcon>
                <ListItemText>{config.label}</ListItemText>
              </MenuItem>
            );
          })}
        </Menu>
      </>
    );
  }

  // Scroll variant - full text buttons in horizontal scroll container
  if (variant === "scroll") {
    return (
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
          pb: 0.5,
          "&::-webkit-scrollbar": {
            height: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: 2,
          },
          "& > *": {
            flexShrink: 0,
          },
        }}
      >
        {primaryActions.map((action) => {
          const config = ACTION_CONFIG[action];
          if (!config) return null;
          return (
            <Button
              key={action}
              variant={config.variant}
              color={config.color}
              size={size}
              startIcon={config.icon}
              onClick={() => handleAction(action)}
              disabled={loading}
              loading={loadingAction === action}
              sx={{ whiteSpace: "nowrap" }}
            >
              {config.label}
            </Button>
          );
        })}

        {secondaryActions.length > 0 && (
          <>
            <Button
              variant="outlined"
              size={size}
              endIcon={<MoreIcon />}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              disabled={loading}
              sx={{ whiteSpace: "nowrap" }}
            >
              Thêm
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              {secondaryActions.map((action, index) => {
                const config = ACTION_CONFIG[action];
                if (!config) return null;
                return (
                  <React.Fragment key={action}>
                    {index > 0 &&
                      (action === HANH_DONG.XOA ||
                        action === HANH_DONG.BAO_QUAN_LY) && <Divider />}
                    <MenuItem
                      onClick={() => handleAction(action)}
                      disabled={loading && loadingAction === action}
                    >
                      <ListItemIcon sx={{ color: `${config.color}.main` }}>
                        {config.icon}
                      </ListItemIcon>
                      <ListItemText>{config.label}</ListItemText>
                    </MenuItem>
                  </React.Fragment>
                );
              })}
            </Menu>
          </>
        )}
      </Stack>
    );
  }

  // Default: buttons variant
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {/* Primary actions as buttons */}
      {primaryActions.map((action) => {
        const config = ACTION_CONFIG[action];
        if (!config) return null;
        return (
          <Button
            key={action}
            variant={config.variant}
            color={config.color}
            size={size}
            startIcon={config.icon}
            onClick={() => handleAction(action)}
            disabled={loading}
            loading={loadingAction === action}
          >
            {config.label}
          </Button>
        );
      })}

      {/* Secondary actions in menu */}
      {secondaryActions.length > 0 && (
        <>
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            disabled={loading}
          >
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            {secondaryActions.map((action, index) => {
              const config = ACTION_CONFIG[action];
              if (!config) return null;
              return (
                <React.Fragment key={action}>
                  {index > 0 &&
                    (action === HANH_DONG.XOA ||
                      action === HANH_DONG.BAO_QUAN_LY) && <Divider />}
                  <MenuItem
                    onClick={() => handleAction(action)}
                    disabled={loading && loadingAction === action}
                  >
                    <ListItemIcon sx={{ color: `${config.color}.main` }}>
                      {config.icon}
                    </ListItemIcon>
                    <ListItemText>{config.label}</ListItemText>
                  </MenuItem>
                </React.Fragment>
              );
            })}
          </Menu>
        </>
      )}
    </Stack>
  );
}

export default YeuCauActionButtons;
