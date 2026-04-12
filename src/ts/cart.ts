export class CartManager {
  items: any[] = [];

  constructor() {
    this.loadCart();
    this.bindEvents();
  }

  loadCart() {
    const saved = localStorage.getItem('vito_cart_v2');
    if (saved) {
      this.items = JSON.parse(saved);
    }
    this.updateDOM();
  }

  saveCart() {
    localStorage.setItem('vito_cart_v2', JSON.stringify(this.items));
    this.updateDOM();
  }

  add(product: any, qty: number, size: string, color: string) {
    const existing = this.items.find(i => i.id === product.id && i.size === size && i.color === color);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.items.push({ ...product, quantity: qty, size, color });
    }
    this.saveCart();
    this.open();
  }

  remove(index: number) {
    this.items.splice(index, 1);
    this.saveCart();
  }

  updateDOM() {
    // Tells the React Navbar to update the counter badge
    window.dispatchEvent(new Event('cart-updated'));
    this.render();
  }

  open() {
    document.getElementById('cart-sidebar')?.classList.add('active');
    document.querySelector('.overlay')?.classList.add('active');
    this.render();
  }

  render() {
    const container = document.getElementById('cart-list');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#888; padding:3rem 1rem;">Your cart is empty.</p>';
      return;
    }

    container.innerHTML = this.items.map((item, index) => `
      <div style="display:flex; gap:1rem; margin-bottom:1.5rem; padding-bottom:1.5rem; border-bottom:1px solid #eee;">
        <img src="${item.image}" style="width:80px; height:100px; object-fit:cover; background:#f4f4f4;" />
        <div style="flex:1;">
          <h4 style="font-family: 'Italiana', serif; margin:0 0 0.5rem 0; font-size:1.1rem;">${item.name}</h4>
          <p style="margin:0; font-size:0.8rem; color:#666; text-transform:uppercase;">
            Size: ${item.size} | Color: <span style="display:inline-block; width:12px; height:12px; background:${item.color}; border-radius:50%; border:1px solid #ccc; vertical-align:middle;"></span>
          </p>
          <p style="margin:0.5rem 0; font-weight:bold; color:#D4AF37;">₹${item.price}</p>
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
            <span style="font-size:0.9rem; color:#333;">Qty: ${item.quantity}</span>
            <button class="remove-item-btn" data-index="${index}" style="background:none; border:none; color:#d93025; text-decoration:underline; cursor:pointer; font-size:0.8rem; padding:0;">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Listen for remove button clicks
      if (target.classList.contains('remove-item-btn')) {
        const index = parseInt(target.dataset.index || '0');
        this.remove(index);
      }
    });
  }
}