import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class RolesPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Admin & Roles</h1>
        <button class="btn btn-primary">+ Invite Staff</button>
      </div>
      <div id="roles-grid-wrapper">Loading permissions...</div>
    `;
    this.fetchRoles();
    return this.container;
  }

  async fetchRoles() {
    const { data, error } = await supabase.from('admin_roles').select('*');
    if (error || !data) return;

    const columns: ColumnDef[] = [
      { key: 'email', label: 'Staff Email', render: (val) => `<strong>${val}</strong>` },
      { 
        key: 'role', 
        label: 'Access Level', 
        render: (val) => {
          const color = val === 'Admin' ? 'red' : (val === 'Manager' ? 'orange' : 'gray');
          return `<span class="badge" style="background:transparent; border:1px solid ${color}; color:${color};">${val}</span>`;
        } 
      },
      { key: 'last_login', label: 'Last Activity', render: (val) => val ? new Date(val).toLocaleDateString() : 'Never' }
    ];

    const actions = (row: any) => row.email === 'admin@vito.com' ? '<span style="color:#888;">Owner (Locked)</span>' : `<button class="action-btn">Change Role</button><button class="action-btn" style="margin-left:10px; color:red;">Revoke</button>`;
    const grid = new DataGrid(columns, data, actions);
    document.getElementById('roles-grid-wrapper')!.innerHTML = grid.render();
  }
}