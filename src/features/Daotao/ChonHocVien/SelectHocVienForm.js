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

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

// ==============================|| DIALOG - FULL SCREEN ||============================== //

export default function SelectHocVienForm() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const {lopdaotaoCurrent} =useSelector((state) => state.daotao);
  const handleClickOpen = () => {
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
    <>
    {lopdaotaoCurrent&&lopdaotaoCurrent._id && (
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickOpen} mb={2}>
        Thêm
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
    </>
  );
}
