import { supabase } from '../lib/supabase';

export class ProfilePage {
  
  public async init() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = '/login'; // FIX: Clean path
      return;
    }

    const emailEl = document.getElementById('profile-email');
    if (emailEl) emailEl.innerText = session.user.email || 'Premium Member';

    document.getElementById('btn-logout')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/login'; // FIX: Clean path
    });

    this.bindTabs();
    this.fetchUserOrders(session.user.id);
  }

  // ... keep bindTabs and fetchUserOrders exactly the same
  private bindTabs() { /* ... */ }
  private async fetchUserOrders(userId: string) { /* ... */ }
}

export const initProfile = () => {
  new ProfilePage().init();
};