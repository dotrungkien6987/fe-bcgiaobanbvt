import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function ExportExcellTongHopTinChi({
  data,
  fileName = 'sample',
  title = ['Xuất dữ liệu',''],
  columns = []
}) {
  console.log("data", data);
  console.log("columns", columns);
  console.log("fileName", fileName);
  console.log("title", title);

  // Tạo một workbook mới
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Định dạng header của bảng
  worksheet.columns = columns.map(col => ({
    header: col.header,  // Tên cột truyền vào
    key: col.key,  // Key tương ứng với data
    width: col.width || 20,  // Chiều rộng cột
    alignment: col.alignment || { horizontal: 'center', vertical: 'middle' },  // Căn lề
    font: col.font || { bold: true }  // Font chữ
  }));

  // Thêm dữ liệu vào worksheet bắt đầu từ hàng thứ 3 (sau tiêu đề và dòng trống)
  data.forEach(item => {
    const row = {};
    columns.forEach(col => {
      row[col.key] = col.format ? col.format(item[col.key]) : item[col.key];
    });
    worksheet.addRow(row);
  });

  // Định dạng các dòng dữ liệu, bắt đầu từ hàng thứ 3
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {  // Bỏ qua tiêu đề và dòng trống
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.font = { name: 'Times New Roman' };
      });
    }
  });

  // Sau khi đổ dữ liệu, chèn tiêu đề và header
  worksheet.insertRow(1, []); // Thêm một dòng trống ở trên cùng
  worksheet.insertRow(1, columns.map(col => col.header)); // Thêm dòng header ở trên cùng

  // Định dạng header
  const headerRow = worksheet.getRow(3);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1939B7' },  // Màu xanh
    };
    cell.font = { color: { argb: 'FFFFFF' }, bold: true, name: 'Times New Roman' };  // Màu chữ trắng và đậm
    cell.alignment = { horizontal: 'center', vertical: 'middle' };  // Căn giữa
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Định dạng header
  const row4 = worksheet.getRow(4);
  row4.eachCell((cell) => {
    cell.fill = {
      
      pattern: 'solid',
    
    };
    
    cell.alignment = { horizontal: 'left', vertical: 'middle' };  // Căn giữa
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Chèn tiêu đề
  worksheet.mergeCells(1, 1, 1, columns.length);  // Trộn các ô từ cột 1 đến cột cuối
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${title[0]}\n${title[1]}`;  // Gán tiêu đề truyền từ ngoài vào
  titleCell.font = { size: 16, bold: true ,name: 'Times New Roman'};
  titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };  // Căn giữa và tự động ngắt dòng
  worksheet.getRow(1).height = 40;  // Điều chỉnh độ cao của dòng tiêu đề để hiển thị đầy đủ

  // Tạo Blob từ workbook
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Sử dụng FileSaver để tải file
  saveAs(blob, `${fileName}.xlsx`);
}