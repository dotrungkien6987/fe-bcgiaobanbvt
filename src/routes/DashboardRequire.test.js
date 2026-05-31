import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DashboardRequire from "./DashboardRequire";
import useAuth from "../hooks/useAuth";

jest.mock("../hooks/useAuth", () => jest.fn());
jest.mock("../components/LoadingScreen", () => () => <div>Loading screen</div>);

describe("DashboardRequire", () => {
  const guardedContent = <div>Nội dung dashboard</div>;

  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderGuard = () =>
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={<DashboardRequire>{guardedContent}</DashboardRequire>}
          />
          <Route path="/" element={<div>Trang chủ</div>} />
          <Route path="/login" element={<div>Đăng nhập</div>} />
        </Routes>
      </MemoryRouter>,
    );

  test("cho phép role manager truy cập", () => {
    useAuth.mockReturnValue({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "manager" },
    });

    renderGuard();

    expect(screen.getByText("Nội dung dashboard")).toBeInTheDocument();
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("cho phép role superadmin truy cập", () => {
    useAuth.mockReturnValue({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "superadmin" },
    });

    renderGuard();

    expect(screen.getByText("Nội dung dashboard")).toBeInTheDocument();
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("chặn role nomal", () => {
    useAuth.mockReturnValue({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "nomal" },
    });

    renderGuard();

    expect(screen.queryByText("Nội dung dashboard")).not.toBeInTheDocument();
    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledWith(
      "Bạn không có quyền xem dashboard",
    );
  });
});
