import React from "react";
import { Route } from "react-router-dom";
import GiaoNhiemVuPage from "./GiaoNhiemVuPage";

const GiaoNhiemVuRoutes = () => (
  <Route
    path="/quanlycongviec/giao-nhiem-vu/:NhanVienID"
    element={<GiaoNhiemVuPage />}
  />
);

export default GiaoNhiemVuRoutes;
