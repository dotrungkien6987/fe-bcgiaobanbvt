import { Chip, Dialog, DialogContent, DialogTitle, ImageList, ImageListItem, lighten, useTheme } from '@mui/material';
import React, { useState } from 'react';


const ImagesUploadChip = ({ imageUrls }) => {
    const [open, setOpen] = useState(false);
    const [chipHover, setChipHover] = useState(false)
    const handleClick = () => {
        setOpen(true);
    };
const theme = useTheme();
    const handleClose = () => {
        setOpen(false);
    };
    const handleChipMouseEnter = () => {
        setChipHover(true);
      };
      const handleChipMouseLeave = () => {
        setChipHover(false);
      };
    return (
        <div>
            <Chip label={`Số ảnh: ${imageUrls.length}`}   variant="outlined"
          sx={{
            mt: 2,
            cursor: "pointer",
            backgroundColor: chipHover ? theme.palette.primary.main : lighten(theme.palette.primary.main, 0.2),
                    // color: chipHover ? theme.palette.primary.contrastText : theme.palette.text.primary,
                    borderColor: chipHover ? theme.palette.primary.dark : theme.palette.primary.main,
          }}
          onMouseEnter={handleChipMouseEnter}
          onMouseLeave={handleChipMouseLeave} onClick={handleClick} />
            <Dialog open={open} onClose={handleClose}  maxWidth="md" fullWidth>
                <DialogTitle>Ảnh đã tải lên</DialogTitle>
                <DialogContent>
                <ImageList variant="masonry" cols={1} gap={10}>
            {imageUrls.map((img, index) => (
              <ImageListItem key={index}>
                <img src={img} alt={`Ảnh ${index + 1}`} />
              </ImageListItem>
            ))}
          </ImageList>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ImagesUploadChip;