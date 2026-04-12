import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class ShippingPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Shipping Zones</h1>
        <button class="btn btn-primary" id="btn-show-add-shipping">+ Add Zone</button>
      </div>

      <div id="add-shipping-panel" class="panel" style="display: none; margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1.5rem;">New Shipping Zone</h3>
        <form id="add-shipping-form" class="admin-form" style="max-width: 500px;">
           <div class="input-group">
             <label>Zone Name</label>
             <input type="text" id="s-zone" required placeholder="e.g. North India">
           </div>
           <div class="input-group">
             <label>Flat Rate (₹)</label>
             <input type="number" id="s-rate" required min="0" placeholder="150">
           </div>
           <div class="input-group">
             <label>Estimated Delivery Time</label>
             <input type="text" id="s-days" required placeholder="3-5 Business Days">
           </div>
           <div style="display:flex; gap:1rem; margin-top:1rem;">
             <button type="submit" class="btn btn-primary">Save Zone</button>
             <button type="button" id="btn-cancel-shipping" class="btn">Cancel</button>
           </div>
        </form>
      </div>

      <div id="shipping-grid-wrapper">Loading zones...</div>
    `;

    setTimeout(() => {
      this.fetchZones();
      this.bindEvents();
    }, 0);

    return this.container;
  }

  bindEvents() {
    const panel = document.getElementById('add-shipping-panel');
    const form = document.getElementById('add-shipping-form') as HTMLFormElement;

    document.getElementById('btn-show-add-shipping')?.addEventListener('click', () => {
      if (panel) panel.style.display = 'block';
    });

    document.getElementById('btn-cancel-shipping')?.addEventListener('click', () => {
      if (panel) panel.style.display = 'none';
      form.reset();
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const zone_name = (document.getElementById('s-zone') as HTMLInputElement).value;
      const rate = parseInt((document.getElementById('s-rate') as HTMLInputElement).value, 10);
      const estimated_days = (document.getElementById('s-days') as HTMLInputElement).value;
      
      const { error } = await supabase.from('shipping_zones').insert({ zone_name, rate, estimated_days });
      
      if (!error) {
        if (panel) panel.style.display = 'none';
        form.reset();
        this.fetchZones();
      }
    });

    document.getElementById('shipping-grid-wrapper')?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('delete-btn')) {
        const id = target.dataset.id;
        if (confirm('Delete this shipping zone?')) {
          await supabase.from('shipping_zones').delete().eq('id', id);
          this.fetchZones();
        }
      }
    });
  }

  async fetchZones() {
    const { data } = await supabase.from('shipping_zones').select('*').order('created_at', { ascending: true });
    if (!data) return;

    const columns: ColumnDef[] = [
      { key: 'zone_name', label: 'Zone Name', render: (val) => `<strong>${val}</strong>` },
      { key: 'rate', label: 'Shipping Rate', render: (val) => val === 0 ? 'Free Shipping' : `₹${val}` },
      { key: 'estimated_days', label: 'Est. Delivery' }
    ];

    const grid = new DataGrid(columns, data, (row) => `<button class="action-btn delete-btn" data-id="${row.id}" style="color:red;">Delete</button>`);
    document.getElementById('shipping-grid-wrapper')!.innerHTML = grid.render();
  }
}