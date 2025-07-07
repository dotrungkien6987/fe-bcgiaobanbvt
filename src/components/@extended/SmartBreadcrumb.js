import { Link, useLocation } from "react-router-dom";
import { Breadcrumbs, Typography, Box, Chip } from "@mui/material";
import { Home, ArrowRight2 } from "iconsax-react";
import { useTheme } from "@mui/material/styles";
import { ThemeMode } from "configAble";

// ==============================|| SMART BREADCRUMB ||============================== //

const SmartBreadcrumb = ({
  maxItems = 4,
  showHome = true,
  sx = {},
  separator = <ArrowRight2 size={14} />,
  ...others
}) => {
  const theme = useTheme();
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

  // Build breadcrumb items
  const breadcrumbItems = [];

  if (showHome) {
    breadcrumbItems.push({
      label: "Trang chủ",
      path: "/",
      icon: <Home size={16} />,
    });
  }

  pathnames.forEach((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
    const isLast = index === pathnames.length - 1;

    // Format name
    const formattedName = name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbItems.push({
      label: formattedName,
      path: routeTo,
      isLast,
    });
  });

  return (
    <Box
      sx={{
        py: 1.5,
        px: 2,
        bgcolor: theme.palette.mode === ThemeMode.DARK ? "grey.900" : "grey.50",
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        ...sx,
      }}
      {...others}
    >
      <Breadcrumbs
        maxItems={maxItems}
        separator={separator}
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color:
              theme.palette.mode === ThemeMode.DARK ? "grey.400" : "grey.600",
            mx: 0.5,
          },
        }}
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = item.isLast || index === breadcrumbItems.length - 1;

          return isLast ? (
            <Chip
              key={item.path}
              label={item.label}
              size="small"
              color="primary"
              variant="filled"
              icon={item.icon}
              sx={{
                height: 28,
                fontWeight: 500,
                "& .MuiChip-icon": {
                  fontSize: 16,
                },
              }}
            />
          ) : (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color:
                    theme.palette.mode === ThemeMode.DARK
                      ? "grey.300"
                      : "grey.700",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  transition: "color 0.2s ease",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
              >
                {item.icon}
                {item.label}
              </Typography>
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default SmartBreadcrumb;
