import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useAuth from "hooks/useAuth";
import LopDaoTaoFormTam from "./LopDaoTaoFormTam";
import { getOneLopDaoTaoByID, resetLopDaoTaoCurrent } from "./daotaoSlice";
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
}));

jest.mock("hooks/useAuth", () => jest.fn());

jest.mock("./daotaoSlice", () => ({
  getOneLopDaoTaoByID: jest.fn((payload) => ({
    type: "daotao/getOneLopDaoTaoByID",
    payload,
  })),
  resetLopDaoTaoCurrent: jest.fn(() => ({
    type: "daotao/resetLopDaoTaoCurrent",
  })),
}));

jest.mock("features/NhanVien/hinhthuccapnhatSlice", () => ({
  getAllHinhThucCapNhat: jest.fn(() => ({
    type: "hinhthuccapnhat/getAll",
  })),
}));

jest.mock("features/NhanVien/nhanvienSlice", () => ({
  getDataFix: jest.fn(() => ({ type: "nhanvien/getDataFix" })),
}));

jest.mock("components/MainCard", () => ({ children, title }) => (
  <div>
    <div>{title}</div>
    {children}
  </div>
));

jest.mock("features/NhanVien/LopDaoTaoView1", () => ({ data }) => (
  <div data-testid="lopdaotao-view">{data?.Ten || ""}</div>
));

jest.mock("./ChonHocVien/HocVienLopTableTam", () => () => (
  <div data-testid="hocvien-tam-table">HocVienTamTable</div>
));

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
    },
    hinhthuccapnhat: { HinhThucCapNhat: [] },
    nhanvien: { NoiDaoTao: [] },
  };

  return render(<LopDaoTaoFormTam />);
}

beforeEach(() => {
  dispatchMock = jest.fn();
  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selector) => selector(mockState));
  useParams.mockReturnValue({ lopdaotaoID: "lop-1" });
  useAuth.mockImplementation(() => ({ user: mockUser }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("LopDaoTaoFormTam access gating", () => {
  test("creator sees temporary member table", () => {
    renderScreen({
      userId: "creator-1",
      role: "manager",
      creatorId: "creator-1",
    });

    expect(getOneLopDaoTaoByID).toHaveBeenCalledWith({
      lopdaotaoID: "lop-1",
      tam: true,
      userID: "creator-1",
    });
    expect(screen.getByTestId("hocvien-tam-table")).toBeInTheDocument();
    expect(
      screen.queryByText(/Bạn không có quyền thao tác với danh sách tạm/i),
    ).not.toBeInTheDocument();
  });

  test("non-owner does not see temporary member table", () => {
    renderScreen({
      userId: "viewer-1",
      role: "manager",
      creatorId: "creator-1",
    });

    expect(screen.queryByTestId("hocvien-tam-table")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Bạn không có quyền thao tác với danh sách tạm/i),
    ).toBeInTheDocument();
  });
});
