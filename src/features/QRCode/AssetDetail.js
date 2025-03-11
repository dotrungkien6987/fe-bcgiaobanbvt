import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {QRCodeSVG} from 'qrcode.react';
import PrintQRCode from './PrintQRCode';
const AssetDetail = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState({name: '', description: '', url: 'http://bvdkphutho.io.vn:777/quatrinhdaotao/672adc5695a13d8cd832a3cf'});

  useEffect(() => {
    axios.get(`//http://localhost:3000/quatrinhdaotao/`)
      .then(response => setAsset(response.data))
      .catch(error => console.error(error));
  }, [id]);

  // Hàm xử lý in mã QR code
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>In mã QR code</title>');
    printWindow.document.write('<link rel="stylesheet" href="path/to/your/css/file.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div id="print-content">');
    printWindow.document.write(document.getElementById('print-qr-code').innerHTML);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.print();
  };
//   if (!asset) return <div>Loading...</div>;

  return (
    <div>
    <h1>{asset.name}</h1>
    <p>{asset.description}</p>
    <div id="print-qr-code">
      <PrintQRCode asset={asset} />
    </div>
    <button onClick={handlePrint}>In mã QR code</button>
  </div>
  );
};

export default AssetDetail;