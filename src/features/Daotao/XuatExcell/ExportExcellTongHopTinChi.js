import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function ExportExcellTongHopTinChi({
  data,
  fileName = 'sample',
  title = 'Xuất dữ liệu',
  columns = []
}) {
console.log("data",data);
console.log("columns",columns);
console.log("fileName",fileName);
  // Tạo một workbook mới
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Đặt tiêu đề
  worksheet.mergeCells(1, 1, 1, columns.length);  // Trộn các ô từ cột 1 đến cột cuối
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;  // Gán tiêu đề truyền từ ngoài vào
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Cách ra 1 dòng trống
  worksheet.addRow([]);

  // Định dạng header của bảng
  worksheet.columns = columns.map(col => ({
    header: col.header,  // Tên cột truyền vào
    key: col.key,  // Key tương ứng với data
    width: col.width || 20,  // Chiều rộng cột
    alignment: col.alignment || { horizontal: 'center', vertical: 'middle' },  // Căn lề
    font: col.font || { bold: true }  // Font chữ
  }));

  // Thêm một dòng cho header
  const headerRow = worksheet.addRow(columns.map(col => col.header));

  // Định dạng header của bảng
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4CAF50' },  // Màu xanh lá cây
    };
    cell.font = { color: { argb: 'FFFFFF' }, bold: true };  // Màu chữ trắng và đậm
    cell.alignment = { horizontal: 'center', vertical: 'middle' };  // Căn giữa
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

   // Thêm dữ liệu vào worksheet
   data.forEach(item => {
    const row = {};
    columns.forEach(col => {
      row[col.key] = col.format ? col.format(item[col.key]) : item[col.key];
    });
    worksheet.addRow(row);
  });

  // Định dạng các dòng dữ liệu
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 3) {  // Bỏ qua tiêu đề và header
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    }
  });

  // Tạo Blob từ workbook
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Sử dụng FileSaver để tải file
  saveAs(blob, `${fileName}.xlsx`);
}