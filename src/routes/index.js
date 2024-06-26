import React from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import AcountPage from "../pages/AccountPage";

import BlankLayout from "../layouts/BlankLayout";
import LoginPage from "../pages/LoginPage";

import NotFoundPage from "../pages/NotFoundPage";
import AuthRequire from "./AuthRequire";
import BCKhoaPage from "../pages/BCKhoaPage";
import AdminPage from "../pages/AdminPage";
import TongTrucPage from "../pages/TongTrucPage";

import SuCoYKhoaPage from "../pages/SuCoYKhoaPage";
import PhanTichSuCoPage from "../pages/PhanTichSuCoPage";
import DanhSachSuCoPage from "../pages/DanhSachSuCoPage";
import BaoCaoSuCoYKhoaPage from "../pages/BaoCaoSuCoYKhoaPage";
import DanhSachSuCoDataGridPage from "../pages/DanhSachSuCoDataGridPage";
import AdminRequire from "./AdminRequire";
import DashBoardPage from "../pages/DashBoardPage";
import TongHopPKYC from "../pages/TongHopPKYCPage";
import TongHopPKYCPage from "../pages/TongHopPKYCPage";
import KhuyenCaoKhoaPage from "../pages/KhuyenCaoKhoaPage";
import DashboardRequire from "./DashboardRequire";
import SupperAdminPage from "../pages/SupperAdminPage";
import DaoTaoPage from "../pages/DaoTaoPage";
import NavLayOut from "layouts/NavLayOut";
import Test from "pages/Test";
import QuanLyHocVienPage from "pages/QuanLyHocVienPage";
function Router() {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <AuthRequire>
              <MainLayout />
            </AuthRequire>
          }
        >
          {/* <Route path ="/" element ={<><MainLayout/></>}> */}
          <Route index element={<HomePage />} />
          <Route path="/account" element={<AcountPage />} />
          <Route path="khoa/" element={<BCKhoaPage />} />
          {/* <Route path="/admin" element={ <AdminPage />} /> */}
          <Route
            path="/admin"
            element={
              <AdminRequire>
                {" "}
                <AdminPage />{" "}
              </AdminRequire>
            }
          />
          <Route
            path="/dashboard"
            element={
              <DashboardRequire>
                {" "}
                <DashBoardPage />{" "}
              </DashboardRequire>
            }
          />
          <Route
            path="/khuyencaokhoa"
            element={
              <AdminRequire>
                {" "}
                <KhuyenCaoKhoaPage />{" "}
              </AdminRequire>
            }
          />
          <Route path="/tongtruc" element={<TongTrucPage />} />
          <Route path="/suco" element={<SuCoYKhoaPage />} />
          <Route path="/suco/:sucoId" element={<SuCoYKhoaPage />} />
          <Route path="/phantich/:sucoId" element={<PhanTichSuCoPage />} />
          <Route path="/danhsach" element={<DanhSachSuCoPage />} />
          <Route path="/datagrid" element={<DanhSachSuCoDataGridPage />} />
          <Route path="/baocaosuco" element={<BaoCaoSuCoYKhoaPage />} />
          <Route path="/kienadmin" element={<SupperAdminPage />} />
          <Route path="/daotao" element={<DaoTaoPage />} />
          <Route path="/test" element={<Test />} />
          <Route path="/hocvien" element={<QuanLyHocVienPage />} />
        </Route>

        <Route element={<BlankLayout />}>
          <Route path="/login" element={<LoginPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>


        <Route element={<AuthRequire> <NavLayOut /> </AuthRequire>}>
          <Route path="/dev" element={<SupperAdminPage />} />

          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Route>

      </Routes>
    </div>
  );
}

export default Router;
