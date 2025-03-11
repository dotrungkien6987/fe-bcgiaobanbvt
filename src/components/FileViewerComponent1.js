import React from 'react';
import { Box, Typography } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import FileViewer from 'react-file-viewer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Cấu hình đường dẫn đến worker script của PDF.js
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const FileViewerComponent1 = ({ fileUrl, fileName }) => {
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
        return 'docx';
      case 'xls':
      case 'xlsx':
        return 'xlsx';
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
        <Document file={fileUrl}>
          <Page pageNumber={1} />
        </Document>
      )}
      {(fileType === 'docx' || fileType === 'xlsx') && (
        <FileViewer
          fileType={fileType}
          filePath={fileUrl}
        />
      )}
      {fileType === 'unknown' && (
        <Typography variant="body1">Cannot display this file type. <a href={fileUrl}>Download File</a></Typography>
      )}
    </Box>
  );
};

export default FileViewerComponent1;