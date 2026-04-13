import { CartStore } from '../core/CartStore';

export class CartModal {
  private modal: HTMLElement;
  private list: HTMLElement;
  private store: CartStore;

  constructor() {
    this.modal = document.getElementById('cart-modal') as HTMLElement;
    this.list = document.getElementById('cart-list') as HTMLElement;
    this.store = CartStore.getInstance();
    this.bindEvents();
    this.render();
    
    // Subscribe to store updates to re-render cart automatically
    this.store.subscribe(() => this.render());
  }

  private bindEvents() {
    document.getElementById('cart-trigger')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.open();
    });

    document.getElementById('cart-close')?.addEventListener('click', () => {
      this.close();
    });

    // --- Global Smart Listener ---
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // 1. Close the cart if the user clicks ANY navigation link <a>
      if (target.closest('a') && this.modal.classList.contains('active')) {
        this.close();
      }

      // 2. Close the cart if the user clicks the dark background overlay
      if (target === this.modal) {
        this.close();
      }
    });
  }

  private render() {
    const items = this.store.getItems();
    this.list.innerHTML = '';
    
    if (items.length === 0) {
      this.list.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
      return;
    }

    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <span>${item.type}</span>
        </div>
        <div class="cart-item-actions">
           <span>x${item.quantity}</span>
        </div>
      `;
      this.list.appendChild(el);
    });
  }

  public open() { 
    this.modal.classList.add('active'); 
    document.body.style.overflow = 'hidden'; // Stop background scrolling
  }
  
  public close() { 
    this.modal.classList.remove('active'); 
    document.body.style.overflow = 'auto'; // Restore background scrolling
  }
}