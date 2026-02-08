import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Bar } from 'recharts';
import { fetchInventoryLevels, fetchInboundOrders } from '../services/dataService';

export default function SupplyChainPage() {
  const [inventory, setInventory] = useState(null);
  const [inboundOrders, setInboundOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    sku: 'CUNW-100G',
    orderSize: '',
    freightType: 'sea',
    deliveryDate: '',
    depositPaid: '',
    notes: '',
  });
  const [velocityWindow, setVelocityWindow] = useState(4); // weeks
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [invData, ordersData] = await Promise.all([
          fetchInventoryLevels(),
          fetchInboundOrders(),
        ]);
        setInventory(invData);
        setInboundOrders(ordersData);
      } catch (error) {
        console.error('Error loading supply chain data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!newOrder.orderSize || !newOrder.deliveryDate) {
      alert('Please fill in required fields');
      return;
    }

    const order = {
      id: `ord_${Date.now()}`,
      sku: newOrder.sku,
      orderSize: parseInt(newOrder.orderSize),
      freightType: newOrder.freightType,
      deliveryDate: newOrder.deliveryDate,
      depositTracking: {
        paid: parseInt(newOrder.depositPaid || 0),
        remaining: parseInt(newOrder.orderSize || 0) * 0.1 - (parseInt(newOrder.depositPaid || 0)),
      },
      notes: newOrder.notes,
      estimatedArrival: newOrder.deliveryDate,
      status: 'pending',
    };

    setInboundOrders([...inboundOrders, order]);
    setNewOrder({
      sku: 'CUNW-100G',
      orderSize: '',
      freightType: 'sea',
      deliveryDate: '',
      depositPaid: '',
      notes: '',
    });
    setShowForm(false);
  };

  const handleDeleteOrder = (id) => {
    setInboundOrders(inboundOrders.filter(o => o.id !== id));
  };

  const getStockStatus = (weeksOfCover) => {
    if (weeksOfCover < 2) return { color: '#ff6b6b', label: 'Critical' };
    if (weeksOfCover < 4) return { color: '#ffd93d', label: 'Low' };
    if (weeksOfCover < 8) return { color: '#4ecdc4', label: 'Adequate' };
    return { color: '#51cf66', label: 'High' };
  };

  const getFreightEstimate = (freightType) => {
    return freightType === 'sea' ? '2-4 weeks' : '3-5 days';
  };

  const generateTimelineData = () => {
    // Create a 12-week projection showing inventory depletion and inbound arrivals
    const today = new Date();
    const timeline = [];

    for (let i = 0; i < 84; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      timeline.push({
        date: date.toISOString().split('T')[0],
        week: Math.floor(i / 7),
      });
    }

    return timeline;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading supply chain data...</div>;
  }

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="supply-chain-page">
      {/* Header */}
      <div className="supply-chain-header">
        <h2>Supply Chain & Inventory Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '× Close' : '+ Add Inbound Order'}
        </button>
      </div>

      {/* New Order Form */}
      {showForm && (
        <div className="card order-form-card">
          <h3>Add Inbound Order</h3>
          <form onSubmit={handleAddOrder} className="order-form">
            <div className="form-row">
              <div className="form-group">
                <label>SKU *</label>
                <select
                  value={newOrder.sku}
                  onChange={(e) => setNewOrder({ ...newOrder, sku: e.target.value })}
                >
                  <option value="CUNW-100G">CUNW-100G - Sour Watermelon 100g</option>
                  <option value="CUNW-500G">CUNW-500G - Sour Watermelon 500g</option>
                  <option value="CUNP-100G">CUNP-100G - Sour Peach 100g</option>
                  <option value="CUNP-500G">CUNP-500G - Sour Peach 500g</option>
                  <option value="CUNS-100G">CUNS-100G - Strawberry 100g</option>
                  <option value="CUNS-500G">CUNS-500G - Strawberry 500g</option>
                  <option value="CUNA-100G">CUNA-100G - Green Apple 100g</option>
                  <option value="CUNA-500G">CUNA-500G - Green Apple 500g</option>
                </select>
              </div>
              <div className="form-group">
                <label>Order Size (units) *</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  placeholder="e.g., 50000"
                  value={newOrder.orderSize}
                  onChange={(e) => setNewOrder({ ...newOrder, orderSize: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Freight Type</label>
                <select
                  value={newOrder.freightType}
                  onChange={(e) => setNewOrder({ ...newOrder, freightType: e.target.value })}
                >
                  <option value="air">Air (3-5 days)</option>
                  <option value="sea">Sea (2-4 weeks)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Delivery Date *</label>
                <input
                  type="date"
                  value={newOrder.deliveryDate}
                  onChange={(e) => setNewOrder({ ...newOrder, deliveryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Deposit Paid ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Optional"
                  value={newOrder.depositPaid}
                  onChange={(e) => setNewOrder({ ...newOrder, depositPaid: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input
                  type="text"
                  placeholder="e.g., Container #, Supplier notes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-success">✓ Add Order</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Status Overview */}
      <div className="card">
        <h3>Inventory Status & Stockout Projections</h3>
        <div className="velocity-selector">
          <label>Sales Velocity Window:</label>
          <select value={velocityWindow} onChange={(e) => setVelocityWindow(parseInt(e.target.value))}>
            <option value={4}>Last 4 Weeks</option>
            <option value={8}>Last 8 Weeks</option>
            <option value={12}>Last 12 Weeks</option>
          </select>
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th style={{ textAlign: 'right' }}>On Hand</th>
              <th style={{ textAlign: 'right' }}>Monthly Velocity</th>
              <th style={{ textAlign: 'center' }}>Weeks of Cover</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th>Projected Stockout</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory?.map((item) => {
              const status = getStockStatus(item.weeksOfCover);
              const inboundForSku = inboundOrders.filter(o => o.sku === item.sku);
              const totalInbound = inboundForSku.reduce((sum, o) => sum + o.orderSize, 0);
              const updatedWeeksOfCover = totalInbound > 0
                ? ((item.onHand + totalInbound) / item.monthlySalesVelocity) * 4
                : item.weeksOfCover;

              return (
                <tr key={item.sku} className={status.label === 'Critical' ? 'row-critical' : ''}>
                  <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.sku}</td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{item.productTitle}</div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>{item.variantTitle}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '500' }}>{item.onHand.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{item.monthlySalesVelocity.toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="weeks-badge">{item.weeksOfCover.toFixed(1)}w</span>
                    {totalInbound > 0 && (
                      <span style={{ fontSize: '0.8rem', color: '#667eea', display: 'block' }}>
                        → {updatedWeeksOfCover.toFixed(1)}w
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: status.color, color: 'white' }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td>{item.projectedStockoutDate}</td>
                  <td style={{ textAlign: 'center' }}>
                    {inboundForSku.length > 0 && (
                      <span style={{ fontSize: '0.8rem', color: '#667eea', fontWeight: '600' }}>
                        {inboundForSku.length} order(s)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inbound Orders Tracker */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Inbound Orders Tracker</h3>
        {inboundOrders.length === 0 ? (
          <div className="empty-state">
            <p>📭</p>
            <p>No inbound orders scheduled</p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>Add one to start tracking</p>
          </div>
        ) : (
          <div className="inbound-orders-list">
            {inboundOrders.map((order) => (
              <div key={order.id} className="inbound-order-card">
                <div className="order-header-mini">
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{order.sku}</span>
                    <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                      {order.orderSize.toLocaleString()} units
                    </span>
                  </div>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-details-mini">
                  <div className="detail-item">
                    <span className="detail-label">Freight:</span>
                    <span>{order.freightType.toUpperCase()} ({getFreightEstimate(order.freightType)})</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Est. Arrival:</span>
                    <span>{order.deliveryDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Deposit:</span>
                    <span>
                      {order.depositTracking.paid > 0 ? `$${order.depositTracking.paid}` : 'Not paid'}
                      {order.depositTracking.remaining > 0 && ` → $${order.depositTracking.remaining.toFixed(2)} remaining`}
                    </span>
                  </div>
                  {order.notes && (
                    <div className="detail-item">
                      <span className="detail-label">Notes:</span>
                      <span>{order.notes}</span>
                    </div>
                  )}
                </div>

                <button
                  className="btn-delete-order"
                  onClick={() => handleDeleteOrder(order.id)}
                  title="Delete order"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead Time Configuration */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Lead Time Configuration</h3>
        <div className="lead-time-config">
          <div className="config-item">
            <span className="config-label">Air Freight Default:</span>
            <span className="config-value">3-5 business days</span>
          </div>
          <div className="config-item">
            <span className="config-label">Sea Freight Default:</span>
            <span className="config-value">2-4 weeks</span>
          </div>
          <div className="config-item">
            <span className="config-label">Processing Time:</span>
            <span className="config-value">3-5 business days</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '1rem' }}>
            💡 Lead times can be overridden per order when adding inbound shipments
          </p>
        </div>
      </div>

      {/* Stock Projection Timeline */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>12-Week Stock Depletion & Inbound Forecast</h3>
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px', textAlign: 'center', color: '#999' }}>
          📊 Timeline view showing projected inventory depletion and inbound shipment arrivals
        </div>
      </div>
    </div>
  );
}
