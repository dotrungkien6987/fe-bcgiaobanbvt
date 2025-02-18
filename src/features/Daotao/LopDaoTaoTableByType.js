import { Grid, IconButton, Stack, Tooltip, useTheme } from "@mui/material";

import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";

import { getAllLopDaoTao } from "./daotaoSlice";
import AddLopDaoTao from "./AddLopDaoTao";

import DeleteLopDaoTaoButton from "./DeleteLopDaoTaoButton";
import UpdateLopDaoTaoButton from "./UpdateLopDaoTaoButton";
import DiemDanhLopDaoTaoButton from "./DiemDanhLopDaoTaoButton";
import LopDaoTaoView from "features/NhanVien/LopDaoTaoView";
import { Add, Eye } from "iconsax-react";
import { ThemeMode } from "configAble";
import TrangThaiLopDaoTao from "./TrangThaiLopDaoTao";

import ScrollX from "components/ScrollX";
import ThemHocVienTamButton from "./ThemHocVienTam/ThemHocVienTamButton";
import { useParams } from "react-router-dom";
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { el } from "date-fns/locale";

function LopDaoTaoTableByType() {
  const params = useParams();
  let typeLopDaoTao = params.type;
  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  useEffect(() => {
    if (HinhThucCapNhat.length === 0) {
      dispatch(getAllHinhThucCapNhat());
    }
  }, []);
  // Kiểm tra nếu ký tự đầu tiên là 'D' thì thay bằng 'Đ'
  if (typeLopDaoTao && typeLopDaoTao.charAt(0) === "D") {
    typeLopDaoTao = "Đ" + typeLopDaoTao.slice(1);
  }

  const theme = useTheme();
  const mode = theme.palette.mode;
  // const columns = useMemo(
  //   () => [
  //     {
  //       Header: "Actions",
  //       Footer: "Actions",
  //       accessor: "Actions",
  //       disableGroupBy: true,
  //       sticky: "left",
  //       Cell: ({ row }) => {
  //         const collapseIcon = row.isExpanded ? (
  //           <Add
  //             style={{
  //               // color: theme.palette.error.main,
  //               transform: "rotate(45deg)",
  //             }}
  //           />
  //         ) : (
  //           <Eye />
  //         );
  //         return (
  //           <Stack
  //             direction="row"
  //             alignItems="center"
  //             justifyContent="center"
  //             spacing={0}
  //           >
  //             <DeleteLopDaoTaoButton lopdaotaoID={row.original._id} />
  //             {row.original.TrangThai === false && (
  //               <Stack direction={"row"}>
  //                 <UpdateLopDaoTaoButton lopdaotaoID={row.original._id} />
  //                 <ThemHocVienTamButton lopdaotaoID={row.original._id} />
  //               </Stack>
  //             )}
  //             <DiemDanhLopDaoTaoButton lopdaotaoID={row.original._id} />
  //             <Tooltip
  //               componentsProps={{
  //                 tooltip: {
  //                   sx: {
  //                     backgroundColor:
  //                       mode === ThemeMode.DARK
  //                         ? theme.palette.grey[50]
  //                         : theme.palette.grey[700],
  //                     opacity: 0.9,
  //                   },
  //                 },
  //               }}
  //               title="View"
  //             >
  //               <IconButton
  //                 color="secondary"
  //                 onClick={(e) => {
  //                   e.stopPropagation();
  //                   row.toggleRowExpanded();
  //                 }}
  //               >
  //                 {collapseIcon}
  //               </IconButton>
  //             </Tooltip>
  //           </Stack>
  //         );
  //       },
  //     },
  //     {
  //       Header: "Mã hình thức",
  //       Footer: "Mã hình thức",
  //       accessor: "MaHinhThucCapNhat",
  //       className: "cell-center",
  //       disableGroupBy: true,
  //       // sticky: 'left',
  //       // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
  //     },
  //     {
  //       Header: "Tên lớp đào tạo",
  //       Footer: "Tên lớp đào tạo",

  //       accessor: "Ten",
  //       disableGroupBy: true,
  //     },
  //     {
  //       Header: "Trạng thái",
  //       Footer: "Trạng thái",

  //       accessor: "TrangThai",
  //       disableGroupBy: true,
  //       Cell: ({ value }) => {
  //         if (value === true)
  //           return (
  //             <TrangThaiLopDaoTao trangthai={true} title={"Đã hoàn thành"} />
  //           );
  //         else
  //           return (
  //             <TrangThaiLopDaoTao trangthai={false} title={"Chưa hoàn thành"} />
  //           );
  //       },
  //     },

  //     typeLopDaoTao.startsWith("NCKH01")
  //       ? {
  //           Header: "Xếp loại",
  //           Footer: "Xếp loại",

  //           accessor: "XepLoai",

  //           disableGroupBy: true,
  //         }
  //       : {},
  //     {
  //       Header: "Quyết định",
  //       Footer: "Quyết định",

  //       accessor: "QuyetDinh",

  //       disableGroupBy: true,
  //     },
  //     {
  //       Header: "Cán bộ tham gia",
  //       Footer: "Cán bộ tham gia",

  //       accessor: "CanBoThamGia",

  //       disableGroupBy: true,
  //     },
  //     {
  //       Header: "Hình thức đào tạo",
  //       Footer: "Hình thức đào tạo",

  //       accessor: "HinhThucDaoTao",

  //       disableGroupBy: true,
  //     },
  //     {
  //       Header: "Số thành viên",
  //       Footer: "Số thành viên",

  //       accessor: "SoThanhVien",

  //       disableGroupBy: true,
  //     },
  //     {
  //       Header: "Ngày bắt đầu",
  //       Footer: "Ngày bắt đầu",
  //       // Filter:DateColumnFilter,
  //       accessor: "NgayBatDauFormat",

  //       disableGroupBy: true,
  //       // Cell: ({ value }) => formatDate_getDate(value),
  //     },
  //     {
  //       Header: "Ngày kết thúc",
  //       Footer: "Ngày kết thúc",

  //       accessor: "NgayKetThucFormat",

  //       disableGroupBy: true,
  //       // Cell: ({ value }) => formatDate_getDate(value),
  //     },
  //     {
  //       Header: "Số section",
  //       Footer: "Số section",

  //       accessor: "SoLuong",
  //       disableGroupBy: true,
  //     },
  //     {
  //       Header: "Người tạo",
  //       Footer: "Người tạo",

  //       accessor: "NguoiTao",
  //       disableGroupBy: true,
  //     },
  //     {
  //       Header: "_id",
  //       Footer: "_id",

  //       accessor: "_id",
  //       disableGroupBy: true,
  //     },
  //   ],
  //   [typeLopDaoTao]
  // );


  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          Header: "Actions",
          Footer: "Actions",
          accessor: "Actions",
          disableGroupBy: true,
          sticky: "left",
          Cell: ({ row }) => {
            const collapseIcon = row.isExpanded ? (
              <Add
                style={{
                  // color: theme.palette.error.main,
                  transform: "rotate(45deg)",
                }}
              />
            ) : (
              <Eye />
            );
            return (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={0}
              >
                <DeleteLopDaoTaoButton lopdaotaoID={row.original._id} />
                {row.original.TrangThai === false && (
                  <Stack direction={"row"}>
                    <UpdateLopDaoTaoButton lopdaotaoID={row.original._id} />
                    <ThemHocVienTamButton lopdaotaoID={row.original._id} />
                  </Stack>
                )}
                <DiemDanhLopDaoTaoButton lopdaotaoID={row.original._id} />
                <Tooltip
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor:
                          mode === ThemeMode.DARK
                            ? theme.palette.grey[50]
                            : theme.palette.grey[700],
                        opacity: 0.9,
                      },
                    },
                  }}
                >
                  <IconButton
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      row.toggleRowExpanded();
                    }}
                  >
                    {collapseIcon}
                  </IconButton>
                </Tooltip>
              </Stack>
            );
          },
        },
       
        {
          Header: "Mã hình thức",
          Footer: "Mã hình thức",
          accessor: "MaHinhThucCapNhat",
          className: "cell-center",
          disableGroupBy: true,
        },
        {
          Header: "Tên lớp đào tạo",
          Footer: "Tên lớp đào tạo",
          accessor: "Ten",
          disableGroupBy: true,
        },
        {
          Header: "Trạng thái",
          Footer: "Trạng thái",
          accessor: "TrangThai",
          disableGroupBy: true,
          Cell: ({ value }) => {
            if (value === true)
              return (
                <TrangThaiLopDaoTao trangthai={true} title={"Đã hoàn thành"} />
              );
            else
              return (
                <TrangThaiLopDaoTao trangthai={false} title={"Chưa hoàn thành"} />
              );
          },
        },
        {
          Header: "Quyết định",
          Footer: "Quyết định",
          accessor: "QuyetDinh",
          disableGroupBy: true,
        },
        {
          Header: "Cán bộ tham gia",
          Footer: "Cán bộ tham gia",
          accessor: "CanBoThamGia",
          disableGroupBy: true,
        },
        {
          Header: "Hình thức đào tạo",
          Footer: "Hình thức đào tạo",
          accessor: "HinhThucDaoTao",
          disableGroupBy: true,
        },
        {
          Header: "Số thành viên",
          Footer: "Số thành viên",
          accessor: "SoThanhVien",
          disableGroupBy: true,
        },
        {
          Header: "Ngày bắt đầu",
          Footer: "Ngày bắt đầu",
          accessor: "NgayBatDauFormat",
          disableGroupBy: true,
        },
        {
          Header: "Ngày kết thúc",
          Footer: "Ngày kết thúc",
          accessor: "NgayKetThucFormat",
          disableGroupBy: true,
        },
        {
          Header: "Số section",
          Footer: "Số section",
          accessor: "SoLuong",
          disableGroupBy: true,
        },
        {
          Header: "Người tạo",
          Footer: "Người tạo",
          accessor: "NguoiTao",
          disableGroupBy: true,
        },
        {
          Header: "_id",
          Footer: "_id",
          accessor: "_id",
          disableGroupBy: true,
        },
      ];
  
      if (typeLopDaoTao.startsWith("NCKH01")) {
        baseColumns.splice(5, 0, {
          Header: "Xếp loại",
          Footer: "Xếp loại",
          accessor: "XepLoai",
          disableGroupBy: true,
        });
      }
  
      if (typeLopDaoTao.startsWith("NCKH02") || typeLopDaoTao.startsWith("NCKH03")) {
        baseColumns.splice(5, 0, {
          Header: "Tạp chí",
          Footer: "Tạp chí",
          accessor: "TenTapChi",
          disableGroupBy: true,
        });
      }
  

      return baseColumns;
    },
    [typeLopDaoTao]
  );

  const dispatch = useDispatch();
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    dispatch(getAllLopDaoTao());
  }, [dispatch]);

  const { LopDaoTaos } = useSelector((state) => state.daotao);

  const data = useMemo(
    () => LopDaoTaos.filter((item) => item.MaHinhThucCapNhat === typeLopDaoTao),
    [LopDaoTaos, typeLopDaoTao]
  );
  const renderRowSubComponent = useCallback(
    ({ row }) => <LopDaoTaoView data={data[Number(row.id)]} />,
    [data]
  );
  const quyDoiLoaiDaoTao = (maLoai) => {
    const hinhthuc = HinhThucCapNhat.find((item) => item.Ma === maLoai);
    if (hinhthuc?.TenBenhVien) return hinhthuc.TenBenhVien;
    else return "Lớp đào tạo";
  };
  //   const quyDoiLoaiDaoTao =(maLoai) =>{
  //     switch (maLoai) {
  //         case "ĐT01":
  //             return "khóa đào tạo ngắn hạn";
  //         case "ĐT02":
  //             return "hội nghị ,hội thảo tại viện";
  //         case "ĐT03":
  //             return "hội thảo ngoại viện tuyến trên";
  //         case "ĐT08":
  //             return "soạn thảo quy trình chuyên môn";
  //         case "ĐT04":
  //             return "soạn thảo quy phạm pháp luật ban hành quy trình chuyên môn";
  //         case "ĐT05":
  //             return "giảng dạy y khoa";
  //         case "ĐT07":
  //             return "giảng dạy cấp chứng chỉ tuyến trên";
  //         case "ĐT09":
  //             return "hội chẩn ca bệnh";
  //         case "NCKH06":
  //             return "sinh hoạt khoa học";
  //         case "NCKH01":
  //             return "đề tài cấp cơ sở";
  //         case "NCKH04":
  //             return "đề tài cấp tỉnh/bộ/quốc gia";
  //         case "NCKH02":
  //             return "đăng báo quốc tế";
  //         case "NCKH03":
  //             return "đăng báo trong nước";
  //         case "NCKH07":
  //             return "tập huấn, hội nghị, hội thảo";
  //         case "NCKH08":
  //             return "tập san thông tin thuốc, y học thực hành";
  //         case "ĐT061":
  //             return "đào tạo thạc sĩ";
  //         case "ĐT062":
  //             return "đào tạo tiến sĩ";
  //         case "ĐT063":
  //             return "bác sĩ chuyên khoa I";
  //         case "ĐT064":
  //             return "bác sĩ chuyên khoa II";
  //         default:
  //             return "lớp đào tạo";
  //     }
  // }
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title={`Quản lý ${quyDoiLoaiDaoTao(typeLopDaoTao)}`}>
          <ScrollX sx={{ height: 700 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <AddLopDaoTao mahinhthuccapnhat={typeLopDaoTao} />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default LopDaoTaoTableByType;
