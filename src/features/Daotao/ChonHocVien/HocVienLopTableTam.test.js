import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "hooks/useAuth";
import HocVienLopTableTam from "./HocVienLopTableTam";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import { insertOrUpdateLopDaoTaoNhanVien } from "../daotaoSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("hooks/useAuth", () => jest.fn());

jest.mock("features/NhanVien/nhanvienSlice", () => ({
  getAllNhanVien: jest.fn(() => ({ type: "nhanvien/getAll" })),
}));

jest.mock("../daotaoSlice", () => ({
  insertOrUpdateLopDaoTaoNhanVien: jest.fn((payload) => ({
    type: "daotao/insertOrUpdateLopDaoTaoNhanVien",
    payload,
  })),
}));

jest.mock("./SelectHocVienForm", () => () => (
  <div data-testid="select-hocvien-form">SelectHocVienForm</div>
));

jest.mock("./SelectVaiTro", () => () => (
  <div data-testid="select-vaitro">SelectVaiTro</div>
));

jest.mock("./RemoveHocVienTrongLop", () => () => (
  <div data-testid="remove-hocvien">RemoveHocVienTrongLop</div>
));

let stickyTableProps;

jest.mock("sections/react-table/StickyTable", () => (props) => {
  stickyTableProps = props;
  return (
    <div data-testid="sticky-table">
      <div data-testid="sticky-column-count">{props.columns.length}</div>
      {props.additionalComponent}
    </div>
  );
});

let dispatchMock;
let mockState;
let mockUser;

function renderScreen({ userId, role, creatorId }) {
  mockUser = { _id: userId, UserName: "tester", PhanQuyen: role };
  mockState = {
    daotao: {
      lopdaotaoCurrent: {
        _id: "lop-1",
        Ten: "Lop thu nghiem",
        UserIDCreated: creatorId,
      },
      hocvienCurrents: [
        {
          _id: "row-1",
          NhanVienID: "nv-1",
          VaiTro: "Hoc vien",
          MaNhanVien: "NV001",
          Ten: "Nguyen Van A",
          TenKhoa: "Noi tong hop",
          Sex: "Nam",
          NgaySinh: "1990-01-01",
        },
      ],
    },
  };

  return render(<HocVienLopTableTam />);
}

beforeEach(() => {
  stickyTableProps = undefined;
  dispatchMock = jest.fn();
  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selector) => selector(mockState));
  useAuth.mockImplementation(() => ({ user: mockUser }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("HocVienLopTableTam owner-scope controls", () => {
  test("creator sees save and selection controls", () => {
    renderScreen({
      userId: "creator-1",
      role: "manager",
      creatorId: "creator-1",
    });

    expect(getAllNhanVien).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Danh sách tạm")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Lưu thành viên tạm tham gia/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("select-hocvien-form")).toBeInTheDocument();
    expect(screen.getByTestId("select-vaitro")).toBeInTheDocument();
    expect(screen.getByTestId("sticky-column-count")).toHaveTextContent("7");
    expect(stickyTableProps.columns[0].Header).toBe("_id");

    fireEvent.click(
      screen.getByRole("button", { name: /Lưu thành viên tạm tham gia/i }),
    );

    expect(insertOrUpdateLopDaoTaoNhanVien).toHaveBeenCalledWith({
      lopdaotaonhanvienData: [
        {
          LopDaoTaoID: "lop-1",
          NhanVienID: "nv-1",
          VaiTro: "Hoc vien",
        },
      ],
      lopdaotaoID: "lop-1",
      tam: true,
    });
  });

  test("non-owner loses save, selection, and row-action controls", () => {
    renderScreen({
      userId: "viewer-1",
      role: "manager",
      creatorId: "creator-1",
    });

    expect(
      screen.queryByRole("button", { name: /Lưu thành viên tạm tham gia/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("select-hocvien-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("select-vaitro")).not.toBeInTheDocument();
    expect(screen.getByTestId("sticky-column-count")).toHaveTextContent("6");
    expect(stickyTableProps.columns[0].Header).toBe("Vai trò");
    expect(stickyTableProps.additionalComponent).toBeNull();
    expect(insertOrUpdateLopDaoTaoNhanVien).not.toHaveBeenCalled();
  });
});
