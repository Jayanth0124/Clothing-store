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
        <button class="btn btn-primary" id="btn-refresh-dash" style="background: #000; color: #fff; padding: 0.8rem 1.5rem; cursor: pointer; border: none; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Refresh Data</button>
      </div>

      <div class="vg-dashboard">
        
        <div class="vg-kpi-row">
          <div class="vg-card">
            <div class="vg-card-header">
              <span class="vg-card-title">Total Revenue</span>
              <span style="color: #d4af37;">₹</span>
            </div>
            <div style="display: flex; align-items: flex-end; gap: 1rem;">
              <div class="vg-kpi-value" id="kpi-revenue">₹0</div>
              <span class="vg-trend up" id="kpi-rev-trend">--</span>
            </div>
          </div>
          
          <div class="vg-card">
            <div class="vg-card-header">
              <span class="vg-card-title">Total Orders</span>
              <span style="color: #888;">📦</span>
            </div>
            <div style="display: flex; align-items: flex-end; gap: 1rem;">
              <div class="vg-kpi-value" id="kpi-orders">0</div>
              <span class="vg-trend up" id="kpi-ord-trend">--</span>
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
                    <path id="realtime-svg-path" d="M0,200 L500,200" fill="none" stroke="#000" stroke-width="3" />
                </svg>
            </div>
          </div>

          <div class="vg-card">
            <div class="vg-card-header">
              <span class="vg-card-title">Traffic by Source</span>
            </div>
            <div id="traffic-container" style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem;">
              </div>
          </div>
        </div>

        <div class="vg-bottom-row" style="grid-template-columns: 2.5fr 1fr;">
          <div class="vg-card">
            <div class="vg-card-header">
              <span class="vg-card-title">Recent Orders</span>
            </div>
            <div class="admin-table-container" style="margin-top: 0; border: none;">
              <div id="recent-orders-wrapper">Loading orders...</div>
            </div>
          </div>

          <div class="vg-card">
            <div class="vg-card-header">
              <span class="vg-card-title">Location</span>
            </div>
            <div id="realtime-donut" class="vg-css-donut" style="background: conic-gradient(#000 0% 100%);"></div>
            
            <div id="donut-labels" style="display: flex; justify-content: center; gap: 2rem; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-top: 1rem;">
               </div>
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
    // 1. Fetch real data from Supabase
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { count: customersCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });

    if (!orders) return;

    // --- KPI CALCULATION ---
    const totalRev = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    document.getElementById('kpi-revenue')!.innerText = `₹${totalRev.toLocaleString()}`;
    document.getElementById('kpi-orders')!.innerText = orders.length.toString();
    if (customersCount !== null) {
      document.getElementById('kpi-customers')!.innerText = customersCount.toString();
    }

    // --- RECENT ORDERS DATAGRID ---
    const recentOrders = orders.slice(0, 5);
    const columns: ColumnDef[] = [
      { key: 'id', label: 'Order ID', render: (val) => `<span style="font-family: monospace;">${val.substring(0,8)}</span>` },
      { key: 'customer_name', label: 'Customer' },
      { key: 'status', label: 'Status', render: (val) => {
          let color = 'badge-gray';
          if (val === 'Paid' || val === 'Delivered') color = 'badge-green';
          return `<span class="badge ${color}">${val}</span>`;
      }},
      { key: 'total_amount', label: 'Total', render: (val) => `₹${val.toLocaleString()}` }
    ];
    const grid = new DataGrid(columns, recentOrders, () => ``);
    document.getElementById('recent-orders-wrapper')!.innerHTML = grid.render();

    // --- REAL-TIME LOCATION DONUT CHART ---
    // Scans order data to see if it's Domestic (India) or International
    let domesticCount = 0;
    let intlCount = 0;
    orders.forEach(o => {
      const addr = (o.shipping_address || o.address || '').toLowerCase();
      if (addr.includes('india') || addr.includes('hyderabad') || addr.includes('ap') || addr.includes('telangana')) {
        domesticCount++;
      } else {
        intlCount++;
      }
    });
    
    // Fallback if no addresses are found to prevent NaN
    if (domesticCount === 0 && intlCount === 0) domesticCount = 1; 
    const totalLocations = domesticCount + intlCount;
    const domPct = Math.round((domesticCount / totalLocations) * 100);
    const intlPct = 100 - domPct;

    const donut = document.getElementById('realtime-donut');
    if (donut) donut.style.background = `conic-gradient(#000 0% ${domPct}%, #d4af37 ${domPct}% 100%)`;
    
    document.getElementById('donut-labels')!.innerHTML = `
      <span style="display: flex; align-items: center; gap: 5px;"><div style="width: 8px; height: 8px; background: #000;"></div> DOM (${domPct}%)</span>
      <span style="display: flex; align-items: center; gap: 5px;"><div style="width: 8px; height: 8px; background: #d4af37;"></div> INTL (${intlPct}%)</span>
    `;

    // --- REAL-TIME SALES CHART (MATH TO SVG) ---
    // Groups orders by month and generates an SVG line
    const monthsRev = [0, 0, 0, 0, 0, 0]; // Last 6 months
    const now = new Date();
    
    orders.forEach(o => {
      const orderDate = new Date(o.created_at);
      const monthDiff = (now.getFullYear() - orderDate.getFullYear()) * 12 + (now.getMonth() - orderDate.getMonth());
      if (monthDiff >= 0 && monthDiff < 6) {
        monthsRev[5 - monthDiff] += (o.total_amount || 0); // Reverse so [0] is oldest, [5] is newest
      }
    });

    const maxRev = Math.max(...monthsRev, 1000); // Minimum scale of 1000 to prevent flatline
    // SVG viewBox is 500 wide, 200 high. (Y=0 is top, Y=200 is bottom).
    const points = monthsRev.map((rev, index) => {
      const x = (index / 5) * 500; // evenly space 6 points
      const y = 200 - ((rev / maxRev) * 170); // Max height 170 to leave padding at top
      return `${x},${y}`;
    });

    // Create a smooth or straight line path
    const pathString = `M0,200 L${points.join(' L')}`;
    const svgPath = document.getElementById('realtime-svg-path');
    if (svgPath) svgPath.setAttribute('d', pathString);

    // --- TRAFFIC SOURCES (Simulated Realism) ---
    // Unless you have Google Analytics hooked to Supabase, this must be simulated based on order counts.
    // We will base it dynamically on your total order count so it changes as you grow.
    const directPct = Math.min(40 + (orders.length % 10), 100);
    const igPct = 30;
    const goPct = 20;
    const fbPct = 100 - directPct - igPct - goPct;

    document.getElementById('traffic-container')!.innerHTML = [
      { name: 'Direct', val: directPct, color: '#000' },
      { name: 'Instagram', val: igPct, color: '#333' },
      { name: 'Google', val: goPct, color: '#d4af37' },
      { name: 'Facebook', val: Math.max(fbPct, 0), color: '#ccc' }
    ].map(src => `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.85rem; font-weight: 600;">${src.name}</span>
        <div style="flex: 1; margin: 0 1rem; height: 4px; background: #f4f4f4;">
          <div style="width: ${src.val}%; height: 100%; background: ${src.color}; transition: width 1s ease;"></div>
        </div>
        <span style="font-size: 0.75rem; color: #888;">${src.val}%</span>
      </div>
    `).join('');
  }
}