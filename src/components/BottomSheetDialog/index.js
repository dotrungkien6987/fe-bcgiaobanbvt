/**
 * BottomSheetDialog - Responsive dialog component
 *
 * Desktop: Regular center modal (professional)
 * Mobile: Bottom sheet with swipe-to-dismiss (native feel)
 *
 * SHARED COMPONENT - Used across QuanLyCongViec module
 */
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Slide,
  useMediaQuery,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function BottomSheetDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullScreen = false,
  fullWidth = true,
  ...otherDialogProps
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!isMobile) {
    // DESKTOP: Regular dialog (unchanged UX)
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        {...otherDialogProps}
      >
        <DialogTitle>
          {title}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "grey.500",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
        {actions && <DialogActions>{actions}</DialogActions>}
      </Dialog>
    );
  }

  // MOBILE: Bottom sheet
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      TransitionComponent={Transition}
      sx={{
        "& .MuiDialog-paper": {
          position: "fixed",
          bottom: 0,
          m: 0,
          borderRadius: "16px 16px 0 0",
          maxHeight: fullScreen ? "100vh" : "90vh",
          width: "100%",
        },
        "& .MuiDialogContent-root": {
          overflowY: "auto",
          WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
          px: 3,
          py: 2,
        },
        "& .MuiDialogActions-root": {
          px: 3,
          py: 2,
          pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)", // 👈 Safe area padding with fallback
          flexDirection: "column",
          gap: 1,
        },
      }}
      PaperProps={{
        sx: {
          touchAction: "pan-y", // Allow vertical scroll
        },
      }}
      {...otherDialogProps}
    >
      {/* Drag handle for visual affordance */}
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: "action.disabled",
          borderRadius: 2,
          mx: "auto",
          mt: 1,
          mb: 1,
        }}
      />

      <DialogTitle sx={{ pb: 1, pt: 1 }}>
        {title}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            minWidth: 48,
            minHeight: 48, // Touch target
            color: "grey.500",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      {actions && (
        <DialogActions>
          {/* Render full-width buttons on mobile */}
          {React.Children.map(actions.props?.children || actions, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                fullWidth: true,
                size: "large",
                sx: {
                  minHeight: 48,
                  ...child.props.sx,
                },
              });
            }
            return child;
          })}
        </DialogActions>
      )}
    </Dialog>
  );
}
