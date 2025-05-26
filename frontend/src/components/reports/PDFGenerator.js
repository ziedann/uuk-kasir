import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PDF_OPTIONS } from '../../config/constants';

export const generatePDF = (reportData) => {
  const receipt = document.createElement('div');
  receipt.innerHTML = `
    <div style="padding: 40px; font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; color: #1f2937;">
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
        <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #344293;">Laporan Penjualan UUK KASIR</h1>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          Periode: ${reportData.monthlySales[0]?.name || '-'} - ${reportData.monthlySales[reportData.monthlySales.length - 1]?.name || '-'}
        </p>
      </div>

      <!-- Ringkasan Penjualan Bulanan -->
      <div style="margin-bottom: 40px; page-break-inside: avoid;">
        <h2 style="font-size: 18px; font-weight: 600; color: #344293; margin-bottom: 15px;">Penjualan Bulanan</h2>
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 0;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 12px 20px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Bulan</th>
                <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Total Penjualan</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.monthlySales.map(sale => `
                <tr class="hover:bg-gray-50">
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">${sale.name}</td>
                  <td style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb;">
                    Rp ${sale.total.toLocaleString()}
                  </td>
                </tr>
              `).join('')}
              <tr style="font-weight: 600; background-color: #f8fafc;">
                <td style="padding: 12px 20px;">Total Keseluruhan</td>
                <td style="padding: 12px 20px; text-align: right;">
                  Rp ${reportData.monthlySales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Transaksi Mingguan -->
      <div style="margin-bottom: 40px; page-break-inside: avoid;">
        <h2 style="font-size: 18px; font-weight: 600; color: #344293; margin-bottom: 15px;">Transaksi Minggu Ini</h2>
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 0;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 12px 20px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Hari</th>
                <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Jumlah Transaksi</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.dailyTransactions.map(day => `
                <tr class="hover:bg-gray-50">
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">${day.name}</td>
                  <td style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb;">
                    ${day.total} transaksi
                  </td>
                </tr>
              `).join('')}
              <tr style="font-weight: 600; background-color: #f8fafc;">
                <td style="padding: 12px 20px;">Total Transaksi</td>
                <td style="padding: 12px 20px; text-align: right;">
                  ${reportData.dailyTransactions.reduce((sum, day) => sum + day.total, 0)} transaksi
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Produk Terlaris -->
      <div style="margin-bottom: 40px; page-break-inside: avoid;">
        <h2 style="font-size: 18px; font-weight: 600; color: #344293; margin-bottom: 15px;">Produk Terlaris</h2>
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 0;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 12px 20px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Produk</th>
                <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Jumlah Terjual</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.bestSellers.map((product, index) => `
                <tr class="hover:bg-gray-50">
                  <td style="padding: 12px 20px; border-bottom: ${index !== reportData.bestSellers.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                    ${product.name}
                  </td>
                  <td style="padding: 12px 20px; text-align: right; border-bottom: ${index !== reportData.bestSellers.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                    ${product.value} pcs
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Laporan Stok -->
      <div style="margin-bottom: 40px; page-break-inside: avoid;">
        <h2 style="font-size: 18px; font-weight: 600; color: #344293; margin-bottom: 15px;">Laporan Stok Minimum</h2>
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 0;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 12px 20px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Produk</th>
                <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Stok Tersedia</th>
                <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Batas Minimum</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.stockReport.map((product, index) => `
                <tr class="hover:bg-gray-50">
                  <td style="padding: 12px 20px; border-bottom: ${index !== reportData.stockReport.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                    ${product.name}
                  </td>
                  <td style="padding: 12px 20px; text-align: right; border-bottom: ${index !== reportData.stockReport.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                    ${product.stock} pcs
                  </td>
                  <td style="padding: 12px 20px; text-align: right; border-bottom: ${index !== reportData.stockReport.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                    ${product.lowStock} pcs
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
        <p style="margin: 0;">Laporan ini dibuat secara otomatis oleh sistem <span style="font-weight">Kasir Kita</span></p>
        <p style="margin: 5px 0 0 0;">Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}</p>
      </div>
    </div>
  `;

  const options = {
    ...PDF_OPTIONS,
    filename: `laporan-penjualan-${format(new Date(), 'dd-MM-yyyy')}.pdf`,
  };

  return html2pdf().set(options).from(receipt).save();
}; 