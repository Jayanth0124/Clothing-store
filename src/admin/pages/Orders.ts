import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class OrdersPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Orders Management</h1>
      </div>
      
      <div id="update-order-panel" class="panel" style="display: none; margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1.5rem;">Update Order Status</h3>
        <form id="update-order-form" class="admin-form" style="max-width: 500px;">
           <input type="hidden" id="o-id">
           <div class="input-group">
             <label>Order Reference</label>
             <input type="text" id="o-display-id" readonly style="background: #fafafa; color: #888; border: none;">
           </div>
           <div class="input-group">
             <label>Status</label>
             <select id="o-status" required>
               <option value="Pending">Pending</option>
               <option value="Processing">Processing</option>
               <option value="Shipped">Shipped</option>
               <option value="Delivered">Delivered</option>
               <option value="Cancelled">Cancelled</option>
             </select>
           </div>
           <div style="display:flex; gap:1rem; margin-top:1rem;">
             <button type="submit" class="btn btn-primary">Update Status</button>
             <button type="button" id="btn-cancel-order" class="btn">Cancel</button>
           </div>
        </form>
      </div>

      <div id="orders-grid-wrapper">Loading orders...</div>
    `;

    setTimeout(() => {
      this.fetchOrders();
      this.bindEvents();
    }, 0);

    return this.container;
  }

  bindEvents() {
    const panel = document.getElementById('update-order-panel');
    const form = document.getElementById('update-order-form') as HTMLFormElement;

    document.getElementById('btn-cancel-order')?.addEventListener('click', () => {
      if (panel) panel.style.display = 'none';
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = (document.getElementById('o-id') as HTMLInputElement).value;
      const status = (document.getElementById('o-status') as HTMLInputElement).value;
      
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      
      if (error) {
        alert("Error updating order: " + error.message);
      } else {
        if (panel) panel.style.display = 'none';
        this.fetchOrders();
      }
    });

    document.getElementById('orders-grid-wrapper')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('edit-btn')) {
        const id = target.dataset.id;
        const status = target.dataset.status;
        
        (document.getElementById('o-id') as HTMLInputElement).value = id || '';
        (document.getElementById('o-display-id') as HTMLInputElement).value = id || '';
        (document.getElementById('o-status') as HTMLInputElement).value = status || 'Pending';
        
        if (panel) {
          panel.style.display = 'block';
          panel.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  async fetchOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error || !data) return;

    const columns: ColumnDef[] = [
      { key: 'id', label: 'Order ID', render: (val) => `<span style="font-family: monospace;">${val.substring(0,8)}</span>` },
      { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
      { key: 'customer_name', label: 'Customer' },
      { key: 'status', label: 'Status', render: (val) => `<span class="badge ${val === 'Pending' ? 'badge-gray' : 'badge-green'}">${val}</span>` },
      { key: 'total_amount', label: 'Total', render: (val) => `₹${val.toLocaleString()}` }
    ];

    const actions = (row: any) => `<button class="action-btn edit-btn" data-id="${row.id}" data-status="${row.status}">Update Status</button>`;
    
    const grid = new DataGrid(columns, data, actions);
    document.getElementById('orders-grid-wrapper')!.innerHTML = grid.render();
  }
}