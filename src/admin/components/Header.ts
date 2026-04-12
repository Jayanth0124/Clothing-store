export const renderHeader = (userEmail: string): HTMLElement => {
  // FIX: Create a div instead of a header to prevent nesting issues
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';
  container.style.alignItems = 'center';
  
  const initial = userEmail.charAt(0).toUpperCase();

  container.innerHTML = `
    <div style="flex: 1; display: flex; align-items: center;">
      <button id="admin-mobile-toggle" class="mobile-toggle" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #000;">☰</button>
    </div>
    
    <div style="flex: 1; text-align: center;">
      <h2 style="font-family: 'Italiana', serif; margin: 0; font-size: 1.5rem; letter-spacing: 2px; color: #000;">COMMAND CENTER</h2>
    </div>
    
    <div style="flex: 1; display: flex; justify-content: flex-end;">
      <div class="admin-profile-dropdown" style="position: relative; cursor: pointer;">
        <div id="admin-profile-trigger" style="display: flex; align-items: center; gap: 12px; transition: opacity 0.2s;">
          <div style="text-align: right; display: flex; flex-direction: column;">
            <span style="font-size: 0.8rem; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 1px;">Admin</span>
            <span style="font-size: 0.7rem; color: #888;">${userEmail}</span>
          </div>
          <div style="width: 40px; height: 40px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: 'Manrope', sans-serif;">
            ${initial}
          </div>
        </div>

        <div id="admin-dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; width: 200px; background: #fff; border: 1px solid #eee; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-top: 15px; z-index: 1000; flex-direction: column;">
          <a href="#settings" class="admin-dropdown-link" style="padding: 1rem; color: #555; text-decoration: none; font-size: 0.85rem; display: block; border-bottom: 1px solid #f9f9f9; text-transform: uppercase; letter-spacing: 1px; font-family: 'Manrope', sans-serif;">⚙️ Settings</a>
          <button id="admin-header-logout" style="padding: 1rem; color: #ff4444; background: none; border: none; cursor: pointer; font-size: 0.85rem; width: 100%; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-family: 'Manrope', sans-serif;">Sign Out</button>
        </div>
      </div>
    </div>
  `;
  return container;
};