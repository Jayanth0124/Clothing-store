import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class InventoryPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Inventory & Stock</h1>
        <button class="btn btn-primary" id="btn-refresh-inventory">Refresh Data</button>
      </div>
      
      <div id="edit-stock-panel" class="panel" style="display: none; margin-bottom: 2rem; background: #fff; border: 1px solid var(--border);">
        <h3 style="margin-bottom: 1.5rem; font-family: var(--font-display);">Adjust Stock Level</h3>
        <form id="edit-stock-form" class="admin-form" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
          <input type="hidden" id="edit-variant-id">
          <div class="input-group" style="flex: 2; min-width: 250px;">
            <label>Product & SKU</label>
            <input type="text" id="edit-variant-name" readonly style="background: #f9f9f9; color: #666; cursor: not-allowed;">
          </div>
          <div class="input-group" style="flex: 1; min-width: 150px;">
            <label>New Quantity</label>
            <input type="number" id="edit-stock-qty" required min="0">
          </div>
          <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
            <button type="submit" class="btn btn-primary">Save Stock</button>
            <button type="button" id="btn-cancel-stock" class="btn">Cancel</button>
          </div>
        </form>
      </div>

      <div id="inventory-grid-wrapper">Loading inventory data...</div>
    `;
    
    setTimeout(() => {
      this.fetchInventory();
      this.bindEvents();
    }, 0);
    
    return this.container;
  }

  bindEvents() {
    const gridWrapper = document.getElementById('inventory-grid-wrapper');
    const panel = document.getElementById('edit-stock-panel');
    const form = document.getElementById('edit-stock-form') as HTMLFormElement;

    document.getElementById('btn-refresh-inventory')?.addEventListener('click', () => {
      this.fetchInventory();
    });

    // Event Delegation for Adjust Buttons
    gridWrapper?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('adjust-stock-btn')) {
        const id = target.dataset.id;
        const sku = target.dataset.sku;
        const name = target.dataset.name;
        const qty = target.dataset.qty;

        (document.getElementById('edit-variant-id') as HTMLInputElement).value = id || '';
        (document.getElementById('edit-variant-name') as HTMLInputElement).value = `${name} (${sku})`;
        (document.getElementById('edit-stock-qty') as HTMLInputElement).value = qty || '0';

        if (panel) {
          panel.style.display = 'block';
          panel.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    // Close Panel
    document.getElementById('btn-cancel-stock')?.addEventListener('click', () => {
      if (panel) panel.style.display = 'none';
    });

    // Submit New Stock to Database
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = (document.getElementById('edit-variant-id') as HTMLInputElement).value;
      const newQty = parseInt((document.getElementById('edit-stock-qty') as HTMLInputElement).value, 10);

      const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Saving...';
      submitBtn.disabled = true;

      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newQty })
        .eq('id', id);

      submitBtn.innerText = originalText;
      submitBtn.disabled = false;

      if (error) {
        alert('Error updating stock: ' + error.message);
      } else {
        if (panel) panel.style.display = 'none';
        this.fetchInventory(); 
        alert('Stock updated successfully!');
      }
    });
  }

  async fetchInventory() {
    const { data, error } = await supabase
      .from('product_variants')
      .select('id, sku, size, color, stock_quantity, products(name)')
      .order('stock_quantity', { ascending: true }); 

    if (error || !data) {
      document.getElementById('inventory-grid-wrapper')!.innerText = 'Failed to load inventory.';
      return;
    }

    const columns: ColumnDef[] = [
      { key: 'products', label: 'Product Name', render: (val) => `<strong>${val?.name || 'Unknown'}</strong>` },
      { key: 'sku', label: 'SKU', render: (val) => val || '-' },
      { key: 'size', label: 'Size', render: (val) => val || 'Standard' },
      { key: 'color', label: 'Color', render: (val) => val && val !== 'Default' ? `<div style="display:flex; align-items:center; gap:8px;"><div style="width:12px; height:12px; background:${val}; border-radius:50%; border:1px solid #ccc;"></div>${val}</div>` : 'Default' },
      { 
        key: 'stock_quantity', 
        label: 'Available Stock',
        render: (val) => {
          if (val <= 0) return `<span class="badge badge-red">Out of Stock (0)</span>`;
          if (val <= 5) return `<span class="badge" style="background:#fff3cd; color:#856404;">Low Stock (${val})</span>`;
          return `<span class="badge badge-green">${val} in stock</span>`;
        }
      }
    ];

    const actions = (row: any) => `
      <button class="action-btn adjust-stock-btn" 
        data-id="${row.id}" 
        data-sku="${row.sku || 'N/A'}" 
        data-name="${row.products?.name || 'Unknown'}" 
        data-qty="${row.stock_quantity}">
        Adjust Stock
      </button>
    `;

    const grid = new DataGrid(columns, data, actions);
    document.getElementById('inventory-grid-wrapper')!.innerHTML = grid.render();
  }
}