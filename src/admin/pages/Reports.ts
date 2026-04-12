export class ReportsPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Business Reports</h1>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div class="kpi-card">
          <h3 style="margin-bottom: 1rem;">Sales Ledger</h3>
          <p style="color:#666; margin-bottom: 1.5rem; font-size: 0.9rem;">Export all paid orders, tax collected, and payment gateway fees.</p>
          <button class="btn btn-primary" onclick="alert('Downloading Sales_Report.csv')">Export CSV</button>
        </div>
        <div class="kpi-card">
          <h3 style="margin-bottom: 1rem;">Inventory Valuation</h3>
          <p style="color:#666; margin-bottom: 1.5rem; font-size: 0.9rem;">Export current stock levels, low-stock warnings, and warehouse valuation.</p>
          <button class="btn btn-primary" onclick="alert('Downloading Inventory_Report.csv')">Export CSV</button>
        </div>
        <div class="kpi-card">
          <h3 style="margin-bottom: 1rem;">Customer Insights</h3>
          <p style="color:#666; margin-bottom: 1.5rem; font-size: 0.9rem;">Export user emails, lifetime value, and demographic data for email marketing.</p>
          <button class="btn btn-primary" onclick="alert('Downloading Customer_List.csv')">Export CSV</button>
        </div>
      </div>
    `;
    return this.container;
  }
}