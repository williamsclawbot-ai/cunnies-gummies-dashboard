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

// API call helper
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
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data.data;
  } catch (error) {
    console.error('Shopify API request failed:', error);
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
  const now = startOfDay(utcToZonedTime(new Date(), TZ));
  
  let start;
  let label = '';

  switch (timeRange) {
    case 'daily':
      start = subDays(now, 1);
      label = 'Last 24 Hours';
      break;
    case 'weekly':
      start = subDays(now, 7);
      label = 'Last 7 Days';
      break;
    case 'mtd': {
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      label = 'Month to Date';
      break;
    }
    case 'ytd': {
      start = startOfDay(new Date(now.getFullYear(), 0, 1));
      label = 'Year to Date';
      break;
    }
    case 'all':
    default:
      start = subDays(now, 180);
      label = 'All Time (180 days)';
  }

  return { start, end: now, label };
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
    const { start, end } = getDateRange(timeRange);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const comparisonStart = new Date(start.getTime() - daysDiff * 24 * 60 * 60 * 1000);

    const currentQuery = getShopifyDateQuery(start, end);
    const comparisonQuery = getShopifyDateQuery(comparisonStart, start);

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
      orders: currentOrders,
      comparison,
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
    const { start, end } = getDateRange(timeRange);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const comparisonStart = new Date(start.getTime() - daysDiff * 24 * 60 * 60 * 1000);

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

    const comparison = calculatePeriodComparison(currentSales, previousSales);

    console.log(`Sales - Current: $${currentSales.toFixed(2)}, Previous: $${previousSales.toFixed(2)}, Change: ${comparison}%`);

    return {
      sales: Math.round(currentSales * 100) / 100,
      comparison,
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

    return {
      sku,
      byDay,
      byWeek,
      byMonth,
      byQuarter,
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
    const INVENTORY_QUERY = `
      query {
        inventoryItems(first: 250) {
          edges {
            node {
              id
              sku
              tracked
              inventoryLevels(first: 10) {
                edges {
                  node {
                    id
                    available
                    location {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await callShopifyAPI(INVENTORY_QUERY);

    const inventory = (data?.inventoryItems?.edges || []).map(edge => {
      const item = edge.node;
      const available = (item.inventoryLevels?.edges || [])[0]?.node?.available || 0;

      return {
        sku: item.sku,
        onHand: available,
        tracked: item.tracked,
        lastUpdated: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      };
    });

    return inventory;
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
};
