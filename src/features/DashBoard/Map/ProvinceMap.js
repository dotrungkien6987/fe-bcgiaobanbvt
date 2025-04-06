import React, { useState, memo } from "react";
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup 
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const colorRange = [
  "#D4EEFF",
  "#A7D5F2",
  "#74B9E8", 
  "#4A9FDD", 
  "#2685D2",
  "#0A6BC6",
  "#0050A0"
];

// Component chính
const ProvinceMap = ({ 
  geoData, 
  patientData, 
  selectedProvinces = [], 
  provinceProperty = "name", 
  districtProperty = "name", 
  center = [105.6, 21.3], 
  scale = 8000,
  tooltipContent
}) => {
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  // Tạo object để truy xuất nhanh số lượng bệnh nhân theo huyện
  const districtDataMap = {};
  patientData.forEach(item => {
    const key = `${item.provinceCode}_${item.districtCode}`;
    districtDataMap[key] = item.patientCount;
  });
  
  // Xác định tất cả giá trị số bệnh nhân để tạo thang màu
  const patientCounts = Object.values(districtDataMap);
  
  // Tạo thang màu dựa trên phân vị
  const colorScale = scaleQuantile()
    .domain(patientCounts.length ? patientCounts : [0, 1])
    .range(colorRange);
  
  // Lọc chỉ hiển thị các tỉnh được chọn (nếu có)
  const filterGeographies = geo => {
    if (selectedProvinces.length === 0) return true;
    return selectedProvinces.includes(geo.properties[provinceProperty]);
  };
  
  // Xác định màu sắc cho huyện
  const getColorForDistrict = (geo) => {
    const province = geo.properties[provinceProperty];
    const district = geo.properties[districtProperty];
    const key = `${province}_${district}`;
    
    const count = districtDataMap[key] || 0;
    return count > 0 ? colorScale(count) : "#F5F5F5"; // Màu xám nhạt nếu không có dữ liệu
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      {tooltipVisible && tooltipData && (
        <Box
          sx={{
            position: "absolute",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "10px",
            pointerEvents: "none",
            left: tooltipData.x,
            top: tooltipData.y,
            zIndex: 999,
            boxShadow: "0px 2px 5px rgba(0,0,0,0.15)"
          }}
        >
          {tooltipContent ? 
            tooltipContent(tooltipData.geo, districtDataMap) :
            <Typography variant="body2">
              {`${tooltipData.geo.properties[districtProperty]} (${tooltipData.geo.properties[provinceProperty]}): 
                ${districtDataMap[`${tooltipData.geo.properties[provinceProperty]}_${tooltipData.geo.properties[districtProperty]}`] || 0} bệnh nhân`}
            </Typography>
          }
        </Box>
      )}
      
      <ComposableMap 
        projection="geoMercator"
        projectionConfig={{
          center: center,
          scale: scale
        }}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        <ZoomableGroup>
          <Geographies geography={geoData}>
            {({ geographies }) => 
              geographies
                .filter(filterGeographies)
                .map(geo => {
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColorForDistrict(geo)}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: "#F53" },
                        pressed: { outline: "none" }
                      }}
                      onMouseEnter={(evt) => {
                        const { clientX, clientY } = evt;
                        setTooltipData({
                          geo,
                          x: clientX,
                          y: clientY - 40
                        });
                        setTooltipVisible(true);
                      }}
                      onMouseLeave={() => {
                        setTooltipVisible(false);
                      }}
                    />
                  );
                })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Legend */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 20,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "10px",
          borderRadius: "4px",
          display: "flex",
          flexDirection: "column",
          gap: 1
        }}
      >
        <Typography variant="subtitle2">Số lượng bệnh nhân</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {colorRange.map((color, i) => (
            <Box
              key={i}
              sx={{
                backgroundColor: color,
                width: 30,
                height: 15
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
          <span>Ít</span>
          <span>Nhiều</span>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(ProvinceMap);