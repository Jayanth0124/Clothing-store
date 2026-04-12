import { supabase } from '../lib/supabase';

export class ProfilePage {
  
  public async init() {
    // 1. Route Guard: Ensure user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = '/login.html';
      return;
    }

    // 2. Set user details in UI
    const emailEl = document.getElementById('profile-email');
    if (emailEl) emailEl.innerText = session.user.email || 'Premium Member';

    // 3. Bind Logout Logic
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/login.html'; // Kick to login after sign out
    });

    // 4. Tab Switching Logic (Flipkart/Ajio style)
    this.bindTabs();

    // 5. Fetch Real Order History
    this.fetchUserOrders(session.user.id);
  }

  private bindTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetElement = e.target as HTMLElement;

        // Reset all tabs
        tabs.forEach(t => { 
          (t as HTMLElement).style.color = '#888'; 
          (t as HTMLElement).style.fontWeight = '400'; 
        });
        document.querySelectorAll('.profile-section').forEach(s => (s as HTMLElement).style.display = 'none');
        
        // Activate clicked tab
        const target = targetElement.dataset.target;
        targetElement.style.color = '#000';
        targetElement.style.fontWeight = '600';
        document.getElementById(`tab-${target}`)!.style.display = 'block';
      });
    });
  }

  private async fetchUserOrders(userId: string) {
    const container = document.getElementById('customer-orders-container');
    if (!container) return;

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      container.innerHTML = `<p style="color:red;">Error loading orders.</p>`;
      return;
    }

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div style="padding: 4rem; text-align: center; background: #fafafa; border: 1px solid #eee; border-radius: 4px;">
          <p style="color: #666; margin-bottom: 1.5rem; font-size: 1rem;">You haven't placed any orders yet.</p>
          <a href="/" class="btn" style="background:#000; color:#fff;">Explore Collection</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div style="border: 1px solid #e5e5e5; padding: 2rem; margin-bottom: 2rem; background: #fff; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f4f4f4; padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
          <div>
            <span style="font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px;">Order Reference</span>
            <h4 style="font-size: 1.2rem; font-family: var(--font-body); font-weight: 600; margin-top: 0.5rem;">${order.id}</h4>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px;">Date Placed</span>
            <p style="font-size: 0.95rem; margin-top: 0.5rem; font-weight: 500;">${new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="badge" style="background: ${order.status === 'Pending' ? '#fff3cd' : '#e6f4ea'}; color: ${order.status === 'Pending' ? '#856404' : '#1e8e3e'}; padding: 6px 12px; border-radius: 2px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
              ${order.status}
            </span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px;">Total</span>
            <p style="font-size: 1.5rem; font-weight: 600; margin-top: 0.5rem;">₹${order.total_amount.toLocaleString()}</p>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Export initialization function for Barba Router
export const initProfile = () => {
  new ProfilePage().init();
};