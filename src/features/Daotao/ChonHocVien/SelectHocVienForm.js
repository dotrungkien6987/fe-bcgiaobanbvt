import { forwardRef, useState } from "react";

// material-ui
import {
  AppBar,
  Button,
  Dialog,
  Slide,
  Toolbar,
  Typography,
} from "@mui/material";

// project-imports
import IconButton from "components/@extended/IconButton";

// assets
import { Add } from "iconsax-react";

import SeLectHocVienTable from "./SeLectHocVienTable";
import { useDispatch, useSelector } from "react-redux";
import { addselectedHocVien } from "../daotaoSlice";
import AddIcon from "@mui/icons-material/Add";
import { is } from "date-fns/locale";
import { isNullOrEmptyObject } from "utils/heplFuntion";

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

// ==============================|| DIALOG - FULL SCREEN ||============================== //

export default function SelectHocVienForm({isHoiDong = false}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const { lopdaotaoCurrent,vaitroCurrent } = useSelector((state) => state.daotao);
  const handleClickOpen = () => {
    if (isNullOrEmptyObject(vaitroCurrent)){
      alert("Vui lòng chọn vai trò")
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleSelect = () => {
    dispatch(addselectedHocVien(selectedRows));
    setOpen(false);
  };
  return (
    <div>
      {((lopdaotaoCurrent && lopdaotaoCurrent._id) || isHoiDong) && (
        <Button
          fullWidth
          style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          variant="contained"
          startIcon={<Add />}
          onClick={handleClickOpen}
          // mb={2}
        >
          Thêm thành viên
        </Button>
      )}

      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative", boxShadow: "none" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <Add style={{ transform: "rotate(45deg)" }} />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Hủy
            </Typography>
            <Button color="primary" variant="contained" onClick={handleSelect}>
              Chọn
            </Button>
          </Toolbar>
        </AppBar>
        <SeLectHocVienTable onSelectedRowsChange={setSelectedRows} />
      </Dialog>
    </div>
  );
}
