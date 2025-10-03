// Formatters
export const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const PCT = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  maximumFractionDigits: 1,
});

// Colors
export const COLORS = {
  BLUE: "#1939B7",
  GREEN: "#00C49F",
  RED: "#bb1515",
  YELLOW: "#FFBB28",
};

// Loại khoa
export const LOAI_KHOA = {
  NOI_TRU: "noitru",
  NGOAI_TRU: "ngoaitru",
};
