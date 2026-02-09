/**
 * Vercel Serverless Function - Shopify GraphQL Proxy
 * Handles all Shopify API requests securely
 * 
 * Frontend calls: POST /api/shopify with {query, variables}
 * This function makes the actual GraphQL request with the access token
 */

const SHOPIFY_STORE = process.env.VITE_SHOPIFY_STORE || 'eyhp3z-x1';
const SHOPIFY_ACCESS_TOKEN = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2024-10';

const SHOPIFY_ENDPOINT = `https://${SHOPIFY_STORE}.myshopify.com/admin/api/${API_VERSION}/graphql.json`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for missing token
  if (!SHOPIFY_ACCESS_TOKEN) {
    console.error('Missing VITE_SHOPIFY_ACCESS_TOKEN');
    return res.status(500).json({ error: 'Missing Shopify API token' });
  }

  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing query' });
  }

  try {
    const response = await fetch(SHOPIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: variables || {},
      }),
    });

    if (!response.ok) {
      console.error(`Shopify API error: ${response.status}`);
      return res.status(response.status).json({ error: `Shopify API error: ${response.status}` });
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return res.status(400).json({ errors: data.errors });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Shopify API request failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
