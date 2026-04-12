import { supabase } from '../../lib/supabase';
import { DataGrid, ColumnDef } from '../components/DataGrid';

export class MarketingPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Homepage CMS (Banners)</h1>
        <button class="btn btn-primary">+ Upload Banner</button>
      </div>
      <div id="marketing-grid-wrapper">Loading active banners...</div>
    `;
    this.fetchBanners();
    return this.container;
  }

  async fetchBanners() {
    const { data, error } = await supabase.from('marketing_banners').select('*').order('display_order', { ascending: true });
    if (error || !data) return;

    const columns: ColumnDef[] = [
      { key: 'image_url', label: 'Visual', render: (val) => `<img src="${val}" style="width: 100px; height: 40px; object-fit: cover; border-radius: 4px;">` },
      { key: 'title', label: 'Campaign Title', render: (val) => `<strong>${val}</strong>` },
      { key: 'target_link', label: 'Click Destination', render: (val) => `<code>${val}</code>` },
      { 
        key: 'is_active', 
        label: 'Status', 
        render: (val) => val ? `<span class="badge badge-green">Live</span>` : `<span class="badge badge-gray">Hidden</span>` 
      }
    ];

    const actions = (row: any) => `
      <button class="action-btn">Edit</button>
      <button class="action-btn" style="margin-left:10px; color:${row.is_active ? 'red' : 'green'};">${row.is_active ? 'Hide' : 'Publish'}</button>
    `;
    const grid = new DataGrid(columns, data, actions);
    document.getElementById('marketing-grid-wrapper')!.innerHTML = grid.render();
  }
}