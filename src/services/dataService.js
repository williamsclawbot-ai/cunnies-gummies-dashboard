// Mock Data Service
// Generates time-series data for all metrics across configurable date ranges
// Uses Australia/Brisbane timezone (UTC+10)

import { 
  subDays, 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  startOfYear,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const TZ = 'Australia/Brisbane';

// Base product data - mirrors real Shopify structure
const products = [
  {
    productId: 'prod_sour_watermelon',
    productTitle: 'Sour Watermelon Gummies',
    variants: [
      { variantId: 'var_sw_100g', variantTitle: '100g Pack', sku: 'CUNW-100G' },
      { variantId: 'var_sw_500g', variantTitle: '500g Pack', sku: 'CUNW-500G' },
    ],
  },
  {
    productId: 'prod_sour_peach',
    productTitle: 'Sour Peach Gummies',
    variants: [
      { variantId: 'var_sp_100g', variantTitle: '100g Pack', sku: 'CUNP-100G' },
      { variantId: 'var_sp_500g', variantTitle: '500g Pack', sku: 'CUNP-500G' },
    ],
  },
  {
    productId: 'prod_strawberry',
    productTitle: 'Strawberry Gummies',
    variants: [
      { variantId: 'var_sb_100g', variantTitle: '100g Pack', sku: 'CUNS-100G' },
      { variantId: 'var_sb_500g', variantTitle: '500g Pack', sku: 'CUNS-500G' },
    ],
  },
  {
    productId: 'prod_green_apple',
    productTitle: 'Green Apple Gummies',
    variants: [
      { variantId: 'var_ga_100g', variantTitle: '100g Pack', sku: 'CUNA-100G' },
      { variantId: 'var_ga_500g', variantTitle: '500g Pack', sku: 'CUNA-500G' },
    ],
  },
  {
    productId: 'prod_pre_workout',
    productTitle: 'Pre-Workout Energy Gummies',
    variants: [
      { variantId: 'var_pw_blue', variantTitle: 'Blue Razz', sku: 'CUNPW-BLUE' },
      { variantId: 'var_pw_mango', variantTitle: 'Mango Madness', sku: 'CUNPW-MANGO' },
      { variantId: 'var_pw_citrus', variantTitle: 'Citrus Surge', sku: 'CUNPW-CITRUS' },
    ],
  },
];

// Base inventory levels (units)
const inventoryLevels = {
  'CUNW-100G': 15000,
  'CUNW-500G': 8500,
  'CUNP-100G': 12000,
  'CUNP-500G': 6200,
  'CUNS-100G': 5500,
  'CUNS-500G': 2800,
  'CUNA-100G': 4200,
  'CUNA-500G': 1900,
  'CUNPW-BLUE': 800,
  'CUNPW-MANGO': 650,
  'CUNPW-CITRUS': 520,
};

// Monthly sales velocity (units sold per month average)
const monthlySalesVelocity = {
  'CUNW-100G': 2100,
  'CUNW-500G': 1400,
  'CUNP-100G': 1200,
  'CUNP-500G': 950,
  'CUNS-100G': 480,
  'CUNS-500G': 360,
  'CUNA-100G': 320,
  'CUNA-500G': 240,
  'CUNPW-BLUE': 45,
  'CUNPW-MANGO': 38,
  'CUNPW-CITRUS': 32,
};

// Unit pricing
const pricing = {
  'CUNW-100G': 12.99,
  'CUNW-500G': 45.99,
  'CUNP-100G': 12.99,
  'CUNP-500G': 45.99,
  'CUNS-100G': 12.99,
  'CUNS-500G': 45.99,
  'CUNA-100G': 12.99,
  'CUNA-500G': 45.99,
  'CUNPW-BLUE': 22.99,
  'CUNPW-MANGO': 22.99,
  'CUNPW-CITRUS': 22.99,
};

// Pseudo-random generator seeded for consistency
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate daily sales for a SKU over a date range
function generateDailySales(sku, startDate, endDate) {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const velocity = monthlySalesVelocity[sku] || 100;
  const dailyAvg = velocity / 30;
  
  return days.map((date, idx) => {
    const seed = sku.charCodeAt(0) + date.getTime();
    const variance = 0.6 + seededRandom(seed) * 0.8; // 60% to 140% of daily average
    const units = Math.round(dailyAvg * variance);
    const price = pricing[sku] || 12.99;
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      units: Math.max(0, units),
      grossSales: Math.max(0, units * price),
      orders: Math.max(1, Math.round(units / 2.5)), // assume ~2.5 units per order
    };
  });
}

// Aggregate daily sales to weekly, monthly, quarterly
function aggregateToWeekly(dailyData) {
  const weekly = {};
  dailyData.forEach(d => {
    const date = new Date(d.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const key = format(weekStart, 'yyyy-MM-dd');
    
    if (!weekly[key]) {
      weekly[key] = { date: key, units: 0, grossSales: 0, orders: 0, days: 0 };
    }
    weekly[key].units += d.units;
    weekly[key].grossSales += d.grossSales;
    weekly[key].orders += d.orders;
    weekly[key].days += 1;
  });
  
  return Object.values(weekly);
}

function aggregateToMonthly(dailyData) {
  const monthly = {};
  dailyData.forEach(d => {
    const date = new Date(d.date);
    const monthStart = startOfMonth(date);
    const key = format(monthStart, 'yyyy-MM-dd');
    
    if (!monthly[key]) {
      monthly[key] = { date: key, units: 0, grossSales: 0, orders: 0, days: 0 };
    }
    monthly[key].units += d.units;
    monthly[key].grossSales += d.grossSales;
    monthly[key].orders += d.orders;
    monthly[key].days += 1;
  });
  
  return Object.values(monthly);
}

function aggregateToQuarterly(dailyData) {
  const quarterly = {};
  dailyData.forEach(d => {
    const date = new Date(d.date);
    const quarterStart = startOfYear(date);
    const quarter = Math.floor(date.getMonth() / 3);
    const key = format(new Date(quarterStart.getFullYear(), quarter * 3, 1), 'yyyy-MM-dd');
    
    if (!quarterly[key]) {
      quarterly[key] = { date: key, units: 0, grossSales: 0, orders: 0, days: 0 };
    }
    quarterly[key].units += d.units;
    quarterly[key].grossSales += d.grossSales;
    quarterly[key].orders += d.orders;
    quarterly[key].days += 1;
  });
  
  return Object.values(quarterly);
}

// Get date range based on filter
export function getDateRange(timeRange) {
  const now = new Date();
  const zonedNow = utcToZonedTime(now, TZ);
  
  switch (timeRange) {
    case 'daily':
      return { start: subDays(zonedNow, 1), end: zonedNow, label: 'Last 24 Hours' };
    case 'weekly':
      return { start: subDays(zonedNow, 7), end: zonedNow, label: 'Last 7 Days' };
    case 'mtd':
      return { start: startOfMonth(zonedNow), end: zonedNow, label: 'Month to Date' };
    case 'ytd':
      return { start: startOfYear(zonedNow), end: zonedNow, label: 'Year to Date' };
    case 'all':
    default:
      return { start: subDays(zonedNow, 180), end: zonedNow, label: 'All Time (180 days)' };
  }
}

// Calculate period-over-period comparison
export function calculatePeriodComparison(current, previous) {
  const change = current - previous;
  const pctChange = previous > 0 ? ((change / previous) * 100).toFixed(1) : 0;
  const trend = change >= 0 ? 'up' : 'down';
  
  return {
    change: Math.abs(change),
    pctChange: Math.abs(pctChange),
    trend,
    raw: change,
  };
}

// Main data fetch functions
export async function fetchOrdersByRange(timeRange) {
  const { start, end } = getDateRange(timeRange);
  const previousRange = getDateRange(timeRange === 'all' ? 'all' : timeRange);
  const previousStart = subDays(start, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  
  let totalOrders = 0;
  let previousOrders = 0;
  
  products.forEach(product => {
    product.variants.forEach(variant => {
      const sku = variant.sku;
      const dailySales = generateDailySales(sku, start, end);
      const previousSales = generateDailySales(sku, previousStart, start);
      
      totalOrders += dailySales.reduce((sum, d) => sum + d.orders, 0);
      previousOrders += previousSales.reduce((sum, d) => sum + d.orders, 0);
    });
  });
  
  return {
    current: totalOrders,
    previous: previousOrders,
    comparison: calculatePeriodComparison(totalOrders, previousOrders),
  };
}

export async function fetchSalesByRange(timeRange) {
  const { start, end } = getDateRange(timeRange);
  const previousStart = subDays(start, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  
  let totalSales = 0;
  let previousSales = 0;
  
  products.forEach(product => {
    product.variants.forEach(variant => {
      const sku = variant.sku;
      const dailySales = generateDailySales(sku, start, end);
      const previousDailySales = generateDailySales(sku, previousStart, start);
      
      totalSales += dailySales.reduce((sum, d) => sum + d.grossSales, 0);
      previousSales += previousDailySales.reduce((sum, d) => sum + d.grossSales, 0);
    });
  });
  
  return {
    current: totalSales,
    previous: previousSales,
    comparison: calculatePeriodComparison(totalSales, previousSales),
  };
}

export async function fetchTopVariantsByRange(timeRange) {
  const { start, end } = getDateRange(timeRange);
  
  const variants = [];
  
  products.forEach(product => {
    product.variants.forEach(variant => {
      const sku = variant.sku;
      const dailySales = generateDailySales(sku, start, end);
      const units = dailySales.reduce((sum, d) => sum + d.units, 0);
      const sales = dailySales.reduce((sum, d) => sum + d.grossSales, 0);
      const orders = dailySales.reduce((sum, d) => sum + d.orders, 0);
      
      variants.push({
        productId: product.productId,
        productTitle: product.productTitle,
        variantId: variant.variantId,
        variantTitle: variant.variantTitle,
        sku: variant.sku,
        unitsSold: units,
        grossSales: sales,
        ordersCount: orders,
      });
    });
  });
  
  return variants.sort((a, b) => b.unitsSold - a.unitsSold);
}

export async function fetchProductTimeSeries(sku, timeRange = 'all') {
  const { start, end } = getDateRange(timeRange);
  
  const byDay = generateDailySales(sku, start, end);
  const byWeek = aggregateToWeekly(byDay);
  const byMonth = aggregateToMonthly(byDay);
  const byQuarter = aggregateToQuarterly(byDay);
  
  const totals = {
    units: byDay.reduce((sum, d) => sum + d.units, 0),
    sales: byDay.reduce((sum, d) => sum + d.grossSales, 0),
    orders: byDay.reduce((sum, d) => sum + d.orders, 0),
  };
  
  return {
    sku,
    byDay,
    byWeek,
    byMonth,
    byQuarter,
    totals,
  };
}

export async function fetchInventoryLevels() {
  return Object.entries(inventoryLevels).map(([sku, units]) => {
    const monthlyVelocity = monthlySalesVelocity[sku] || 100;
    const weeksOfCover = (units / monthlyVelocity) * 4; // Convert monthly to weekly
    const projectedStockoutDate = new Date();
    projectedStockoutDate.setDate(projectedStockoutDate.getDate() + (weeksOfCover * 7));
    
    // Find product and variant info
    let productTitle = '';
    let variantTitle = '';
    let productId = '';
    let variantId = '';
    
    products.forEach(product => {
      product.variants.forEach(variant => {
        if (variant.sku === sku) {
          productTitle = product.productTitle;
          variantTitle = variant.variantTitle;
          productId = product.productId;
          variantId = variant.variantId;
        }
      });
    });
    
    return {
      sku,
      productId,
      productTitle,
      variantId,
      variantTitle,
      onHand: units,
      monthlySalesVelocity,
      weeksOfCover: parseFloat(weeksOfCover.toFixed(1)),
      projectedStockoutDate: format(projectedStockoutDate, 'yyyy-MM-dd'),
      lastUpdated: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };
  });
}

// Mock inbound orders (for supply chain tracker)
export async function fetchInboundOrders() {
  return [
    {
      id: 'ord_sea_001',
      sku: 'CUNW-100G',
      orderSize: 50000,
      freightType: 'sea',
      deliveryDate: '2026-03-15',
      depositTracking: { paid: 5000, remaining: 5000 },
      notes: 'Container from Vietnam supplier',
      estimatedArrival: '2026-03-15',
      status: 'in-transit',
    },
    {
      id: 'ord_air_001',
      sku: 'CUNP-100G',
      orderSize: 20000,
      freightType: 'air',
      deliveryDate: '2026-02-25',
      depositTracking: { paid: 3000, remaining: 0 },
      notes: 'High priority restock',
      estimatedArrival: '2026-02-25',
      status: 'shipped',
    },
  ];
}

export default {
  getDateRange,
  calculatePeriodComparison,
  fetchOrdersByRange,
  fetchSalesByRange,
  fetchTopVariantsByRange,
  fetchProductTimeSeries,
  fetchInventoryLevels,
  fetchInboundOrders,
};
