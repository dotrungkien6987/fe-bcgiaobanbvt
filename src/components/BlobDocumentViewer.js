import React, { useState, useEffect } from 'react';
import DocViewer from 'react-doc-viewer';

function BlobDocumentViewer({ documentBlob, fileType }) { // Nhận blob và fileType từ props
  const [documentUrl, setDocumentUrl] = useState(null);

  useEffect(() => {
    if (documentBlob) {
      const tempDocumentUrl = URL.createObjectURL(documentBlob); // 1. Tạo URL tạm thời từ Blob
      setDocumentUrl(tempDocumentUrl);

      // Cleanup URL khi component unmount hoặc blob thay đổi
      return () => {
        URL.revokeObjectURL(tempDocumentUrl); // 3. Giải phóng URL khi không cần thiết
      };
    }
  }, [documentBlob]);

  const docs = documentUrl ? [ // Chỉ tạo mảng docs nếu có documentUrl
    { uri: documentUrl, fileType: fileType } // 2. Sử dụng URL tạm thời làm uri
  ] : [];

  return (
    <div>
      {documentBlob ? ( // Kiểm tra blob có tồn tại trước khi render DocViewer
        <DocViewer
          documents={docs}
          config={{
            header: {
              disableHeader: true, // Tùy chỉnh header của DocViewer nếu cần
            },
          }}
          pluginRenderers={[]}
        />
      ) : (
        <p>Không có dữ liệu tài liệu Blob.</p>
      )}
    </div>
  );
}

export default BlobDocumentViewer;