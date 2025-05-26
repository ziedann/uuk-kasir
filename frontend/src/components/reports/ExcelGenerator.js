import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const generateExcel = async (reportData) => {
  try {
    // Validate input data
    if (!reportData?.excelData || typeof reportData.excelData !== 'object') {
      throw new Error('Data laporan tidak valid');
    }

    const {
      monthlySales = [],
      dailyTransactions = [],
      bestSellers = [],
    } = reportData.excelData;

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan');

    // Set column widths
    worksheet.columns = [
      { width: 5 },    // No.
      { width: 35 },   // Name/Date
      { width: 20 },   // Total Penjualan
      { width: 20 },   // Jumlah Transaksi
    ];

    // Add title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'LAPORAN PENJUALAN UUK KASIR';
    titleCell.font = { bold: true, size: 16 };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBDD7EE' }
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add date
    worksheet.mergeCells('A2:D2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`;
    dateCell.font = { bold: true, size: 12 };
    dateCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFBDD7EE' }
    };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Helper function to add section
    const addSection = (title, headers, data, startRow) => {
      // Add section title
      worksheet.mergeCells(`A${startRow}:D${startRow}`);
      const sectionTitle = worksheet.getCell(`A${startRow}`);
      sectionTitle.value = title;
      sectionTitle.font = { bold: true, size: 12 };
      sectionTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFBDD7EE' }
      };
      sectionTitle.alignment = { horizontal: 'left', vertical: 'middle' };

      // Add headers
      const headerRow = worksheet.getRow(startRow + 1);
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBDD7EE' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Add data
      data.forEach((item, index) => {
        const row = worksheet.getRow(startRow + 2 + index);
        Object.values(item).forEach((value, colIndex) => {
          const cell = row.getCell(colIndex + 1);
          
          // Handle different types of values
          if (typeof value === 'object' && value !== null) {
            if (value.formula) {
              cell.value = value.formula;
            } else {
              cell.value = value.toString();
            }
          } else {
            cell.value = value;
          }

          // Apply number format for currency columns
          if (colIndex === 2 && typeof value === 'number') { // Total Penjualan column
            cell.numFmt = '"Rp"#,##0';
          }

          // Set alignment
          if (colIndex >= 2) { // For numeric columns
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          }

          // Add borders
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      return startRow + 2 + data.length + 2; // Return next section start row
    };

    // Prepare monthly sales data
    const monthlySalesData = monthlySales.map((item, index) => ({
      no: index + 1,
      month: format(new Date(item.month), 'MMMM yyyy', { locale: id }),
      totalSales: item.totalSales || 0,
      transactionCount: `${item.transactionCount || 0} transaksi`
    }));

    // Prepare daily transactions data
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    const dailyTransactionsData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const transaction = dailyTransactions.find(t =>
        format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ) || { totalSales: 0, transactionCount: 0 };

      return {
        no: i + 1,
        date: format(date, 'EEEE, dd MMMM yyyy', { locale: id }),
        totalSales: transaction.totalSales || 0,
        transactionCount: `${transaction.transactionCount || 0} transaksi`
      };
    });

    // Prepare best sellers data
    const bestSellersData = bestSellers.map((item, index) => ({
      no: index + 1,
      name: item.productName || '',
      quantity: `${item.quantitySold || 0} pcs`,
      totalSales: item.totalSales || 0
    }));

    // Add sections
    let nextRow = 4; // Start after title and date
    nextRow = addSection(
      'LAPORAN PENJUALAN BULANAN',
      ['No.', 'Bulan', 'Total Penjualan (Rp)', 'Jumlah Transaksi'],
      monthlySalesData,
      nextRow
    );

    nextRow = addSection(
      'LAPORAN TRANSAKSI MINGGU INI',
      ['No.', 'Tanggal', 'Total Penjualan (Rp)', 'Jumlah Transaksi'],
      dailyTransactionsData,
      nextRow
    );

    nextRow = addSection(
      'LAPORAN PRODUK TERLARIS',
      ['No.', 'Nama Produk', 'Jumlah Terjual', 'Total Penjualan (Rp)'],
      bestSellersData,
      nextRow
    );

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create Blob and download
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Generate filename with current date and time
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm');
    const fileName = `Laporan_${timestamp}.xlsx`;

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw new Error(`Gagal menghasilkan file Excel: ${error.message}`);
  }
}; 