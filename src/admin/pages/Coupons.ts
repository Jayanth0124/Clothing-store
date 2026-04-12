import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class CouponsPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Discount Coupons</h1>
        <button class="btn btn-primary" id="btn-show-add-coupon">+ Create Coupon</button>
      </div>

      <div id="add-coupon-panel" class="panel" style="display: none; margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1.5rem;">New Coupon</h3>
        <form id="add-coupon-form" class="admin-form" style="max-width: 500px;">
           <div class="input-group">
             <label>Promo Code</label>
             <input type="text" id="c-code" required placeholder="SUMMER25" style="text-transform: uppercase;">
           </div>
           <div class="input-group">
             <label>Discount Percentage (%)</label>
             <input type="number" id="c-discount" required min="1" max="100" placeholder="15">
           </div>
           <div style="display:flex; gap:1rem; margin-top:1rem;">
             <button type="submit" class="btn btn-primary">Save Coupon</button>
             <button type="button" id="btn-cancel-coupon" class="btn">Cancel</button>
           </div>
        </form>
      </div>

      <div id="coupons-grid-wrapper">Loading coupons...</div>
    `;

    setTimeout(() => {
      this.fetchCoupons();
      this.bindEvents();
    }, 0);

    return this.container;
  }

  bindEvents() {
    const panel = document.getElementById('add-coupon-panel');
    const form = document.getElementById('add-coupon-form') as HTMLFormElement;

    document.getElementById('btn-show-add-coupon')?.addEventListener('click', () => {
      if (panel) panel.style.display = 'block';
    });

    document.getElementById('btn-cancel-coupon')?.addEventListener('click', () => {
      if (panel) panel.style.display = 'none';
      form.reset();
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = (document.getElementById('c-code') as HTMLInputElement).value.toUpperCase();
      const discount = parseInt((document.getElementById('c-discount') as HTMLInputElement).value, 10);
      
      // FIX: Added 'type' and 'value' to match DB Schema to stop 400 error
      const { error } = await supabase.from('coupons').insert({ 
        code, 
        type: 'Percentage',
        value: discount,
        usage_limit: 100,
        used_count: 0,
        is_active: true 
      });
      
      if (!error) {
        if (panel) panel.style.display = 'none';
        form.reset();
        this.fetchCoupons();
      } else {
        alert("Error saving coupon: " + error.message);
      }
    });

    document.getElementById('coupons-grid-wrapper')?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('delete-btn')) {
        const id = target.dataset.id;
        if (confirm('Delete this coupon?')) {
          await supabase.from('coupons').delete().eq('id', id);
          this.fetchCoupons();
        }
      }
    });
  }

  async fetchCoupons() {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (!data) return;

    const columns: ColumnDef[] = [
      { key: 'code', label: 'Promo Code', render: (val) => `<strong>${val}</strong>` },
      { key: 'discount_percentage', label: 'Discount', render: (val) => `${val}% OFF` },
      { key: 'is_active', label: 'Status', render: (val) => `<span class="badge ${val ? 'badge-green' : 'badge-gray'}">${val ? 'Active' : 'Disabled'}</span>` }
    ];

    const grid = new DataGrid(columns, data, (row) => `<button class="action-btn delete-btn" data-id="${row.id}" style="color:red;">Delete</button>`);
    document.getElementById('coupons-grid-wrapper')!.innerHTML = grid.render();
  }
}