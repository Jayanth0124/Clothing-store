import { supabase } from '../lib/supabase';

export const initAdmin = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) { 
    window.location.href = '/login'; // FIX: Clean path
    return; 
  }

  if (session.user.email !== 'admin@vito.com') {
    alert("Access Denied: You do not have administrator privileges.");
    window.location.href = '/'; 
    return;
  }

  const adminEmailEl = document.getElementById('admin-email-display');
  if (adminEmailEl) adminEmailEl.innerText = session.user.email;

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/login'; // FIX: Clean path
  });

  setupTabs();
  fetchOverview();
  fetchProducts();
  fetchOrders();
  setupAddProduct();
};

// ... keep the rest of your setupTabs, fetchOverview, etc. exactly the same
const setupTabs = () => { /* ... */ };
const fetchOverview = async () => { /* ... */ };
const fetchProducts = async () => { /* ... */ };
const fetchOrders = async () => { /* ... */ };
const setupAddProduct = () => { /* ... */ };