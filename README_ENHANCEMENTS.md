# Cunnies Gummies Dashboard v2.0 - Enhancements

## Overview
This update adds comprehensive sales analytics and supply chain management capabilities to the Cunnies Gummies dashboard. The dashboard now features:

1. **Main Dashboard Overview** - KPI cards with period-over-period comparisons
2. **Enhanced Products Page** - Time-based trends with expandable SKU details
3. **New Supply Chain Page** - Inventory tracking, inbound order management, and stockout projections

## New Features

### 1. Dashboard Overview (`src/components/DashboardOverview.jsx`)

**Key Performance Indicators (KPIs):**
- Total Sales with period-over-period comparison
- Total Orders with trend indicators
- Top Product Variant showcase

**Features:**
- Time range selector (Daily, Weekly, MTD, YTD, All Time)
- Trend charts showing top 3 variants
- Top 10 variants ranked table
- Automatic period-over-period comparison calculations

**Data Flow:**
```javascript
fetchOrdersByRange(timeRange)      // Get order counts with comparison
fetchSalesByRange(timeRange)       // Get sales totals with comparison
fetchTopVariantsByRange(timeRange) // Get top 10 variants
fetchProductTimeSeries(sku, range) // Get trend data for charts
```

### 2. Enhanced Products Page (`src/components/ProductsPage.jsx`)

**Features:**
- Time range selector (consistent with dashboard)
- Expandable SKU detail rows
- Weekly, monthly, quarterly trend aggregation
- CSV export for each SKU
- Sparkline trend indicators in main table
- Summary statistics per SKU

**Expandable Row Shows:**
- Daily, weekly, monthly, quarterly sales data
- Interactive bar/line charts
- Summary statistics (avg daily, total units, etc.)
- CSV export button

**Technical Details:**
- Uses Recharts for visualizations
- Mock data generated with consistent seed-based pseudo-randomness
- Timezone-aware date bucketing (Australia/Brisbane)

### 3. New Supply Chain Page (`src/components/SupplyChainPage.jsx`)

**Inventory Management:**
- Stock on hand per SKU
- Monthly sales velocity tracking
- Weeks of cover calculation
- Projected stockout dates
- Stock status indicators (Critical, Low, Adequate, High)

**Inbound Order Tracking:**
- Add new inbound orders with:
  - SKU selection
  - Order size (units)
  - Freight type (Air/Sea) with estimated delivery times
  - Delivery date
  - Deposit tracking
  - Notes field
- Visual order cards with status badges
- Automatic inbound order projection into weeks of cover

**Features:**
- Lead time configuration (air: 3-5 days, sea: 2-4 weeks)
- Sales velocity window selector (4/8/12 weeks)
- Updated stockout projections when inbound orders added
- Delete order functionality

## Data Service Layer

### `src/services/dataService.js`

Core functions:

```javascript
// Date range utilities
getDateRange(timeRange) // Returns { start, end, label }

// Main data fetching
fetchOrdersByRange(timeRange)           // Orders with comparison
fetchSalesByRange(timeRange)            // Sales with comparison
fetchTopVariantsByRange(timeRange)      // Top variants ranked
fetchProductTimeSeries(sku, timeRange)  // Multi-granularity trends

// Supply chain
fetchInventoryLevels()                  // Current inventory + projections
fetchInboundOrders()                    // Inbound shipment list
```

### Mock Data Structure

Product variants follow this shape:
```javascript
{
  productId: 'prod_sour_watermelon',
  productTitle: 'Sour Watermelon Gummies',
  variantId: 'var_sw_100g',
  variantTitle: '100g Pack',
  sku: 'CUNW-100G',
  unitsSold: 25777,
  grossSales: 334649.23,
  ordersCount: 10310,
  timeSeries: {
    byDay: [{date, units, grossSales, orders}, ...],
    byWeek: [{date, units, grossSales, orders}, ...],
    byMonth: [{date, units, grossSales, orders}, ...],
    byQuarter: [{date, units, grossSales, orders}, ...]
  }
}
```

Inventory structure:
```javascript
{
  sku: 'CUNW-100G',
  productId: 'prod_sour_watermelon',
  productTitle: 'Sour Watermelon Gummies',
  variantId: 'var_sw_100g',
  variantTitle: '100g Pack',
  onHand: 15000,
  monthlySalesVelocity: 2100,
  weeksOfCover: 14.3,
  projectedStockoutDate: '2026-04-15',
  lastUpdated: '2026-02-09 09:38:00'
}
```

## Reusable Components

### TimeRangeSelector (`src/components/TimeRangeSelector.jsx`)
- Consistent button styling across all pages
- Options: Daily, Weekly, MTD, YTD, All Time
- Customizable size prop
- Callback-based value updates

```jsx
<TimeRangeSelector 
  value={timeRange} 
  onChange={setTimeRange}
  size="normal"
/>
```

## Shopify Integration Points

### Ready for Integration

The data service layer is designed to accept real Shopify data. To integrate:

#### 1. Authentication
```javascript
// src/services/shopifyClient.js (new file needed)
const SHOPIFY_STORE = 'cunnies-gummies';
const SHOPIFY_ACCESS_TOKEN = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
```

#### 2. Shopify GraphQL Queries

**Fetch Orders with Sales Data:**
```graphql
{
  orders(first: 100) {
    edges {
      node {
        id
        createdAt
        totalPrice
        lineItems {
          variantId
          title
          sku
          quantity
          price
        }
      }
    }
  }
}
```

**Fetch Product Variants:**
```graphql
{
  productVariants(first: 100) {
    edges {
      node {
        id
        title
        sku
        product { id, title }
        inventoryQuantity
      }
    }
  }
}
```

#### 3. Integration Points in Data Service

Replace mock data functions with Shopify calls:

```javascript
// Currently mocking - replace with real API
export async function fetchOrdersByRange(timeRange) {
  // TODO: Call Shopify GraphQL API
  // Query orders filtered by date range
  // Aggregate orders count and sales
}

export async function fetchProductTimeSeries(sku, timeRange) {
  // TODO: Query Shopify for line items with sku
  // Bucket by day/week/month/quarter
  // Aggregate units and sales
}

export async function fetchInventoryLevels() {
  // TODO: Query productVariants for current inventory
  // Calculate weeks of cover based on sales velocity
}
```

#### 4. Authentication Setup
```javascript
// Add to .env.local (not committed)
VITE_SHOPIFY_STORE=cunnies-gummies
VITE_SHOPIFY_ACCESS_TOKEN=<your-shopify-access-token>

// src/services/shopifyClient.js
const client = new ApolloClient({
  uri: `https://${import.meta.env.VITE_SHOPIFY_STORE}.myshopify.com/admin/api/2024-01/graphql.json`,
  headers: {
    'X-Shopify-Access-Token': import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
  },
});
```

### Testing Shopify Integration
1. Create `.env.local` with credentials
2. Replace mock data calls in `dataService.js`
3. Implement caching layer (e.g., Redis) for performance
4. Add rate limiting awareness
5. Test with real data

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

### Mock Data
- Generated using seed-based pseudo-random numbers for consistency
- Respects Australia/Brisbane timezone for date bucketing
- 180-day historical data for "All Time" view
- Monthly sales velocity from real business data

### SKU List (11 Total)
1. CUNW-100G - Sour Watermelon 100g
2. CUNW-500G - Sour Watermelon 500g
3. CUNP-100G - Sour Peach 100g
4. CUNP-500G - Sour Peach 500g
5. CUNS-100G - Strawberry 100g
6. CUNS-500G - Strawberry 500g
7. CUNA-100G - Green Apple 100g
8. CUNA-500G - Green Apple 500g
9. CUNPW-BLUE - Pre-Workout Blue Razz
10. CUNPW-MANGO - Pre-Workout Mango Madness
11. CUNPW-CITRUS - Pre-Workout Citrus Surge

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## Performance Notes
- Charts are memoized to prevent unnecessary re-renders
- Large datasets (180 days) aggregated on service layer
- Consider implementing data caching for Shopify API calls
- Estimated load time: <2s with mock data, depends on Shopify API

## Files Modified/Created

### New Files
- `src/components/DashboardOverview.jsx` - Main dashboard
- `src/components/ProductsPage.jsx` - Products with trends
- `src/components/SupplyChainPage.jsx` - Supply chain management
- `src/components/TimeRangeSelector.jsx` - Reusable selector
- `src/services/dataService.js` - Data fetching & aggregation
- `README_ENHANCEMENTS.md` - This file

### Modified Files
- `src/App.jsx` - Integrated new pages
- `src/App.css` - Added comprehensive styling
- `package.json` - Added date-fns dependencies

## Future Enhancements
- Forecast modeling (regression-based)
- Seasonal adjustment
- Anomaly detection alerts
- Custom date range picker
- Dashboard customization/favorites
- Export reports (PDF)
- Webhook support for real-time updates
- Multi-currency support
- Custom lead time per supplier
- Automated reorder suggestions

## Testing Checklist

### Dashboard Overview
- [ ] Time range selector updates all metrics
- [ ] Period-over-period comparisons calculate correctly
- [ ] Top variants chart displays properly
- [ ] KPI cards load without errors

### Products Page
- [ ] Expandable rows show/hide correctly
- [ ] Charts render with mock data
- [ ] CSV export downloads correct file
- [ ] Time range updates product data

### Supply Chain
- [ ] Add inbound order form validates inputs
- [ ] New orders appear in tracker
- [ ] Stock projections update with inbound orders
- [ ] Delete order removes from list
- [ ] Weeks of cover calculations are accurate

## Support
For issues or questions about the Shopify integration, refer to:
- Shopify GraphQL Admin API docs: https://shopify.dev/api/admin-rest
- Date-fns timezone docs: https://date-fns.org/docs/Locale
