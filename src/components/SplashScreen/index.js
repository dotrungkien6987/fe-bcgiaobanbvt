import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { keyframes } from "@mui/system";

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
`;

const fadeOut = keyframes`
  from { 
    opacity: 1; 
    transform: scale(1); 
  }
  to { 
    opacity: 0; 
    transform: scale(0.95); 
  }
`;

/**
 * SplashScreen - Loading screen hiển thị khi app khởi động
 *
 * @param {Function} onComplete - Callback được gọi khi animation hoàn tất (sau 1s)
 * @param {number} duration - Thời gian hiển thị splash (ms), default 1000ms
 *
 * @example
 * <SplashScreen onComplete={() => setShowSplash(false)} />
 */
function SplashScreen({ onComplete, duration = 1000 }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Progress bar animation - tăng dần từ 0 → 100
    const interval = duration / 10; // Chia làm 10 bước
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Bắt đầu fade out animation
          setIsExiting(true);
          // Gọi onComplete sau fade out duration (300ms)
          setTimeout(() => {
            onComplete?.();
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete, duration]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        zIndex: 9999,
        animation: isExiting ? `${fadeOut} 0.3s ease-out forwards` : "none",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          animation: `${fadeIn} 0.5s ease-out`,
          mb: 3,
        }}
      >
        <img
          src="/logo192.png" // From public folder
          alt="Hospital Logo"
          style={{
            width: 120,
            height: 120,
            objectFit: "contain",
          }}
        />
      </Box>

      {/* App Name */}
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          animation: `${fadeIn} 0.5s ease-out 0.2s both`,
          fontWeight: 500,
          textAlign: "center",
          px: 2,
        }}
      >
        Hệ thống Quản lý Bệnh viện
      </Typography>

      {/* Progress Bar */}
      <Box
        sx={{
          width: { xs: 280, sm: 320 },
          animation: `${fadeIn} 0.5s ease-out 0.4s both`,
          px: 2,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "action.hover",
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              transition: "transform 0.1s linear",
            },
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1.5,
          }}
        >
          Đang tải...
        </Typography>
      </Box>
    </Box>
  );
}

export default SplashScreen;
