import { useState, useEffect } from 'react';
import { Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-toastify';

import MonthlySalesChart from '../components/charts/MonthlySalesChart';
import DailyTransactionsChart from '../components/charts/DailyTransactionsChart';
import BestSellersChart from '../components/charts/BestSellersChart';
import StockReportChart from '../components/charts/StockReportChart';
import { fetchReportData } from '../services/reportService';
import { generatePDF } from '../components/reports/PDFGenerator';
import { generateExcel } from '../components/reports/ExcelGenerator';

const Report = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState({
    monthlySales: [],
    dailyTransactions: [],
    bestSellers: [],
    stockReport: []
  });

  useEffect(() => {
    loadReportData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const data = await fetchReportData();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Gagal memuat data laporan');
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      await generatePDF(reportData);
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal mengunduh PDF');
    } finally {
      setIsExporting(false);
      setIsDropdownOpen(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);
      await generateExcel(reportData);
      toast.success('Excel berhasil diunduh');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Gagal mengunduh Excel');
    } finally {
      setIsExporting(false);
      setIsDropdownOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#344293]">Laporan</h1>
        
        {/* Dropdown Container */}
        <div className="dropdown-container relative">
          <button
            onClick={toggleDropdown}
            disabled={isExporting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#344293] hover:bg-[#2a3574] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#344293] ${
              isExporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Mengunduh...' : 'Download Laporan'}
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                    isExporting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Laporan PDF
                </button>
                <button
                  onClick={handleDownloadExcel}
                  disabled={isExporting}
                  className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                    isExporting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Laporan Excel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthlySalesChart data={reportData.monthlySales} />
        <DailyTransactionsChart data={reportData.dailyTransactions} />
        <BestSellersChart data={reportData.bestSellers} />
        <StockReportChart data={reportData.stockReport} />
      </div>
    </div>
  );
};

export default Report;