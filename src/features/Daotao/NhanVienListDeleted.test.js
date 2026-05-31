import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "hooks/useAuth";
import NhanVienListDeleted from "./NhanVienListDeleted";
import { getAllNhanVienDeleted } from "features/NhanVien/nhanvienSlice";

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

jest.mock("./RestoreNhanVienButton", () => ({ nhanvienID }) => (
  <div data-testid={`restore-${nhanvienID}`}>Restore {nhanvienID}</div>
));

jest.mock("features/NhanVien/NhanVienView", () => ({ data }) => (
  <div data-testid={`view-${data._id}`}>View {data._id}</div>
));

jest.mock("features/NhanVien/nhanvienSlice", () => ({
  getAllNhanVienDeleted: jest.fn(() => ({ type: "nhanvien/getDeleted" })),
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
    _id: "deleted-1",
    Ten: "Nhan vien da xoa",
    TenKhoa: "Noi tong hop",
    Sex: "Nam",
    NgaySinh: "2026-05-27T00:00:00.000Z",
    updatedAt: "2026-05-27T00:00:00.000Z",
  },
];

let dispatchMock;
let mockState;
let mockUser;

const renderScreen = (role) => {
  mockUser = { PhanQuyen: role };
  mockState = { nhanvien: { nhanviensDeleted: sampleRows } };
  return render(<NhanVienListDeleted />);
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

describe("NhanVienListDeleted role visibility", () => {
  test("daotao can access deleted list and restore controls", () => {
    renderScreen("daotao");

    expect(getAllNhanVienDeleted).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("restore-deleted-1")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Bạn không có quyền truy cập danh sách nhân viên đã xóa.",
      ),
    ).not.toBeInTheDocument();
  });

  test("manager is blocked from deleted list", () => {
    renderScreen("manager");

    expect(getAllNhanVienDeleted).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "Bạn không có quyền truy cập danh sách nhân viên đã xóa.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("restore-deleted-1")).not.toBeInTheDocument();
  });
});
