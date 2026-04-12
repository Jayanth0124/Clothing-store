import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class ReturnsPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Returns & Exchanges</h1>
      </div>
      <div id="returns-grid-wrapper">Loading return requests...</div>
    `;
    this.fetchReturns();
    return this.container;
  }

  async fetchReturns() {
    const { data, error } = await supabase.from('returns').select('*').order('created_at', { ascending: false });

    if (error || !data) {
      document.getElementById('returns-grid-wrapper')!.innerText = 'Failed to load returns.';
      return;
    }

    const columns: ColumnDef[] = [
      { key: 'order_id', label: 'Order ID', render: (val) => `<strong>${val}</strong>` },
      { key: 'customer_name', label: 'Customer' },
      { 
        key: 'type', 
        label: 'Request Type', 
        render: (val) => `<span class="badge" style="background:#eee; color:#333;">${val}</span>` 
      },
      { key: 'reason', label: 'Reason' },
      { 
        key: 'status', 
        label: 'Status', 
        render: (val) => {
          const color = val === 'Requested' ? 'orange' : (val === 'Refunded' ? 'green' : 'gray');
          return `<span class="badge badge-${color}">${val}</span>`;
        } 
      }
    ];

    const actions = (row: any) => `
      <button class="action-btn" onclick="alert('Reviewing request for Order ${row.order_id}')">Review Request</button>
    `;

    const grid = new DataGrid(columns, data, actions);
    document.getElementById('returns-grid-wrapper')!.innerHTML = grid.render();
  }
}