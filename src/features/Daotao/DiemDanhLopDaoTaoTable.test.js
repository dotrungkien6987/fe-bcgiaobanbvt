import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "hooks/useAuth";
import DiemDanhLopDaoTaoTable from "./DiemDanhLopDaoTaoTable";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("hooks/useAuth", () => jest.fn());

jest.mock("./daotaoSlice", () => ({
  setOpenUploadLopDaoTaoNhanVien: jest.fn((open) => ({
    type: "daotao/setOpenUploadLopDaoTaoNhanVien",
    payload: open,
  })),
  updateLopDaoTaoNhanVienDiemDanh: jest.fn((payload) => ({
    type: "daotao/updateLopDaoTaoNhanVienDiemDanh",
    payload,
  })),
}));

jest.mock(
  "./UploadAnhChoHocVien/UploadLopDaoTaoNhanVienButton",
  () =>
    ({ lopdaotaonhanvienID }) => (
      <div data-testid={`upload-${lopdaotaonhanvienID}`}>Upload</div>
    ),
);

jest.mock("./UploadAnhChoHocVien/UpLoadHocVienLopDaoTaoForm", () => () => (
  <div data-testid="upload-form">Upload form</div>
));

jest.mock("./UploadAnhChoHocVien/ImagesUploadChip", () => ({ imageUrls }) => (
  <div data-testid="images-chip">{imageUrls.length}</div>
));

jest.mock(
  "pages/tables/MyTable/MyStickyEditTable",
  () =>
    ({ data, columns }) => {
      const getValue = (row, accessor) => {
        if (typeof accessor !== "string") return undefined;
        return accessor.split(".").reduce((value, key) => value?.[key], row);
      };

      return (
        <div>
          {columns.map((column) => (
            <div key={column.Header}>{column.Header}</div>
          ))}
          {data.map((row) => (
            <div key={row._id}>
              {columns.map((column) => (
                <div key={`${row._id}-${column.accessor || column.Header}`}>
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

const sampleHocVien = [
  {
    _id: "hv-1",
    MaNhanVien: "NV001",
    Ten: "Nguyen Van A",
    Sex: "Nam",
    NgaySinh: "1990-01-01T00:00:00.000Z",
    TenKhoa: "Khoa A",
    Images: [],
    SoTinChiTichLuy: 3,
    TuDong: 3,
    VaiTro: "Hoc vien",
    DonVi: "Don vi A",
    QuyDoi: 1,
    SoLuong: 1,
    DiemDanh: [true],
    "section 1": true,
  },
];

let dispatchMock;
let mockState;
let mockUser;

function renderScreen({ role, userId, creatorId }) {
  mockUser = { _id: userId, PhanQuyen: role };
  mockState = {
    daotao: {
      hocvienCurrents: sampleHocVien,
      lopdaotaoCurrent: {
        _id: "lop-1",
        TrangThai: false,
        UserIDCreated: creatorId,
      },
      openUploadLopDaoTaoNhanVien: false,
    },
  };

  return render(<DiemDanhLopDaoTaoTable numSections={1} />);
}

beforeEach(() => {
  dispatchMock = jest.fn();
  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selector) => selector(mockState));
  useAuth.mockImplementation(() => ({ user: mockUser }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("DiemDanhLopDaoTaoTable access gating", () => {
  test("creator sees save and upload controls", () => {
    renderScreen({
      role: "nomal",
      userId: "creator-1",
      creatorId: "creator-1",
    });

    expect(
      screen.getByRole("button", { name: /Lưu tín chỉ/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Tự động tính tín chỉ tích lũy/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("upload-hv-1")).toBeInTheDocument();
  });

  test("admin sees save and upload controls", () => {
    renderScreen({ role: "admin", userId: "admin-1", creatorId: "creator-1" });

    expect(
      screen.getByRole("button", { name: /Lưu tín chỉ/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("upload-hv-1")).toBeInTheDocument();
  });

  test("non-owner manager does not see write controls", () => {
    renderScreen({
      role: "manager",
      userId: "manager-1",
      creatorId: "creator-1",
    });

    expect(
      screen.queryByRole("button", { name: /Lưu tín chỉ/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Tự động tính tín chỉ tích lũy/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("upload-hv-1")).not.toBeInTheDocument();
  });
});
