/**
 * SwipeableYeuCauCard - Card with swipe gestures for quick actions
 *
 * Mobile: Swipe right/left for quick actions
 * Desktop: Regular card with hover buttons
 */
import React, { useRef, useState } from "react";
import { Card, Box, IconButton, useMediaQuery } from "@mui/material";
import { Check as AcceptIcon, Close as RejectIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function SwipeableYeuCauCard({
  children,
  onSwipeAction,
  leftAction = { icon: <AcceptIcon />, color: "success", action: "TIEP_NHAN" },
  rightAction = { icon: <RejectIcon />, color: "error", action: "TU_CHOI" },
  disabled = false,
  ...cardProps
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const cardRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const SWIPE_THRESHOLD = 100; // pixels to trigger action

  const handleTouchStart = (e) => {
    if (disabled || !isMobile) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || disabled || !isMobile) return;
    const diff = e.touches[0].clientX - startX;
    setCurrentX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled || !isMobile) {
      setCurrentX(0);
      setIsDragging(false);
      return;
    }

    setIsDragging(false);

    // Trigger action if threshold met
    if (Math.abs(currentX) > SWIPE_THRESHOLD) {
      if (currentX > 0 && leftAction) {
        onSwipeAction?.(leftAction.action);
      } else if (currentX < 0 && rightAction) {
        onSwipeAction?.(rightAction.action);
      }
    }

    // Reset position
    setCurrentX(0);
  };

  if (!isMobile) {
    // DESKTOP: Regular card without swipe
    return <Card {...cardProps}>{children}</Card>;
  }

  // MOBILE: Swipeable card
  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      {/* Background action indicators */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          zIndex: 0,
        }}
      >
        {/* Left action (swipe right to reveal) */}
        {leftAction && (
          <IconButton
            sx={{
              bgcolor: `${leftAction.color}.main`,
              color: "white",
              opacity:
                currentX > 0 ? Math.min(currentX / SWIPE_THRESHOLD, 1) : 0,
              transition: isDragging ? "none" : "opacity 0.3s",
              "&:hover": { bgcolor: `${leftAction.color}.dark` },
              width: 48,
              height: 48,
            }}
            disabled
          >
            {leftAction.icon}
          </IconButton>
        )}

        {/* Right action (swipe left to reveal) */}
        {rightAction && (
          <IconButton
            sx={{
              bgcolor: `${rightAction.color}.main`,
              color: "white",
              opacity:
                currentX < 0
                  ? Math.min(Math.abs(currentX) / SWIPE_THRESHOLD, 1)
                  : 0,
              transition: isDragging ? "none" : "opacity 0.3s",
              "&:hover": { bgcolor: `${rightAction.color}.dark` },
              width: 48,
              height: 48,
            }}
            disabled
          >
            {rightAction.icon}
          </IconButton>
        )}
      </Box>

      {/* Swipeable card */}
      <Card
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...cardProps}
        sx={{
          position: "relative",
          zIndex: 1,
          transform: `translateX(${currentX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
          touchAction: "pan-y", // Allow vertical scroll
          cursor: isDragging ? "grabbing" : "grab",
          ...cardProps.sx,
        }}
      >
        {children}
      </Card>
    </Box>
  );
}
