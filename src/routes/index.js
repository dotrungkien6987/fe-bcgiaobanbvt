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

import KhuyenCaoKhoaPage from "../pages/KhuyenCaoKhoaPage";
import DashboardRequire from "./DashboardRequire";
import SupperAdminPage from "../pages/SupperAdminPage";

import Test from "pages/Test";
import QuanLyHocVienPage from "pages/QuanLyHocVienPage";
import MainLayoutAble from "layout/MainLayout";

import ThemeProvider from "theme";
import ThemeCustomization from "theme/index1";
import NhanVienList from "features/Daotao/NhanVienList";
import DataFixTable from "features/Daotao/DataFixTable";
import NhomHinhThucTable from "features/Daotao/NhomHinhThucTable";
import TongHopHoatDong from "features/DashBoard/HoatDongChung/TongHopHoatDong";
import HinhThucTable from "features/Daotao/HinhThucTable";
import LopDaoTaoTable from "features/Daotao/LopDaoTaoTable";
import LopDaoTaoForm from "features/Daotao/LopDaoTaoForm";
import DiemDanhLopDaoTaoForm from "features/Daotao/DiemDanhLopDaoTaoForm";
import NhanVienView1 from "features/NhanVien/NhanVienView1";
import LopDaoTaoFormTam from "features/Daotao/LopDaoTaoFormTam";
import TinChiTichLuyNhanVien from "features/Daotao/BaoCaoTongHopDaoTao/TinChiTichLuyNhanVien";
import HoiDongTable from "features/Daotao/HoiDong/HoiDongTable";
import LopDaoTaoTableByType from "features/Daotao/LopDaoTaoTableByType";
import TongHopSoLuongThucHien from "features/Daotao/BaoCaoTongHopDaoTao/TongHopSoLuong/TongHopSoLuongThucHien";
import BaoCaoSoLuongTheoKhoa from "features/Daotao/BaoCaoTongHopDaoTao/BaoCaoSoLuongTheoKhoa/BaoCaoSoLuongTheoKhoa";
import TrinhDoChuyenMonTable from "features/Daotao/TrinhDoChuyenMon/TrinhDoChuyenMonTable";
import DashBoardDaotao from "features/Daotao/BaoCaoTongHopDaoTao/DashBoardDaotao/DashBoardDaotao";
import DashBoardDaotaoKhoa from "features/Daotao/BaoCaoTongHopDaoTao/DashBoardDaoTaoKhoa/DashBoardDaotaoKhoa";
import UserThemeAbleTable from "features/User/UserThemeAble/UserThemeAbleTable";
import Function1 from "features/NoiBo/Function1";
import Function2 from "features/NoiBo/Function2";
import TinhTable from "features/Daotao/DanhMucTinh/TinhTable";
import HuyenTable from "features/Daotao/DanhMucHuyen/HuyenTable";
import XaTable from "features/Daotao/DanhMucXa/XaTable";
import KhoaTable from "features/Daotao/Khoa/KhoaTable";
import LichTrucPage from "features/LichTruc/LichTrucPage";
import SoThuTuTest from "components/SoThuTuTest";

import NhomKhoaSoThuTuTable from "features/Daotao/NhomKhoaSoThuTu/NhomKhoaSoThuTuTable";
import SoThuTuDashboard from "features/SoThuTuPhongKham/SoThuTuDashboard";
import HoatDongDashboard from "features/HoatDongBenhVien/HoatDongDashboard";
import DataSourceExplanation from "features/HoatDongBenhVien/DataSourceExplanation";
import HoatDongDashBoard1 from "features/HoatDongBenhVien1/HoatDongDashBoard1";
import DoanRaTable from "features/NghienCuuKhoaHoc/DoanRa/DoanRaTable";
import QuocGiaTable from "features/Daotao/QuocGia/QuocGiaTable";

function Router() {
  return (
    <div>
      <Routes>

        <Route
          path="/"
          element={
            <AuthRequire>
              <ThemeProvider>
                <MainLayout />
              </ThemeProvider>
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
             
                <DashBoardPage />
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
          <Route path="/daotao" element={<DataFixTable />} />
          <Route path="/testtonghop1" element={<TongHopHoatDong />} />
          <Route path="/hocvien" element={<QuanLyHocVienPage />} />
          <Route path="/lichtruc" element={<LichTrucPage />} />          <Route path="/sothutu" element={<SoThuTuDashboard />} />
          <Route path="/hoatdongbenhvien" element={<HoatDongDashboard />} />
          <Route path="/hoatdongchung" element={<HoatDongDashBoard1 />} /> {/* Compatibility with old path */}
          <Route path="/hoatdongbenhvien/schema" element={<DataSourceExplanation />} />
          
        </Route>

        <Route element={<BlankLayout />}>
          <Route path="/login" element={<LoginPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* <Route element={<AuthRequire> <NavLayOut /> </AuthRequire>}> */}
        <Route
          element={
            <AuthRequire>
              <ThemeCustomization>
                <MainLayoutAble />
                
              </ThemeCustomization>
            </AuthRequire>
          }
        >
          <Route path="/dev" element={<SupperAdminPage />} />
          <Route path="/testtonghop" element={<TongHopHoatDong />} />
          <Route path="/test" element={<Test />} />
          <Route path="/nhanvien" element={<NhanVienList />} />
          <Route path="/datafix/:field" element={<DataFixTable />} />
          <Route path="/nhomhinhthuc" element={<NhomHinhThucTable />} />
          <Route path="/trinhdochuyenmon" element={<TrinhDoChuyenMonTable />} />
          <Route path="/hinhthuc" element={<HinhThucTable />} />
          <Route path="/lopdaotaos" element={<LopDaoTaoTable />} />
          <Route path="/lopdaotaos/:type" element={<LopDaoTaoTableByType />} />
          <Route path="/lopdaotao/:lopdaotaoID/:type" element={<LopDaoTaoForm />} />
          <Route path="/diemdanh/:lopdaotaoID" element={<DiemDanhLopDaoTaoForm />} />
          <Route path="/quatrinhdaotao/:nhanvienID" element={<NhanVienView1 />} />
          <Route path="/lopdaotao/:type" element={<LopDaoTaoForm />} />

          <Route path="/dashboarddaotao" element={<DashBoardDaotao />} />
          <Route path="/dashboarddaotaotheokhoa" element={<DashBoardDaotaoKhoa />} />
          <Route path="/tonghopdaotao" element={<TinChiTichLuyNhanVien />} />
          <Route path="/tonghopsoluong" element={<TongHopSoLuongThucHien />} />
          <Route path="/soluongtheokhoa" element={<BaoCaoSoLuongTheoKhoa />} />

          <Route path="/hoidong" element={<HoiDongTable />} />
          <Route path="/usersable" element={<UserThemeAbleTable />} />
          <Route path="/lopdaotaotam/:lopdaotaoID" element={<LopDaoTaoFormTam />} />
          <Route path="/newfeature" element={<TongHopHoatDong />} />
          <Route path="/newfeature/function1" element={<Function1 />} />
          <Route path="/newfeature/function2" element={<Function2 />} />
          <Route path="/newfeature/function3" element={<TongHopHoatDong />} />
          <Route path="/tinh" element={<TinhTable />} />
          <Route path="/Huyen" element={<HuyenTable />} />
          <Route path="/Xa" element={<XaTable />} />
          <Route path="/quocgia" element={<QuocGiaTable />} />
          <Route path="/khoas" element={<KhoaTable />} />
          <Route path="/nhomkhoas" element={<NhomKhoaSoThuTuTable />} />
          <Route path="/doandi" element={<DoanRaTable />} />
          

          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Route>
      </Routes>
    </div>
  );
}

export default Router;
