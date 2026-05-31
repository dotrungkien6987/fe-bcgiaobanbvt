import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "contexts/AuthContext";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import QuocGiaTable from "./QuocGia/QuocGiaTable";
import TinhTable from "./DanhMucTinh/TinhTable";
import HuyenTable from "./DanhMucHuyen/HuyenTable";
import XaTable from "./DanhMucXa/XaTable";
import NhomHinhThucTable from "./NhomHinhThucTable";
import TrinhDoChuyenMonTable from "./TrinhDoChuyenMon/TrinhDoChuyenMonTable";
import KhoaBinhQuanBenhAnTable from "./KhoaBinhQuanBenhAn/KhoaBinhQuanBenhAnTable";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("components/MainCard", () => ({ children }) => <div>{children}</div>);

jest.mock("features/NhanVien/nhanvienSlice", () => ({
  getDataFix: jest.fn(() => ({ type: "nhanvien/getDataFix" })),
}));

jest.mock("./DeleteDataFixButton", () => ({ datafixField, index }) => (
  <div data-testid={`delete-${datafixField}-${index}`}>Delete</div>
));

jest.mock("./QuocGia/AddQuocGiaButton", () => () => (
  <div data-testid="add-quoc-gia">Add QuocGia</div>
));

jest.mock("./QuocGia/UpdateQuocGiaButton", () => ({ index }) => (
  <div data-testid={`update-quoc-gia-${index}`}>Update QuocGia</div>
));

jest.mock("./DanhMucTinh/AddTinhButton", () => () => (
  <div data-testid="add-tinh">Add Tinh</div>
));

jest.mock("./DanhMucTinh/UpdateTinhButton", () => ({ index }) => (
  <div data-testid={`update-tinh-${index}`}>Update Tinh</div>
));

jest.mock("./DanhMucHuyen/AddHuyenButton", () => () => (
  <div data-testid="add-huyen">Add Huyen</div>
));

jest.mock("./DanhMucHuyen/UpdateHuyenButton", () => ({ index }) => (
  <div data-testid={`update-huyen-${index}`}>Update Huyen</div>
));

jest.mock("./DanhMucXa/AddXaButton", () => () => (
  <div data-testid="add-xa">Add Xa</div>
));

jest.mock("./DanhMucXa/UpdateXaButton", () => ({ index }) => (
  <div data-testid={`update-xa-${index}`}>Update Xa</div>
));

jest.mock("./AddNhomHinhThucButton", () => () => (
  <div data-testid="add-nhom-hinh-thuc">Add NhomHinhThuc</div>
));

jest.mock("./UpdateNhomHinhThucButton", () => ({ index }) => (
  <div data-testid={`update-nhom-hinh-thuc-${index}`}>Update NhomHinhThuc</div>
));

jest.mock("./TrinhDoChuyenMon/AddTrinhDoChuyenMonButton", () => () => (
  <div data-testid="add-trinh-do-chuyen-mon">Add TrinhDoChuyenMon</div>
));

jest.mock(
  "./TrinhDoChuyenMon/UpdateTrinhDocChuyenMonButton",
  () =>
    ({ index }) => (
      <div data-testid={`update-trinh-do-chuyen-mon-${index}`}>
        Update TrinhDoChuyenMon
      </div>
    ),
);

jest.mock("./KhoaBinhQuanBenhAn/AddKhoaBinhQuanBenhAnButton", () => () => (
  <div data-testid="add-khoa-binh-quan-benh-an">Add KhoaBinhQuanBenhAn</div>
));

jest.mock(
  "./KhoaBinhQuanBenhAn/UpdateKhoaBinhQuanBenhAnButton",
  () =>
    ({ index }) => (
      <div data-testid={`update-khoa-binh-quan-benh-an-${index}`}>
        Update KhoaBinhQuanBenhAn
      </div>
    ),
);

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
            <div key={row._id || row.index || index}>
              {columns.map((column) => (
                <div
                  key={`${row._id || row.index || index}-${column.accessor || column.Header}`}
                >
                  {column.Cell
                    ? column.Cell({
                        row: { original: row },
                        value: getValue(row, column.accessor),
                      })
                    : getValue(row, column.accessor) || null}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    },
);

const sampleState = {
  nhanvien: {
    QuocGia: [
      { _id: "qg-1", code: "VN", label: "Việt Nam", phone: "+84", index: 1 },
    ],
    Tinh: [
      {
        _id: "t-1",
        TenTinh: "Bắc Ninh",
        MaTinh: "BN",
        DienTich: 1,
        DanSo: 1,
        KhoangCach: 1,
        index: 1,
      },
    ],
    Huyen: [
      {
        _id: "h-1",
        MaTinh: "BN",
        TenHuyen: "Từ Sơn",
        MaHuyen: "TS",
        DienTich: 1,
        DanSo: 1,
        KhoangCach: 1,
        index: 1,
      },
    ],
    Xa: [
      {
        _id: "x-1",
        TenXa: "Phù Chẩn",
        MaXa: "PC",
        MaTinh: "BN",
        MaHuyen: "TS",
        DienTich: 1,
        DanSo: 1,
        KhoangCach: 1,
        index: 1,
      },
    ],
    NhomHinhThucCapNhat: [
      {
        _id: "nh-1",
        Loai: "A",
        Ma: "NH01",
        Ten: "Nhóm hình thức 1",
        index: 1,
      },
    ],
    TrinhDoChuyenMon: [
      {
        _id: "td-1",
        TrinhDoChuyenMon: "Bác sĩ",
        QuyDoi1: 1,
        QuyDoi2: 2,
        index: 1,
      },
    ],
    KhoaBinhQuanBenhAn: [
      {
        _id: "kb-1",
        TenKhoa: "Nội tổng hợp",
        KhoaID: "K001",
        LoaiKhoa: "noitru",
        index: 1,
      },
    ],
  },
};

const cases = [
  {
    label: "QuocGiaTable",
    Component: QuocGiaTable,
    addTestId: "add-quoc-gia",
    updateTestId: "update-quoc-gia-1",
  },
  {
    label: "TinhTable",
    Component: TinhTable,
    addTestId: "add-tinh",
    updateTestId: "update-tinh-1",
  },
  {
    label: "HuyenTable",
    Component: HuyenTable,
    addTestId: "add-huyen",
    updateTestId: "update-huyen-1",
  },
  {
    label: "XaTable",
    Component: XaTable,
    addTestId: "add-xa",
    updateTestId: "update-xa-1",
  },
  {
    label: "NhomHinhThucTable",
    Component: NhomHinhThucTable,
    addTestId: "add-nhom-hinh-thuc",
    updateTestId: "update-nhom-hinh-thuc-1",
  },
  {
    label: "TrinhDoChuyenMonTable",
    Component: TrinhDoChuyenMonTable,
    addTestId: "add-trinh-do-chuyen-mon",
    updateTestId: "update-trinh-do-chuyen-mon-1",
  },
  {
    label: "KhoaBinhQuanBenhAnTable",
    Component: KhoaBinhQuanBenhAnTable,
    addTestId: "add-khoa-binh-quan-benh-an",
    updateTestId: "update-khoa-binh-quan-benh-an-1",
  },
];

let dispatchMock;
let mockUser;

const renderTable = (Component, role) => {
  mockUser = { PhanQuyen: role };
  return render(<Component />);
};

beforeEach(() => {
  dispatchMock = jest.fn();
  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selector) => selector(sampleState));
  useAuth.mockImplementation(() => ({ user: mockUser }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Specialized DataFix table access", () => {
  test.each(cases)(
    "admin sees write controls in $label",
    ({ Component, addTestId, updateTestId }) => {
      renderTable(Component, "admin");

      expect(getDataFix).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId(addTestId)).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(screen.getByTestId(updateTestId)).toBeInTheDocument();
    },
  );

  test.each(cases)(
    "regular user does not see write controls in $label",
    ({ Component, addTestId, updateTestId }) => {
      renderTable(Component, "nomal");

      expect(screen.queryByTestId(addTestId)).not.toBeInTheDocument();
      expect(screen.queryByText("Action")).not.toBeInTheDocument();
      expect(screen.queryByTestId(updateTestId)).not.toBeInTheDocument();
    },
  );

  test.each(cases)(
    "manager does not see write controls in $label",
    ({ Component, addTestId, updateTestId }) => {
      renderTable(Component, "manager");

      expect(screen.queryByTestId(addTestId)).not.toBeInTheDocument();
      expect(screen.queryByText("Action")).not.toBeInTheDocument();
      expect(screen.queryByTestId(updateTestId)).not.toBeInTheDocument();
    },
  );
});
