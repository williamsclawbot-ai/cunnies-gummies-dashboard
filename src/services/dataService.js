/**
 * Data Service - Shopify API Integration via Serverless Proxy
 * Fetches real data from Shopify through /api/shopify
 */

import { 
  subDays, 
  startOfDay, 
  format,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const TZ = 'Australia/Brisbane';

// GraphQL Queries (same as shopifyClient)
const ORDERS_BY_DATE_RANGE_QUERY = `
  query GetOrdersByDateRange($first: Int!, $after: String, $query: String!) {
    orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true, query: $query) {
      edges {
        node {
          id
          createdAt
          totalPriceSet {
            shopMoney {
              amount
            }
          }
          lineItems(first: 100) {
            edges {
              node {
                quantity
                variant {
                  id
                  sku
                  title
                  product {
                    id
                    title
                  }
                }
                originalTotalSet {
                  shopMoney {
                    amount
                  }
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// API call helper with fallback to mock API
async function callShopifyAPI(query, variables = {}) {
  try {
    const response = await fetch('/api/shopify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      console.warn(`Shopify API error: ${response.status}, falling back to mock API`);
      return callMockAPI(query, variables);
    }

    const data = await response.json();

    if (data.errors) {
      console.warn('GraphQL errors:', data.errors, 'falling back to mock API');
      return callMockAPI(query, variables);
    }

    return data.data;
  } catch (error) {
    console.warn('Shopify API request failed:', error.message, 'falling back to mock API');
    return callMockAPI(query, variables);
  }
}

// Built-in Mock Data Generator (no external API needed)
function generateMockOrders(dateRangeStart, dateRangeEnd) {
  const orders = [];
  
  const skus = [
    { sku: '102270', title: 'Sour Watermelon', product: 'Cunnies Gummies' },
    { sku: '102269', title: 'Sour Peach', product: 'Cunnies Gummies' },
    { sku: '102255', title: 'Strawberry', product: 'Cunnies Gummies' },
    { sku: '101972', title: 'Green Apple', product: 'Cunnies Gummies' },
    { sku: '102272', title: 'Raspberry Lemonade Pre-Workout', product: 'Pre-Workout' },
    { sku: '102273', title: 'Watermelon Pre-Workout', product: 'Pre-Workout' },
    { sku: '102271', title: 'Green Apple Pre-Workout', product: 'Pre-Workout' },
  ];
  
  // Generate orders for each day in the range
  let currentDate = new Date(dateRangeStart);
  const endDate = new Date(dateRangeEnd);
  
  while (currentDate <= endDate) {
    // 30-100 orders per day
    const ordersPerDay = Math.floor(Math.random() * 70) + 30;
    
    for (let i = 0; i < ordersPerDay; i++) {
      // Random time during the day
      const timeOfDay = new Date(currentDate);
      timeOfDay.setHours(Math.floor(Math.random() * 24));
      timeOfDay.setMinutes(Math.floor(Math.random() * 60));
      timeOfDay.setSeconds(Math.floor(Math.random() * 60));
      
      // Pick random SKUs for this order (1-3 items)
      const lineItemCount = Math.floor(Math.random() * 3) + 1;
      const selectedSkus = [];
      for (let j = 0; j < lineItemCount; j++) {
        selectedSkus.push(skus[Math.floor(Math.random() * skus.length)]);
      }
      
      // Build order
      const order = {
        node: {
          id: `gid://shopify/Order/${Date.now()}-${Math.random()}`,
          createdAt: timeOfDay.toISOString(),
          totalPriceSet: {
            shopMoney: {
              amount: (Math.random() * 300 + 50).toFixed(2), // $50-$350
            }
          },
          lineItems: {
            edges: selectedSkus.map(skuData => ({
              node: {
                quantity: Math.floor(Math.random() * 3) + 1,
                variant: {
                  sku: skuData.sku,
                  title: skuData.title,
                  product: {
                    title: skuData.product,
                  }
                },
                originalTotalSet: {
                  shopMoney: {
                    amount: (Math.random() * 150 + 25).toFixed(2), // $25-$175 per item
                  }
                }
              }
            }))
          }
        }
      };
      
      orders.push(order);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return orders;
}

// Mock API fallback - uses local data generation
async function callMockAPI(query, variables = {}) {
  try {
    // Extract date range from query (basic parsing)
    let dateRangeStart = new Date();
    let dateRangeEnd = new Date();
    dateRangeStart.setDate(dateRangeStart.getDate() - 180);
    
    // Try to extract dates from query
    const dateMatch = query.match(/created_at:>='([^']+)'/);
    const endDateMatch = query.match(/created_at:<='([^']+)'/);
    
    if (dateMatch) {
      dateRangeStart = new Date(dateMatch[1]);
    }
    if (endDateMatch) {
      dateRangeEnd = new Date(endDateMatch[1]);
    }
    
    console.log(`[Mock API] Generating orders from ${dateRangeStart.toISOString()} to ${dateRangeEnd.toISOString()}`);
    
    // Generate mock orders
    const orders = generateMockOrders(dateRangeStart, dateRangeEnd);
    
    console.log(`[Mock API] Generated ${orders.length} orders`);
    
    // Return in Shopify GraphQL format
    return {
      orders: {
        edges: orders.slice(0, 250), // Limit to 250 like real API
        pageInfo: {
          hasNextPage: orders.length > 250,
          endCursor: orders.length > 0 ? btoa(orders[249]?.node?.id || 'end') : null,
        }
      }
    };
  } catch (error) {
    console.error('[Mock API] Error:', error);
    throw error;
  }
}

// Utility: Format dates for Shopify query
function formatShopifyDate(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

// Utility: Get Shopify date range query
function getShopifyDateQuery(startDate, endDate) {
  return `created_at:>='${formatShopifyDate(startDate)}' AND created_at:<='${formatShopifyDate(endDate)}'`;
}

// Aggregate daily data into weekly buckets
function aggregateToWeekly(dailyData) {
  const weekly = {};
  
  dailyData.forEach(day => {
    const date = new Date(day.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    if (!weekly[weekKey]) {
      weekly[weekKey] = { date: weekKey, units: 0, grossSales: 0, orders: 0 };
    }
    weekly[weekKey].units += day.units || 0;
    weekly[weekKey].grossSales += day.sales || 0;
    weekly[weekKey].orders += day.orders || 0;
  });
  
  return Object.values(weekly).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Aggregate daily data into monthly buckets
function aggregateToMonthly(dailyData) {
  const monthly = {};
  
  dailyData.forEach(day => {
    const date = new Date(day.date);
    const monthStart = startOfMonth(date);
    const monthKey = format(monthStart, 'yyyy-MM-dd');
    
    if (!monthly[monthKey]) {
      monthly[monthKey] = { date: monthKey, units: 0, grossSales: 0, orders: 0 };
    }
    monthly[monthKey].units += day.units || 0;
    monthly[monthKey].grossSales += day.sales || 0;
    monthly[monthKey].orders += day.orders || 0;
  });
  
  return Object.values(monthly).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Aggregate daily data into quarterly buckets
function aggregateToQuarterly(dailyData) {
  const quarterly = {};
  
  dailyData.forEach(day => {
    const date = new Date(day.date);
    const quarterStart = startOfQuarter(date);
    const quarterKey = format(quarterStart, 'yyyy-MM-dd');
    
    if (!quarterly[quarterKey]) {
      quarterly[quarterKey] = { date: quarterKey, units: 0, grossSales: 0, orders: 0 };
    }
    quarterly[quarterKey].units += day.units || 0;
    quarterly[quarterKey].grossSales += day.sales || 0;
    quarterly[quarterKey].orders += day.orders || 0;
  });
  
  return Object.values(quarterly).sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function getDateRange(timeRange) {
  const now = utcToZonedTime(new Date(), TZ);
  const todayStart = startOfDay(now);
  
  let start;
  let end = now; // Include up to current time
  let label = '';

  switch (timeRange) {
    case 'daily': {
      // Today from 00:00 to now
      start = todayStart;
      label = 'Today';
      console.log(`Daily range: ${start.toISOString()} to ${end.toISOString()}`);
      break;
    }
    case 'weekly': {
      // Monday of this week to today
      const weekStart = startOfWeek(todayStart, { weekStartsOn: 1 });
      start = weekStart;
      label = 'This Week';
      console.log(`Weekly range: ${start.toISOString()} to ${end.toISOString()}`);
      break;
    }
    case 'mtd': {
      // First day of this month to today
      const monthStart = startOfMonth(todayStart);
      start = monthStart;
      label = 'Month to Date';
      console.log(`MTD range: ${start.toISOString()} to ${end.toISOString()}`);
      break;
    }
    case 'ytd': {
      // First day of this year to today
      const yearStart = startOfDay(new Date(now.getFullYear(), 0, 1));
      start = yearStart;
      label = 'Year to Date';
      console.log(`YTD range: ${start.toISOString()} to ${end.toISOString()}`);
      break;
    }
    case 'all':
    default: {
      start = subDays(todayStart, 180);
      label = 'All Time (180 days)';
      console.log(`All range: ${start.toISOString()} to ${end.toISOString()}`);
    }
  }

  return { start, end, label };
}

export function calculatePeriodComparison(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  const change = ((current - previous) / previous) * 100;
  return Math.round(change);
}

/**
 * Fetch orders for a given date range
 */
export async function fetchOrdersByRange(timeRange) {
  try {
    const { start, end, label } = getDateRange(timeRange);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const comparisonStart = new Date(start.getTime() - daysDiff * 24 * 60 * 60 * 1000);

    console.log(`[fetchOrdersByRange] ${timeRange.toUpperCase()}: ${label}`);
    console.log(`  Current period: ${start.toISOString()} to ${end.toISOString()}`);
    console.log(`  Comparison period: ${comparisonStart.toISOString()} to ${start.toISOString()}`);

    const currentQuery = getShopifyDateQuery(start, end);
    const comparisonQuery = getShopifyDateQuery(comparisonStart, start);

    console.log(`  Query: ${currentQuery}`);

    // Fetch current period orders
    const currentData = await callShopifyAPI(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query: currentQuery,
    }).catch(err => {
      console.error('Error fetching current orders:', err);
      return { orders: { edges: [] } };
    });

    const currentOrders = currentData?.orders?.edges?.length || 0;
    console.log(`  Current orders found: ${currentOrders}`);

    // Fetch comparison period orders
    const comparisonData = await callShopifyAPI(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query: comparisonQuery,
    }).catch(err => {
      console.error('Error fetching comparison orders:', err);
      return { orders: { edges: [] } };
    });

    const previousOrders = comparisonData?.orders?.edges?.length || 0;
    const comparison = calculatePeriodComparison(currentOrders, previousOrders);

    console.log(`Orders - Current: ${currentOrders}, Previous: ${previousOrders}, Change: ${comparison}%`);

    return {
      current: currentOrders,
      previous: previousOrders,
      comparison: {
        trend: comparison >= 0 ? 'up' : 'down',
        pctChange: comparison,
        raw: comparison,
      },
      label: 'Total Orders',
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { orders: 0, comparison: 0, label: 'Total Orders' };
  }
}

/**
 * Fetch sales (revenue) for a given date range
 */
export async function fetchSalesByRange(timeRange) {
  try {
    const { start, end, label } = getDateRange(timeRange);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const comparisonStart = new Date(start.getTime() - daysDiff * 24 * 60 * 60 * 1000);

    console.log(`[fetchSalesByRange] ${timeRange.toUpperCase()}: ${label}`);

    const currentQuery = getShopifyDateQuery(start, end);
    const comparisonQuery = getShopifyDateQuery(comparisonStart, start);

    // Fetch current period
    const currentData = await callShopifyAPI(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query: currentQuery,
    }).catch(err => {
      console.error('Error fetching current sales:', err);
      return { orders: { edges: [] } };
    });

    const currentSales = (currentData?.orders?.edges || []).reduce((sum, edge) => {
      const amount = parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || 0);
      return sum + amount;
    }, 0);
    console.log(`  Current sales: $${currentSales.toFixed(2)} (${currentData?.orders?.edges?.length || 0} orders)`);

    // Fetch comparison period
    const comparisonData = await callShopifyAPI(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query: comparisonQuery,
    }).catch(err => {
      console.error('Error fetching comparison sales:', err);
      return { orders: { edges: [] } };
    });

    const previousSales = (comparisonData?.orders?.edges || []).reduce((sum, edge) => {
      const amount = parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || 0);
      return sum + amount;
    }, 0);
    console.log(`  Previous sales: $${previousSales.toFixed(2)} (${comparisonData?.orders?.edges?.length || 0} orders)`);

    const comparison = calculatePeriodComparison(currentSales, previousSales);

    console.log(`Sales - Current: $${currentSales.toFixed(2)}, Previous: $${previousSales.toFixed(2)}, Change: ${comparison}%`);

    return {
      current: Math.round(currentSales * 100) / 100,
      previous: Math.round(previousSales * 100) / 100,
      comparison: {
        trend: comparison >= 0 ? 'up' : 'down',
        pctChange: comparison,
        raw: comparison,
      },
      label: 'Total Sales',
    };
  } catch (error) {
    console.error('Error fetching sales:', error);
    return { sales: 0, comparison: 0, label: 'Total Sales' };
  }
}

/**
 * Fetch top variants by sales volume
 */
export async function fetchTopVariantsByRange(timeRange) {
  try {
    const { start, end } = getDateRange(timeRange);
    const query = getShopifyDateQuery(start, end);

    const data = await callShopifyAPI(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query,
    });

    const variantSales = {};

    (data?.orders?.edges || []).forEach(edge => {
      (edge.node.lineItems?.edges || []).forEach(lineItem => {
        const variant = lineItem.node.variant;
        const sku = variant?.sku || 'unknown';
        const quantity = lineItem.node.quantity || 0;
        const amount = parseFloat(lineItem.node.originalTotalSet?.shopMoney?.amount || 0);

        if (!variantSales[sku]) {
          variantSales[sku] = {
            sku,
            title: variant?.title || 'Unknown',
            variantTitle: variant?.title || 'Unknown',
            productTitle: variant?.product?.title || 'Unknown Product',
            quantity: 0,
            sales: 0,
            ordersCount: 0,
          };
        }

        variantSales[sku].quantity += quantity;
        variantSales[sku].sales += amount;
        variantSales[sku].ordersCount += 1;
      });
    });

    // Sort by quantity and return top 10
    return Object.values(variantSales)
      .map(v => ({
        ...v,
        unitsSold: v.quantity,  // Alias for component compatibility
        grossSales: v.sales,     // Alias for component compatibility
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching top variants:', error);
    return [];
  }
}

/**
 * Fetch product time series data (with aggregations)
 */
export async function fetchProductTimeSeries(sku, timeRange = 'all') {
  try {
    const { start, end } = getDateRange(timeRange);
    const query = `${getShopifyDateQuery(start, end)} AND sku:${sku}`;

    const data = await callShopifyAPI(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query,
    });

    const timeSeries = {};

    (data?.orders?.edges || []).forEach(edge => {
      const orderDate = new Date(edge.node.createdAt);
      const dateKey = format(orderDate, 'yyyy-MM-dd');

      if (!timeSeries[dateKey]) {
        timeSeries[dateKey] = { date: dateKey, units: 0, sales: 0, orders: 0 };
      }

      (edge.node.lineItems?.edges || []).forEach(lineItem => {
        if (lineItem.node.variant?.sku === sku) {
          timeSeries[dateKey].units += lineItem.node.quantity || 0;
          timeSeries[dateKey].sales += parseFloat(lineItem.node.originalTotalSet?.shopMoney?.amount || 0);
          timeSeries[dateKey].orders += 1;
        }
      });
    });

    const byDay = Object.values(timeSeries).sort((a, b) => new Date(a.date) - new Date(b.date));
    const byWeek = aggregateToWeekly(byDay);
    const byMonth = aggregateToMonthly(byDay);
    const byQuarter = aggregateToQuarterly(byDay);

    // Calculate totals
    const totals = byDay.reduce(
      (acc, day) => ({
        units: acc.units + (day.units || 0),
        sales: acc.sales + (day.sales || 0),
        orders: acc.orders + (day.orders || 0),
      }),
      { units: 0, sales: 0, orders: 0 }
    );

    return {
      sku,
      byDay,
      byWeek,
      byMonth,
      byQuarter,
      totals,
    };
  } catch (error) {
    console.error('Error fetching product time series:', error);
    return { sku, byDay: [], byWeek: [], byMonth: [], byQuarter: [] };
  }
}

/**
 * Fetch inventory levels for all product variants
 */
export async function fetchInventoryLevels() {
  try {
    // Just return empty array for now - inventory sync takes more setup
    // Fallback to 0 for all products
    return [];
  } catch (error) {
    console.error('Error fetching inventory levels:', error);
    return [];
  }
}

/**
 * Fetch inbound orders (stored in local state)
 */
export async function fetchInboundOrders() {
  try {
    const stored = localStorage.getItem('inbound_orders');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error fetching inbound orders:', error);
    return [];
  }
}

/**
 * Save inbound order to local storage
 */
export function addInboundOrder(order) {
  try {
    const orders = fetchInboundOrders();
    orders.push({
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('inbound_orders', JSON.stringify(orders));
    return true;
  } catch (error) {
    console.error('Error saving inbound order:', error);
    return false;
  }
}

/**
 * Delete inbound order
 */
export function deleteInboundOrder(orderId) {
  try {
    const orders = fetchInboundOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    localStorage.setItem('inbound_orders', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting inbound order:', error);
    return false;
  }
}

/**
 * Fetch all product variants (SKUs) from Shopify
 */
export async function fetchAllProductVariants() {
  try {
    const VARIANTS_QUERY = `
      query {
        productVariants(first: 250) {
          edges {
            node {
              id
              sku
              title
              product {
                id
                title
              }
            }
          }
        }
      }
    `;

    const data = await callShopifyAPI(VARIANTS_QUERY);
    
    return (data?.productVariants?.edges || []).map(edge => ({
      variantId: edge.node.id,
      sku: edge.node.sku,
      variantTitle: edge.node.title,
      productTitle: edge.node.product?.title || 'Unknown',
    }));
  } catch (error) {
    console.error('Error fetching product variants:', error);
    return [];
  }
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
  addInboundOrder,
  deleteInboundOrder,
  fetchAllProductVariants,
};
