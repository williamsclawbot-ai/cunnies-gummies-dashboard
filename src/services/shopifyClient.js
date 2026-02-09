/**
 * Shopify GraphQL Admin API Client
 * Routes through Vercel serverless proxy for security + CORS
 */

class ShopifyClient {
  constructor() {
    // No token needed on frontend - it's handled by /api/shopify
  }

  async query(query, variables = {}) {
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
}

export const shopifyClient = new ShopifyClient();

// GraphQL Queries

export const ORDERS_QUERY = `
  query GetOrders($first: Int!, $after: String) {
    orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
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
                id
                title
                variantTitle
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

export const PRODUCT_VARIANTS_QUERY = `
  query GetProductVariants($first: Int!, $after: String) {
    productVariants(first: $first, after: $after) {
      edges {
        node {
          id
          sku
          title
          product {
            id
            title
          }
          inventoryQuantity
          inventoryItem {
            id
            tracked
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

export const INVENTORY_LEVELS_QUERY = `
  query GetInventoryLevels($first: Int!, $after: String) {
    inventoryItems(first: $first, after: $after) {
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const ORDERS_BY_DATE_RANGE_QUERY = `
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
