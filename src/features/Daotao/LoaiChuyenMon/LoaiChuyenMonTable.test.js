import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "hooks/useAuth";
import LoaiChuyenMonTable from "./LoaiChuyenMonTable";
import { getAllLoaiChuyenMon } from "./loaiChuyenMonSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("hooks/useAuth", () => jest.fn());

jest.mock("components/MainCard", () => ({ children }) => <div>{children}</div>);

jest.mock("./AddLoaiChuyenMonButton", () => () => (
  <div data-testid="add-loai-chuyen-mon">Add LoaiChuyenMon</div>
));

jest.mock("./UpdateLoaiChuyenMonButton", () => ({ row }) => (
  <div data-testid={`update-${row._id}`}>Update {row._id}</div>
));

jest.mock("./loaiChuyenMonSlice", () => ({
  getAllLoaiChuyenMon: jest.fn(() => ({ type: "loaichuyenmon/getAll" })),
  deleteLoaiChuyenMon: jest.fn((id) => ({
    type: "loaichuyenmon/delete",
    payload: id,
  })),
}));

jest.mock(
  "pages/tables/MyTable/SimpleTable",
  () =>
    ({ data, columns, additionalComponent }) => {
      const getValue = (row, accessor) => {
        if (typeof accessor !== "string") return undefined;
        return accessor.split(".").reduce((value, key) => value?.[key], row);
      };

      return (
        <div>
          {additionalComponent}
          {columns.map((column) => (
            <div key={column.Header}>{column.Header}</div>
          ))}
          {data.map((row, index) => (
            <div key={row._id || index}>
              {columns.map((column) => (
                <div
                  key={`${row._id || index}-${column.accessor || column.Header}`}
                >
                  {column.Cell
                    ? column.Cell({
                        row: { original: row },
                        value: getValue(row, column.accessor),
                      })
                    : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    },
);

const sampleList = [
  {
    _id: "lcm-1",
    LoaiChuyenMon: "Bác sĩ",
    TrinhDo: "Đại học",
    createdAt: "2026-05-27T00:00:00.000Z",
  },
];

let dispatchMock;
let mockState;
let mockUser;

const renderScreen = (role) => {
  mockUser = { PhanQuyen: role };
  mockState = { loaichuyenmon: { list: sampleList } };
  return render(<LoaiChuyenMonTable />);
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

describe("LoaiChuyenMonTable smoke access", () => {
  test("admin sees write controls", () => {
    renderScreen("admin");

    expect(getAllLoaiChuyenMon).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("add-loai-chuyen-mon")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByTestId("update-lcm-1")).toBeInTheDocument();
  });

  test("daotao sees write controls", () => {
    renderScreen("daotao");

    expect(screen.getByTestId("add-loai-chuyen-mon")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByTestId("update-lcm-1")).toBeInTheDocument();
  });

  test("manager does not see write controls", () => {
    renderScreen("manager");

    expect(screen.queryByTestId("add-loai-chuyen-mon")).not.toBeInTheDocument();
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-lcm-1")).not.toBeInTheDocument();
  });

  test("regular user does not see write controls", () => {
    renderScreen("user");

    expect(screen.queryByTestId("add-loai-chuyen-mon")).not.toBeInTheDocument();
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-lcm-1")).not.toBeInTheDocument();
  });
});
