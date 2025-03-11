import React from 'react';
import { Box, Typography } from '@mui/material';

const FileViewer = ({ fileUrl, fileName }) => {
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      default:
        return 'unknown';
    }
  };

  const fileType = getFileType(fileName);

  return (
    <Box>
      <Typography variant="h6">File Viewer</Typography>
      {fileType === 'image' && <img src={fileUrl} alt={fileName} style={{ maxWidth: '100%' }} />}
      {fileType === 'pdf' && (
        <object data={fileUrl} type="application/pdf" width="100%" height="600px">
          <p>PDF cannot be displayed. <a href={fileUrl}>Download PDF</a></p>
        </object>
      )}
      {fileType === 'word' && (
        <object data={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`} type="application/vnd.openxmlformats-officedocument.wordprocessingml.document" width="100%" height="600px">
          <p>Word document cannot be displayed. <a href={fileUrl}>Download Word Document</a></p>
        </object>
      )}
      {fileType === 'excel' && (
        <object data={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`} type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" width="100%" height="600px">
          <p>Excel document cannot be displayed. <a href={fileUrl}>Download Excel Document</a></p>
        </object>
      )}
      {fileType === 'unknown' && (
        <Typography variant="body1">Cannot display this file type. <a href={fileUrl}>Download File</a></Typography>
      )}
    </Box>
  );
};

export default FileViewer;