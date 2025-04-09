import { Box, Button, Card, Typography } from "@mui/material";
import MyPieChart from "components/form/MyPieChart";
import VisibilityIcon from '@mui/icons-material/Visibility';

const ChartCard = ({ title, data = [], colors, darkMode, onViewDetail }) => {
  return (
    <Card
      sx={{
        fontWeight: "bold",
        color: darkMode ? "#FFF" : "#1939B7",
        boxShadow: 10,
        position: "relative",
        pb: 2,
      }}
    >
      {/* Tiêu đề */}
      <Box sx={{ p: 1, fontSize: "1rem", textAlign: "center" }}>
        <Typography variant="body1" fontWeight="bold">
          {title}
        </Typography>
      </Box>

      {/* PieChart */}
      <MyPieChart
        data={data}
        colors={colors}
        other={{ height: 200 }}
      />

      {/* Nút xem chi tiết */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => onViewDetail(title, data)}
          sx={{
            borderRadius: 20,
            fontSize: '0.75rem',
            textTransform: 'none',
          }}
        >
          Xem chi tiết
        </Button>
      </Box>
    </Card>
  );
};

export default ChartCard;