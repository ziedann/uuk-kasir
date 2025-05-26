import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const generateExcel = (reportData) => {
  try {
    // Validate input data
    if (!reportData?.excelData || typeof reportData.excelData !== 'object') {
      throw new Error('Data laporan tidak valid');
    }

    const {
      monthlySales = [],
      dailyTransactions = [],
      bestSellers = [],
      stockReport = []
    } = reportData.excelData;

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Prepare data for single sheet with all sections
    const allData = [];

    // Title
    allData.push([{ v: 'LAPORAN PENJUALAN UUK KASIR', t: 's' }]);
    allData.push([{ v: `Tanggal: ${format(new Date(), 'dd MMMM yyyy', { locale: id })}`, t: 's' }]);
    allData.push([]);

    // 1. Monthly Sales Section
    allData.push([{ v: 'LAPORAN PENJUALAN BULANAN', t: 's' }]);
    allData.push(['No.', 'Bulan', 'Total Penjualan (Rp)', 'Jumlah Transaksi']);
    
    if (monthlySales && monthlySales.length > 0) {
      monthlySales.forEach((item, index) => {
        try {
          allData.push([
            index + 1,
            format(new Date(item.month), 'MMMM yyyy', { locale: id }),
            { v: parseFloat(item.totalSales || 0), t: 'n', z: '"Rp "#,##0' },
            { v: parseInt(item.transactionCount || 0), t: 'n', z: '0" transaksi"' }
          ]);
        } catch (err) {
          console.error('Error processing monthly sales row:', err);
        }
      });
    }
    allData.push([]); // Empty row for spacing
    allData.push([]); // Empty row for spacing

    // 2. Daily Transactions Section
    allData.push([{ v: 'LAPORAN TRANSAKSI MINGGU INI', t: 's' }]);
    allData.push(['No.', 'Tanggal', 'Total Penjualan (Rp)', 'Jumlah Transaksi']);

    // Get Monday of current week
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    // Create array for all weekdays
    const weekdays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekdays.push(date);
    }

    // Process daily transactions
    weekdays.forEach((date, index) => {
      const transaction = dailyTransactions.find(t => 
        format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ) || { totalSales: 0, transactionCount: 0 };

      allData.push([
        index + 1,
        format(date, 'EEEE, dd MMMM yyyy', { locale: id }),
        { v: parseFloat(transaction.totalSales || 0), t: 'n', z: '"Rp "#,##0' },
        { v: parseInt(transaction.transactionCount || 0), t: 'n', z: '0" transaksi"' }
      ]);
    });

    allData.push([]); // Empty row for spacing
    allData.push([]); // Empty row for spacing

    // 3. Best Sellers Section
    allData.push([{ v: 'LAPORAN PRODUK TERLARIS', t: 's' }]);
    allData.push(['No.', 'Nama Produk', 'Jumlah Terjual', 'Total Penjualan (Rp)']);

    if (bestSellers && bestSellers.length > 0) {
      bestSellers.forEach((item, index) => {
        try {
          allData.push([
            index + 1,
            item.productName || '',
            { v: parseInt(item.quantitySold || 0), t: 'n', z: '0" pcs"' },
            { v: parseFloat(item.totalSales || 0), t: 'n', z: '"Rp "#,##0' }
          ]);
        } catch (err) {
          console.error('Error processing best seller row:', err);
        }
      });
    }
    allData.push([]); // Empty row for spacing
    allData.push([]); // Empty row for spacing

    // 4. Stock Report Section
    allData.push([{ v: 'LAPORAN STOK PRODUK', t: 's' }]);
    allData.push(['No.', 'Nama Produk', 'Stok Tersedia', 'Stok Minimum', 'Status']);

    if (stockReport && stockReport.length > 0) {
      stockReport.forEach((item, index) => {
        try {
          const currentStock = parseInt(item.currentStock || 0);
          const minimumStock = parseInt(item.minimumStock || 0);
          const status = currentStock <= minimumStock ? 'Stok Menipis' : 'Stok Aman';
          allData.push([
            index + 1,
            item.productName || '',
            { v: currentStock, t: 'n', z: '#,##0" pcs"' },
            { v: minimumStock, t: 'n', z: '#,##0" pcs"' },
            { v: status, t: 's' }
          ]);
        } catch (err) {
          console.error('Error processing stock report row:', err);
        }
      });
    }

    // Create worksheet from all data
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No.
      { wch: 35 },  // Name/Date
      { wch: 20 },  // Total Penjualan
      { wch: 20 },  // Jumlah Transaksi
    ];

    // Style configurations
    const titleStyle = {
      font: { 
        bold: true, 
        size: 16, 
        color: { rgb: "000000" } 
      },
      fill: { 
        patternType: "solid", 
        fgColor: { rgb: "BDD7EE" } 
      },
      alignment: { 
        horizontal: "center", 
        vertical: "center" 
      },
      border: {
        top: { style: "medium" },
        bottom: { style: "medium" },
        left: { style: "medium" },
        right: { style: "medium" }
      }
    };

    const dateStyle = {
      font: { 
        bold: true, 
        size: 12 
      },
      fill: { 
        patternType: "solid", 
        fgColor: { rgb: "BDD7EE" } 
      },
      alignment: { 
        horizontal: "center", 
        vertical: "center" 
      },
      border: {
        top: { style: "medium" },
        bottom: { style: "medium" },
        left: { style: "medium" },
        right: { style: "medium" }
      }
    };

    const sectionTitleStyle = {
      font: { 
        bold: true, 
        size: 12,
        color: { rgb: "000000" }
      },
      fill: { 
        patternType: "solid", 
        fgColor: { rgb: "BDD7EE" } 
      },
      alignment: { 
        horizontal: "left", 
        vertical: "center" 
      },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    const headerStyle = {
      font: { 
        bold: true,
        color: { rgb: "000000" }
      },
      fill: { 
        patternType: "solid", 
        fgColor: { rgb: "BDD7EE" } 
      },
      alignment: { 
        horizontal: "center", 
        vertical: "center",
        wrapText: true
      },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };

    const cellStyle = {
      font: {
        color: { rgb: "000000" }
      },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      },
      alignment: { 
        vertical: "center",
        wrapText: true
      }
    };

    // Apply styles
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);

      // Helper function to get cell reference
      const getCellRef = (r, c) => XLSX.utils.encode_cell({ r, c });

      // Style main title and date
      if (ws['A1']) {
        ws['A1'].s = titleStyle;
        // Merge main title cells
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }  // Main title
        ];
      }
      if (ws['A2']) {
        ws['A2'].s = dateStyle;
        // Merge date cells if not already merged
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } });  // Date
      }

      // Style section titles and headers
      const sectionStarts = [3, 11, 19]; // Row numbers where sections start
      sectionStarts.forEach(row => {
        // Style section title
        const titleRef = getCellRef(row, 0);
        if (ws[titleRef]) {
          ws[titleRef].s = sectionTitleStyle;
          // Merge section title cells
          if (!ws['!merges']) ws['!merges'] = [];
          ws['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: 3 } });
        }

        // Style headers
        const headerRow = row + 1;
        for (let C = 0; C <= 3; C++) {
          const headerRef = getCellRef(headerRow, C);
          if (ws[headerRef]) {
            ws[headerRef].s = headerStyle;
          }
        }

        // Style data cells
        const dataEndRow = row + 8;
        for (let R = headerRow + 1; R < dataEndRow; R++) {
          for (let C = 0; C <= 3; C++) {
            const cellRef = getCellRef(R, C);
            if (ws[cellRef]) {
              ws[cellRef].s = {
                ...cellStyle,
                alignment: {
                  horizontal: C >= 2 ? "right" : "left",
                  vertical: "center",
                  wrapText: true
                }
              };
            }
          }
        }
      });
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');

    // Generate filename with current date and time
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm');
    const fileName = `Laporan_${timestamp}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);

    return true;
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw new Error(`Gagal menghasilkan file Excel: ${error.message}`);
  }
}; 