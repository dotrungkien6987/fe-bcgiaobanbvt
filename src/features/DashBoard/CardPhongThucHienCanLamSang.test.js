import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import CardPhongThucHienCanLamSang from "./CardPhongThucHienCanLamSang";

jest.mock("../../app/apiService", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("./TwoLevelPieChart", () => () => (
  <div data-testid="two-level-pie-chart">TwoLevelPieChart</div>
));

jest.mock("../../components/form/MyPieChart", () => () => (
  <div data-testid="my-pie-chart">MyPieChart</div>
));

jest.mock("./CardChiTietBenhNhanPhongThucHien", () => () => (
  <div data-testid="chi-tiet-benh-nhan">ChiTietBenhNhan</div>
));

jest.mock("./CardPhongChiDinhPhongThucHien", () => () => (
  <div data-testid="phong-chi-dinh">PhongChiDinh</div>
));

const dashboardReducer = require("./dashboardSlice").default;

const createZeroStatus = () => ({
  ChiDinh: 0,
  DaThucHien: 0,
  DaTraKQ: 0,
});

const phongThucHien = {
  phongthuchien: "Xét nghiệm",
  noitru: {
    BHYT: createZeroStatus(),
    VP: createZeroStatus(),
    YC: createZeroStatus(),
    BHYTYC: createZeroStatus(),
  },
  ngoaitru: {
    BHYT: createZeroStatus(),
    VP: createZeroStatus(),
    YC: createZeroStatus(),
    BHYTYC: createZeroStatus(),
  },
};

function renderComponent() {
  const store = configureStore({
    reducer: {
      dashboard: dashboardReducer,
      mytheme: (state = { darkMode: false }) => state,
    },
  });

  render(
    <Provider store={store}>
      <CardPhongThucHienCanLamSang phongthuchien={phongThucHien} />
    </Provider>
  );

  return store;
}

describe("CardPhongThucHienCanLamSang", () => {
  test("khong crash khi dashboard data chua hydrate", () => {
    const store = renderComponent();

    expect(
      store.getState().dashboard.SoLuong_CanLamSang_PhongChiDinh_PhongThucHien
    ).toEqual([]);
    expect(screen.getByText("Tổng hợp ngoại trú")).toBeInTheDocument();
    expect(screen.getByText("Tổng hợp nội trú")).toBeInTheDocument();
    expect(screen.getAllByTestId("my-pie-chart")).toHaveLength(2);
  });
});