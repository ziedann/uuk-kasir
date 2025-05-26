import axios from 'axios';
import { format, startOfWeek } from 'date-fns';
import { id } from 'date-fns/locale';
import { API_URL } from '../config/constants';

const getToken = () => localStorage.getItem('token');

export const fetchReportData = async () => {
  try {
    const token = getToken();
    const [ordersResponse, productsResponse] = await Promise.all([
      axios.get(`${API_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    const orders = ordersResponse.data;
    const products = productsResponse.data;

    // Process data for charts
    const chartData = {
      monthlySales: processMonthlySalesChart(orders),
      dailyTransactions: processDailyTransactionsChart(orders),
      bestSellers: processBestSellersChart(orders),
      stockReport: processStockReportChart(products)
    };

    // Process data for Excel
    const excelData = {
      monthlySales: processMonthlySalesExcel(orders),
      dailyTransactions: processDailyTransactionsExcel(orders),
      bestSellers: processBestSellersExcel(orders),
      stockReport: processStockReportExcel(products)
    };

    return {
      ...chartData,
      excelData
    };
  } catch (error) {
    throw new Error('Failed to fetch report data');
  }
};

// Chart data processing functions
const processMonthlySalesChart = (orders) => {
  if (!orders?.length) return [];

  const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const firstTransactionDate = new Date(sortedOrders[0].createdAt);
  const currentDate = new Date();

  const monthDiff = (currentDate.getFullYear() - firstTransactionDate.getFullYear()) * 12 
    + (currentDate.getMonth() - firstTransactionDate.getMonth());
  
  const monthsToShow = Math.min(6, monthDiff + 1);
  const monthlyData = {};

  for (let i = 0; i < monthsToShow; i++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - (monthsToShow - 1) + i,
      1
    );
    const monthKey = format(date, 'MMM yyyy', { locale: id });
    monthlyData[monthKey] = 0;
  }

  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      const monthKey = format(new Date(order.createdAt), 'MMM yyyy', { locale: id });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += order.total;
      }
    }
  });

  return Object.entries(monthlyData)
    .map(([name, total]) => ({ name, total }));
};

const processDailyTransactionsChart = (orders) => {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const dailyData = Object.fromEntries(days.map(day => [day, 0]));
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    if (orderDate >= weekStart && order.status !== 'cancelled') {
      const dayKey = format(orderDate, 'E', { locale: id }).substring(0, 3);
      dailyData[dayKey]++;
    }
  });

  return days.map(name => ({
    name,
    total: dailyData[name]
  }));
};

const processBestSellersChart = (orders) => {
  const productSales = {};

  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      order.items.forEach(item => {
        const productName = item.productName;
        productSales[productName] = (productSales[productName] || 0) + item.quantity;
      });
    }
  });

  return Object.entries(productSales)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
};

const processStockReportChart = (products) => {
  return products
    .map(product => ({
      name: product.name,
      stock: product.stock,
      lowStock: product.minStock || Math.ceil(product.stock * 0.2)
    }))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 4);
};

// Excel data processing functions
const processMonthlySalesExcel = (orders) => {
  if (!orders?.length) return [];

  const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const firstTransactionDate = new Date(sortedOrders[0].createdAt);
  const currentDate = new Date();

  const monthDiff = (currentDate.getFullYear() - firstTransactionDate.getFullYear()) * 12 
    + (currentDate.getMonth() - firstTransactionDate.getMonth());
  
  const monthsToShow = Math.min(6, monthDiff + 1);
  const monthlyData = {};

  for (let i = 0; i < monthsToShow; i++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - (monthsToShow - 1) + i,
      1
    );
    const monthKey = format(date, 'MMMM yyyy', { locale: id });
    monthlyData[monthKey] = { total: 0, count: 0 };
  }

  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      const monthKey = format(new Date(order.createdAt), 'MMMM yyyy', { locale: id });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey].total += order.total;
        monthlyData[monthKey].count += 1;
      }
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month: new Date(month),
    totalSales: data.total,
    transactionCount: data.count
  }));
};

const processDailyTransactionsExcel = (orders) => {
  if (!orders?.length) return [];

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const dailyData = {};

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateKey = format(date, 'yyyy-MM-dd');
    dailyData[dateKey] = { total: 0, count: 0 };
  }

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const dateKey = format(orderDate, 'yyyy-MM-dd');
    
    if (orderDate >= weekStart && order.status !== 'cancelled' && dailyData[dateKey]) {
      dailyData[dateKey].total += order.total;
      dailyData[dateKey].count += 1;
    }
  });

  return Object.entries(dailyData).map(([date, data]) => ({
    date: new Date(date),
    totalSales: data.total,
    transactionCount: data.count
  }));
};

const processBestSellersExcel = (orders) => {
  if (!orders?.length) return [];

  const productSales = {};

  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      order.items.forEach(item => {
        const productName = item.productName;
        if (!productSales[productName]) {
          productSales[productName] = {
            quantity: 0,
            total: 0
          };
        }
        productSales[productName].quantity += item.quantity;
        productSales[productName].total += item.price * item.quantity;
      });
    }
  });

  return Object.entries(productSales)
    .map(([productName, data]) => ({
      productName,
      quantitySold: data.quantity,
      totalSales: data.total
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 10);
};

const processStockReportExcel = (products) => {
  if (!products?.length) return [];

  return products
    .map(product => ({
      productName: product.name,
      currentStock: product.stock,
      minimumStock: product.minStock || Math.ceil(product.stock * 0.2)
    }))
    .sort((a, b) => a.currentStock - b.currentStock);
}; 