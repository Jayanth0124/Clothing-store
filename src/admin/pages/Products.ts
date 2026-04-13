import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class ProductsPage {
  private container: HTMLElement;
  private editModeId: string | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Products</h1>
        <button class="btn btn-primary" id="btn-show-add-product">+ Add Product</button>
      </div>
      
      <div id="add-product-panel" class="panel" style="display: none; margin-bottom: 2rem;">
        <h3 id="form-title" style="margin-bottom: 2rem; font-family: 'Italiana', serif; font-size: 1.5rem; text-transform: uppercase;">New Product</h3>
        <form id="add-product-form" class="admin-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="input-group">
              <label>Product Name</label>
              <input type="text" id="p-name" required>
            </div>
            <div class="input-group">
              <label>Category</label>
              <select id="p-type" required>
                <option value="">Loading categories...</option>
              </select>
            </div>
            <div class="input-group">
              <label>Selling Price (₹)</label>
              <input type="number" id="p-price" required>
            </div>
            <div class="input-group">
              <label>Original Price (₹)</label>
              <input type="number" id="p-orig">
            </div>
            
            <div class="input-group">
              <label>Sizes (Comma separated)</label>
              <input type="text" id="p-sizes" placeholder="S, M, L, XL">
            </div>
            <div class="input-group">
              <label>Colors (Comma separated HEX or Names)</label>
              <input type="text" id="p-colors" placeholder="Black, #D4AF37">
            </div>
            
            <div class="input-group" style="grid-column: span 2;">
              <label>Image URLs (Comma separated for swipe gallery)</label>
              <input type="text" id="p-img" required placeholder="https://img1.jpg, https://img2.jpg">
            </div>
          </div>
          <div style="margin-top: 2rem; display: flex; gap: 1rem;">
            <button type="submit" class="btn btn-primary" id="p-submit-btn">Save Product</button>
            <button type="button" class="btn" id="btn-cancel-product">Cancel</button>
          </div>
        </form>
      </div>

      <div id="products-grid-wrapper">Loading products...</div>
    `;
    
    setTimeout(() => {
      this.fetchProducts();
      this.loadLiveCategories();
      this.bindEvents();
    }, 0);
    
    return this.container;
  }

  async loadLiveCategories() {
    const { data } = await supabase.from('categories').select('name').eq('status', 'Active').order('name');
    const select = document.getElementById('p-type') as HTMLSelectElement;
    if (select) {
      if (data && data.length > 0) {
        select.innerHTML = data.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      } else {
        select.innerHTML = `<option value="Uncategorized">Uncategorized</option>`;
      }
    }
  }

  bindEvents() {
    const addPanel = document.getElementById('add-product-panel')!;
    const formTitle = document.getElementById('form-title')!;
    const submitBtn = document.getElementById('p-submit-btn') as HTMLButtonElement;
    const form = document.getElementById('add-product-form') as HTMLFormElement;

    document.getElementById('btn-show-add-product')?.addEventListener('click', () => {
      this.editModeId = null;
      form.reset();
      formTitle.innerText = "New Product";
      submitBtn.innerText = "Save Product";
      addPanel.style.display = 'block';
    });

    document.getElementById('btn-cancel-product')?.addEventListener('click', () => {
      addPanel.style.display = 'none';
      form.reset();
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Saving...';
      submitBtn.disabled = true;

      const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
      
      const sizesArray = getVal('p-sizes').split(',').map(s => s.trim()).filter(Boolean);
      const colorsArray = getVal('p-colors').split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        name: getVal('p-name'),
        type: getVal('p-type'),
        price: Number(getVal('p-price')),
        original_price: getVal('p-orig') ? Number(getVal('p-orig')) : null,
        image: getVal('p-img'), // Saves the raw comma-separated string to the DB
        sizes: sizesArray.length ? sizesArray : ['Standard'],
        colors: colorsArray.length ? colorsArray : ['Default'],
        status: 'Published'
      };

      if (this.editModeId) {
        const { error } = await supabase.from('products').update(payload).eq('id', this.editModeId);
        if (error) alert("Error updating: " + error.message);
      } else {
        const { data: newProduct, error } = await supabase.from('products').insert(payload).select().single();
        
        if (error) {
          alert("Error creating: " + error.message);
        } else if (newProduct) {
          const variantsToInsert = [];
          for (const color of payload.colors) {
            for (const size of payload.sizes) {
              const colorCode = color.replace('#', '').substring(0,3).toUpperCase();
              const sizeCode = size.substring(0,2).toUpperCase();
              variantsToInsert.push({
                product_id: newProduct.id,
                size: size,
                color: color,
                sku: `SKU-${newProduct.id.substring(0,4).toUpperCase()}-${sizeCode}-${colorCode}`,
                stock_quantity: 10 
              });
            }
          }
          await supabase.from('product_variants').insert(variantsToInsert);
        }
      }

      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
      form.reset();
      addPanel.style.display = 'none';
      this.fetchProducts();
    });

    document.getElementById('products-grid-wrapper')?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('delete-btn')) {
        const id = target.dataset.id;
        if (confirm('Are you sure you want to delete this product?')) {
          await supabase.from('products').delete().eq('id', id);
          this.fetchProducts();
        }
      }

      if (target.classList.contains('edit-btn')) {
        const id = target.dataset.id;
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          this.editModeId = data.id;
          (document.getElementById('p-name') as HTMLInputElement).value = data.name;
          
          await this.loadLiveCategories();
          (document.getElementById('p-type') as HTMLSelectElement).value = data.type;
          
          (document.getElementById('p-price') as HTMLInputElement).value = data.price;
          (document.getElementById('p-orig') as HTMLInputElement).value = data.original_price || '';
          (document.getElementById('p-img') as HTMLInputElement).value = data.image;
          (document.getElementById('p-sizes') as HTMLInputElement).value = data.sizes?.join(', ') || '';
          (document.getElementById('p-colors') as HTMLInputElement).value = data.colors?.join(', ') || '';

          formTitle.innerText = "Edit Product";
          submitBtn.innerText = "Update Product";
          addPanel.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }

  async fetchProducts() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error || !data) return;

    const columns: ColumnDef[] = [
      { key: 'image', label: 'Item', render: (val, row) => {
          // Safety: Only grab the first image URL for the admin thumbnail
          const firstImage = val ? val.split(',')[0].trim() : '';
          return `<div style="display:flex; align-items:center; gap:1rem;"><img src="${firstImage}" style="width:50px; height:60px; object-fit:cover; border:1px solid #eee;"><strong>${row.name}</strong></div>`;
      }},
      { key: 'type', label: 'Category', render: (val) => `<span class="badge badge-gray">${val}</span>` },
      { key: 'price', label: 'Price', render: (val) => `₹${val}` }
    ];

    const actions = (row: any) => `
      <button class="action-btn edit-btn" data-id="${row.id}" style="margin-right: 15px; font-weight: bold;">Edit</button>
      <button class="action-btn delete-btn" data-id="${row.id}" style="color: #d93025;">Delete</button>
    `;
    const grid = new DataGrid(columns, data, actions);
    document.getElementById('products-grid-wrapper')!.innerHTML = grid.render();
  }
}