import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Adjust path if needed
import { showToast } from '../../lib/ui';

// Mock data for the UI preview
const MOCK_CUSTOMERS = [
  { id: 'usr_001', name: 'Eleanor Vance', email: 'eleanor.v@example.com', orders: 12, spent: 45200, status: 'Active', joined: '2025-01-15' },
  { id: 'usr_002', name: 'James Sterling', email: 'j.sterling@example.com', orders: 3, spent: 8900, status: 'Active', joined: '2025-08-22' },
  { id: 'usr_003', name: 'Sophia Chen', email: 'schen99@example.com', orders: 0, spent: 0, status: 'Inactive', joined: '2026-02-10' },
  { id: 'usr_004', name: 'Marcus Wright', email: 'mwright.biz@example.com', orders: 28, spent: 112500, status: 'VIP', joined: '2024-11-05' },
  { id: 'usr_005', name: 'Isabella Rossi', email: 'bella.rossi@example.com', orders: 1, spent: 1299, status: 'Active', joined: '2026-04-01' },
];

export default function Customers() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');

  // Example of how you would fetch real users from Supabase later
  /*
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data) setCustomers(data);
    };
    fetchUsers();
  }, []);
  */

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'VIP': return <span className="badge badge-gold">VIP</span>;
      case 'Active': return <span className="badge badge-green">Active</span>;
      case 'Inactive': return <span className="badge badge-gray">Inactive</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="admin-page-wrapper">
      
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1>Customer Directory</h1>
          <p style={{ color: '#888', marginTop: '0.5rem', fontSize: '0.9rem' }}>Manage your clientele and view purchasing history.</p>
        </div>
        <button className="btn btn-primary">+ Export CSV</button>
      </div>

      {/* KPI Summary Cards */}
      <div className="admin-stats-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Customers</span>
          <div className="kpi-value">{customers.length}</div>
          <p style={{ color: '#1e8e3e', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>+12% this month</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Active Buyers</span>
          <div className="kpi-value">{customers.filter(c => c.orders > 0).length}</div>
          <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>Placed at least 1 order</p>
        </div>
        <div className="kpi-card" style={{ borderLeft: '3px solid #d4af37' }}>
          <span className="kpi-label">VIP Clients</span>
          <div className="kpi-value">{customers.filter(c => c.status === 'VIP').length}</div>
          <p style={{ color: '#d4af37', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>Top 5% of spenders</p>
        </div>
      </div>

      {/* Directory Section */}
      <div className="panel" style={{ padding: '0', background: 'transparent', border: 'none' }}>
        
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '250px', padding: '1rem', border: '1px solid #ddd', fontFamily: 'inherit', outline: 'none' }}
          />
          <select style={{ padding: '1rem', border: '1px solid #ddd', fontFamily: 'inherit', outline: 'none', background: '#fff' }}>
            <option value="all">All Statuses</option>
            <option value="vip">VIP Only</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="admin-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No customers found matching "{searchTerm}"</td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="customer-avatar">{customer.name.charAt(0)}</div>
                        <span style={{ fontWeight: 600, fontFamily: 'Italiana, serif', fontSize: '1.1rem' }}>{customer.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#666', fontSize: '0.85rem' }}>{customer.email}</td>
                    <td>{customer.orders}</td>
                    <td style={{ fontWeight: 600 }}>₹{customer.spent.toLocaleString()}</td>
                    <td>{getStatusBadge(customer.status)}</td>
                    <td>
                      <button className="action-btn" onClick={() => showToast(`Viewing profile for ${customer.name}`)}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}