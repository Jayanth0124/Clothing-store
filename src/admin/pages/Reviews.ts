import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class ReviewsPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'admin-page-wrapper'; 
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1>Customer Reviews</h1>
        <button class="btn btn-primary" id="btn-refresh-reviews" style="background: #000; color: #fff; padding: 0.8rem 1.5rem; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">Refresh Data</button>
      </div>
      
      <div class="vg-card" style="padding: 0;">
        <div class="admin-table-container" style="margin-top: 0; border: none; overflow-x: visible;">
          <div id="reviews-grid-wrapper" style="padding: 2rem; text-align: center;">Loading reviews...</div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.fetchReviews();
      this.bindEvents();
    }, 0);

    return this.container;
  }

  bindEvents() {
    document.getElementById('btn-refresh-reviews')?.addEventListener('click', () => {
      this.fetchReviews();
    });

    document.getElementById('reviews-grid-wrapper')?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      // FEATURE ON HOME PAGE (DATABASE SYNC)
      const featureBtn = target.closest('.feature-btn') as HTMLElement;
      if (featureBtn) {
        const id = featureBtn.dataset.id;
        const currentStatus = featureBtn.dataset.featured === 'true';
        if (!id) return;

        featureBtn.innerText = 'Syncing...';

        const { error } = await supabase.from('reviews').update({ is_featured: !currentStatus }).eq('id', id);
        if (!error) {
          this.fetchReviews(); // Reload from database instantly
        } else {
          alert('Error updating database: ' + error.message);
          featureBtn.innerText = 'Failed';
        }
      }

      // APPROVE REVIEW
      const approveBtn = target.closest('.approve-btn') as HTMLElement;
      if (approveBtn) {
        const id = approveBtn.dataset.id;
        approveBtn.innerText = '...';
        const { error } = await supabase.from('reviews').update({ status: 'Approved' }).eq('id', id);
        if (!error) this.fetchReviews();
      }

      // REJECT REVIEW
      const rejectBtn = target.closest('.reject-btn') as HTMLElement;
      if (rejectBtn) {
        const id = rejectBtn.dataset.id;
        rejectBtn.innerText = '...';
        const { error } = await supabase.from('reviews').update({ status: 'Rejected', is_featured: false }).eq('id', id);
        if (!error) this.fetchReviews();
      }
      
      // DELETE REVIEW
      const deleteBtn = target.closest('.delete-btn') as HTMLElement;
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if(confirm("Are you sure you want to permanently delete this review?")) {
           const { error } = await supabase.from('reviews').delete().eq('id', id);
           if (!error) this.fetchReviews();
        }
      }
    });
  }

  async fetchReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
    
    if (error) {
      document.getElementById('reviews-grid-wrapper')!.innerHTML = '<p>Error loading reviews.</p>';
      return;
    }

    const columns: ColumnDef[] = [
      { key: 'customer_name', label: 'Customer', render: (val) => `<strong style="color: #111;">${val}</strong>` },
      { key: 'products', label: 'Product', render: (val) => val?.name || 'Vito Ginglies' },
      { key: 'rating', label: 'Rating', render: (val) => `<span style="color:#d4af37; font-size:1.1rem; letter-spacing:2px;">${'★'.repeat(val)}${'☆'.repeat(5-val)}</span>` },
      { key: 'comment', label: 'Comment', render: (val) => `<span style="font-size: 0.85rem; color: #555; font-style: italic;">"${val}"</span>` },
      { 
        key: 'status', 
        label: 'Status', 
        render: (val) => {
          if (val === 'Approved') return `<span class="badge badge-green">Approved</span>`;
          if (val === 'Rejected') return `<span class="badge" style="background:#fee2e2; color:#991b1b;">Rejected</span>`;
          return `<span class="badge badge-gray">Pending</span>`;
        }
      },
      {
        key: 'is_featured',
        label: 'Visibility',
        render: (val, row) => {
          if (row.status !== 'Approved') return `<span style="color: #ccc; font-size: 0.75rem;">Awaiting Approval</span>`;
          if (val === true) { 
            return `<span style="background: rgba(30, 142, 62, 0.1); color: #1e8e3e; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Featured</span>`;
          }
          return `<span style="background: #f4f4f4; color: #888; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Hidden</span>`;
        }
      }
    ];

    const actions = (row: any) => {
      const isFeatured = row.is_featured === true;
      
      return `
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; min-width: 160px;">
          ${row.status === 'Approved' ? `
            <button class="action-btn feature-btn" data-id="${row.id}" data-featured="${isFeatured}" style="background: ${isFeatured ? '#000' : 'transparent'}; border: 1px solid #000; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.7rem; color: ${isFeatured ? '#fff' : '#000'}; white-space: nowrap; transition: all 0.2s ease;">
              ${isFeatured ? '★ FEATURED' : '☆ FEATURE'}
            </button>
          ` : ''}

          ${row.status === 'Pending' ? `
            <button class="action-btn approve-btn" data-id="${row.id}" style="background: rgba(30,142,62,0.1); color: #1e8e3e; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 0.7rem; cursor: pointer;">Approve</button>
            <button class="action-btn reject-btn" data-id="${row.id}" style="background: rgba(217,48,37,0.1); color: #d93025; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 0.7rem; cursor: pointer;">Reject</button>
          ` : ''}
          
          <button class="action-btn delete-btn" data-id="${row.id}" style="color: #888; text-decoration: underline; background: none; border: none; cursor: pointer; font-size: 0.75rem; padding: 0;">Delete</button>
        </div>
      `;
    };

    const grid = new DataGrid(columns, data || [], actions);
    document.getElementById('reviews-grid-wrapper')!.innerHTML = grid.render();
  }
}