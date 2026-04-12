import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class DashboardPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Dashboard Overview</h1>
        <button class="btn btn-primary" id="btn-refresh-dash">Refresh Data</button>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Total Revenue</span>
          <span class="kpi-value" id="kpi-revenue">₹0</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total Orders</span>
          <span class="kpi-value" id="kpi-orders">0</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total Customers</span>
          <span class="kpi-value" id="kpi-customers">0</span>
        </div>
      </div>

      <div class="panel">
        <h2 style="margin-bottom: 2rem;">Recent Orders</h2>
        <div id="recent-orders-wrapper">Loading orders...</div>
      </div>
    `;

    setTimeout(() => {
      this.fetchDashboardData();
      document.getElementById('btn-refresh-dash')?.addEventListener('click', () => this.fetchDashboardData());
    }, 0);

    return this.container;
  }

  async fetchDashboardData() {
    // 1. Fetch Orders for KPIs & Grid
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { count: customersCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });

    if (orders) {
      const totalRev = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      document.getElementById('kpi-revenue')!.innerText = `₹${totalRev.toLocaleString()}`;
      document.getElementById('kpi-orders')!.innerText = orders.length.toString();
      
      const recentOrders = orders.slice(0, 5); // Just top 5
      
      const columns: ColumnDef[] = [
        { key: 'id', label: 'Order ID', render: (val) => `<span style="font-family: monospace;">${val.substring(0,8)}</span>` },
        { key: 'customer_name', label: 'Customer' },
        { key: 'status', label: 'Status', render: (val) => `<span class="badge ${val === 'Pending' ? 'badge-gray' : 'badge-green'}">${val}</span>` },
        { key: 'total_amount', label: 'Total', render: (val) => `₹${val.toLocaleString()}` }
      ];

      const grid = new DataGrid(columns, recentOrders, () => ``);
      document.getElementById('recent-orders-wrapper')!.innerHTML = grid.render();
    }

    if (customersCount !== null) {
      document.getElementById('kpi-customers')!.innerText = customersCount.toString();
    }
  }
}