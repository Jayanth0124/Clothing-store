export const renderSidebar = (currentRoute: string) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'products', icon: '🏷️', label: 'Products' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'orders', icon: '🛒', label: 'Orders' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'coupons', icon: '🎟️', label: 'Coupons' },
    { id: 'categories', icon: '📁', label: 'Categories' },
    { id: 'reviews', icon: '⭐', label: 'Reviews' },
    { id: 'returns', icon: '↩️', label: 'Returns' },
    { id: 'shipping', icon: '🚚', label: 'Shipping' },
    { id: 'reports', icon: '📈', label: 'Reports' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  const html = `
    <div class="sidebar-brand" style="font-family: 'Italiana', serif; font-size: 1.5rem; letter-spacing: 1px;">VG. COMMAND</div>
    <div class="sidebar-nav">
      ${menuItems.map(item => `
        <a href="#${item.id}" class="nav-item ${currentRoute === item.id ? 'active' : ''}">
          <span class="nav-icon">${item.icon}</span>
          ${item.label}
        </a>
      `).join('')}
    </div>
    `;

  document.getElementById('admin-sidebar-container')!.innerHTML = html;
};