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


import { useDispatch, useSelector } from "react-redux";

import AddIcon from "@mui/icons-material/Add";
import { is } from "date-fns/locale";
import { isNullOrEmptyObject } from "utils/heplFuntion";
import { addselectedHocVien } from "features/Daotao/daotaoSlice";
import SeLectHocVienTable from "features/Daotao/ChonHocVien/SeLectHocVienTable";
import { setNhanVienUserCurrent } from "../userSlice";
import SeLectNhanVienTable from "./SeLectNhanVienTable";

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

// ==============================|| DIALOG - FULL SCREEN ||============================== //

export default function SelectNhanVienForUserForm() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  
  const handleClickOpen = () => {
   
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleSelect = () => {
    dispatch(setNhanVienUserCurrent(selectedRows));
    setOpen(false);
  };
  return (
    <div>
     
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
        <SeLectNhanVienTable onSelectedRowsChange={setSelectedRows} />
      </Dialog>
    </div>
  );


}
