/**
 * PullToRefreshWrapper - Native-like pull-to-refresh gesture
 *
 * Mobile: Pull down to refresh (like iOS/Android)
 * Desktop: Optional (can still use button)
 */
import React, { useState, useRef, useCallback } from "react";
import { Box, CircularProgress, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function PullToRefreshWrapper({
  onRefresh,
  children,
  disabled = false,
  threshold = 80, // pixels to trigger refresh
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback(
    (e) => {
      if (disabled || !isMobile || isRefreshing) return;

      // Only start if at top of scroll
      if (containerRef.current && containerRef.current.scrollTop === 0) {
        setStartY(e.touches[0].clientY);
      }
    },
    [disabled, isMobile, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (startY === 0 || disabled || !isMobile || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Only pull down (positive distance)
      if (
        distance > 0 &&
        containerRef.current &&
        containerRef.current.scrollTop === 0
      ) {
        // Apply resistance (logarithmic curve for natural feel)
        const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);

        setPullDistance(resistedDistance);
        setIsPulling(resistedDistance > threshold);

        // CHỈ preventDefault khi đang pull đủ xa (> 10px)
        // Điều này cho phép tap/click bình thường
        if (distance > 10) {
          e.preventDefault();
        }
      }
    },
    [startY, disabled, isMobile, isRefreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !isMobile) {
      setStartY(0);
      setPullDistance(0);
      setIsPulling(false);
      return;
    }

    // Trigger refresh if threshold met
    if (isPulling && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Lock at threshold position

      try {
        await onRefresh?.();
      } catch (error) {
        console.error("Refresh error:", error);
      } finally {
        setIsRefreshing(false);
      }
    }

    // Reset state
    setStartY(0);
    setPullDistance(0);
    setIsPulling(false);
  }, [isPulling, isRefreshing, disabled, isMobile, onRefresh, threshold]);

  if (!isMobile) {
    // DESKTOP: Regular wrapper without pull-to-refresh
    return <Box>{children}</Box>;
  }

  // MOBILE: Pull-to-refresh enabled
  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: "relative",
        minHeight: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Pull indicator */}
      <Box
        sx={{
          position: "absolute",
          top: -60,
          left: 0,
          right: 0,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          transform: `translateY(${pullDistance}px)`,
          transition:
            isPulling || isRefreshing ? "none" : "transform 0.3s ease-out",
          opacity: Math.min(pullDistance / threshold, 1),
          zIndex: 1000,
        }}
      >
        <CircularProgress
          size={32}
          variant={isRefreshing ? "indeterminate" : "determinate"}
          value={Math.min((pullDistance / threshold) * 100, 100)}
          sx={{
            color: isPulling ? "success.main" : "primary.main",
          }}
        />
      </Box>

      {/* Content */}
      <Box
        sx={{
          transform: `translateY(${isRefreshing ? threshold : 0}px)`,
          transition: isRefreshing ? "transform 0.3s ease-out" : "none",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
