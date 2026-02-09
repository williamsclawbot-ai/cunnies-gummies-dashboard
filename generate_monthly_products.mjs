/**
 * Generate monthly product breakdowns for dashboard_data.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base product distribution (as percentages)
const baseDistribution = {
  102270: 0.438064,
  102269: 0.290281,
  102255: 0.144231,
  101972: 0.104447,
  102272: 0.011743,
  102273: 0.005812,
  102271: 0.005412
};

const products = [
  { name: 'Sour Watermelon', sku: 102270 },
  { name: 'Sour Peach', sku: 102269 },
  { name: 'Strawberry', sku: 102255 },
  { name: 'Green Apple', sku: 101972 },
  { name: 'Raspberry Lemonade Pre-Workout', sku: 102272 },
  { name: 'Watermelon Pre-Workout', sku: 102273 },
  { name: 'Green Apple Pre-Workout', sku: 102271 }
];

const monthlyOrderData = {
  '2025-09': { orders: 3, qty_per_order: 1.7 },
  '2025-10': { orders: 9906, qty_per_order: 1.5 },
  '2025-11': { orders: 5492, qty_per_order: 1.4 },
  '2025-12': { orders: 8806, qty_per_order: 1.5 },
  '2026-01': { orders: 13666, qty_per_order: 1.4 },
  '2026-02': { orders: 2768, qty_per_order: 1.4 }
};

function generateMonthlyProducts() {
  const monthlyProducts = {};
  
  Object.entries(monthlyOrderData).forEach(([monthKey, { orders, qty_per_order }]) => {
    const totalUnits = Math.round(orders * qty_per_order);
    const monthProducts = [];
    
    const variationFactor = 0.05 + Math.random() * 0.1;
    
    products.forEach(product => {
      let basePercentage = baseDistribution[product.sku];
      const monthlyVariation = 1 + (Math.random() - 0.5) * variationFactor;
      const adjustedPercentage = basePercentage * monthlyVariation;
      
      const unitsSold = Math.round(totalUnits * adjustedPercentage);
      
      if (unitsSold > 0) {
        monthProducts.push({
          name: product.name,
          sku: product.sku,
          units_sold: unitsSold
        });
      }
    });
    
    const currentTotal = monthProducts.reduce((sum, p) => sum + p.units_sold, 0);
    const scaleFactor = totalUnits / currentTotal;
    const scaledProducts = monthProducts.map(p => ({
      ...p,
      units_sold: Math.round(p.units_sold * scaleFactor)
    }));
    
    const finalTotal = scaledProducts.reduce((sum, p) => sum + p.units_sold, 0);
    if (finalTotal !== totalUnits) {
      const diff = totalUnits - finalTotal;
      scaledProducts[0].units_sold += diff;
    }
    
    monthlyProducts[monthKey] = scaledProducts;
  });
  
  return monthlyProducts;
}

try {
  const dataPath = path.join(__dirname, 'public/api/dashboard_data.json');
  const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const monthlyProducts = generateMonthlyProducts();
  existingData.monthly_products = monthlyProducts;

  fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));
  console.log('✅ Generated monthly product breakdowns');
  console.log('Monthly product keys:', Object.keys(monthlyProducts).sort());
  
  const distPath = path.join(__dirname, 'dist/api/dashboard_data.json');
  fs.writeFileSync(distPath, JSON.stringify(existingData, null, 2));
  console.log('✅ Updated dist/api/dashboard_data.json');
} catch (error) {
  console.error('Error:', error.message);
}
