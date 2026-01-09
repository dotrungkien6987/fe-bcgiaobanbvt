import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography, Icon, Box } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { getBreadcrumbs } from "utils/navigationHelper";
import apiService from "app/apiService";

/**
 * WorkManagementBreadcrumb - Auto-generating breadcrumb for QuanLyCongViec module
 *
 * Features:
 * - Auto-generates breadcrumb based on current URL
 * - Fetches dynamic labels for detail pages (e.g., task name)
 * - Clickable navigation
 * - Material-UI icons
 *
 * Usage:
 *   <WorkManagementBreadcrumb />
 */
function WorkManagementBreadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      setLoading(true);
      try {
        const items = getBreadcrumbs(location.pathname);

        // Fetch dynamic labels if needed
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.dynamic && item.fetchLabel) {
            // Extract ID from pathname
            const pathSegments = location.pathname.split("/");
            const id = pathSegments[pathSegments.length - 1];

            // Fetch label
            try {
              const label = await item.fetchLabel(id, apiService);
              items[i].label = label;
            } catch (error) {
              console.error("Failed to fetch breadcrumb label:", error);
              // Keep default label
            }
          }
        }

        setBreadcrumbItems(items);
      } catch (error) {
        console.error("Error generating breadcrumbs:", error);
        // Fallback to simple breadcrumb
        setBreadcrumbItems([
          { label: "Trang chủ", path: "/", icon: "home" },
          { label: "Quản lý công việc", path: "/quanlycongviec", icon: "work" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBreadcrumbs();
  }, [location.pathname]);

  const handleClick = (event, path) => {
    event.preventDefault();
    navigate(path);
  };

  if (loading) {
    return (
      <Box sx={{ mb: 2, height: 32 }}>
        {/* Skeleton or loading state */}
        <Typography variant="caption" color="text.secondary">
          Đang tải...
        </Typography>
      </Box>
    );
  }

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
      data-testid="breadcrumb"
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return isLast ? (
          // Last item (current page) - not clickable
          <Box
            key={item.path}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {item.icon && (
              <Icon sx={{ fontSize: 20 }} color="action">
                {item.icon}
              </Icon>
            )}
            <Typography variant="body2" color="text.primary">
              {item.label}
            </Typography>
          </Box>
        ) : (
          // Intermediate items - clickable
          <Link
            key={item.path}
            underline="hover"
            color="inherit"
            href={item.path}
            onClick={(e) => handleClick(e, item.path)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
            }}
          >
            {item.icon && (
              <Icon sx={{ fontSize: 20 }} color="action">
                {item.icon}
              </Icon>
            )}
            <Typography variant="body2">{item.label}</Typography>
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

export default WorkManagementBreadcrumb;
