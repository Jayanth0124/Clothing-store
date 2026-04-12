import { useEffect, useRef } from 'react';
import '../admin/styles/admin.css';
import { initAdminApp } from '../admin/AdminMain';

export default function AdminShell() {
  const initialized = useRef(false);

  useEffect(() => {
    // Ensure the admin logic only runs exactly once when the component mounts
    if (!initialized.current) {
      initialized.current = true;
      
      // Manually boot the vanilla JS admin application
      initAdminApp();

      // Small delay to ensure the DOM elements are ready before routing
      setTimeout(() => {
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }, 100);
    }
  }, []);

  return (
    /* ADDED id="admin-root" to lock in the CSS scoping */
    <div id="admin-root" className="admin-body">
      <div id="admin-app" style={{ display: 'none' }}>
        <aside id="admin-sidebar-container"></aside>
        
        <div className="admin-wrapper">
          <header id="admin-header-container"></header>
          <main id="admin-main-content"></main>
        </div>
      </div>

      <div id="admin-loader" className="loader-overlay">
        <div className="spinner"></div>
        <p>Authenticating Workspace...</p>
      </div>
    </div>
  );
}