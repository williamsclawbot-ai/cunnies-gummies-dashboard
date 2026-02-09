/**
 * Data Service - Shopify API Integration
 * Fetches real data from Shopify Admin API
 */

import { shopifyClient, ORDERS_BY_DATE_RANGE_QUERY, PRODUCT_VARIANTS_QUERY, INVENTORY_LEVELS_QUERY } from './shopifyClient';
import { 
  subDays, 
  startOfDay, 
  format,
  isBefore,
  isAfter,
} from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

const TZ = 'Australia/Brisbane';

// Utility: Format dates for Shopify query
function formatShopifyDate(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

// Utility: Get Shopify date range query
function getShopifyDateQuery(startDate, endDate) {
  return `created_at:>='${formatShopifyDate(startDate)}' AND created_at:<='${formatShopifyDate(endDate)}'`;
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
    const { start: prevStart, end: prevEnd } = getDateRange('daily'); // For comparison
    
    // Adjust comparison period to be same length as current period
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const comparisonStart = new Date(start.getTime() - daysDiff * 24 * 60 * 60 * 1000);

    const currentQuery = getShopifyDateQuery(start, end);
    const comparisonQuery = getShopifyDateQuery(comparisonStart, start);

    // Fetch current period orders
    const currentData = await shopifyClient.query(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query: currentQuery,
    });

    const currentOrders = currentData?.orders?.edges?.length || 0;

    // Fetch comparison period orders
    const comparisonData = await shopifyClient.query(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query: comparisonQuery,
    });

    const previousOrders = comparisonData?.orders?.edges?.length || 0;
    const comparison = calculatePeriodComparison(currentOrders, previousOrders);

    return {
      orders: currentOrders,
      comparison,
      label: 'Total Orders',
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Return fallback structure
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
    const currentData = await shopifyClient.query(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query: currentQuery,
    });

    const currentSales = (currentData?.orders?.edges || []).reduce((sum, edge) => {
      const amount = parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || 0);
      return sum + amount;
    }, 0);

    // Fetch comparison period
    const comparisonData = await shopifyClient.query(ORDERS_BY_DATE_RANGE_QUERY, {
      first: 250,
      after: null,
      query: comparisonQuery,
    });

    const previousSales = (comparisonData?.orders?.edges || []).reduce((sum, edge) => {
      const amount = parseFloat(edge.node.totalPriceSet?.shopMoney?.amount || 0);
      return sum + amount;
    }, 0);

    const comparison = calculatePeriodComparison(currentSales, previousSales);

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

    const data = await shopifyClient.query(ORDERS_BY_DATE_RANGE_QUERY, {
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
            quantity: 0,
            sales: 0,
          };
        }

        variantSales[sku].quantity += quantity;
        variantSales[sku].sales += amount;
      });
    });

    // Sort by quantity and return top 10
    return Object.values(variantSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching top variants:', error);
    return [];
  }
}

/**
 * Fetch product time series data
 */
export async function fetchProductTimeSeries(sku, timeRange = 'all') {
  try {
    const { start, end } = getDateRange(timeRange);
    const query = `${getShopifyDateQuery(start, end)} AND sku:${sku}`;

    const data = await shopifyClient.query(ORDERS_BY_DATE_RANGE_QUERY, {
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

    return Object.values(timeSeries).sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error fetching product time series:', error);
    return [];
  }
}

/**
 * Fetch inventory levels for all product variants
 */
export async function fetchInventoryLevels() {
  try {
    const data = await shopifyClient.query(INVENTORY_LEVELS_QUERY, {
      first: 250,
      after: null,
    });

    // Process inventory data
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
 * This is not directly available from Shopify, so it's stored locally
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
