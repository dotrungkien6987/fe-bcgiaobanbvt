import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    Grid,
    Modal,
    Stack,
    ThemeProvider,
    Typography,
    createTheme,
    useMediaQuery,
    useTheme,
  } from "@mui/material";
import { Card } from "iconsax-react";
  import React, { useEffect, useState } from "react";
  import { useDispatch, useSelector } from "react-redux";
import { setKhoaTaiChinhCurent } from "./userSlice";
  
  function ChonKhoaForm({ KhoaTaiChinh }) {
   
    const { khoas } = useSelector((state) => state.baocaongay);
    const [open, setOpen] = useState(false);
    const [selectedKhoas, setSelectedKhoas] = useState({});
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
    useEffect(() => {
        const initialSelected = {};
        // Ensure khoas is loaded and KhoaTaiChinh is defined and is an array
        if (khoas && Array.isArray(KhoaTaiChinh)) {
          khoas.forEach(khoa => {
            initialSelected[khoa.MaKhoa] = KhoaTaiChinh.includes(khoa.MaKhoa);
          });
          setSelectedKhoas(initialSelected);
        }
      }, [khoas, KhoaTaiChinh]);
      function getSelectedKhoaIds(selectedKhoas) {
        return Object.entries(selectedKhoas)
          .filter(([id, isSelected]) => isSelected)  // Lọc các cặp có giá trị true
          .map(([id, isSelected]) => id);  // Trích xuất và trả về _id
      }
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch()
    const handleChon = () =>{
        const chonKhoaTaiChinh = getSelectedKhoaIds(selectedKhoas)
        console.log("KHoa chon",chonKhoaTaiChinh)
        dispatch(setKhoaTaiChinhCurent(chonKhoaTaiChinh))
        setOpen(false)
    };
    const handleCheckboxChange = (makhoa) => {
      setSelectedKhoas(prev => ({ ...prev, [makhoa]: !prev[makhoa] }));
    };
  
    return (
      <Box>
        <Button variant="contained" color="secondary" onClick={handleOpen}>
          Chọn khoa
        </Button>
        
          <Modal open={open} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80vw",
                maxHeight: "80vh",
                overflowY: "auto",
                bgcolor: theme.palette.background.paper,
                boxShadow: 24,
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography variant="h6" gutterBottom align="center">
                Danh sách các Khoa báo cáo
              </Typography>
              <Stack>
                
              <Grid
                container
                spacing={3}
                direction={isSmallScreen ? "column" : "row"}
              >
                {khoas && khoas.map((khoa, index) => (
                  <Grid item xs={isSmallScreen ? 12 : 6} key={index}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedKhoas[khoa.MaKhoa] || false}
                          onChange={() => handleCheckboxChange(khoa.MaKhoa)}
                        />
                      }
                      label={khoa.TenKhoa}
                    />
                    <Divider />
                  </Grid>
                ))}
              </Grid>
              </Stack>
              <Stack sx={{flexDirection:"row",p:2}}> 
<Box sx={{flexGrow:1}}/>
              <Button variant ="contained" onClick={handleChon} >
            Chọn
          </Button>

              <Button variant ="contained" onClick={handleClose} color="error">
            Hủy
          </Button>
              </Stack>
            </Box>
          </Modal>
        
      </Box>
    );
  }
  
  export default ChonKhoaForm;
  