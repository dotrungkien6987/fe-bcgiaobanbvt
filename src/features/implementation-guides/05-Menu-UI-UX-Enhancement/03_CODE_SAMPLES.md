# 📦 Code Samples & Utilities

> Reusable code snippets và patterns cho Menu UI/UX

## 🎯 Quick Jump

- [Animation Utilities](#animation-utilities)
- [Custom Hooks](#custom-hooks)
- [Theme Helpers](#theme-helpers)
- [Reusable Components](#reusable-components)
- [Performance Patterns](#performance-patterns)

---

## 1️⃣ Animation Utilities

### Keyframes Collection

**File**: `src/utils/animations.js` (Create if needed)

```javascript
// ==============================|| ANIMATION KEYFRAMES ||============================== //

export const keyframes = {
  // Icon Animations
  iconBounce: `
    @keyframes iconBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
  `,

  iconPulse: `
    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
  `,

  iconShake: `
    @keyframes iconShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-2px); }
      75% { transform: translateX(2px); }
    }
  `,

  // Slide Animations
  slideInFromLeft: `
    @keyframes slideInFromLeft {
      0% {
        opacity: 0;
        transform: translateX(-20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,

  slideInFromRight: `
    @keyframes slideInFromRight {
      0% {
        opacity: 0;
        transform: translateX(20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,

  slideInFromTop: `
    @keyframes slideInFromTop {
      0% {
        opacity: 0;
        transform: translateY(-20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  // Fade Animations
  fadeIn: `
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  `,

  fadeOut: `
    @keyframes fadeOut {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
  `,

  // Shimmer Effect
  shimmer: `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `,

  // Pulse Effect
  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 0.6;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
    }
  `,

  // Glow Effect
  glow: `
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 5px currentColor;
      }
      50% {
        box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
      }
    }
  `,
};

// Usage trong component:
// sx={{ animation: 'iconBounce 0.6s ease-in-out' }}
```

### Stagger Animation Helper

```javascript
/**
 * Generate staggered animation delay
 * @param {number} index - Item index
 * @param {number} baseDelay - Delay between items (ms)
 * @param {string} animationName - Keyframe animation name
 * @param {string} duration - Animation duration
 * @param {string} easing - Timing function
 * @returns {object} MUI sx object
 */
export const getStaggeredAnimation = (
  index,
  baseDelay = 50,
  animationName = "slideInFromLeft",
  duration = "0.3s",
  easing = "ease-out"
) => ({
  animation: `${animationName} ${duration} ${easing} ${
    index * baseDelay
  }ms both`,
});

// Usage:
const items = data.map((item, index) => (
  <Box key={item.id} sx={getStaggeredAnimation(index)}>
    {/* content */}
  </Box>
));
```

### Transition Helper

```javascript
/**
 * Generate consistent transition
 * @param {string[]} properties - CSS properties to transition
 * @param {string} duration - Duration
 * @param {string} easing - Timing function
 * @returns {string} CSS transition value
 */
export const getTransition = (
  properties = ["all"],
  duration = "0.3s",
  easing = "cubic-bezier(0.4, 0, 0.2, 1)"
) => {
  return properties
    .map((prop) => `${prop} ${duration} ${easing}`)
    .join(", ");
};

// Usage:
sx={{
  transition: getTransition(["opacity", "transform"], "0.4s")
}}
```

---

## 2️⃣ Custom Hooks

### useActiveIndicator Hook

```javascript
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Track active menu item position
 * @param {boolean} isVisible - Whether indicator should be visible
 * @param {string} selector - CSS selector for active item
 * @param {string} containerSelector - CSS selector for container
 * @returns {object} Position state and visibility
 */
export const useActiveIndicator = (
  isVisible,
  selector = ".MuiListItemButton-root.Mui-selected",
  containerSelector = '[aria-label="mailbox folders"]'
) => {
  const { pathname } = useLocation();
  const [position, setPosition] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShowIndicator(false);
      return;
    }

    const activeElement = document.querySelector(selector);
    const container = document.querySelector(containerSelector);

    if (activeElement && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      const calculatedPosition =
        activeRect.top - containerRect.top + activeRect.height / 2 - 24;

      setPosition(calculatedPosition);
      setShowIndicator(true);
    } else {
      setShowIndicator(false);
    }
  }, [pathname, isVisible, selector, containerSelector]);

  return { position, showIndicator };
};

// Usage:
const { position, showIndicator } = useActiveIndicator(drawerOpen);
```

### useDrawerAnimation Hook

```javascript
import { useEffect, useState } from "react";

/**
 * Manage drawer animation states
 * @param {boolean} isOpen - Drawer open state
 * @param {number} delay - Animation delay (ms)
 * @returns {object} Animation states
 */
export const useDrawerAnimation = (isOpen, delay = 300) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, delay]);

  return { isAnimating, shouldRender };
};

// Usage:
const { isAnimating, shouldRender } = useDrawerAnimation(drawerOpen);

return (
  shouldRender && (
    <Box sx={{ opacity: isAnimating ? 1 : 0 }}>{/* content */}</Box>
  )
);
```

### useHoverAnimation Hook

```javascript
import { useState } from "react";

/**
 * Track hover state for animations
 * @returns {object} Hover state and handlers
 */
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return { isHovered, handlers };
};

// Usage:
const { isHovered, handlers } = useHoverAnimation();

return (
  <Box
    {...handlers}
    sx={{
      transform: isHovered ? "scale(1.05)" : "scale(1)",
      transition: "transform 0.2s",
    }}
  >
    {/* content */}
  </Box>
);
```

---

## 3️⃣ Theme Helpers

### Get Glassmorphism Styles

```javascript
/**
 * Generate glassmorphism styles
 * @param {object} theme - MUI theme
 * @param {number} blur - Backdrop blur amount (px)
 * @param {number} opacity - Background opacity (0-1)
 * @returns {object} MUI sx object
 */
export const getGlassmorphismStyles = (theme, blur = 20, opacity = 0.85) => ({
  backdropFilter: `blur(${blur}px)`,
  background:
    theme.palette.mode === "dark"
      ? `rgba(30, 30, 30, ${opacity})`
      : `rgba(255, 255, 255, ${opacity})`,
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)"
  }`,
  borderRadius: theme.shape.borderRadius,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0, 0, 0, 0.4)"
      : "0 8px 32px rgba(0, 0, 0, 0.1)",
});

// Usage:
const GlassBox = styled(Box)(({ theme }) => ({
  ...getGlassmorphismStyles(theme),
  padding: theme.spacing(2),
}));
```

### Get Gradient Styles

```javascript
/**
 * Generate gradient styles
 * @param {object} theme - MUI theme
 * @param {number} angle - Gradient angle (deg)
 * @param {string} color1 - Start color key
 * @param {string} color2 - End color key
 * @returns {object} Gradient styles
 */
export const getGradientStyles = (
  theme,
  angle = 135,
  color1 = "primary.main",
  color2 = "secondary.main"
) => {
  const c1 = theme.palette.primary.main;
  const c2 = theme.palette.secondary.main;

  return {
    background: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
};

// Usage:
<Typography sx={getGradientStyles(theme)}>Gradient Text</Typography>;
```

### Get Theme-Aware Shadow

```javascript
/**
 * Get shadow based on theme mode
 * @param {object} theme - MUI theme
 * @param {number} elevation - Shadow elevation (1-5)
 * @returns {string} Box shadow CSS
 */
export const getThemeShadow = (theme, elevation = 2) => {
  const shadows = {
    dark: [
      "0 2px 4px rgba(0,0,0,0.3)",
      "0 4px 8px rgba(0,0,0,0.4)",
      "0 8px 16px rgba(0,0,0,0.5)",
      "0 12px 24px rgba(0,0,0,0.6)",
      "0 16px 32px rgba(0,0,0,0.7)",
    ],
    light: [
      "0 2px 4px rgba(0,0,0,0.1)",
      "0 4px 8px rgba(0,0,0,0.15)",
      "0 8px 16px rgba(0,0,0,0.2)",
      "0 12px 24px rgba(0,0,0,0.25)",
      "0 16px 32px rgba(0,0,0,0.3)",
    ],
  };

  const mode = theme.palette.mode === "dark" ? "dark" : "light";
  return shadows[mode][elevation - 1] || shadows[mode][1];
};

// Usage:
sx={{
  boxShadow: getThemeShadow(theme, 3)
}}
```

---

## 4️⃣ Reusable Components

### AnimatedBox Component

```javascript
import { Box } from "@mui/material";
import { forwardRef } from "react";

/**
 * Box với animation presets
 */
const AnimatedBox = forwardRef(
  (
    {
      animation = "fadeIn",
      duration = "0.3s",
      delay = "0s",
      easing = "ease-out",
      children,
      sx,
      ...props
    },
    ref
  ) => {
    const animations = {
      fadeIn: {
        "@keyframes fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      slideUp: {
        "@keyframes slideUp": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      slideLeft: {
        "@keyframes slideLeft": {
          "0%": { opacity: 0, transform: "translateX(-20px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
      },
      scale: {
        "@keyframes scale": {
          "0%": { opacity: 0, transform: "scale(0.8)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
    };

    return (
      <Box
        ref={ref}
        sx={{
          ...animations[animation],
          animation: `${animation} ${duration} ${easing} ${delay} both`,
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

export default AnimatedBox;

// Usage:
<AnimatedBox animation="slideUp" duration="0.5s" delay="0.2s">
  Content
</AnimatedBox>;
```

### GlassCard Component

```javascript
import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

/**
 * Card với glassmorphism effect
 */
const GlassCard = styled(Card)(({ theme, blur = 20, opacity = 0.85 }) => ({
  backdropFilter: `blur(${blur}px)`,
  background:
    theme.palette.mode === "dark"
      ? `rgba(30, 30, 30, ${opacity})`
      : `rgba(255, 255, 255, ${opacity})`,
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)"
  }`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0, 0, 0, 0.4)"
      : "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 40px rgba(0, 0, 0, 0.5)"
        : "0 12px 40px rgba(0, 0, 0, 0.15)",
  },
}));

export default GlassCard;

// Usage:
<GlassCard blur={30} opacity={0.9}>
  <CardContent>Content</CardContent>
</GlassCard>;
```

### StaggeredList Component

```javascript
import { Box } from "@mui/material";

/**
 * List với staggered animation
 */
const StaggeredList = ({
  items,
  delay = 50,
  animationDuration = "0.3s",
  children,
}) => {
  return (
    <>
      {items.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            animation: `slideInFromLeft ${animationDuration} ease-out ${
              index * delay
            }ms both`,
            "@keyframes slideInFromLeft": {
              "0%": {
                opacity: 0,
                transform: "translateX(-20px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateX(0)",
              },
            },
          }}
        >
          {children(item, index)}
        </Box>
      ))}
    </>
  );
};

export default StaggeredList;

// Usage:
<StaggeredList items={menuItems} delay={50}>
  {(item) => <MenuItem>{item.title}</MenuItem>}
</StaggeredList>;
```

---

## 5️⃣ Performance Patterns

### Debounced Animation Trigger

```javascript
import { useEffect, useRef } from "react";

/**
 * Debounce animation triggers
 */
export const useDebouncedAnimation = (callback, delay = 300) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const trigger = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  return trigger;
};

// Usage:
const triggerAnimation = useDebouncedAnimation(() => {
  // Animation logic
}, 300);
```

### RAF Animation Loop

```javascript
import { useEffect, useRef } from "react";

/**
 * RequestAnimationFrame loop
 */
export const useAnimationFrame = (callback, deps = []) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, deps);
};

// Usage:
useAnimationFrame((deltaTime) => {
  // Update animation state
  setProgress((prev) => prev + deltaTime * 0.001);
});
```

### Lazy Animation

```javascript
import { useEffect, useState } from "react";

/**
 * Only animate when in viewport
 */
export const useLazyAnimation = (elementRef, threshold = 0.1) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldAnimate(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [elementRef, threshold]);

  return shouldAnimate;
};

// Usage:
const ref = useRef();
const shouldAnimate = useLazyAnimation(ref);

return (
  <Box
    ref={ref}
    sx={{
      opacity: shouldAnimate ? 1 : 0,
      transition: "opacity 0.5s",
    }}
  >
    Content
  </Box>
);
```

---

## 📊 Usage Examples

### Complete Menu Item với All Features

```javascript
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useHoverAnimation } from "utils/hooks";

const EnhancedMenuItem = ({ item, selected, onClick }) => {
  const theme = useTheme();
  const { isHovered, handlers } = useHoverAnimation();

  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      {...handlers}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

        // Glassmorphism hover
        "&:hover": {
          backdropFilter: "blur(20px)",
          background:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.02)",
        },

        // Gradient selected state
        "&.Mui-selected": {
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
          position: "relative",

          // Gradient border
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            padding: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "exclude",
            maskComposite: "exclude",
          },

          // Shimmer effect
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            animation: "shimmer 3s infinite",
          },
        },

        // Icon animation
        "& .MuiListItemIcon-root": {
          animation: isHovered ? "iconBounce 0.6s ease-in-out" : "none",
          "@keyframes iconBounce": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-3px)" },
          },
        },
      }}
    >
      <ListItemIcon>{item.icon}</ListItemIcon>
      <ListItemText primary={item.title} />
    </ListItemButton>
  );
};
```

---

**Next**: [Testing Guide](./04_TESTING_GUIDE.md) →
