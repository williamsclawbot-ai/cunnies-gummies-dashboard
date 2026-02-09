# Cunnies Gummies - Sales Forecasting & Supply Chain Dashboard

A professional React dashboard for tracking sales metrics, forecasting demand, and managing your supply chain for Cunnies Gummies products.

---

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended - 2 minutes)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd ~/.openclaw/workspace-prod/dashboard
   vercel
   ```
   
   Follow the prompts:
   - Project name: `cunnies-gummies-dashboard`
   - Link to existing project: No
   - Deploy: Yes

   Your dashboard will be live at a Vercel URL (e.g., `https://cunnies-gummies-dashboard.vercel.app`)

3. **Update data weekly:**
   - Export new CSV from Shopify
   - Run the build script: `python3 scripts/build_dashboard.py`
   - Redeploy: `vercel`

---

### Option 2: Run Locally

1. **Install dependencies:**
   ```bash
   cd ~/.openclaw/workspace-prod/dashboard
   npm install
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```
   
   Opens at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```
   
   Creates optimized files in `dist/` folder

---

## 📊 Dashboard Features

### Overview Tab
- **Summary Cards:** Total revenue, orders, units sold, average monthly revenue
- **Revenue Trend Chart:** Monthly revenue and order counts over time
- **Forecast Card:** Next month projected orders, AOV, and revenue
- **Top Products:** Bar chart + list of best performers
- **Reorder Recommendations:** Smart order quantities based on sales velocity

### Products Tab
- **All Products Table:** Complete product list with sales volume and percentage breakdown
- **Visual Progress Bars:** Easy at-a-glance product mix

### Supply Chain Tab
- **Purchase Order Tracker:** Add, track, and visualize all purchase orders
- **Production Timeline:** Automatic date calculations (12 weeks production + shipping)
- **Shipping Methods:** Air (7 days) or Sea (6 weeks) with arrival date estimates
- **Deposit Tracking:** Keep track of 50% deposits paid for each order

---

## 🔄 Updating Dashboard Data

The dashboard reads from `output/dashboard_data.json`, which is generated from your Shopify CSV exports.

### Weekly Update Process:

1. **Export from Shopify:**
   - Go to **Admin** → **Products** → Click the menu (⋮) → **Export products**
   - Go to **Admin** → **Orders** → Click the menu (⋮) → **Export orders**
   - Save both CSVs to `data/` folder

2. **Rebuild dashboard data:**
   ```bash
   python3 scripts/build_dashboard.py
   ```

3. **Deploy updates:**
   ```bash
   vercel
   ```
   
   Or if running locally, the dev server auto-reloads.

---

## 📈 Forecasting Logic

The dashboard uses a **3-month moving average** for forecasts:

```
Forecast = Average of last 3 months' orders × Average AOV
Confidence: 70% (±20%)
```

**Best Practices:**
- Forecast accuracy improves as you accumulate more historical data
- Account for seasonality (holidays, promotions, seasonal demand)
- Adjust projections manually if you know of planned marketing campaigns

---

## 📦 Reorder Calculations

Recommended order quantity accounts for:
- **Monthly burn rate:** (Total monthly units × product percentage)
- **Lead time buffer:** 12 weeks production + 4 weeks safety stock
- **Total:** 16 weeks of inventory per order

**Example:**
- Product A sells ~5,000 units/month
- Recommended order: ~80,000 units (16 weeks)
- When to order: When current stock will deplete within 14 weeks

---

## 🛠️ Customization

### Modify Colors & Theme
Edit `src/App.css` — look for CSS custom properties:
```css
/* Change primary color */
--primary: #667eea;
--secondary: #764ba2;
```

### Add New Charts
Edit `src/components/` components. Dashboard uses **Recharts** for charting:
```jsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';
```

### Extend Product Analysis
Edit `src/components/ProductAnalysis.jsx` to add filters, sorting, or additional metrics.

---

## 📝 Environment Setup

No API keys or secrets needed! The dashboard:
- ✅ Reads static JSON data (`output/dashboard_data.json`)
- ✅ Stores supply chain data locally in browser (LocalStorage)
- ✅ Runs 100% client-side (no backend needed)

---

## 🚨 Troubleshooting

**Dashboard shows "Loading..."**
- Check that `public/api/dashboard_data.json` exists
- Ensure you ran `python3 scripts/build_dashboard.py`

**No data appears**
- Verify CSV exports from Shopify are in `data/` folder
- Re-run the build script
- Check browser console (F12) for errors

**Supply Chain orders don't persist**
- Orders are stored in browser LocalStorage
- Clearing browser data will reset them
- (Optional: Set up backend database if you need persistence)

---

## 📚 File Structure

```
dashboard/
├── src/
│   ├── App.jsx                    # Main app component
│   ├── App.css                    # Global styles
│   ├── main.jsx                   # React entry point
│   └── components/
│       ├── SummaryCards.jsx       # Metric cards
│       ├── SalesChart.jsx         # Revenue trend chart
│       ├── ProductAnalysis.jsx    # Top products
│       ├── ForecastCard.jsx       # Next month forecast
│       ├── ReorderTable.jsx       # Reorder recommendations
│       └── SupplyChainTracker.jsx # PO management
├── public/
│   └── api/
│       └── dashboard_data.json    # Generated data (auto-updated)
├── index.html                     # HTML entry point
├── package.json                   # Dependencies
├── vite.config.js                 # Build config
└── README.md                      # This file
```

---

## 🔗 Deployment Options

| Platform | Cost | Setup Time | Auto-Deploy |
|----------|------|-----------|-------------|
| **Vercel** | Free | 2 min | Optional |
| **Netlify** | Free | 3 min | Optional |
| **GitHub Pages** | Free | 5 min | Manual |
| **Your Server** | Varies | 10 min | Manual |

**Recommended:** Vercel (simplest, fastest, free tier is generous)

---

## 📞 Support

**Need help?**
- Check this README first
- Review the build script output: `python3 scripts/build_dashboard.py`
- Check browser console for JavaScript errors (F12 → Console tab)

---

**Built with React + Recharts + Vite**  
*Last updated: Feb 8, 2026*
# hls-canva-dashboard
