import { isDungTuyenMacskcbbd } from "./constants";

export function calculateHopLeThirdUnits({
  coKhamCoTien = 0,
  manTinhDungTuyen = 0,
  manTinhChuyenTuyen = 0,
}) {
  return (
    Number(coKhamCoTien || 0) * 3 -
    Number(manTinhDungTuyen || 0) * 3 -
    Number(manTinhChuyenTuyen || 0) * 2
  );
}

export function thirdUnitsToNumber(thirdUnits = 0) {
  return Number(thirdUnits || 0) / 3;
}

export function buildManTinhClassificationByNGT({
  danhSachManTinh = {},
  chiTietDatLich = [],
}) {
  const chiTietByDangKyKhamId = new Map();

  chiTietDatLich.forEach((row) => {
    const dangKyKhamId = row?.dangkykhamid;
    if (dangKyKhamId == null) return;
    chiTietByDangKyKhamId.set(String(dangKyKhamId), row);
  });

  const byNGT = {};
  const totals = {
    so_man_tinh: 0,
    man_tinh_dung_tuyen: 0,
    man_tinh_chuyen_tuyen: 0,
  };

  Object.values(danhSachManTinh).forEach((doc) => {
    const dangKyKhamId = doc?.dangkykhamid;
    if (dangKyKhamId == null) return;

    const chiTiet = chiTietByDangKyKhamId.get(String(dangKyKhamId));
    const ngtId = String(
      doc?.nguoigioithieuid ?? chiTiet?.nguoigioithieuid ?? "",
    );
    if (!ngtId) return;

    if (!byNGT[ngtId]) {
      byNGT[ngtId] = {
        so_man_tinh: 0,
        man_tinh_dung_tuyen: 0,
        man_tinh_chuyen_tuyen: 0,
      };
    }

    byNGT[ngtId].so_man_tinh += 1;
    totals.so_man_tinh += 1;

    if (isDungTuyenMacskcbbd(chiTiet?.macskcbbd)) {
      byNGT[ngtId].man_tinh_dung_tuyen += 1;
      totals.man_tinh_dung_tuyen += 1;
    } else {
      byNGT[ngtId].man_tinh_chuyen_tuyen += 1;
      totals.man_tinh_chuyen_tuyen += 1;
    }
  });

  return { byNGT, totals };
}
