import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class ReviewsPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Customer Reviews</h1>
        <button class="btn btn-primary" id="btn-refresh-reviews">Refresh Data</button>
      </div>
      <div id="reviews-grid-wrapper">Loading reviews...</div>
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
      
      // APPROVE REVIEW
      if (target.classList.contains('approve-btn')) {
        const id = target.dataset.id;
        target.innerText = '...';
        const { error } = await supabase.from('reviews').update({ status: 'Approved' }).eq('id', id);
        if (!error) this.fetchReviews();
        else alert('Error approving review: ' + error.message);
      }

      // REJECT REVIEW
      if (target.classList.contains('reject-btn')) {
        const id = target.dataset.id;
        target.innerText = '...';
        const { error } = await supabase.from('reviews').update({ status: 'Rejected' }).eq('id', id);
        if (!error) this.fetchReviews();
        else alert('Error rejecting review: ' + error.message);
      }
      
      // DELETE REVIEW
      if (target.classList.contains('delete-btn')) {
        const id = target.dataset.id;
        if(confirm("Are you sure you want to permanently delete this review?")) {
           const { error } = await supabase.from('reviews').delete().eq('id', id);
           if (!error) this.fetchReviews();
           else alert('Error deleting review: ' + error.message);
        }
      }
    });
  }

  async fetchReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      document.getElementById('reviews-grid-wrapper')!.innerHTML = '<p>Error loading reviews.</p>';
      return;
    }

    const columns: ColumnDef[] = [
      { key: 'customer_name', label: 'Customer', render: (val) => `<strong>${val}</strong>` },
      { key: 'products', label: 'Product', render: (val) => val?.name || 'Unknown Item' },
      { key: 'rating', label: 'Rating', render: (val) => `<span style="color:#000; font-size:1.1rem; letter-spacing:2px;">${'★'.repeat(val)}${'☆'.repeat(5-val)}</span>` },
      { key: 'comment', label: 'Comment', render: (val) => `<span style="font-size: 0.85rem; color: #555; font-style: italic;">"${val}"</span>` },
      { 
        key: 'status', 
        label: 'Status', 
        render: (val) => {
          if (val === 'Approved') return `<span class="badge badge-green">Approved</span>`;
          if (val === 'Rejected') return `<span class="badge" style="background:#fee2e2; color:#991b1b;">Rejected</span>`;
          return `<span class="badge badge-gray">Pending</span>`;
        }
      }
    ];

    const actions = (row: any) => `
      ${row.status === 'Pending' ? `
        <button class="action-btn approve-btn" data-id="${row.id}" style="color: #1e8e3e; margin-right: 15px; font-weight: bold;">Approve</button>
        <button class="action-btn reject-btn" data-id="${row.id}" style="color: #d93025; margin-right: 15px; font-weight: bold;">Reject</button>
      ` : ''}
      <button class="action-btn delete-btn" data-id="${row.id}" style="color: #888; text-decoration: underline;">Delete</button>
    `;

    const grid = new DataGrid(columns, data, actions);
    document.getElementById('reviews-grid-wrapper')!.innerHTML = grid.render();
  }
}