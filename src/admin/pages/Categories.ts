import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class CategoriesPage {
  private container: HTMLElement;
  private editModeId: string | null = null; 

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Product Categories</h1>
        <button class="btn btn-primary" id="btn-show-add-category">+ Add Category</button>
      </div>

      <div id="add-category-panel" class="panel" style="display: none; margin-bottom: 2rem;">
        <h3 id="cat-form-title" style="margin-bottom: 1.5rem; font-family: 'Italiana', serif; font-size: 1.5rem;">New Category</h3>
        <form id="category-form" class="admin-form" style="max-width: 600px;">
           <div class="input-group">
             <label>Category Name</label>
             <input type="text" id="c-name" required placeholder="e.g. Formal Jackets">
           </div>
           <div class="input-group">
             <label>Description</label>
             <textarea id="c-desc" rows="3" placeholder="Brief description of this collection..."></textarea>
           </div>
           <div class="input-group">
             <label>Status</label>
             <select id="c-status">
               <option value="Active">Active</option>
               <option value="Draft">Draft</option>
               <option value="Archived">Archived</option>
             </select>
           </div>
           <div style="display:flex; gap:1rem; margin-top:1.5rem;">
             <button type="submit" id="cat-submit-btn" class="btn btn-primary">Save Category</button>
             <button type="button" id="btn-cancel-category" class="btn">Cancel</button>
           </div>
        </form>
      </div>

      <div id="categories-grid-wrapper">Loading categories...</div>
    `;

    setTimeout(() => {
      this.fetchCategories();
      this.bindEvents();
    }, 0);

    return this.container;
  }

  bindEvents() {
    const panel = document.getElementById('add-category-panel');
    const form = document.getElementById('category-form') as HTMLFormElement;
    const formTitle = document.getElementById('cat-form-title');
    const submitBtn = document.getElementById('cat-submit-btn') as HTMLButtonElement;

    document.getElementById('btn-show-add-category')?.addEventListener('click', () => {
      this.editModeId = null; 
      if (form) form.reset();
      if (formTitle) formTitle.innerText = 'New Category';
      if (submitBtn) submitBtn.innerText = 'Save Category';
      if (panel) panel.style.display = 'block';
    });

    document.getElementById('btn-cancel-category')?.addEventListener('click', () => {
      if (panel) panel.style.display = 'none';
      if (form) form.reset();
      this.editModeId = null;
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Saving...';
      submitBtn.disabled = true;

      const name = (document.getElementById('c-name') as HTMLInputElement).value;
      const description = (document.getElementById('c-desc') as HTMLTextAreaElement).value;
      const status = (document.getElementById('c-status') as HTMLSelectElement).value;
      
      // CRITICAL FIX: Automatically generate a URL-friendly slug from the name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const payload = { name, slug, description, status };

      if (this.editModeId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', this.editModeId);
        if (error) alert("Error updating category: " + error.message);
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) alert("Error creating category: " + error.message);
      }
      
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
      
      if (panel) panel.style.display = 'none';
      form.reset();
      this.editModeId = null;
      this.fetchCategories();
    });

    document.getElementById('categories-grid-wrapper')?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('delete-btn')) {
        const id = target.dataset.id;
        if (confirm('Are you sure you want to delete this category?')) {
          await supabase.from('categories').delete().eq('id', id);
          this.fetchCategories();
        }
      }

      if (target.classList.contains('edit-btn')) {
        const id = target.dataset.id;
        
        const { data } = await supabase.from('categories').select('*').eq('id', id).single();
        
        if (data) {
          this.editModeId = data.id;
          
          (document.getElementById('c-name') as HTMLInputElement).value = data.name;
          (document.getElementById('c-desc') as HTMLTextAreaElement).value = data.description || '';
          (document.getElementById('c-status') as HTMLSelectElement).value = data.status || 'Active';

          if (formTitle) formTitle.innerText = 'Edit Category';
          if (submitBtn) submitBtn.innerText = 'Update Category';
          
          if (panel) {
            panel.style.display = 'block';
            panel.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  }

  async fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    
    if (error || !data) {
      document.getElementById('categories-grid-wrapper')!.innerHTML = '<p>Error loading categories.</p>';
      return;
    }

    const columns: ColumnDef[] = [
      { key: 'name', label: 'Category Name', render: (val) => `<strong>${val}</strong>` },
      { key: 'slug', label: 'URL Slug', render: (val) => `<span style="color:#888; font-family:monospace; font-size:0.85rem;">${val || '-'}</span>` },
      { key: 'description', label: 'Description', render: (val) => val ? `<span style="color:#666; font-size:0.85rem;">${val.length > 40 ? val.substring(0, 40) + '...' : val}</span>` : '-' },
      { 
        key: 'status', 
        label: 'Status', 
        render: (val) => {
          if (val === 'Active') return `<span class="badge badge-green">Active</span>`;
          if (val === 'Draft') return `<span class="badge badge-gray">Draft</span>`;
          return `<span class="badge" style="background:#fee2e2; color:#991b1b;">Archived</span>`;
        }
      }
    ];

    const actions = (row: any) => `
      <button class="action-btn edit-btn" data-id="${row.id}" style="margin-right: 15px; font-weight: bold;">Edit</button>
      <button class="action-btn delete-btn" data-id="${row.id}" style="color: #d93025;">Delete</button>
    `;

    const grid = new DataGrid(columns, data, actions);
    document.getElementById('categories-grid-wrapper')!.innerHTML = grid.render();
  }
}