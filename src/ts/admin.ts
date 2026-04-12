import { supabase } from '../lib/supabase';

export const initAdmin = async () => {
  // 1. SECURITY GUARD: Check session & Admin Email
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) { 
    window.location.href = '/login.html'; 
    return; 
  }

  if (session.user.email !== 'admin@vito.com') {
    alert("Access Denied: You do not have administrator privileges.");
    window.location.href = '/'; 
    return;
  }

  // Set Admin Email in UI
  const adminEmailEl = document.getElementById('admin-email-display');
  if (adminEmailEl) adminEmailEl.innerText = session.user.email;

  // 2. LOGOUT LOGIC
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
  });

  // 3. INITIALIZE DASHBOARD
  setupTabs();
  fetchOverview();
  fetchProducts();
  fetchOrders();
  setupAddProduct();
};

const setupTabs = () => {
  const tabs = document.querySelectorAll('.admin-tab');
  const sections = document.querySelectorAll('.admin-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => (s as HTMLElement).style.display = 'none');
      
      const target = (e.target as HTMLElement).dataset.target;
      (e.target as HTMLElement).classList.add('active');
      document.getElementById(`section-${target}`)!.style.display = 'block';
    });
  });
};

const fetchOverview = async () => {
  const { data: orders } = await supabase.from('orders').select('total_amount, status');
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  
  if (orders) {
    const totalRev = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const completedOrders = orders.filter(o => o.status === 'Paid').length;
    
    document.getElementById('stat-rev')!.innerText = `₹${totalRev.toLocaleString()}`;
    document.getElementById('stat-orders')!.innerText = completedOrders.toString();
  }
  if (prodCount !== null) {
    document.getElementById('stat-prods')!.innerText = prodCount.toString();
  }
};

const fetchProducts = async () => {
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  const tbody = document.getElementById('products-tbody');
  
  if (tbody && products) {
    tbody.innerHTML = products.map(p => `
      <tr>
        <td><div style="width: 45px; height: 55px; border-radius: 4px; overflow: hidden; background: #eee;"><img src="${p.image}" style="width: 100%; height: 100%; object-fit: cover;"></div></td>
        <td><strong>${p.name}</strong><br><span style="color:#888; font-size:0.8rem;">ID: ${p.id.substring(0,8)}</span></td>
        <td><span class="badge" style="background:#f4f4f4; color:#333; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${p.type}</span></td>
        <td><strong>₹${p.price}</strong>${p.original_price ? `<br><span style="text-decoration:line-through; color:#888; font-size:0.8rem;">₹${p.original_price}</span>` : ''}</td>
        <td><button class="action-btn" onclick="alert('Edit functionality coming soon')">Edit</button></td>
      </tr>
    `).join('');
  }
};

const fetchOrders = async () => {
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  const tbody = document.getElementById('orders-tbody');
  
  if (tbody && orders) {
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.customer_name}</td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td><span class="badge badge-shipped">${o.status}</span></td>
        <td><strong>₹${o.total_amount.toLocaleString()}</strong></td>
      </tr>
    `).join('');
  }
};

const setupAddProduct = () => {
  const addPanel = document.getElementById('add-product-panel');
  document.getElementById('btn-add-product')?.addEventListener('click', () => addPanel!.style.display = 'block');
  document.getElementById('btn-cancel-product')?.addEventListener('click', () => addPanel!.style.display = 'none');

  document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('#add-product-form button[type="submit"]') as HTMLButtonElement;
    btn.innerText = 'Saving to Database...';

    const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
    
    const { error } = await supabase.from('products').insert({
      name: getVal('p-name'),
      type: getVal('p-type'),
      price: Number(getVal('p-price')),
      original_price: getVal('p-orig') ? Number(getVal('p-orig')) : null,
      image: getVal('p-img')
    });

    if (error) {
      alert("Error adding product: " + error.message);
    } else {
      (e.target as HTMLFormElement).reset();
      addPanel!.style.display = 'none';
      fetchProducts(); // Refresh list dynamically
      fetchOverview(); // Refresh counts dynamically
      alert("Product successfully added to the store!");
    }
    btn.innerText = 'Save Product';
  });
};