import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminDaotaoCnttRequire from "./AdminDaotaoCnttRequire";
import useAuth from "../hooks/useAuth";

jest.mock("../hooks/useAuth", () => jest.fn());
jest.mock("../components/LoadingScreen", () => () => <div>Loading screen</div>);

const guardedContent = <div>Nội dung được bảo vệ</div>;

const renderGuard = (authState) => {
  useAuth.mockReturnValue(authState);

  return render(
    <MemoryRouter initialEntries={["/doanra"]}>
      <Routes>
        <Route
          path="/doanra"
          element={
            <AdminDaotaoCnttRequire>{guardedContent}</AdminDaotaoCnttRequire>
          }
        />
        <Route path="/" element={<div>Trang chủ</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

beforeEach(() => {
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("AdminDaotaoCnttRequire", () => {
  test("cho phép role daotao truy cập", () => {
    renderGuard({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "daotao" },
    });

    expect(screen.getByText("Nội dung được bảo vệ")).toBeInTheDocument();
  });

  test("cho phép role cntt truy cập", () => {
    renderGuard({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "cntt" },
    });

    expect(screen.getByText("Nội dung được bảo vệ")).toBeInTheDocument();
  });

  test("chặn role manager", () => {
    renderGuard({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "manager" },
    });

    expect(screen.queryByText("Nội dung được bảo vệ")).not.toBeInTheDocument();
    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledWith(
      "Bạn không có quyền truy cập chức năng này",
    );
  });
});
