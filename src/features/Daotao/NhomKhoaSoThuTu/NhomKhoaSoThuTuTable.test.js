import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "contexts/AuthContext";
import NhomKhoaSoThuTuTable from "./NhomKhoaSoThuTuTable";
import { getAllNhomKhoa } from "../../Slice/nhomkhoasothutuSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("components/MainCard", () => ({ children }) => <div>{children}</div>);

jest.mock("./AddNhomKhoaButton", () => () => (
  <div data-testid="add-nhom-khoa">Add NhomKhoa</div>
));

jest.mock("./UpdateNhomKhoaButton", () => ({ nhomKhoa }) => (
  <div data-testid={`update-${nhomKhoa._id}`}>Update {nhomKhoa._id}</div>
));

jest.mock("./DeleteNhomKhoaButton", () => ({ nhomKhoaID }) => (
  <div data-testid={`delete-${nhomKhoaID}`}>Delete {nhomKhoaID}</div>
));

jest.mock("../../Slice/nhomkhoasothutuSlice", () => ({
  getAllNhomKhoa: jest.fn(() => ({ type: "nhomkhoasothutu/getAll" })),
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
    _id: "nk-1",
    TenNhom: "Khối khám bệnh",
    DanhSachKhoa: [{ KhoaID: { TenKhoa: "Khoa Khám bệnh" } }],
    GhiChu: "Ghi chú nhóm khoa",
  },
];

let dispatchMock;
let mockUser;
let mockState;

const renderScreen = (role) => {
  mockUser = { PhanQuyen: role };
  mockState = {
    nhomKhoaSoThuTu: {
      nhomKhoaList: sampleList,
      isLoading: false,
    },
  };
  return render(<NhomKhoaSoThuTuTable />);
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

describe("NhomKhoaSoThuTuTable role visibility", () => {
  test("admin sees write controls", () => {
    renderScreen("admin");

    expect(getAllNhomKhoa).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("add-nhom-khoa")).toBeInTheDocument();
    expect(screen.getByText("Thao tác")).toBeInTheDocument();
    expect(screen.getByTestId("update-nk-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-nk-1")).toBeInTheDocument();
  });

  test("daotao sees write controls", () => {
    renderScreen("daotao");

    expect(screen.getByTestId("add-nhom-khoa")).toBeInTheDocument();
    expect(screen.getByText("Thao tác")).toBeInTheDocument();
    expect(screen.getByTestId("update-nk-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-nk-1")).toBeInTheDocument();
  });

  test("manager does not see write controls", () => {
    renderScreen("manager");

    expect(screen.queryByTestId("add-nhom-khoa")).not.toBeInTheDocument();
    expect(screen.queryByText("Thao tác")).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-nk-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-nk-1")).not.toBeInTheDocument();
  });

  test("regular user does not see write controls", () => {
    renderScreen("nomal");

    expect(screen.queryByTestId("add-nhom-khoa")).not.toBeInTheDocument();
    expect(screen.queryByText("Thao tác")).not.toBeInTheDocument();
    expect(screen.queryByTestId("update-nk-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-nk-1")).not.toBeInTheDocument();
  });
});
