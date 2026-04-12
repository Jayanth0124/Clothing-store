export interface ColumnDef {
  key: string;
  label: string;
  render?: (val: any, row: any) => string;
}

export class DataGrid {
  private columns: ColumnDef[];
  private data: any[];
  private actions: (row: any) => string;

  constructor(columns: ColumnDef[], data: any[], actions?: (row: any) => string) {
    this.columns = columns;
    this.data = data;
    this.actions = actions || (() => '');
  }

  render(): string {
    if (this.data.length === 0) {
      return `<div style="padding: 3rem; text-align: center; color: #888;">No records found.</div>`;
    }

    const thead = this.columns.map(col => `<th>${col.label}</th>`).join('') + (this.actions ? `<th>Actions</th>` : '');
    
    const tbody = this.data.map(row => {
      const tds = this.columns.map(col => {
        const val = row[col.key];
        const displayVal = col.render ? col.render(val, row) : (val || '-');
        return `<td>${displayVal}</td>`;
      }).join('');
      
      const actionTd = this.actions ? `<td>${this.actions(row)}</td>` : '';
      return `<tr>${tds}${actionTd}</tr>`;
    }).join('');

    return `
      <div class="data-table-container">
        <table class="data-table">
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    `;
  }
}