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
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1>Shipping Zones</h1>
        <button class="btn btn-primary" id="btn-show-add-shipping" style="background: #000; color: #fff; padding: 0.8rem 1.5rem; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">+ Add Zone</button>
      </div>

      <div id="add-shipping-panel" class="panel" style="display: none; margin-bottom: 2rem; background: #fff; padding: 2rem; border-radius: 8px; border: 1px solid #eee;">
        <h3 style="margin-bottom: 1.5rem; font-family: 'Italiana', serif; font-size: 1.5rem;">New Shipping Zone</h3>
        <form id="add-shipping-form" class="admin-form" style="max-width: 500px; display: flex; flex-direction: column; gap: 1.5rem;">
           <div class="input-group">
             <label style="display: block; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #888; margin-bottom: 0.5rem;">Zone Name</label>
             <input type="text" id="s-zone" required placeholder="e.g. North India" style="width: 100%; padding: 1rem; border: 1px solid #ddd; outline: none; font-family: inherit;">
           </div>
           <div class="input-group">
             <label style="display: block; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #888; margin-bottom: 0.5rem;">Flat Rate (₹)</label>
             <input type="number" id="s-rate" required min="0" placeholder="150" style="width: 100%; padding: 1rem; border: 1px solid #ddd; outline: none; font-family: inherit;">
           </div>
           <div class="input-group">
             <label style="display: block; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #888; margin-bottom: 0.5rem;">Estimated Delivery Time</label>
             <input type="text" id="s-days" required placeholder="3-5 Business Days" style="width: 100%; padding: 1rem; border: 1px solid #ddd; outline: none; font-family: inherit;">
           </div>
           <div style="display:flex; gap:1rem; margin-top:1rem;">
             <button type="submit" id="submit-shipping-btn" class="btn btn-primary" style="background: #000; color: #fff; padding: 1rem 2rem; border: none; font-weight: 700; cursor: pointer; text-transform: uppercase;">Save Zone</button>
             <button type="button" id="btn-cancel-shipping" class="btn" style="background: transparent; color: #000; padding: 1rem 2rem; border: 1px solid #000; font-weight: 700; cursor: pointer; text-transform: uppercase;">Cancel</button>
           </div>
        </form>
      </div>

      <div class="vg-card" style="padding: 0;">
        <div class="admin-table-container" style="margin-top: 0; border: none;" id="shipping-grid-wrapper">
          <div style="padding: 4rem 2rem; text-align: center; color: #888;">Loading zones...</div>
        </div>
      </div>
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
    const submitBtn = document.getElementById('submit-shipping-btn') as HTMLButtonElement;

    document.getElementById('btn-show-add-shipping')?.addEventListener('click', () => {
      if (panel) panel.style.display = 'block';
    });

    document.getElementById('btn-cancel-shipping')?.addEventListener('click', () => {
      if (panel) panel.style.display = 'none';
      form.reset();
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Saving...';
      submitBtn.disabled = true;

      const zone_name = (document.getElementById('s-zone') as HTMLInputElement).value;
      const rate = parseInt((document.getElementById('s-rate') as HTMLInputElement).value, 10);
      const estimated_days = (document.getElementById('s-days') as HTMLInputElement).value;
      
      const { error } = await supabase.from('shipping_zones').insert({ zone_name, rate, estimated_days });
      
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;

      if (error) {
        // NOW WE CATCH THE EXACT DATABASE ERROR
        alert("Database Error: " + error.message);
        console.error("Supabase Error Details:", error);
      } else {
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
          const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
          if (error) alert("Error deleting: " + error.message);
          else this.fetchZones();
        }
      }
    });
  }

  async fetchZones() {
    const { data, error } = await supabase.from('shipping_zones').select('*').order('created_at', { ascending: true });
    
    if (error) {
      document.getElementById('shipping-grid-wrapper')!.innerHTML = `<div style="padding: 3rem; text-align: center; color: red;">Error: ${error.message}</div>`;
      return;
    }

    if (!data || data.length === 0) {
      document.getElementById('shipping-grid-wrapper')!.innerHTML = `<div style="padding: 3rem; text-align: center; color: #888;">No shipping zones configured yet.</div>`;
      return;
    }

    const columns: ColumnDef[] = [
      { key: 'zone_name', label: 'Zone Name', render: (val) => `<strong style="color: #111;">${val}</strong>` },
      { key: 'rate', label: 'Shipping Rate', render: (val) => val === 0 ? '<span style="color: #1e8e3e; font-weight: bold;">Free Shipping</span>' : `₹${val}` },
      { key: 'estimated_days', label: 'Est. Delivery', render: (val) => `<span style="color: #666;">${val}</span>` }
    ];

    const grid = new DataGrid(columns, data, (row) => `
      <button class="action-btn delete-btn" data-id="${row.id}" style="color: #d93025; background: rgba(217, 48, 37, 0.1); border: none; padding: 6px 12px; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.7rem; text-transform: uppercase;">Delete</button>
    `);
    
    document.getElementById('shipping-grid-wrapper')!.innerHTML = grid.render();
  }
}