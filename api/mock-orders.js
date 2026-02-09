/**
 * Mock Orders API - Generates realistic test data with timestamps
 * Used when Shopify API is unavailable
 */

// SKU data
const SKUS = [
  { sku: 102270, title: 'Sour Watermelon', product: 'Cunnies Gummies - Sour Watermelon' },
  { sku: 102269, title: 'Sour Peach', product: 'Cunnies Gummies - Sour Peach' },
  { sku: 102255, title: 'Strawberry', product: 'Cunnies Gummies - Strawberry' },
  { sku: 101972, title: 'Green Apple', product: 'Cunnies Gummies - Green Apple' },
  { sku: 102272, title: 'Raspberry Lemonade Pre-Workout', product: 'Pre-Workout - Raspberry Lemonade' },
  { sku: 102273, title: 'Watermelon Pre-Workout', product: 'Pre-Workout - Watermelon' },
  { sku: 102271, title: 'Green Apple Pre-Workout', product: 'Pre-Workout - Green Apple' },
];

// Generate mock orders with dates
function generateMockOrders(dateRangeStart, dateRangeEnd) {
  const orders = [];
  
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
        selectedSkus.push(SKUS[Math.floor(Math.random() * SKUS.length)]);
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
                  sku: skuData.sku.toString(),
                  title: skuData.title,
                  product: {
                    title: skuData.product.split('-')[0].trim(),
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

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing query' });
  }

  try {
    // Parse the query to determine what data to return
    // For now, just generate orders for a date range if query contains date filters
    
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
    
    console.log(`Mock API - Generating orders from ${dateRangeStart.toISOString()} to ${dateRangeEnd.toISOString()}`);
    
    // Generate mock orders
    const orders = generateMockOrders(dateRangeStart, dateRangeEnd);
    
    // Return in Shopify GraphQL format
    const response = {
      data: {
        orders: {
          edges: orders.slice(0, 250), // Limit to 250 like real API
          pageInfo: {
            hasNextPage: orders.length > 250,
            endCursor: orders.length > 0 ? btoa(orders[249]?.node?.id || 'end') : null,
          }
        }
      }
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Mock API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
