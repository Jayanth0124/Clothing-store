import { DashboardPage } from '../pages/Dashboard';
import { ProductsPage } from '../pages/Products';
import { OrdersPage } from '../pages/Orders';
import { InventoryPage } from '../pages/Inventory';
import { CustomersPage } from '../pages/Customers';
import { ReviewsPage } from '../pages/Reviews';
import { ReturnsPage } from '../pages/Returns';
import { CouponsPage } from '../pages/Coupons';
import { CategoriesPage } from '../pages/Categories';
import { ShippingPage } from '../pages/Shipping';
import { MarketingPage } from '../pages/Marketing';
import { ReportsPage } from '../pages/Reports';
import { RolesPage } from '../pages/Roles';
import { SettingsPage } from '../pages/Settings';

export class AdminRouter {
  private container: HTMLElement;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  public handleRoute() {
    // Decode URI safely to handle spaces or special characters in the hash
    const rawHash = window.location.hash.replace('#', '') || 'dashboard';
    const hash = decodeURIComponent(rawHash).toLowerCase().trim(); 
    
    this.container.innerHTML = ''; 

    let pageComponent;
    
    switch (hash) {
      case 'dashboard': pageComponent = new DashboardPage(); break;
      case 'products': pageComponent = new ProductsPage(); break;
      case 'orders': pageComponent = new OrdersPage(); break;
      case 'inventory': pageComponent = new InventoryPage(); break;
      case 'customers': pageComponent = new CustomersPage(); break;
      case 'reviews': pageComponent = new ReviewsPage(); break;
      case 'returns': pageComponent = new ReturnsPage(); break;
      case 'coupons': pageComponent = new CouponsPage(); break;
      case 'categories': pageComponent = new CategoriesPage(); break;
      case 'shipping': pageComponent = new ShippingPage(); break;
      case 'marketing': pageComponent = new MarketingPage(); break;
      case 'reports': pageComponent = new ReportsPage(); break;
      case 'settings': pageComponent = new SettingsPage(); break;
      // Handles both "roles" and exact match for the sidebar item "admins & roles"
      case 'roles': 
      case 'admins & roles': pageComponent = new RolesPage(); break; 
      default:
        this.container.innerHTML = `
          <div style="padding: 4rem; text-align: center; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <h1 style="font-family: 'Italiana', serif; font-size: 4rem; margin-bottom: 1rem;">404</h1>
            <h2 style="font-size: 1.5rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem;">Module Not Found</h2>
            <p style="color: #888;">The module "<strong>${hash}</strong>" does not exist or is under construction.</p>
          </div>
        `;
        return;
    }

    this.container.appendChild(pageComponent.render());
  }
}