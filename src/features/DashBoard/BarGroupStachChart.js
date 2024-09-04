import React from "react";
import ReactApexChart from "react-apexcharts";

const BarGroupStachChart = ({ series, categories, formatter, yaxis,type }) => {
  const options = {
    chart: {
      type: "bar",
      height: 400,
      stacked: true,
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    dataLabels: {
      enabled: true,
      formatter: formatter,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: "100%",
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        formatter: formatter,
        style: {
          colors: ["#1939B7"], // Màu sắc của text
          fontSize: "15px", // Cỡ chữ của text
          fontFamily: "Helvetica, Arial, sans-serif", // Phông chữ
          fontWeight: 200, // Độ đậm
        },
      },
    },
    yaxis: {
      reversed: false,
     labels:{
      style: {
        colors: [
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
          "#1939B7",
                 ], // Màu sắc của text
        fontSize: "13px", // Cỡ chữ của text
        // fontFamily: 'Helvetica, Arial, sans-serif', // Phông chữ
        fontWeight: 200, // Độ đậm
      },
     }
    },
    fill: {
      opacity: 1,
    },
    colors: ["#bb1515", "#008FFB", "#1939B7", "#ea4b4b","#61bbff", "#4f6de6"],
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
    tooltip: {
      y: {
        formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
          if(type==='tien'){

            const VND = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            });
            return VND.format(value);
          }
          return value
        }
      },
     
    },
  };

  return (
    <div id="chart">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={1200}
      />
    </div>
  );
};

export default BarGroupStachChart;
