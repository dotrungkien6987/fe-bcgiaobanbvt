import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function ExportExcellJS({ data, fileName ='sample' }) {
  // Tạo một workbook mới
  const workbook = new ExcelJS.Workbook();
  // Thêm một worksheet mới
  const worksheet = workbook.addWorksheet('My Sheet');

  // Định dạng tiêu đề cho cột dựa trên key của đối tượng data đầu tiên
  worksheet.columns = Object.keys(data[0]).map(key => ({
    header: key.toUpperCase(),
    key: key,
    width: 20
  }));

  // Thêm dữ liệu vào worksheet
  data.forEach(item => {
    worksheet.addRow(item);
  });
  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0000' }, // Màu đỏ
    };
    cell.font = { color: { argb: 'FFFFFF' }, bold: true }; // Màu chữ trắng và đậm
  });
  // Tạo Blob từ workbook
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Sử dụng FileSaver để tải file
  saveAs(blob, `${fileName}.xlsx`);
}

// Ví dụ về cách sử dụng:
// const data = [
//   { name: 'John Doe', age: 30, city: 'New York' },
//   { name: 'Jane Doe', age: 25, city: 'Los Angeles' },
// ];
// exportToExcel(data);
