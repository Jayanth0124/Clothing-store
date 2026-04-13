import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class ReturnsPage {
  private container: HTMLElement;
  private returnsList: any[] = [];

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'admin-page-wrapper';
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1>Returns & Exchanges</h1>
        <button class="btn btn-primary" id="btn-refresh-returns" style="background: #000; color: #fff; padding: 0.8rem 1.5rem; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">Refresh Data</button>
      </div>

      <div class="vg-card" style="padding: 0;">
        <div class="admin-table-container" style="margin-top: 0; border: none;" id="returns-grid-wrapper">
          <div style="padding: 4rem 2rem; text-align: center; color: #888;">
            <div class="spinner"></div> Loading return requests...
          </div>
        </div>
      </div>
    `;
    
    setTimeout(() => this.fetchReturns(), 0);
    return this.container;
  }

  bindEvents() {
    // Refresh Button
    document.getElementById('btn-refresh-returns')?.addEventListener('click', () => {
      this.fetchReturns();
    });

    // Listen for "Review Request" clicks inside the table
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const reviewBtn = target.closest('.review-return-btn') as HTMLElement;
      
      if (reviewBtn) {
        const id = reviewBtn.getAttribute('data-id');
        if (id) this.openReviewModal(id);
      }
    });

    // Global listener for Modal Actions (Approve/Reject/Close)
    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      // Close Modal
      if (target.id === 'return-modal-overlay' || target.closest('.close-return-modal')) {
        document.getElementById('return-modal-overlay')?.remove();
      }

      // Process Return Action (Approve / Reject)
      const processBtn = target.closest('.process-return-btn') as HTMLElement;
      if (processBtn) {
        const id = processBtn.getAttribute('data-id');
        const newStatus = processBtn.getAttribute('data-status'); // e.g., 'Refunded' or 'Rejected'
        
        if (!id || !newStatus) return;

        const originalText = processBtn.innerText;
        processBtn.innerText = 'Processing...';

        // Update Supabase
        const { error } = await supabase.from('returns').update({ status: newStatus }).eq('id', id);

        if (!error) {
          document.getElementById('return-modal-overlay')?.remove();
          this.fetchReturns(); // Instantly refresh the table
        } else {
          alert('Error updating return request: ' + error.message);
          processBtn.innerText = originalText;
        }
      }
    });
  }

  async fetchReturns() {
    const { data, error } = await supabase.from('returns').select('*').order('created_at', { ascending: false });

    const wrapper = document.getElementById('returns-grid-wrapper');
    if (!wrapper) return;

    if (error || !data) {
      wrapper.innerHTML = '<div style="padding: 3rem; text-align: center; color: #d93025;">Failed to load returns.</div>';
      return;
    }

    // Save to class memory so the modal can read it instantly without a second database call
    this.returnsList = data;

    const columns: ColumnDef[] = [
      { key: 'order_id', label: 'Order ID', render: (val) => `<span style="font-family: monospace; font-weight: 600;">${val.substring(0,8).toUpperCase()}</span>` },
      { key: 'customer_name', label: 'Customer', render: (val) => `<strong>${val}</strong>` },
      { 
        key: 'type', 
        label: 'Request Type', 
        render: (val) => `<span style="background:#f4f4f4; color:#333; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${val}</span>` 
      },
      { 
        key: 'status', 
        label: 'Status', 
        render: (val) => {
          if (val === 'Requested') return `<span class="badge" style="background:#fff3cd; color:#856404;">Awaiting Review</span>`;
          if (val === 'Refunded' || val === 'Approved') return `<span class="badge badge-green">Approved</span>`;
          return `<span class="badge" style="background:#fee2e2; color:#991b1b;">Rejected</span>`;
        } 
      },
      { key: 'created_at', label: 'Date Requested', render: (val) => `<span style="color: #888; font-size: 0.85rem;">${new Date(val).toLocaleDateString()}</span>` }
    ];

    // The Action Button
    const actions = (row: any) => `
      <button class="action-btn review-return-btn" data-id="${row.id}" style="background: #fff; border: 1px solid #ddd; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.75rem; color: #111; letter-spacing: 0.5px; transition: all 0.2s;" onmouseover="this.style.borderColor='#000'; this.style.color='#000';" onmouseout="this.style.borderColor='#ddd'; this.style.color='#111';">
        REVIEW REQUEST
      </button>
    `;

    const grid = new DataGrid(columns, data, actions);
    wrapper.innerHTML = grid.render();
  }

  openReviewModal(returnId: string) {
    // Find the specific return from our saved array
    const returnData = this.returnsList.find(r => r.id === returnId);
    if (!returnData) return;

    // Check if it's already processed so we can hide the action buttons
    const isPending = returnData.status === 'Requested';

    const modalHTML = `
      <div id="return-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;">
        <div style="background: #fff; width: 90%; max-width: 550px; border-radius: 24px; padding: 2.5rem; box-shadow: 0 20px 48px rgba(0,0,0,0.15); animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1.5rem;">
            <div>
              <h2 style="margin: 0 0 0.5rem 0; font-family: 'Manrope', sans-serif; font-size: 1.4rem; color: #111;">Review ${returnData.type}</h2>
              <span style="font-family: monospace; font-size: 0.85rem; color: #888; background: #f4f4f4; padding: 4px 8px; border-radius: 4px;">Order: ${returnData.order_id.substring(0,8).toUpperCase()}</span>
            </div>
            <button class="close-return-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #888;">&times;</button>
          </div>

          <div style="margin-bottom: 2rem;">
            <span style="display: block; font-size: 0.75rem; color: #888; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Customer Name</span>
            <p style="font-size: 1.1rem; font-weight: 600; color: #111; margin: 0;">${returnData.customer_name}</p>
          </div>

          <div style="background: #f4f5f7; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border-left: 4px solid #d4af37;">
            <span style="display: block; font-size: 0.75rem; color: #888; font-weight: 700; text-transform: uppercase; margin-bottom: 0.8rem;">Reason for Request</span>
            <p style="font-size: 1rem; color: #333; line-height: 1.6; margin: 0; font-style: italic;">"${returnData.reason}"</p>
          </div>

          ${isPending ? `
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button class="process-return-btn" data-id="${returnData.id}" data-status="Refunded" style="flex: 1; background: #1e8e3e; color: #fff; border: none; padding: 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                Approve Refund
              </button>
              <button class="process-return-btn" data-id="${returnData.id}" data-status="Rejected" style="flex: 1; background: #fff; color: #d93025; border: 1px solid #fecaca; padding: 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: background 0.2s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='#fff'">
                Reject Request
              </button>
            </div>
          ` : `
            <div style="text-align: center; padding: 1rem; background: #f9f9f9; border-radius: 8px; color: #888; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">
              This request has been ${returnData.status}
            </div>
          `}

        </div>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    `;

    // Ensure no old modals are stuck, then append the new one
    document.getElementById('return-modal-overlay')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}