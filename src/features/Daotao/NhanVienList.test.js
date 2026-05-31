import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useAuth from "hooks/useAuth";
import NhanVienList from "./NhanVienList";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
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

jest.mock("./AddNhanVienButton", () => () => (
  <div data-testid="add-nhan-vien">Add NhanVien</div>
));

jest.mock("./UpdateNhanVienButton", () => ({ nhanvien }) => (
  <div data-testid={`update-${nhanvien._id}`}>Update {nhanvien._id}</div>
));

jest.mock("./DeleteNhanVienButton", () => ({ nhanvienID }) => (
  <div data-testid={`delete-${nhanvienID}`}>Delete {nhanvienID}</div>
));

jest.mock(
  "features/NhanVien/QuaTrinhDaoTaoNhanVienButon",
  () =>
    ({ nhanvienID }) => (
      <div data-testid={`training-${nhanvienID}`}>Training {nhanvienID}</div>
    ),
);

jest.mock(
  "features/QuanLyCongViec/QuanLyNhanVien/QuanLyNhanVienButton",
  () =>
    ({ nhanvienID }) => (
      <div data-testid={`manage-${nhanvienID}`}>Manage {nhanvienID}</div>
    ),
);

jest.mock("features/NhanVien/NhanVienView", () => ({ data }) => (
  <div data-testid={`view-${data._id}`}>View {data._id}</div>
));

jest.mock("features/NhanVien/nhanvienSlice", () => ({
  getAllNhanVien: jest.fn(() => ({ type: "nhanvien/getAll" })),
}));

jest.mock(
  "pages/tables/MyTable/CommonTable",
  () =>
    ({ data, columns, additionalComponent }) => {
      const getValue = (row, accessor) => {
        if (typeof accessor === "function") return accessor(row);
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
                  <div key={`${row._id || index}-${column.Header}`}>
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
    _id: "nv-1",
    Ten: "Nguyen Van A",
    TenKhoa: "Noi tong hop",
    GioiTinh: 0,
    Sex: "Nam",
    NgaySinh: "2026-05-27T00:00:00.000Z",
  },
];

let dispatchMock;
let navigateMock;
let mockState;
let mockUser;

const renderScreen = (role) => {
  mockUser = { PhanQuyen: role };
  mockState = { nhanvien: { nhanviens: sampleRows } };
  return render(<NhanVienList />);
};

beforeEach(() => {
  dispatchMock = jest.fn();
  navigateMock = jest.fn();
  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selector) => selector(mockState));
  useNavigate.mockReturnValue(navigateMock);
  useAuth.mockImplementation(() => ({ user: mockUser }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("NhanVienList role visibility", () => {
  test("cntt sees nhanvien CRUD controls", () => {
    renderScreen("cntt");

    expect(getAllNhanVien).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("add-nhan-vien")).toBeInTheDocument();
    expect(screen.getByTestId("update-nv-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-nv-1")).toBeInTheDocument();
  });

  test("manager does not see nhanvien CRUD controls", () => {
    renderScreen("manager");

    expect(screen.queryByTestId("add-nhan-vien")).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-nv-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-nv-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("training-nv-1")).toBeInTheDocument();
  });
});
