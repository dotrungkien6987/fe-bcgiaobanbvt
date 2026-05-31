import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminDaotaoRequire from "./AdminDaotaoRequire";
import useAuth from "../hooks/useAuth";

jest.mock("../hooks/useAuth", () => jest.fn());
jest.mock("../components/LoadingScreen", () => () => <div>Loading screen</div>);

const guardedContent = <div>Nội dung được bảo vệ</div>;

const renderGuard = (authState) => {
  useAuth.mockReturnValue(authState);

  return render(
    <MemoryRouter initialEntries={["/loaichuyenmon"]}>
      <Routes>
        <Route
          path="/loaichuyenmon"
          element={<AdminDaotaoRequire>{guardedContent}</AdminDaotaoRequire>}
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

describe("AdminDaotaoRequire", () => {
  test("cho phép role daotao truy cập", () => {
    renderGuard({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "daotao" },
    });

    expect(screen.getByText("Nội dung được bảo vệ")).toBeInTheDocument();
  });

  test("cho phép role admin truy cập", () => {
    renderGuard({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "admin" },
    });

    expect(screen.getByText("Nội dung được bảo vệ")).toBeInTheDocument();
  });

  test("chặn role cntt", () => {
    renderGuard({
      isInitialize: true,
      isAuthenticated: true,
      user: { PhanQuyen: "cntt" },
    });

    expect(screen.queryByText("Nội dung được bảo vệ")).not.toBeInTheDocument();
    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledWith(
      "Bạn không có quyền truy cập chức năng này",
    );
  });
});
