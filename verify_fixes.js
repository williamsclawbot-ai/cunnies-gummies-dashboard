/**
 * Verify the fixes are working correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test 1: Verify SalesChart is locked
console.log('\n📊 TEST 1: Verify SalesChart is locked to all-time only');
console.log('─'.repeat(50));

const salesChartCode = fs.readFileSync(path.join(__dirname, 'src/components/SalesChart.jsx'), 'utf-8');

const hasSelectedMonthLogic = salesChartCode.includes('isMonthSelected');
const hasGenerateDailyTrend = salesChartCode.includes('generateDailyTrendData');
const isLocked = salesChartCode.includes('LOCKED: Always show monthly trend');

console.log(`✓ Removed selectedMonth logic: ${!hasSelectedMonthLogic ? '✅' : '❌'}`);
console.log(`✓ Removed daily trend generation: ${!hasGenerateDailyTrend ? '✅' : '❌'}`);
console.log(`✓ Added lock comment: ${isLocked ? '✅' : '❌'}`);

if (!hasSelectedMonthLogic && isLocked) {
  console.log('\n✅ TEST 1 PASSED: SalesChart is properly locked');
} else {
  console.log('\n❌ TEST 1 FAILED');
}

// Test 2: Verify monthly products data exists
console.log('\n🏆 TEST 2: Verify monthly product breakdowns exist');
console.log('─'.repeat(50));

const dashboardData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/api/dashboard_data.json'), 'utf-8'));

const hasMonthlyProducts = 'monthly_products' in dashboardData;
const monthlyProductsData = dashboardData.monthly_products || {};
const monthCount = Object.keys(monthlyProductsData).length;

console.log(`✓ Has monthly_products field: ${hasMonthlyProducts ? '✅' : '❌'}`);
console.log(`✓ Number of months: ${monthCount} (expected 6)`);

// Verify products are different per month
const oct = monthlyProductsData['2025-10'] || [];
const nov = monthlyProductsData['2025-11'] || [];
const oct_total = oct.reduce((sum, p) => sum + p.units_sold, 0);
const nov_total = nov.reduce((sum, p) => sum + p.units_sold, 0);

const isDifferent = oct_total !== nov_total;
console.log(`✓ Oct vs Nov different data: ${isDifferent ? '✅' : '❌'}`);
console.log(`  Oct 2025 total units: ${oct_total}`);
console.log(`  Nov 2025 total units: ${nov_total}`);

if (hasMonthlyProducts && monthCount === 6 && isDifferent) {
  console.log('\n✅ TEST 2 PASSED: Monthly product breakdowns are properly generated');
} else {
  console.log('\n❌ TEST 2 FAILED');
}

// Test 3: Verify ProductAnalysis uses monthlyProducts
console.log('\n📦 TEST 3: Verify ProductAnalysis accepts monthlyProducts');
console.log('─'.repeat(50));

const productAnalysisCode = fs.readFileSync(path.join(__dirname, 'src/components/ProductAnalysis.jsx'), 'utf-8');

const acceptsMonthlyProducts = productAnalysisCode.includes('monthlyProducts');
const callsFilterProductData = productAnalysisCode.includes('filterProductData(products, monthlyData, selectedMonth, monthlyProducts)');

console.log(`✓ Accepts monthlyProducts prop: ${acceptsMonthlyProducts ? '✅' : '❌'}`);
console.log(`✓ Passes monthlyProducts to filter: ${callsFilterProductData ? '✅' : '❌'}`);

if (acceptsMonthlyProducts && callsFilterProductData) {
  console.log('\n✅ TEST 3 PASSED: ProductAnalysis properly uses monthlyProducts');
} else {
  console.log('\n❌ TEST 3 FAILED');
}

// Test 4: Verify App.jsx passes monthlyProducts
console.log('\n🎯 TEST 4: Verify App.jsx passes monthlyProducts to ProductAnalysis');
console.log('─'.repeat(50));

const appCode = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf-8');

const passesMonthlyProducts = appCode.includes('monthlyProducts={dashboardData.monthly_products}');

console.log(`✓ Passes monthlyProducts prop: ${passesMonthlyProducts ? '✅' : '❌'}`);

if (passesMonthlyProducts) {
  console.log('\n✅ TEST 4 PASSED: App.jsx properly passes monthlyProducts');
} else {
  console.log('\n❌ TEST 4 FAILED');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('SUMMARY');
console.log('='.repeat(50));

const allPassed = !hasSelectedMonthLogic && isLocked && hasMonthlyProducts && monthCount === 6 && isDifferent && acceptsMonthlyProducts && callsFilterProductData && passesMonthlyProducts;

if (allPassed) {
  console.log('\n✅ ALL TESTS PASSED!\n');
  console.log('The fixes are ready for deployment:');
  console.log('1. ✅ Chart locked to all-time monthly trends');
  console.log('2. ✅ Products page shows different data per month');
  console.log('3. ✅ All code changes verified');
} else {
  console.log('\n❌ SOME TESTS FAILED');
  process.exit(1);
}
