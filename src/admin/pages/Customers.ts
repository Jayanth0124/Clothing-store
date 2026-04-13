import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class CustomersPage {
  private container: HTMLElement;
  private allOrders: any[] = []; 
  private customerList: any[] = [];

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'admin-page-wrapper';
    this.bindEvents(); 
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1>Customer Directory</h1>
      </div>

      <div class="vg-card" style="min-height: 400px; padding: 0;">
        <div class="admin-table-container" style="margin-top: 0; border: none;" id="customers-table-wrapper">
           <div style="padding: 4rem 2rem; text-align: center; color: #888;">
             <div class="spinner"></div> Loading customer data...
           </div>
        </div>
      </div>
    `;

    setTimeout(() => this.fetchCustomers(), 0);
    return this.container;
  }

  async fetchCustomers() {
    // 1. Fetch all orders
    const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const wrapper = document.getElementById('customers-table-wrapper');
    if (!wrapper) return;

    if (error || !orders || orders.length === 0) {
      wrapper.innerHTML = this.getEmptyStateUI();
      return;
    }

    this.allOrders = orders;
    
    // 2. Map customers strictly by EMAIL, not name
    const customerMap: Record<string, { name: string; email: string; orders: number; totalSpent: number; lastOrder: string }> = {};

    orders.forEach(order => {
      // Fallback to name if it's an old order before we added the email column
      const uniqueKey = order.customer_email ? order.customer_email.trim().toLowerCase() : (order.customer_name ? order.customer_name.trim().toLowerCase() : 'unknown');
      
      if (!customerMap[uniqueKey]) {
        customerMap[uniqueKey] = {
          name: order.customer_name || 'Guest', 
          email: order.customer_email || 'No email provided',
          orders: 0,
          totalSpent: 0,
          lastOrder: order.created_at
        };
      }
      
      customerMap[uniqueKey].orders += 1;
      
      // Do not count refunded/cancelled orders in Lifetime Value!
      if (order.status !== 'Cancelled' && order.status !== 'Refunded') {
        customerMap[uniqueKey].totalSpent += (order.total_amount || 0);
      }
    });

    this.customerList = Object.values(customerMap);

    const columns: ColumnDef[] = [
      { 
        key: 'name', 
        label: 'Customer Info',
        render: (val, row) => `
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 35px; height: 35px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: 'Manrope', sans-serif;">
              ${val.charAt(0).toUpperCase()}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 600; text-transform: capitalize; color: #111;">${val}</span>
              <span style="font-size: 0.75rem; color: #888;">${row.email}</span>
            </div>
          </div>
        `
      },
      { 
        key: 'orders', 
        label: 'Total Orders',
        render: (val) => `<span style="background: #f4f4f4; padding: 4px 12px; border-radius: 20px; font-weight: 600;">${val}</span>`
      },
      { 
        key: 'totalSpent', 
        label: 'Lifetime Value', 
        render: (val) => `<span style="color: #d4af37; font-weight: bold;">₹${val.toLocaleString()}</span>` 
      },
      { 
        key: 'lastOrder', 
        label: 'Last Active', 
        render: (val) => `<span style="color: #888; font-size: 0.85rem;">${new Date(val).toLocaleDateString()}</span>` 
      }
    ];

    const grid = new DataGrid(columns, this.customerList, (customer) => `
      <button class="action-btn view-profile-btn" data-email="${customer.email}" data-name="${customer.name}" style="background: #fff; border: 1px solid #ddd; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.75rem; color: #111; letter-spacing: 0.5px; transition: all 0.2s;" onmouseover="this.style.borderColor='#000'; this.style.color='#000';" onmouseout="this.style.borderColor='#ddd'; this.style.color='#111';">
        VIEW PROFILE
      </button>
    `);
    
    wrapper.innerHTML = grid.render();
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const profileBtn = target.closest('.view-profile-btn') as HTMLElement;
      
      if (profileBtn) {
        // Retrieve by email now to guarantee exact match
        const email = profileBtn.getAttribute('data-email');
        const name = profileBtn.getAttribute('data-name');
        if (email && name) this.openCustomerModal(email, name);
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'customer-modal-overlay' || target.closest('.close-modal-btn')) {
        document.getElementById('customer-modal-overlay')?.remove();
      }
    });
  }

  openCustomerModal(customerEmail: string, customerName: string) {
    const customer = this.customerList.find(c => c.email === customerEmail);
    if (!customer) return;

    // Filter history safely checking if email matches
    const history = this.allOrders.filter(o => {
      if (o.customer_email && o.customer_email.toLowerCase() === customerEmail.toLowerCase()) return true;
      // Fallback for old orders before email was tracked
      if (!o.customer_email && o.customer_name && o.customer_name.toLowerCase() === customerName.toLowerCase()) return true;
      return false;
    });

    const isVIP = customer.orders > 10;
    const badgeText = isVIP ? 'VIP Customer' : 'Standard Customer';
    const badgeColor = isVIP ? '#d4af37' : '#888'; 
    const badgeBg = isVIP ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0,0,0,0.04)';

    const modalHTML = `
      <div id="customer-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;">
        <div style="background: #fff; width: 90%; max-width: 550px; border-radius: 24px; padding: 2.5rem; box-shadow: 0 20px 48px rgba(0,0,0,0.15); animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 50px; height: 50px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-family: 'Italiana', serif;">
                ${customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style="margin: 0; font-family: 'Manrope', sans-serif; font-size: 1.4rem; color: #111;">${customer.name}</h2>
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px;">
                  <span style="font-size: 0.8rem; color: #666;">${customer.email}</span>
                  <span style="font-size: 0.7rem; color: ${badgeColor}; background: ${badgeBg}; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">${badgeText}</span>
                </div>
              </div>
            </div>
            <button class="close-modal-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #888;">&times;</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
            <div style="background: #f4f5f7; padding: 1.5rem; border-radius: 16px;">
              <span style="display: block; font-size: 0.75rem; color: #888; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Lifetime Value</span>
              <span style="font-size: 1.8rem; font-weight: 300; color: #d4af37;">₹${customer.totalSpent.toLocaleString()}</span>
            </div>
            <div style="background: #f4f5f7; padding: 1.5rem; border-radius: 16px;">
              <span style="display: block; font-size: 0.75rem; color: #888; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">Total Orders</span>
              <span style="font-size: 1.8rem; font-weight: 300; color: #000;">${customer.orders}</span>
            </div>
          </div>

          <h3 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #eee;">Order History</h3>
          <div style="max-height: 250px; overflow-y: auto; padding-right: 10px;">
            ${history.map(order => {
              let statusColor = '#888';
              let statusBg = '#f4f4f4';
              if (order.status === 'Paid' || order.status === 'Delivered') { statusColor = '#1e8e3e'; statusBg = 'rgba(30,142,62,0.1)'; }
              if (order.status === 'Cancelled' || order.status === 'Refunded') { statusColor = '#d93025'; statusBg = 'rgba(217,48,37,0.1)'; }
              
              return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #f4f4f4;">
                <div>
                  <div style="font-weight: 600; font-size: 0.9rem; color: #111; margin-bottom: 4px;">Ref: ${order.id.substring(0,8).toUpperCase()}</div>
                  <div style="font-size: 0.75rem; color: #888;">${new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700; font-size: 0.95rem; color: ${order.status === 'Cancelled' || order.status === 'Refunded' ? '#888' : '#000'}; text-decoration: ${order.status === 'Cancelled' || order.status === 'Refunded' ? 'line-through' : 'none'}; margin-bottom: 4px;">₹${(order.total_amount || 0).toLocaleString()}</div>
                  <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: ${statusColor}; background: ${statusBg}; padding: 3px 8px; border-radius: 4px;">${order.status || 'Pending'}</span>
                </div>
              </div>
            `}).join('')}
          </div>

        </div>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    `;

    document.getElementById('customer-modal-overlay')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  private getEmptyStateUI() {
    return `
      <div style="padding: 5rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="width: 80px; height: 80px; background: #f4f4f4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
          <span style="font-size: 2rem;">👤</span>
        </div>
        <h3 style="font-family: 'Italiana', serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #111;">No Customers Yet</h3>
        <p style="color: #888; font-size: 0.95rem; max-width: 400px; margin: 0 auto; line-height: 1.6;">
          Your customer directory will automatically populate here as soon as your first orders are placed.
        </p>
      </div>
    `;
  }
}