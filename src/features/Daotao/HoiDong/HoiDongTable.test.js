import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "hooks/useAuth";
import HoiDongTable from "./HoiDongTable";
import { getAllHoiDong } from "features/NhanVien/hinhthuccapnhatSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("hooks/useAuth", () => jest.fn());

jest.mock("components/MainCard", () => ({ children }) => <div>{children}</div>);

jest.mock("./AddHoiDongButton", () => () => (
  <div data-testid="add-hoi-dong">Add HoiDong</div>
));

jest.mock("./UpdateHoiDongButton", () => ({ hoidong }) => (
  <div data-testid={`update-${hoidong._id}`}>Update {hoidong._id}</div>
));

jest.mock("./DeleteHoiDongButton", () => ({ hoidongID }) => (
  <div data-testid={`delete-${hoidongID}`}>Delete {hoidongID}</div>
));

jest.mock("features/NhanVien/hinhthuccapnhatSlice", () => ({
  getAllHoiDong: jest.fn(() => ({ type: "hoidong/getAll" })),
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
    _id: "hd-1",
    Ten: "Hội đồng nghiên cứu",
  },
];

let dispatchMock;
let mockState;
let mockUser;

const renderScreen = (role) => {
  mockUser = { PhanQuyen: role };
  mockState = { hinhthuccapnhat: { HoiDong: sampleList } };
  return render(<HoiDongTable />);
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

describe("HoiDongTable smoke access", () => {
  test("admin sees write controls", () => {
    renderScreen("admin");

    expect(getAllHoiDong).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("add-hoi-dong")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByTestId("update-hd-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-hd-1")).toBeInTheDocument();
  });

  test("daotao sees write controls", () => {
    renderScreen("daotao");

    expect(screen.getByTestId("add-hoi-dong")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByTestId("update-hd-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-hd-1")).toBeInTheDocument();
  });

  test("manager does not see write controls", () => {
    renderScreen("manager");

    expect(screen.queryByTestId("add-hoi-dong")).not.toBeInTheDocument();
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-hd-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-hd-1")).not.toBeInTheDocument();
  });

  test("regular user does not see write controls", () => {
    renderScreen("nomal");

    expect(screen.queryByTestId("add-hoi-dong")).not.toBeInTheDocument();
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-hd-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-hd-1")).not.toBeInTheDocument();
  });
});
