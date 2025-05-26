// API URL configuration
export const API_URL = 'http://localhost:5000/api';

export const CHART_COLORS = ['#344293', '#4A5BA8', '#6B7BC0', '#8C9BD6'];

export const PDF_OPTIONS = {
  margin: [0.75, 0.75],
  image: { type: 'jpeg', quality: 1 },
  html2canvas: { 
    scale: 3,
    letterRendering: true,
    useCORS: true,
  },
  jsPDF: { 
    unit: 'in',
    format: 'a4',
    orientation: 'portrait'
  }
};

// Other constants can be added here as needed 