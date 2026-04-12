import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class CustomersPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Customer Directory</h1>
        <button class="btn btn-primary" id="btn-refresh-customers">Refresh List</button>
      </div>
      <div id="customers-grid-wrapper">Loading directory...</div>
    `;

    setTimeout(() => {
      this.fetchCustomers();
      document.getElementById('btn-refresh-customers')?.addEventListener('click', () => this.fetchCustomers());
    }, 0);

    return this.container;
  }

  async fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (!data) return;

    const columns: ColumnDef[] = [
      { key: 'full_name', label: 'Name', render: (val) => `<strong>${val || 'Guest'}</strong>` },
      { key: 'email', label: 'Email' },
      { key: 'total_spent', label: 'Total Spent', render: (val) => `₹${val || 0}` },
      { key: 'status', label: 'Status', render: (val) => `<span class="badge badge-green">${val || 'Active'}</span>` }
    ];

    const grid = new DataGrid(columns, data, () => ``);
    document.getElementById('customers-grid-wrapper')!.innerHTML = grid.render();
  }
}