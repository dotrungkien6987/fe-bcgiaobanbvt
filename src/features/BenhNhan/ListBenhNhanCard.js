import React from "react";
import {
  Card,
  Grid,
  CardHeader,
  Box,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  PersonOff,
  LocalHospital,
  Home,
  Warning,
  MedicalServices,
  AccessTime,
  Visibility,
} from "@mui/icons-material";

import BenhNhanCard from "./BenhNhanCard";

// Mapping icons cho từng loại bệnh nhân
const getIconByTitle = (title) => {
  if (title.includes("tử vong")) return <PersonOff sx={{ color: "#f44336" }} />;
  if (title.includes("chuyển viện"))
    return <LocalHospital sx={{ color: "#ff9800" }} />;
  if (title.includes("xin về")) return <Home sx={{ color: "#2196f3" }} />;
  if (title.includes("nặng")) return <Warning sx={{ color: "#ff5722" }} />;
  if (title.includes("mổ cấp cứu"))
    return <MedicalServices sx={{ color: "#e91e63" }} />;
  if (title.includes("phẫu thuật"))
    return <MedicalServices sx={{ color: "#9c27b0" }} />;
  if (title.includes("ngoài giờ"))
    return <AccessTime sx={{ color: "#607d8b" }} />;
  if (title.includes("theo dõi"))
    return <Visibility sx={{ color: "#4caf50" }} />;
  return <MedicalServices sx={{ color: "#1976d2" }} />;
};

function ListBenhNhanCard({ benhnhans, title }) {
  const theme = useTheme();
  const icon = getIconByTitle(title);

  return (
    <Card
      elevation={2}
      sx={{
        mt: 3,
        borderRadius: 3,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.02
        )} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <CardHeader
        avatar={icon}
        title={title}
        action={
          <Chip
            label={`${benhnhans.length} bệnh nhân`}
            size="small"
            color="primary"
            variant="outlined"
          />
        }
        titleTypographyProps={{
          variant: "h6",
          fontWeight: "bold",
          color: "primary.main",
        }}
        sx={{
          background: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          "& .MuiCardHeader-avatar": {
            marginRight: theme.spacing(2),
          },
        }}
      />
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {benhnhans.map((benhnhan, index) => (
            <Grid key={benhnhan.Stt} item xs={12} md={6}>
              <Box
                sx={{
                  opacity: 0,
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                  "@keyframes fadeInUp": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(20px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <BenhNhanCard benhnhan={benhnhan} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  );
}

export default ListBenhNhanCard;
