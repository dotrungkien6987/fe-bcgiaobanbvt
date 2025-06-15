import React, {   useState } from "react";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import {
  Box,
  Stack,
  
  Dialog,
  DialogTitle,
  DialogContent,
  
  DialogActions,
  Button,
  Card,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";

import { addBenhNhanToList } from "features/BaoCaoNgay/baocaongay_riengtheokhoaSlice";
import ImageUploader from "components/form/ImageUploader";
import ImageListDisplay from "components/form/ImageListDisplay";
import { FormProvider, FRadioGroup, FTextField } from "components/form";

const yupSchema = Yup.object().shape({
  TenBenhNhan: Yup.string().required("Bắt buộc nhập tên"),
});

function BenhNhanInsertFormRieng({
  open,
  tenLoaiBN,
  loaiBN,
  handleClose,
  handleSave,
  benhnhan,
  handleChange,
}) {
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      TenBenhNhan: benhnhan.TenBenhNhan || "",
      Tuoi: benhnhan.Tuoi || "",
      DiaChi: benhnhan.DiaChi || "",
      VaoVien: benhnhan.VaoVien || "",
      GioiTinh: benhnhan.GioiTinh || "",
      LyDoVV: benhnhan.LyDoVV || "",
      DienBien: benhnhan.DienBien || "",
      ChanDoan: benhnhan.ChanDoan || "",
      XuTri: benhnhan.XuTri || "",
      HienTai: benhnhan.HienTai || "",
      GhiChu: benhnhan.GhiChu || "",
    },
  });
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;
  const dispatch = useDispatch();

  const resetForm = () => {
    reset();
    newImages.forEach(imageURL => URL.revokeObjectURL(imageURL));
    setImages([]); // Clear the images from Cloudinary
    setNewImages([]); // Clear the local image URLs
    setFiles([]); // Clear the file objects
  };

  const onSubmitData = (data) => {
    console.log("data", data);
    const benhnhan = { ...data, LoaiBN: loaiBN };
    benhnhan.Images = [...images];
    console.log("images", newImages);
    console.log("Saving files:", files);
    dispatch(addBenhNhanToList(benhnhan, files)).then(() => resetForm());
    console.log("image sau khi đóng", images);
    handleClose();
  };
  const [images, setImages] = useState([]); // ảnh hiển thị từ benhnhan.images đã tải lên cloud
  const [newImages, setNewImages] = useState([]); //ảnh hiển thị khi đính kèm mới trên local
  const [files, setFiles] = useState([]); //file ảnh đính kèm

 
  const handleDropNew = (acceptedFiles) => {
    console.log("acceptedfile",acceptedFiles);
    const newLocalImages = acceptedFiles.map(file => URL.createObjectURL(file));
    console.log("New Local Images:", newLocalImages);
    setNewImages((prevNewImages) => [...prevNewImages, ...newLocalImages]);
    console.log("newImages",newImages)
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  };
 
  const handleDelete = (index) => {
    if (index < images.length) {
      const newImagesList = [...images];
      newImagesList.splice(index, 1);
      setImages(newImagesList);
    } else {
      const actualIndex = index - images.length;
      const newNewImagesList = [...newImages];
      const newFilesList = [...files];
      newNewImagesList.splice(actualIndex, 1);
      newFilesList.splice(actualIndex, 1);
      setNewImages(newNewImagesList);
      setFiles(newFilesList);
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        // sx={{
        //   "& .MuiDialog-paper": {
        //     width: "1000px", // Or any other width you want
        //     height: "600px", // Or any other height you want
        //   },
        // }}
      >
        <DialogTitle id="form-dialog-title">Bệnh nhân {tenLoaiBN}</DialogTitle>
        <DialogContent>
          <Card sx={{ p: 3 }}>
            {/* onSubmit={handleSubmit(onSubmit)} */}
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(onSubmitData)}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={2}>
                  <FTextField name="TenBenhNhan" label="Tên người bệnh" />
                  <FTextField name="Tuoi" label="Tuổi" />
                  <FRadioGroup
                    name="GioiTinh"
                    options={["Nam", "Nữ"]}
                    sx={{
                      "& .MuiSvgIcon-root": {
                        fontSize: 15,
                      },
                    }}
                  />
                </Stack>
                <FTextField multiline name="DiaChi" label="Địa chỉ" />
                <FTextField multiline name="VaoVien" label="Vào viện" />
                <FTextField multiline name="LyDoVV" label="Lý do" />
                <FTextField multiline name="DienBien" label="Diễn biến" />
                <FTextField multiline name="ChanDoan" label="Chẩn đoán" />
                <FTextField multiline name="XuTri" label="Xử trí" />
                <FTextField multiline name="HienTai" label="Hiện tại" />
                <FTextField multiline name="GhiChu" label="Ghi chú" />

                <Divider />
                <Stack>
                  <ImageUploader onDrop={handleDropNew} />
                  <ImageListDisplay
                    listImage={[...images, ...newImages]}
                    onDelete={handleDelete}
                  />
                </Stack>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="small"
                    loading={isSubmitting}
                  >
                    Cập nhật
                  </LoadingButton>
                </Box>
                <Stack sx={{color:"#bb1515"}}>
                  Chú ý nhớ Click nút Lưu bên ngoài form này tránh mất dữ liệu !
                  </Stack>
              </Stack>
            </FormProvider>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default BenhNhanInsertFormRieng;
