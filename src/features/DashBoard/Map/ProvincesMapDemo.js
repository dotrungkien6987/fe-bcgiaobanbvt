import React, { useState, useEffect } from "react";
import { Box, Card,Typography, CardHeader, CardContent, FormControl, InputLabel, MenuItem, Select, Grid } from "@mui/material";
import ProvinceMap from "./ProvinceMap";

// Demo component để hiển thị bản đồ 3 tỉnh
const ProvincesMapDemo = () => {
  const [selectedMap, setSelectedMap] = useState("all");
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dữ liệu mẫu cho bệnh nhân theo huyện
  const patientData = [
    { provinceCode: "Vĩnh Phúc", districtCode: "H. Sông Lô", patientCount: 3770 },
    { provinceCode: "Vĩnh Phúc", districtCode: "H. Lập Thạch", patientCount: 1693 },
    { provinceCode: "Vĩnh Phúc", districtCode: "H. Tam Đảo", patientCount: 40 },
    { provinceCode: "Vĩnh Phúc", districtCode: "TP. Vĩnh Yên", patientCount: 2500 },
    { provinceCode: "Bắc Ninh", districtCode: "TP. Bắc Ninh", patientCount: 4200 },
    { provinceCode: "Bắc Ninh", districtCode: "H. Yên Phong", patientCount: 1800 },
    { provinceCode: "Hà Nội", districtCode: "Q. Ba Đình", patientCount: 5600 },
    { provinceCode: "Hà Nội", districtCode: "Q. Hoàn Kiếm", patientCount: 4800 },
    // Thêm dữ liệu cho các huyện khác
  ];

  // Danh sách các tỉnh muốn hiển thị
  const provinces = ["Vĩnh Phúc", "Hà Nội", "Bắc Ninh"];

  useEffect(() => {
    const loadGeoData = async () => {
      setLoading(true);
      try {
        // Load file GeoJSON tương ứng
        const file = selectedMap === "all" ? "/vn.json" : `/${selectedMap}.geojson`;
        const response = await fetch(file);
        const data = await response.json();
        setGeoData(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu địa lý:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGeoData();
  }, [selectedMap]);

  // Cấu hình tọa độ và tỷ lệ zoom cho các tỉnh
  const getMapConfig = () => {
    switch (selectedMap) {
      case "VinhPhuc":
        return { center: [105.6, 21.3], scale: 15000 };
      case "HaNoi":
        return { center: [105.85, 21], scale: 15000 };
      case "BacNinh": 
        return { center: [106.1, 21.15], scale: 15000 };
      default:
        return { center: [105.8, 21.1], scale: 6000 }; // Tọa độ để hiển thị cả 3 tỉnh
    }
  };

  // Lọc các tỉnh hiển thị
  const getSelectedProvinces = () => {
    if (selectedMap === "all") return provinces;
    if (selectedMap === "VinhPhuc") return ["Vĩnh Phúc"];
    if (selectedMap === "HaNoi") return ["Hà Nội"];
    if (selectedMap === "BacNinh") return ["Bắc Ninh"];
    return [];
  };

  const mapConfig = getMapConfig();
  const selectedProvinces = getSelectedProvinces();

  return (
    <Card>
      <CardHeader 
        title="Phân Bố Bệnh Nhân Theo Địa Phương" 
        action={
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Chọn Tỉnh</InputLabel>
            <Select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              label="Chọn Tỉnh"
            >
              <MenuItem value="all">Tất cả 3 tỉnh</MenuItem>
              <MenuItem value="VinhPhuc">Vĩnh Phúc</MenuItem>
              <MenuItem value="HaNoi">Hà Nội</MenuItem>
              <MenuItem value="BacNinh">Bắc Ninh</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <CardContent>
        <Box sx={{ height: 500, width: "100%" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              Đang tải bản đồ...
            </Box>
          ) : geoData ? (
            <ProvinceMap
              geoData={geoData}
              patientData={patientData}
              selectedProvinces={selectedProvinces}
              center={mapConfig.center}
              scale={mapConfig.scale}
              tooltipContent={(geo, dataMap) => {
                const province = geo.properties.name;
                const district = geo.properties.name;
                const key = `${province}_${district}`;
                const count = dataMap[key] || 0;
                
                return (
                  <Box>
                    <Typography variant="subtitle2">{district}</Typography>
                    <Typography variant="body2">{province}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {count.toLocaleString()} bệnh nhân
                    </Typography>
                  </Box>
                );
              }}
            />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              Không thể tải bản đồ. Vui lòng kiểm tra lại file GeoJSON.
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProvincesMapDemo;