import React from 'react';
import {QRCodeSVG} from 'qrcode.react';

const PrintQRCode = ({ asset ={name:'Tài sản', description:'Đỗ trung kiên',url:'http://bvdkphutho.io.vn:777/quatrinhdaotao/672adc5695a13d8cd832a3cf'} }) => {
  return (
    <div className="print-container">
      <h1>{asset.name}</h1>
      <p>{asset.description}</p>
      <div id="qr-code">
        <QRCodeSVG value={asset.url} size={200} />
      </div>
    </div>
  );
};

export default PrintQRCode;