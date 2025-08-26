import dayjs from "dayjs";
import {
  computeExtendedDueStatus,
  computeDueStatus,
  computeSoGioTre,
} from "../congViecUtils";

// Helper to build a task
const build = (overrides = {}) => ({
  TrangThai: "DANG_THUC_HIEN",
  NgayBatDau: dayjs().subtract(2, "day").toISOString(),
  NgayHetHan: dayjs().add(1, "day").toISOString(),
  NgayCanhBao: dayjs().add(6, "hour").toISOString(),
  PhanTramTienDoTong: 0.5,
  ...overrides,
});

describe("congViecUtils - extended due status", () => {
  test("DUNG_HAN when before warning and not finished", () => {
    const cv = build({ NgayCanhBao: dayjs().add(12, "hour").toISOString() });
    expect(computeExtendedDueStatus(cv)).toBe("DUNG_HAN");
  });

  test("SAP_QUA_HAN when within warning window", () => {
    const cv = build({ NgayCanhBao: dayjs().add(1, "hour").toISOString() });
    expect(computeExtendedDueStatus(cv)).toBe("SAP_QUA_HAN");
  });

  test("QUA_HAN when past due and not finished", () => {
    const cv = build({ NgayHetHan: dayjs().subtract(1, "hour").toISOString() });
    expect(computeExtendedDueStatus(cv)).toBe("QUA_HAN");
  });

  test("HOAN_THANH_DUNG_HAN when finished before due", () => {
    const cv = build({
      TrangThai: "HOAN_THANH",
      NgayHoanThanh: dayjs().subtract(2, "hour").toISOString(),
    });
    expect(computeExtendedDueStatus(cv)).toBe("HOAN_THANH_DUNG_HAN");
  });

  test("HOAN_THANH_TRE_HAN when finished after due", () => {
    const cv = build({
      TrangThai: "HOAN_THANH",
      NgayHetHan: dayjs().subtract(3, "hour").toISOString(),
      NgayHoanThanh: dayjs().subtract(1, "hour").toISOString(),
    });
    expect(computeExtendedDueStatus(cv)).toBe("HOAN_THANH_TRE_HAN");
  });
});

describe("congViecUtils - computeSoGioTre", () => {
  test("0 lateness before due", () => {
    const cv = build();
    expect(computeSoGioTre(cv)).toBe(0);
  });

  test("lateness grows after due (no completion)", () => {
    const cv = build({ NgayHetHan: dayjs().subtract(2, "hour").toISOString() });
    const hours = computeSoGioTre(cv);
    expect(hours).toBeGreaterThanOrEqual(2);
  });

  test("lateness based on completion after due", () => {
    const cv = build({
      TrangThai: "HOAN_THANH",
      NgayHetHan: dayjs().subtract(5, "hour").toISOString(),
      NgayHoanThanh: dayjs().subtract(2, "hour").toISOString(),
    });
    const hours = computeSoGioTre(cv);
    expect(Math.round(hours)).toBe(3);
  });
});

// Alias should behave the same
describe("computeDueStatus alias", () => {
  test("alias matches extended function", () => {
    const cv = build();
    expect(computeDueStatus(cv)).toBe(computeExtendedDueStatus(cv));
  });
});
