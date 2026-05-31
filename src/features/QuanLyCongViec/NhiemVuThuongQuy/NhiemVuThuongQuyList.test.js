import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "hooks/useAuth";
import NhiemVuThuongQuyList from "./NhiemVuThuongQuyList";
import ThongTinNhiemVuThuongQuy from "./ThongTinNhiemVuThuongQuy";
import {
  getAllNhiemVuThuongQuy,
  insertOneNhiemVuThuongQuy,
  updateOneNhiemVuThuongQuy,
} from "./nhiemvuThuongQuySlice";
import { getAllKhoa } from "../../Daotao/Khoa/khoaSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("hooks/useAuth", () => jest.fn());

jest.mock("components/MainCard", () => ({ children }) => <div>{children}</div>);
jest.mock("components/ScrollX", () => ({ children }) => <div>{children}</div>);
jest.mock("components/ExcelButton", () => () => (
  <div data-testid="excel-button" />
));
jest.mock("components/@extended/IconButton", () => {
  const React = require("react");

  return React.forwardRef(({ children, ...props }, ref) => (
    <button type="button" ref={ref} {...props}>
      {children}
    </button>
  ));
});

jest.mock("./AddNhiemVuThuongQuyButton", () => () => (
  <div data-testid="add-nhiem-vu-thuong-quy">Add NhiemVuThuongQuy</div>
));

jest.mock("./UpdateNhiemVuThuongQuyButton", () => ({ nhiemvuThuongQuy }) => (
  <div data-testid={`update-${nhiemvuThuongQuy._id}`}>
    Update {nhiemvuThuongQuy._id}
  </div>
));

jest.mock("./DeleteNhiemVuThuongQuyButton", () => ({ nhiemvuThuongQuyID }) => (
  <div data-testid={`delete-${nhiemvuThuongQuyID}`}>
    Delete {nhiemvuThuongQuyID}
  </div>
));

jest.mock("./nhiemvuThuongQuySlice", () => ({
  getAllNhiemVuThuongQuy: jest.fn(() => ({ type: "nhiemvuThuongQuy/getAll" })),
  insertOneNhiemVuThuongQuy: jest.fn((payload) => ({
    type: "nhiemvuThuongQuy/insert",
    payload,
  })),
  updateOneNhiemVuThuongQuy: jest.fn((payload) => ({
    type: "nhiemvuThuongQuy/update",
    payload,
  })),
}));

jest.mock("../../Daotao/Khoa/khoaSlice", () => ({
  getAllKhoa: jest.fn(() => ({ type: "khoa/getAll" })),
}));

jest.mock(
  "pages/tables/MyTable/CommonTable",
  () =>
    ({ data, columns, additionalComponent }) => {
      const getValue = (row, accessor) => {
        if (typeof accessor !== "string") return undefined;
        return accessor.split(".").reduce((value, key) => value?.[key], row);
      };

      return (
        <div>
          {additionalComponent}
          {data.map((row, index) => {
            const rowApi = {
              original: row,
              id: String(index),
              isExpanded: false,
              toggleRowExpanded: jest.fn(),
            };

            return (
              <div key={row._id || index}>
                {columns.map((column) => (
                  <div
                    key={`${row._id || index}-${column.accessor || column.Header}`}
                  >
                    {column.Cell
                      ? column.Cell({
                          row: rowApi,
                          value: getValue(row, column.accessor),
                        })
                      : null}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    },
);

const sampleRows = [
  {
    _id: "task-1",
    TenNhiemVu: "Đi buồng",
    MoTa: "Mô tả nhiệm vụ",
    KhoaID: { _id: "khoa-1", TenKhoa: "Nội tổng hợp" },
    MucDoKhoDefault: 5,
    TrangThaiHoatDong: true,
    createdAt: "2026-05-27T00:00:00.000Z",
    NguoiTaoID: { _id: "user-1", HoTen: "Quản lý" },
  },
];

const khoaOptions = [
  { _id: "khoa-1", TenKhoa: "Nội tổng hợp" },
  { _id: "khoa-2", TenKhoa: "Ngoại tổng hợp" },
];

let dispatchMock;
let mockState;
let mockUser;

const renderListScreen = (role) => {
  mockUser = { _id: "user-1", PhanQuyen: role };
  mockState = {
    nhiemvuThuongQuy: { nhiemVuThuongQuys: sampleRows },
    khoa: { Khoa: khoaOptions },
  };
  return render(<NhiemVuThuongQuyList />);
};

const renderFormScreen = (role) => {
  mockUser = { _id: "user-1", PhanQuyen: role, KhoaID: "legacy-user-khoa" };
  mockState = { khoa: { Khoa: khoaOptions } };
  return render(<ThongTinNhiemVuThuongQuy open handleClose={jest.fn()} />);
};

beforeEach(() => {
  dispatchMock = jest.fn();
  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selector) => selector(mockState));
  useAuth.mockImplementation(() => ({ user: mockUser }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("NhiemVuThuongQuyList smoke access", () => {
  test("admin sees write controls", () => {
    renderListScreen("admin");

    expect(getAllNhiemVuThuongQuy).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("add-nhiem-vu-thuong-quy")).toBeInTheDocument();
    expect(screen.getByTestId("update-task-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-task-1")).toBeInTheDocument();
  });

  test("manager sees write controls", () => {
    renderListScreen("manager");

    expect(screen.getByTestId("add-nhiem-vu-thuong-quy")).toBeInTheDocument();
    expect(screen.getByTestId("update-task-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-task-1")).toBeInTheDocument();
  });

  test("regular user sees no write controls", () => {
    renderListScreen("user");

    expect(
      screen.queryByTestId("add-nhiem-vu-thuong-quy"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-task-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-task-1")).not.toBeInTheDocument();
  });
});

describe("ThongTinNhiemVuThuongQuy khoa scope", () => {
  test("manager sees readonly khoa hint instead of khoa selector", () => {
    renderFormScreen("manager");

    expect(getAllKhoa).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(
      screen.getByDisplayValue("Khoa sẽ được xác định theo tài khoản quản lý"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Khoa *")).not.toBeInTheDocument();
  });

  test("admin still sees khoa selector", () => {
    renderFormScreen("admin");

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
