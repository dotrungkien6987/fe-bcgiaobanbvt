import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// Đường dẫn chính xác đến file trong thư mục public
// const geoUrl = "/vn.json";
const geoUrl = "/VinhPhuc.geojson";

const data = {
  "H. Sông Lô": 3770,
  "H. Lập Thạch": 1693,
  "H. Tam Đảo": 40,
  // Thêm dữ liệu các huyện khác...
};
const VinhPhuc = () => (
    <div style={{ width: "100%", height: "400px" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [105.6, 21.3], // Tọa độ trung tâm Vĩnh Phúc
          scale: 8000
        }}
        // width={800}
//   height={600}
      >
        <Geographies geography={geoUrl}>
        {({ geographies }) => {
          console.log("Loaded geographies:", geographies);
          return geographies.map((geo) => {
            console.log("Geo property name:", geo.properties.name);
            const value = data[geo.properties.name] || 0;
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={value > 1000 ? "#fdae61" : "#abd9e9"}
              />
            );
          });
        }}
      </Geographies>
      </ComposableMap>
    </div>
  );
export default VinhPhuc;
