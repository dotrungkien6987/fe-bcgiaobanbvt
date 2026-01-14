import React, { useState } from "react";
import {
  Fab,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Slide,
  Box,
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import MenuGridPage from "./MenuGridPage";

// Slide transition for mobile (bottom sheet)
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FABMenuButton() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="menu"
        onClick={handleOpen}
        sx={{
          position: "fixed",
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: (theme) => theme.zIndex.speedDial,
          boxShadow: 4,
          "&:hover": {
            boxShadow: 8,
            transform: "scale(1.05)",
          },
          transition: "all 0.2s",
        }}
      >
        <MenuIcon />
      </Fab>

      {/* Menu Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        maxWidth="xl"
        fullWidth
        TransitionComponent={isMobile ? SlideTransition : undefined}
        PaperProps={{
          sx: {
            ...(isMobile && {
              borderRadius: "16px 16px 0 0",
              maxHeight: "90vh",
            }),
            ...(!isMobile && {
              borderRadius: 2,
              maxHeight: "90vh",
            }),
          },
        }}
      >
        {/* Close Button */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            display: "flex",
            justifyContent: "flex-end",
            p: 1,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            zIndex: 1,
          }}
        >
          <IconButton onClick={handleClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Menu Content */}
        <DialogContent sx={{ p: 0 }}>
          <MenuGridPage />
        </DialogContent>
      </Dialog>
    </>
  );
}
