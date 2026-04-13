import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class DashboardPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'admin-page-wrapper'; 
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1>Dashboard Overview</h1>
        <button class="btn btn-primary" id="btn-refresh-dash" style="background: #000; color: #fff; padding: 0.8rem 1.5rem; cursor: pointer; border: none; border-radius: 8px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Refresh Data</button>
      </div>

      <div class="vg-dashboard">
        
        <div class="vg-kpi-row">
          <div class="vg-card">
            <div class="vg-card-header">
              <span class="vg-card-title">Total Revenue</span>
              <span style="color: #d4af37; font-weight: bold;">₹</span>
            </div>
            <div style="display: flex; align-items: flex-end; gap: 1rem;">
              <div class="vg-kpi-value" id="kpi-revenue">₹0</div>
            </div>
          </div>
          
          <div class="vg-card">
            <div class="vg-card-header">
              <span class="vg-card-title">Total Orders</span>
              <span style="color: #888;">📦</span>
            </div>
            <div style="display: flex; align-items: flex-end; gap: 1rem;">
              <div class="vg-kpi-value" id="kpi-orders">0</div>
            </div>
          </div>

          <div class="vg-card">
            <div class="vg-card-header">
              <span class="vg-card-title">Total Customers</span>
              <span style="color: #888;">👤</span>
            </div>
            <div style="display: flex; align-items: flex-end; gap: 1rem;">
              <div class="vg-kpi-value" id="kpi-customers">0</div>
            </div>
          </div>
        </div>

        <div class="vg-middle-row">
          
          <div class="vg-card" style="min-height: 400px;">
            <div class="vg-card-header">
              <span class="vg-card-title">Sales Overview (Last 6 Months)</span>
              <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: #888; text-transform: uppercase;">
                <span style="display: flex; align-items: center; gap: 5px;"><div style="width: 8px; height: 8px; background: #000; border-radius: 50%;"></div> Revenue</span>
              </div>
            </div>
            <div id="dynamic-chart-container" style="width: 100%; height: 250px; border-left: 1px solid #eee; border-bottom: 1px solid #eee; margin-top: 2rem; position: relative;">
                <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <path id="realtime-svg-path" d="M0,200 L500,200" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
          </div>

          <div class="vg-card">
            <div class="vg-card-header">
              <span class="vg-card-title">Orders by Status</span>
            </div>
            
            <div id="status-bar-chart" style="display: flex; align-items: flex-end; justify-content: space-between; height: 250px; margin-top: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #eee;">
              </div>
            
            <div id="status-labels" style="display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.7rem; color: #888; text-transform: uppercase; font-weight: 700;">
               </div>
          </div>

        </div>

        <div class="vg-card" style="margin-bottom: 2rem;">
          <div class="vg-card-header">
            <span class="vg-card-title">Recent Orders</span>
          </div>
          <div class="admin-table-container" style="margin-top: 0; border: none;">
            
            <style>
              #recent-orders-wrapper table th:last-child,
              #recent-orders-wrapper table td:last-child {
                display: none !important;
              }
            </style>
            
            <div id="recent-orders-wrapper">Loading orders...</div>
          </div>
        </div>

      </div>
    `;

    setTimeout(() => {
      this.fetchDashboardData();
      document.getElementById('btn-refresh-dash')?.addEventListener('click', () => {
        const btn = document.getElementById('btn-refresh-dash') as HTMLButtonElement;
        btn.innerText = 'Refreshing...';
        this.fetchDashboardData().then(() => btn.innerText = 'Refresh Data');
      });
    }, 0);

    return this.container;
  }

  async fetchDashboardData() {
    // 1. Fetch real orders from Supabase
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (!orders) return;

    // --- KPI CALCULATION ---
    const totalRev = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    document.getElementById('kpi-revenue')!.innerText = `₹${totalRev.toLocaleString()}`;
    document.getElementById('kpi-orders')!.innerText = orders.length.toString();
    
    // 🔥 REAL-TIME CUSTOMERS FIX: Count unique customer names from the orders
    const uniqueCustomers = new Set(
      orders
        .map(o => o.customer_name)
        .filter(name => name) // Remove any empty names
        .map(name => name.trim().toLowerCase()) // Normalize names so "John" and "john " count as 1
    );
    document.getElementById('kpi-customers')!.innerText = uniqueCustomers.size.toString();

    // --- RECENT ORDERS DATAGRID ---
    const recentOrders = orders.slice(0, 5);
    const columns: ColumnDef[] = [
      { key: 'id', label: 'Order Ref', render: (val) => `<span style="font-family: monospace; font-weight: 600;">${val.substring(0,8).toUpperCase()}</span>` },
      { key: 'customer_name', label: 'Customer' },
      { key: 'status', label: 'Status', render: (val) => {
          let color = 'badge-gray';
          if (val === 'Paid' || val === 'Delivered') color = 'badge-green';
          if (val === 'Processing') color = 'badge-gray'; 
          if (val === 'Cancelled') color = 'badge-gray'; 
          return `<span class="badge ${color}">${val}</span>`;
      }},
      { key: 'total_amount', label: 'Total', render: (val) => `₹${val.toLocaleString()}` }
    ];
    
    // 🔥 ACTIONS COLUMN FIX: We removed the 3rd argument () => '' so DataGrid won't render an Actions header
    const grid = new DataGrid(columns, recentOrders);
    const wrapper = document.getElementById('recent-orders-wrapper');
    if (wrapper) wrapper.innerHTML = grid.render();

    // ... (Keep the rest of your chart/bar graph code exactly the same here) ...

    // --- REAL-TIME SALES CHART (SVG) ---
    const monthsRev = [0, 0, 0, 0, 0, 0]; 
    const now = new Date();
    
    orders.forEach(o => {
      const orderDate = new Date(o.created_at);
      const monthDiff = (now.getFullYear() - orderDate.getFullYear()) * 12 + (now.getMonth() - orderDate.getMonth());
      if (monthDiff >= 0 && monthDiff < 6) {
        monthsRev[5 - monthDiff] += (o.total_amount || 0); 
      }
    });

    const maxRev = Math.max(...monthsRev, 1000); 
    const points = monthsRev.map((rev, index) => {
      const x = (index / 5) * 500; 
      const y = 200 - ((rev / maxRev) * 170); 
      return `${x},${y}`;
    });

    const pathString = `M0,200 L${points.join(' L')}`;
    const svgPath = document.getElementById('realtime-svg-path');
    if (svgPath) svgPath.setAttribute('d', pathString);

    // --- REAL-TIME ORDER STATUS BAR GRAPH ---
    const statusCounts: Record<string, number> = {
      'Pending': 0,
      'Paid': 0,
      'Process': 0, // Shortened for 'Processing'
      'Deliver': 0, // Shortened for 'Delivered'
      'Cancel': 0   // Shortened for 'Cancelled'
    };

    // Count the exact statuses from the database
    orders.forEach(o => {
      let st = o.status || 'Pending';
      if (st === 'Processing') st = 'Process';
      if (st === 'Delivered') st = 'Deliver';
      if (st === 'Cancelled') st = 'Cancel';
      
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
      } else {
        statusCounts[st] = 1;
      }
    });

    const maxStatusCount = Math.max(...Object.values(statusCounts), 1); // Prevent divide by zero

    // Color code mapping to match Vito Ginglies luxury theme
    const chartColors: Record<string, string> = {
      'Pending': '#e0e0e0',
      'Paid': '#1e8e3e',
      'Process': '#d4af37', // Gold
      'Deliver': '#000000',
      'Cancel': '#d93025'   // Red
    };

    let barsHtml = '';
    let labelsHtml = '';

    // Generate the HTML for the bars based on the exact counts
    Object.keys(statusCounts).forEach(status => {
      const count = statusCounts[status];
      // Calculate height percentage. Minimum 2% so empty categories still show a tiny line
      const heightPct = Math.max(Math.round((count / maxStatusCount) * 100), 2); 
      const color = chartColors[status] || '#000';

      barsHtml += `
        <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 16%; height: 100%;">
          <span style="font-size: 0.85rem; font-weight: 800; margin-bottom: 8px; color: #111;">${count}</span>
          <div style="width: 100%; height: ${heightPct}%; background: ${color}; border-radius: 6px 6px 0 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"></div>
        </div>
      `;
      labelsHtml += `<span style="text-align: center; width: 16%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${status}</span>`;
    });

    const barChartEl = document.getElementById('status-bar-chart');
    const labelsEl = document.getElementById('status-labels');
    
    if (barChartEl) barChartEl.innerHTML = barsHtml;
    if (labelsEl) labelsEl.innerHTML = labelsHtml;
  }
}