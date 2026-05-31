import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BaiBaoListPage from "./BaiBaoListPage";
import {
  fetchBaiBaoListByTapSan,
  deleteBaiBao,
  reorderBaiBao,
  selectBaiBaoListByTapSan,
  selectBaiBaoListMeta,
} from "../slices/baiBaoSlice";
import { fetchTapSanById, selectTapSanById } from "../slices/tapSanSlice";
import useTapSanNhanVienOptions from "../hooks/useTapSanNhanVienOptions";
import useLocalSnackbar from "../hooks/useLocalSnackbar";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
    useParams: jest.fn(),
  };
});

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  const React = require("react");

  return {
    ...actual,
    Autocomplete: ({
      options = [],
      value = null,
      inputValue = "",
      onInputChange,
      onChange,
      getOptionLabel = (option) => option?.label || "",
      renderInput,
      noOptionsText,
    }) => {
      const renderedInput = renderInput
        ? renderInput({
            InputProps: { endAdornment: null },
            inputProps: {},
          })
        : null;
      const label = renderedInput?.props?.label || "Autocomplete";
      const placeholder = renderedInput?.props?.placeholder || "";

      return (
        <div>
          <input
            aria-label={label}
            placeholder={placeholder}
            value={inputValue}
            onChange={(event) =>
              onInputChange?.(event, event.target.value, "input")
            }
          />
          <div>
            {options.length ? (
              options.map((option) => (
                <button
                  type="button"
                  key={option._id}
                  onClick={() => onChange?.(null, option)}
                >
                  {getOptionLabel(option)}
                </button>
              ))
            ) : (
              <span>{noOptionsText}</span>
            )}
            <button type="button" onClick={() => onChange?.(null, null)}>
              Xóa lựa chọn
            </button>
          </div>
          {value ? <span>{getOptionLabel(value)}</span> : null}
        </div>
      );
    },
  };
});

jest.mock("@mui/x-data-grid", () => ({
  DataGrid: () => <div data-testid="bai-bao-grid" />,
  GridActionsCellItem: () => null,
  GridToolbarContainer: ({ children }) => <div>{children}</div>,
  GridToolbarExport: () => null,
  GridToolbarFilterButton: () => null,
  GridToolbarDensitySelector: () => null,
}));

jest.mock("components/ConfirmDialog", () => () => null);

jest.mock("../components/AttachmentLinksCell", () => () => (
  <div data-testid="attachment-links" />
));

jest.mock("../hooks/useLocalSnackbar", () => jest.fn());

jest.mock("../hooks/useTapSanNhanVienOptions", () => jest.fn());

jest.mock("../slices/baiBaoSlice", () => ({
  fetchBaiBaoListByTapSan: jest.fn(),
  deleteBaiBao: jest.fn(),
  reorderBaiBao: jest.fn(),
  selectBaiBaoListByTapSan: jest.fn(),
  selectBaiBaoListMeta: jest.fn(),
}));

jest.mock("../slices/tapSanSlice", () => ({
  fetchTapSanById: jest.fn(),
  selectTapSanById: jest.fn(),
}));

const sampleTapSan = {
  _id: "ts-1",
  Loai: "YH",
  NamXuatBan: 2026,
  SoXuatBan: 2,
};

const sampleNhanVienOptions = [
  { _id: "nv-1", Ten: "Nguyen Van A", MaNhanVien: "NV01" },
  { _id: "nv-2", Ten: "Tran Thi B", MaNhanVien: "NV02" },
];

const nhanVienById = new Map(
  sampleNhanVienOptions.map((item) => [item._id, item]),
);

let dispatchMock;
let navigateMock;

function renderScreen() {
  return render(
    <MemoryRouter>
      <BaiBaoListPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  dispatchMock = jest.fn(() => ({
    unwrap: jest.fn().mockResolvedValue({}),
  }));
  navigateMock = jest.fn();

  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selector) => selector({}));
  useNavigate.mockReturnValue(navigateMock);
  useParams.mockReturnValue({ tapSanId: "ts-1" });

  fetchTapSanById.mockImplementation((id) => ({
    type: "tapsan/fetchById",
    meta: { arg: id },
  }));
  fetchBaiBaoListByTapSan.mockImplementation((payload) => ({
    type: "baibao/fetchList",
    meta: { arg: payload },
  }));
  deleteBaiBao.mockImplementation((id) => ({
    type: "baibao/delete",
    meta: { arg: id },
  }));
  reorderBaiBao.mockImplementation((payload) => ({
    type: "baibao/reorder",
    meta: { arg: payload },
  }));

  selectBaiBaoListByTapSan.mockReturnValue([]);
  selectBaiBaoListMeta.mockReturnValue({ loading: false, total: 0 });
  selectTapSanById.mockReturnValue(sampleTapSan);

  useLocalSnackbar.mockReturnValue({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    SnackbarElement: null,
  });

  useTapSanNhanVienOptions.mockImplementation(({ search = "" } = {}) => ({
    nhanVienOptions: sampleNhanVienOptions,
    nhanVienById,
    loading: false,
    error: null,
    isSearching: false,
    search,
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("BaiBaoListPage reviewer filter", () => {
  test("truyền search vào hook và lọc theo reviewer được chọn", async () => {
    renderScreen();

    const reviewerInput = screen.getByLabelText("Người thẩm định");
    fireEvent.change(reviewerInput, { target: { value: "Tran" } });

    await waitFor(() => {
      expect(useTapSanNhanVienOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 60,
          search: "Tran",
          debounceMs: 300,
        }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Tran Thi B (NV02)" }));

    await waitFor(() => {
      const lastCall = fetchBaiBaoListByTapSan.mock.calls.at(-1)?.[0];
      expect(lastCall).toEqual(
        expect.objectContaining({
          tapSanId: "ts-1",
          filters: expect.objectContaining({
            NguoiThamDinhID: "nv-2",
          }),
        }),
      );
    });
  });
});
