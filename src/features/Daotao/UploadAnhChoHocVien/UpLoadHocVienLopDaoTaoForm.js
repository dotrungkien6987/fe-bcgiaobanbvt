import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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

import ImageUploader from "components/form/ImageUploader";
import ImageListDisplay from "components/form/ImageListDisplay";
import { getOneLopDaoTaoNhanVienByID, uploadImagesForOneLopDaoTaoNhanVien } from "../daotaoSlice";
import { set } from "lodash";

function UpLoadHocVienLopDaoTaoForm({
  open,
  tenLoaiBN,
  loaiBN,
  handleClose,
  handleSave,
  lopdaotaonhanvienID,
  handleChange,
}) {
  const dispatch = useDispatch();
  const resetForm = () => {
    newImages.forEach((imageURL) => URL.revokeObjectURL(imageURL));
    setImages([]); // Clear the images from Cloudinary
    setNewImages([]); // Clear the local image URLs
    setFiles([]); // Clear the file objects
  };

  const { lopdaotaonhanvienCurrent } = useSelector((state) => state.daotao);

  const onSubmitData = (data) => {
    console.log("data", data);
    const benhnhanUpdate = {
      ...data,

      Images: images,
    };
    console.log("images", newImages);
    console.log("lopdaotaonhanvienID", lopdaotaonhanvienID);
    console.log("Saving files:", files);
    console.log("images", images);
    dispatch(uploadImagesForOneLopDaoTaoNhanVien(lopdaotaonhanvienID, files));
    // dispatch(updateBenhNhanToList(benhnhanUpdate, files)).then(() =>
    //   resetForm()
    // );
    console.log("image sau khi đóng", images);
    handleClose();
  };
  const [images, setImages] = useState([]); // ảnh hiển thị từ benhnhan.images đã tải lên cloud
  const [newImages, setNewImages] = useState([]); //ảnh hiển thị khi đính kèm mới trên local
  const [files, setFiles] = useState([]); //file ảnh đính kèm

  useEffect(() => {
    if (lopdaotaonhanvienCurrent) {
      setImages(lopdaotaonhanvienCurrent.Images || []);
    }
  }, [lopdaotaonhanvienCurrent]);
  // useEffect(() => {
  //   if (benhnhan) {
  //     // Khi prop benhnhan thay đổi, cập nhật lại dữ liệu trong form

  //     // setImages(benhnhan.Images || []);
  //   }
  //   // const fetchImages = async () => {
  //   // Fetch or receive the images from props
  //   const InitImage = benhnhan.Images;
  //   // console.log("initimages", InitImage);
  //   // const storedImages = InitImage || [];
  //   setImages(InitImage);
  //   console.log("benhnhan in edit", benhnhan);
  //   // };

  //   // fetchImages();
  // }, [open]);

  const handleDropNew = (acceptedFiles) => {
    console.log("acceptedfile", acceptedFiles);
    const newLocalImages = acceptedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    console.log("New Local Images:", newLocalImages);

    setNewImages((prevNewImages) => [...prevNewImages, ...newLocalImages]);
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">
          {`Tải ảnh lên cho thành viên ${lopdaotaonhanvienCurrent?.NhanVienID?.Ten|| ""}`}
        </DialogTitle>
        <DialogContent>
          <Card sx={{ p: 3 }}>
            {/* onSubmit={handleSubmit(onSubmit)} */}

            <Stack spacing={1}>
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
                <Button variant="contained" size="small" onClick={onSubmitData}>
                  Cập nhật
                </Button>
              </Box>
            </Stack>
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

export default UpLoadHocVienLopDaoTaoForm;
