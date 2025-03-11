import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFile, fetchFile } from '../features/File/fileSlice';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import FileViewerComponent from './FileViewerComponent';

// Cấu hình worker của pdfjs qua CDN
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileUploadView = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();
  const { fileURL, isLoading, fileName } = useSelector((state) => state.file);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      dispatch(uploadFile(selectedFile));
    }
  };

  const handleViewFile = () => {
    if (fileName) {
      dispatch(fetchFile(fileName));
    }
  };

  return (
    <Box>
      <input type="file" onChange={handleFileChange} />
      <Button variant="contained" onClick={handleUpload} disabled={isLoading}>
        {isLoading ? <CircularProgress size={24} /> : 'Upload'}
      </Button>
      <Button variant="contained" onClick={handleViewFile} disabled={isLoading || !fileName}>
        {isLoading ? <CircularProgress size={24} /> : 'View File'}
      </Button>
      {/* {fileURL && ( */}
        <Box mt={2}>
          <Typography variant="h6">Uploaded File:</Typography>
          <Box mt={2}>
            <FileViewerComponent fileUrl={fileURL} fileName={fileName} />
          </Box>
        </Box>
      {/* )} */}
    </Box>
  );
};


export default FileUploadView;