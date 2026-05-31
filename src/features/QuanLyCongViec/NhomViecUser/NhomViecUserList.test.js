import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "hooks/useAuth";
import NhomViecUserList from "./NhomViecUserList";
import { getAllNhomViecUser } from "./nhomViecUserSlice";

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

jest.mock("./AddNhomViecUserButton", () => () => (
  <div data-testid="add-nhom-viec-user">Add NhomViecUser</div>
));

jest.mock("./UpdateNhomViecUserButton", () => ({ nhomViecUser }) => (
  <div data-testid={`update-${nhomViecUser._id}`}>
    Update {nhomViecUser._id}
  </div>
));

jest.mock("./DeleteNhomViecUserButton", () => ({ nhomViecUserID }) => (
  <div data-testid={`delete-${nhomViecUserID}`}>Delete {nhomViecUserID}</div>
));

jest.mock("./nhomViecUserSlice", () => ({
  getAllNhomViecUser: jest.fn(() => ({ type: "nhomViecUser/getAll" })),
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
    _id: "owned-group",
    TenNhom: "Nhóm của tôi",
    MoTa: "Mô tả",
    TrangThaiHoatDong: true,
    createdAt: "2026-05-27T00:00:00.000Z",
    NguoiTaoID: { _id: "owner-user", HoTen: "Owner" },
  },
  {
    _id: "other-group",
    TenNhom: "Nhóm khác",
    MoTa: "Mô tả khác",
    TrangThaiHoatDong: true,
    createdAt: "2026-05-27T00:00:00.000Z",
    NguoiTaoID: { _id: "another-user", HoTen: "Another" },
  },
];

let dispatchMock;
let mockState;
let mockUser;

const renderScreen = (role) => {
  mockUser = { _id: "owner-user", PhanQuyen: role };
  mockState = { nhomViecUser: { nhomViecUsers: sampleRows } };
  return render(<NhomViecUserList />);
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

describe("NhomViecUserList smoke access", () => {
  test("admin sees add and can manage every row", () => {
    renderScreen("admin");

    expect(getAllNhomViecUser).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("add-nhom-viec-user")).toBeInTheDocument();
    expect(screen.getByTestId("update-owned-group")).toBeInTheDocument();
    expect(screen.getByTestId("delete-owned-group")).toBeInTheDocument();
    expect(screen.getByTestId("update-other-group")).toBeInTheDocument();
    expect(screen.getByTestId("delete-other-group")).toBeInTheDocument();
  });

  test("manager only manages rows they created", () => {
    renderScreen("manager");

    expect(screen.getByTestId("add-nhom-viec-user")).toBeInTheDocument();
    expect(screen.getByTestId("update-owned-group")).toBeInTheDocument();
    expect(screen.getByTestId("delete-owned-group")).toBeInTheDocument();
    expect(screen.queryByTestId("update-other-group")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-other-group")).not.toBeInTheDocument();
  });

  test("regular user sees no write controls", () => {
    renderScreen("user");

    expect(screen.queryByTestId("add-nhom-viec-user")).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-owned-group")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-owned-group")).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-other-group")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-other-group")).not.toBeInTheDocument();
  });
});
