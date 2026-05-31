import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TapSanRequire from "./TapSanRequire";
import useAuth from "../hooks/useAuth";

jest.mock("../hooks/useAuth", () => jest.fn());
jest.mock("../components/LoadingScreen", () => () => <div>Loading screen</div>);

describe("TapSanRequire", () => {
  const guardedContent = <div>Nội dung TapSan</div>;

  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderGuard = () =>
    render(
      <MemoryRouter initialEntries={["/tapsan"]}>
        <Routes>
          <Route
            path="/tapsan"
            element={<TapSanRequire>{guardedContent}</TapSanRequire>}
          />
          <Route path="/" element={<div>Trang chủ</div>} />
        </Routes>
      </MemoryRouter>,
    );

  test("cho phép role nomal truy cập", () => {
    useAuth.mockReturnValue({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "nomal" },
    });

    renderGuard();

    expect(screen.getByText("Nội dung TapSan")).toBeInTheDocument();
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("cho phép role manager truy cập", () => {
    useAuth.mockReturnValue({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "manager" },
    });

    renderGuard();

    expect(screen.getByText("Nội dung TapSan")).toBeInTheDocument();
    expect(window.alert).not.toHaveBeenCalled();
  });

  test("chặn role cntt", () => {
    useAuth.mockReturnValue({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "cntt" },
    });

    renderGuard();

    expect(screen.queryByText("Nội dung TapSan")).not.toBeInTheDocument();
    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledWith(
      "Bạn không có quyền truy cập chức năng này",
    );
  });
});
