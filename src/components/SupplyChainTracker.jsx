import React, { useState } from 'react';

export default function SupplyChainTracker({ recommendations }) {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    orderDate: new Date().toISOString().split('T')[0],
    depositPaid: '',
    shippingMethod: 'sea'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDates = (orderDate, method) => {
    const start = new Date(orderDate);
    const completion = new Date(start);
    completion.setDate(completion.getDate() + 84); // 12 weeks

    const shipping = new Date(completion);
    const days = method === 'air' ? 7 : 42;
    shipping.setDate(shipping.getDate() + days);

    return { completion, shipping };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.product || !formData.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    const { completion, shipping } = calculateDates(formData.orderDate, formData.shippingMethod);

    const newOrder = {
      id: Date.now(),
      ...formData,
      completionDate: completion.toISOString().split('T')[0],
      arrivalDate: shipping.toISOString().split('T')[0],
      totalCost: parseInt(formData.depositPaid) * 2, // 50% deposit
      status: 'pending'
    };

    setOrders(prev => [...prev, newOrder]);
    setFormData({
      product: '',
      quantity: '',
      orderDate: new Date().toISOString().split('T')[0],
      depositPaid: '',
      shippingMethod: 'sea'
    });
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffd93d',
      production: '#4ecdc4',
      shipped: '#ff6b6b',
      arrived: '#95e1d3'
    };
    return colors[status] || '#ccc';
  };

  return (
    <div className="supply-chain-tracker">
      <div className="tracker-header">
        <h3>Purchase Orders</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ New Order'}
        </button>
      </div>

      {showForm && (
        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product</label>
            <select 
              name="product" 
              value={formData.product}
              onChange={handleInputChange}
            >
              <option value="">Select product</option>
              {recommendations.map((rec, i) => (
                <option key={i} value={rec.product}>
                  {rec.product} (SKU: {rec.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Order Date</label>
              <input 
                type="date" 
                name="orderDate"
                value={formData.orderDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>50% Deposit ($)</label>
              <input 
                type="number" 
                name="depositPaid"
                value={formData.depositPaid}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Shipping Method</label>
              <select 
                name="shippingMethod"
                value={formData.shippingMethod}
                onChange={handleInputChange}
              >
                <option value="sea">Sea (6 weeks) - $</option>
                <option value="air">Air (7 days) - $$$</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-success">
            Create Purchase Order
          </button>
        </form>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>📭 No purchase orders yet</p>
          <p>Click "New Order" to add your first PO</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h4>{order.product}</h4>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Order Date:</span>
                  <span>{new Date(order.orderDate).toLocaleDateString('en-AU')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span>{order.quantity.toLocaleString()} units</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Deposit Paid:</span>
                  <span>${parseInt(order.depositPaid).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Cost:</span>
                  <span>${order.totalCost.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Production Complete:</span>
                  <span>{new Date(order.completionDate).toLocaleDateString('en-AU')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Shipping Method:</span>
                  <span>{order.shippingMethod === 'air' ? '✈️ Air (7 days)' : '🚢 Sea (6 weeks)'}</span>
                </div>
                <div className="detail-row highlight">
                  <span className="detail-label">Expected Arrival:</span>
                  <span>{new Date(order.arrivalDate).toLocaleDateString('en-AU')}</span>
                </div>
              </div>

              <div className="order-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot">📦</div>
                  <div className="timeline-date">{new Date(order.orderDate).toLocaleDateString('en-AU')}</div>
                  <div className="timeline-label">Ordered</div>
                </div>
                <div className="timeline-arrow">→</div>
                <div className="timeline-item">
                  <div className="timeline-dot">⚙️</div>
                  <div className="timeline-date">{new Date(order.completionDate).toLocaleDateString('en-AU')}</div>
                  <div className="timeline-label">Production</div>
                </div>
                <div className="timeline-arrow">→</div>
                <div className="timeline-item">
                  <div className="timeline-dot">{order.shippingMethod === 'air' ? '✈️' : '🚢'}</div>
                  <div className="timeline-date">{new Date(order.arrivalDate).toLocaleDateString('en-AU')}</div>
                  <div className="timeline-label">Arrival</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
