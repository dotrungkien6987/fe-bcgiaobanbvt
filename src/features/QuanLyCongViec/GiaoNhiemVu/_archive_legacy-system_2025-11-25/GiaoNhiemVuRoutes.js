import React from "react";
import { Route } from "react-router-dom";
import GiaoNhiemVuPage from "./old-components/GiaoNhiemVuPage";
import GiaoNhiemVuPageNew from "./GiaoNhiemVuPageNew";

const GiaoNhiemVuRoutes = () => (
  <>
    {/* New version - table-based UI */}
    <Route
      path="/quanlycongviec/giao-nhiem-vu/:NhanVienID"
      element={<GiaoNhiemVuPageNew />}
    />
    {/* Old version - keep for reference */}
    <Route
      path="/quanlycongviec/giao-nhiem-vu-old/:NhanVienID"
      element={<GiaoNhiemVuPage />}
    />
  </>
);

export default GiaoNhiemVuRoutes;
