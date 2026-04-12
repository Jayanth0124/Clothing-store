import { checkAdminAuth } from './core/AuthGuard';
import { renderSidebar } from './components/Sidebar';
import { renderHeader } from './components/Header';
import { AdminRouter } from './core/AdminRouter';
import { supabase } from '../lib/supabase';

class AdminApp {
  private user: any = null;
  private router!: AdminRouter;

  async init() {
    this.user = await checkAdminAuth();
    if (!this.user) return;

    document.getElementById('admin-loader')!.style.display = 'none';
    document.getElementById('admin-app')!.style.display = 'flex';

    this.mountLayout();
    this.router = new AdminRouter('admin-main-content');
    this.router.handleRoute(); 
    this.bindEvents();
  }

  private mountLayout() {
    const currentHash = window.location.hash.replace('#', '') || 'dashboard';
    renderSidebar(currentHash);
    
    const headerContainer = document.getElementById('admin-header-container');
    if (headerContainer) {
      headerContainer.innerHTML = ''; 
      headerContainer.appendChild(renderHeader(this.user.email));
    }
  }

  private bindEvents() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      renderSidebar(hash);
      // Auto-close mobile sidebar on navigation
      document.querySelector('aside')?.classList.remove('mobile-active');
    });

    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const dropdownMenu = document.getElementById('admin-dropdown-menu');
      
      // Profile Dropdown Toggle
      if (target.closest('#admin-profile-trigger')) {
        if (dropdownMenu) dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
      } else if (!target.closest('.admin-profile-dropdown')) {
        if (dropdownMenu) dropdownMenu.style.display = 'none';
      }

      // Mobile Toggle Button
      if (target.id === 'admin-mobile-toggle' || target.closest('#admin-mobile-toggle')) {
        document.querySelector('aside')?.classList.toggle('mobile-active');
      } 
      // Click outside to close mobile sidebar
      else if (window.innerWidth <= 1024 && !target.closest('aside')) {
        document.querySelector('aside')?.classList.remove('mobile-active');
      }

      // Sign Out from Header
      if (target.id === 'admin-header-logout') {
        await supabase.auth.signOut();
        window.location.href = '/login';
      }
    });
  }
}

export const initAdminApp = () => {
  new AdminApp().init();
};