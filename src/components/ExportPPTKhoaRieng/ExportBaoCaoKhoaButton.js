import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DownloadIcon from "@mui/icons-material/Download";
import { exportBaoCaoKhoa } from "./exportBaoCaoKhoaUtils";

const ExportBaoCaoKhoaButton = ({
  khoaId,
  date,
  tenKhoa,
  variant = "contained",
  size = "medium",
  fullWidth = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const {
    bnTuVongs,
    bnChuyenViens,
    bnXinVes,
    bnNangs,
    bnPhauThuats,
    bnNgoaiGios,
    bnCanThieps,
    bnTheoDois,
    bcGiaoBanTheoNgay,
  } = useSelector((state) => state.baocaongay_riengtheokhoa);

  const {bcGiaoBanTheoNgay: bcGiaoBanTheoNgay_ToanVien} = useSelector((state) => state.baocaongay);
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Validation
      if (!tenKhoa || !date) {
        toast.error("Thiếu thông tin khoa hoặc ngày báo cáo");
        return;
      }

      // Chuẩn bị dữ liệu bệnh nhân
      const danhSachBenhNhan = [
        {
          title: "Bệnh nhân tử vong",
          data: bnTuVongs,
          titleSlide: "BỆNH NHÂN TỬ VONG",
        },
        {
          title: "Bệnh nhân chuyển viện",
          data: bnChuyenViens,
          titleSlide: "BỆNH NHÂN CHUYỂN VIỆN",
        },
        {
          title: "Bệnh nhân xin về",
          data: bnXinVes,
          titleSlide: "BỆNH NHÂN XIN VỀ",
        },
        {
          title: "Bệnh nhân nặng tại khoa",
          data: bnNangs,
          titleSlide: "BỆNH NHÂN NẶNG TẠI KHOA",
        },
        {
          title: "Bệnh nhân phẫu thuật",
          data: bnPhauThuats,
          titleSlide: "BỆNH NHÂN PHẪU THUẬT",
        },
        {
          title: "Bệnh nhân vào viện ngoài giờ",
          data: bnNgoaiGios,
          titleSlide: "BỆNH NHÂN VÀO VIỆN NGOÀI GIỜ",
        },
        {
          title: "Bệnh nhân can thiệp",
          data: bnCanThieps,
          titleSlide: "BỆNH NHÂN CAN THIỆP",
        },
        {
          title: "Bệnh nhân theo dõi",
          data: bnTheoDois,
          titleSlide: "BỆNH NHÂN THEO DÕI",
        },
      ];

      // Tính tổng số bệnh nhân
      const tongSoBenhNhan = danhSachBenhNhan.reduce(
        (total, loai) => total + loai.data.length,
        0
      );

      if (tongSoBenhNhan === 0) {
        toast.warning("Không có dữ liệu bệnh nhân để xuất báo cáo");
        return;
      }

      // Xuất báo cáo
      await exportBaoCaoKhoa({
        tenKhoa,
        date,
        bcGiaoBanTheoNgay,
        bcGiaoBanTheoNgay_ToanVien,
        danhSachBenhNhan,
        tongSoBenhNhan,
      });

      toast.success(`Xuất báo cáo khoa ${tenKhoa} thành công!`);
    } catch (error) {
      console.error("Lỗi khi xuất báo cáo:", error);
      toast.error("Có lỗi xảy ra khi xuất báo cáo: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleExport}
      disabled={isExporting}
      startIcon={
        isExporting ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <DownloadIcon />
        )
      }
      sx={{
        minWidth: 140,
        textTransform: "none",
        fontWeight: 500,
      }}
    >
      {isExporting ? "Đang xuất..." : "Xuất báo cáo khoa"}
    </Button>
  );
};

export default ExportBaoCaoKhoaButton;
