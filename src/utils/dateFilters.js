/**
 * Time range filtering utilities for dashboard
 */

/**
 * Get date range for a given time period
 * @param {string} period - 'daily', 'weekly', 'mtd', or 'ytd'
 * @returns {Object} {startDate, endDate}
 */
export function getDateRange(period) {
  const today = new Date();
  const endDate = new Date(today);
  let startDate = new Date(today);

  switch (period) {
    case 'daily':
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'weekly':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'mtd':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'ytd':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      startDate = new Date(0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

/**
 * Get date range for a specific month
 * @param {string} monthKey - Format: 'YYYY-MM' (e.g., '2025-10')
 * @returns {Object} {startDate, endDate}
 */
export function getMonthDateRange(monthKey) {
  const [year, month] = monthKey.split('-');
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
}

/**
 * Get previous month's date range
 * @param {string} monthKey - Format: 'YYYY-MM' (e.g., '2025-10')
 * @returns {Object} {startDate, endDate}
 */
export function getPreviousMonthRange(monthKey) {
  const [year, month] = monthKey.split('-');
  const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const prevDate = new Date(currentDate);
  prevDate.setMonth(prevDate.getMonth() - 1);
  
  const startDate = new Date(prevDate.getFullYear(), prevDate.getMonth(), 1);
  const endDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
}

/**
 * Filter monthly trends data by time period
 * @param {Array} monthlyData - Array of monthly trend objects
 * @param {string} period - 'daily', 'weekly', 'mtd', 'ytd', or 'all'
 * @returns {Array} Filtered monthly data
 */
export function filterMonthlyData(monthlyData, period) {
  if (!monthlyData || period === 'all') return monthlyData;

  const { startDate, endDate } = getDateRange(period);

  return monthlyData.filter(month => {
    const monthDate = new Date(month.month);
    return monthDate >= startDate && monthDate <= endDate;
  });
}

/**
 * Filter monthly trends data by specific month
 * @param {Array} monthlyData - Array of monthly trend objects
 * @param {string} monthKey - Format: 'YYYY-MM' (e.g., '2025-10')
 * @returns {Array} Filtered monthly data for the selected month
 */
export function filterByMonth(monthlyData, monthKey) {
  if (!monthlyData || !monthKey || monthKey === 'all') return monthlyData;

  const { startDate, endDate } = getMonthDateRange(monthKey);

  return monthlyData.filter(month => {
    const monthDate = new Date(month.month || month.date);
    return monthDate >= startDate && monthDate <= endDate;
  });
}

/**
 * Calculate metrics from filtered data
 * @param {Array} filteredData - Filtered monthly data
 * @returns {Object} Aggregated metrics
 */
export function calculateMetrics(filteredData) {
  if (!filteredData || filteredData.length === 0) {
    return {
      total_orders: 0,
      total_revenue: 0,
      total_units: 0,
      avg_aov: 0,
      total_returns: 0
    };
  }

  const totalOrders = filteredData.reduce((sum, m) => sum + (m.orders || 0), 0);
  const totalRevenue = filteredData.reduce((sum, m) => sum + ((m.orders || 0) * (m.aov || 0)), 0);
  const totalUnits = filteredData.reduce((sum, m) => sum + ((m.orders || 0) * (m.qty_per_order || 0)), 0);
  const avgAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalReturns = filteredData.reduce((sum, m) => sum + Math.abs(m.returns || 0), 0);

  return {
    total_orders: Math.round(totalOrders),
    total_revenue: Math.round(totalRevenue * 100) / 100,
    total_units: Math.round(totalUnits * 10) / 10,
    avg_aov: Math.round(avgAOV * 100) / 100,
    total_returns: Math.round(totalReturns)
  };
}

/**
 * Get period label
 * @param {string} period - Time period key or month key (YYYY-MM)
 * @returns {string} Display label
 */
export function getPeriodLabel(period) {
  const labels = {
    daily: 'Daily',
    weekly: 'Weekly',
    mtd: 'Month to Date',
    ytd: 'Year to Date',
    all: 'All Time'
  };
  
  if (labels[period]) return labels[period];
  
  // Handle month format (YYYY-MM)
  if (period && period.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  }
  
  return period;
}

/**
 * Filter product data by time period or specific month
 * @param {Array} productData - Product data array
 * @param {Array} monthlyData - Monthly trends data
 * @param {string} period - Time period or month key (YYYY-MM)
 * @returns {Array} Products with adjusted metrics for period
 */
export function filterProductData(productData, monthlyData, period) {
  if (!productData || period === 'all') return productData;

  // Check if it's a month key (YYYY-MM format)
  const isMonthKey = period && period.match(/^\d{4}-\d{2}$/);
  const filteredMonthly = isMonthKey ? filterByMonth(monthlyData, period) : filterMonthlyData(monthlyData, period);
  
  if (filteredMonthly.length === 0) return productData;

  // Calculate the proportion of months in this period vs all months
  const allMonthsWithData = monthlyData.filter(m => m.orders > 0).length;
  const periodMonthsWithData = filteredMonthly.filter(m => m.orders > 0).length;
  const proportion = allMonthsWithData > 0 ? periodMonthsWithData / allMonthsWithData : 1;

  // Apply proportion to product units
  return productData.map(product => ({
    ...product,
    units_sold: Math.round(product.units_sold * proportion),
    period_adjusted: true
  }));
}
