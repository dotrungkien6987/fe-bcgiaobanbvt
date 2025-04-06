import React from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Mảng màu sắc cho các huyện
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#800000', '#008000', '#000080'];

// Hàm gán màu dựa trên tên huyện
const getColor = (feature) => {
  const name = feature.properties.name;
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

// Hàm thêm popup cho từng huyện
const onEachFeature = (feature, layer) => {
  layer.bindPopup(`<b>${feature.properties.name}</b><br>Số bệnh nhân: ${feature.properties.patients}`);
};

const MapComponent = ({ geojsonData }) => {
  return (
    <MapContainer
      center={[21.3, 105.6]} // Tọa độ trung tâm của Vĩnh Phúc (giả định)
      zoom={10}
      style={{ height: '500px', width: '100%', backgroundColor: 'white' }}
    >
      <GeoJSON
        data={geojsonData}
        style={(feature) => ({
          fillColor: getColor(feature),
          color: '#000', // Màu viền
          weight: 1, // Độ dày viền
          fillOpacity: 0.7 // Độ mờ của màu nền
        })}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
};

export default MapComponent;