import React from "react";
import { Routes, Route } from "react-router-dom";
import TapSanListPage from "../pages/TapSanListPage";
import TapSanFormPage from "../pages/TapSanFormPage";
import TapSanDetailPage from "../pages/TapSanDetailPage";
import BaiBaoListPage from "../pages/BaiBaoListPage";
import BaiBaoFormPage from "../pages/BaiBaoFormPage";
import BaiBaoDetailPage from "../pages/BaiBaoDetailPage";

export default function TapSanRoutes() {
  return (
    <Routes>
      {/* TapSan routes */}
      <Route path="/" element={<TapSanListPage />} />
      <Route path="/add" element={<TapSanFormPage />} />
      <Route path="/new" element={<TapSanFormPage />} />
      <Route path="/:id" element={<TapSanDetailPage />} />
      <Route path="/:id/edit" element={<TapSanFormPage />} />

      {/* BaiBao routes */}
      <Route path="/:tapSanId/baibao" element={<BaiBaoListPage />} />
      <Route path="/:tapSanId/baibao/add" element={<BaiBaoFormPage />} />
      <Route
        path="/:tapSanId/baibao/:baiBaoId"
        element={<BaiBaoDetailPage />}
      />
      <Route
        path="/:tapSanId/baibao/:baiBaoId/edit"
        element={<BaiBaoFormPage />}
      />
    </Routes>
  );
}
