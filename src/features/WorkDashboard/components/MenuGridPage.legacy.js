import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Collapse,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAuth from "hooks/useAuth";
import { MENU_SECTIONS } from "./MenuGridPage/config/menuConfig";

// MenuItem Component
function MenuItem({ item, onClick }) {
  return (
    <Card
      sx={{
        height: "100%",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
          borderColor: "primary.main",
        },
        border: "1px solid",
        borderColor: "divider",
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box sx={{ color: "primary.main", mr: 1 }}>{item.icon}</Box>
          <Typography variant="subtitle2" noWrap>
            {item.label}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          {item.description}
        </Typography>
      </CardContent>
    </Card>
  );
}

// MenuSection Component
function MenuSection({
  section,
  expanded,
  onToggle,
  filteredItems,
  onItemClick,
}) {
  if (filteredItems.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          cursor: "pointer",
          p: 1,
          borderRadius: 1,
          "&:hover": { bgcolor: "action.hover" },
        }}
        onClick={onToggle}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ color: section.color }}>{section.icon}</Box>
          <Typography variant="h6">{section.title}</Typography>
          <Chip label={filteredItems.length} size="small" />
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={2}>
          {filteredItems.map((item) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
              <MenuItem item={item} onClick={() => onItemClick(item.path)} />
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Box>
  );
}

// Main MenuGridPage Component
export default function MenuGridPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState(() => {
    // Initialize with default expanded state
    const initial = {};
    MENU_SECTIONS.forEach((section) => {
      initial[section.id] = section.defaultExpanded;
    });
    return initial;
  });

  // Filter menu items based on search query and user role
  const filteredSections = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const userRole = user?.PhanQuyen || "user";

    return MENU_SECTIONS.map((section) => {
      const filteredItems = section.items.filter((item) => {
        // Role check
        if (!item.roles.includes(userRole)) return false;

        // Search check
        if (query) {
          return (
            item.label.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            section.title.toLowerCase().includes(query)
          );
        }

        return true;
      });

      return { ...section, filteredItems };
    }).filter((section) => section.filteredItems.length > 0);
  }, [searchQuery, user]);

  // Auto-expand sections with search results
  React.useEffect(() => {
    if (searchQuery) {
      const newExpanded = {};
      filteredSections.forEach((section) => {
        newExpanded[section.id] = section.filteredItems.length > 0;
      });
      setExpandedSections(newExpanded);
    }
  }, [searchQuery, filteredSections]);

  const handleToggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleItemClick = (path) => {
    navigate(path);
  };

  const totalVisibleItems = filteredSections.reduce(
    (sum, section) => sum + section.filteredItems.length,
    0
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Menu Hệ Thống
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Truy cập nhanh các chức năng hệ thống
        </Typography>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Tìm kiếm chức năng..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Stats */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip
          label={`${filteredSections.length} danh mục`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`${totalVisibleItems} chức năng`}
          color="success"
          variant="outlined"
        />
      </Stack>

      {/* Menu Sections */}
      {filteredSections.length > 0 ? (
        filteredSections.map((section) => (
          <MenuSection
            key={section.id}
            section={section}
            expanded={expandedSections[section.id]}
            onToggle={() => handleToggleSection(section.id)}
            filteredItems={section.filteredItems}
            onItemClick={handleItemClick}
          />
        ))
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy chức năng phù hợp
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Thử tìm kiếm với từ khóa khác
          </Typography>
        </Box>
      )}
    </Box>
  );
}
