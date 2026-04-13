import { CartManager } from './cart';
import { supabase } from '../lib/supabase';
import { showToast } from '../lib/ui';
import gsap from 'gsap';

export class CheckoutManager {
  private cart: CartManager;
  private orderId: string = '';
  private appliedDiscount: number = 0; 
  private shippingZones: any[] = [];
  private selectedShipping: any = null;

  constructor(cart: CartManager) {
    this.cart = cart;
    this.bindEvents();
  }

  get modal(): HTMLElement | null {
    return document.getElementById('checkout-modal');
  }

  private generateUUID() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  async open() {
    const m = this.modal;
    if (!m) return; 

    m.setAttribute('data-lenis-prevent', 'true'); 
    this.orderId = this.generateUUID();
    this.appliedDiscount = 0; 
    
    const { data } = await supabase.from('shipping_zones').select('*').order('rate', { ascending: true });
    this.shippingZones = data || [];
    
    if (this.shippingZones.length > 0) {
        this.selectedShipping = this.shippingZones[0]; 
    }

    this.resetModalState();
    this.renderSummary(); 
    
    m.classList.add('active');
    document.getElementById('cart-sidebar')?.classList.remove('active');
    
    const orderIdDisplay = document.getElementById('order-id-display');
    if (orderIdDisplay) {
      orderIdDisplay.innerText = this.orderId.substring(0, 8).toUpperCase();
    }
  }

  renderSummary() {
    const summaryEl = document.getElementById('checkout-summary');
    if (!summaryEl) return;

    const subtotal = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = Math.floor(subtotal * (this.appliedDiscount / 100));
    const shippingCost = this.selectedShipping ? Number(this.selectedShipping.rate) : 0;
    const totalAmount = subtotal - discountAmount + shippingCost;

    let html = this.cart.items.map(i => `
      <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: #444;">
        <span>${i.name} (x${i.quantity})</span>
        <span>₹${(i.price * i.quantity).toLocaleString()}</span>
      </div>
    `).join('');

    if (this.shippingZones.length > 0) {
        html += `
          <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed #ddd;">
            <h4 style="font-size: 0.75rem; text-transform: uppercase; color: #888; font-weight: 700; letter-spacing: 1px; margin-bottom: 1rem;">Delivery Method</h4>
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
              ${this.shippingZones.map(zone => `
                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; padding: 1rem; border: 1px solid ${this.selectedShipping?.id === zone.id ? '#000' : '#e5e5e5'}; background: ${this.selectedShipping?.id === zone.id ? '#fafafa' : '#fff'}; border-radius: 8px; transition: all 0.2s;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <input type="radio" name="shipping" value="${zone.id}" ${this.selectedShipping?.id === zone.id ? 'checked' : ''} class="shipping-radio" style="accent-color: #000; width: 16px; height: 16px;">
                    <div>
                      <span style="display: block; font-weight: 700; font-size: 0.9rem; color: #111;">${zone.zone_name}</span>
                      <span style="font-size: 0.75rem; color: #888;">${zone.estimated_days}</span>
                    </div>
                  </div>
                  <span style="font-weight: 800; color: #000; font-size: 0.95rem;">${zone.rate === 0 ? 'FREE' : `₹${zone.rate}`}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `;
    }

    html += `
      ${this.appliedDiscount > 0 ? `
      <div style="display:flex; justify-content:space-between; margin-top: 1.5rem; color: #1e8e3e; font-weight: 600; font-size: 0.9rem;">
        <span>Discount (${this.appliedDiscount}%)</span><span>- ₹${discountAmount.toLocaleString()}</span>
      </div>` : ''}
      
      <div style="display:flex; justify-content:space-between; margin-top: ${this.appliedDiscount > 0 ? '0.5rem' : '1.5rem'}; color: #666; font-size: 0.9rem;">
        <span>Shipping</span><span>${shippingCost === 0 ? 'FREE' : `+ ₹${shippingCost}`}</span>
      </div>

      <div style="display:flex; justify-content:space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ddd; font-weight: 800; font-size: 1.2rem; color: #000;">
        <span>Total:</span><span>₹${totalAmount.toLocaleString()}</span>
      </div>
    `;

    summaryEl.innerHTML = html;

    const radios = summaryEl.querySelectorAll('.shipping-radio');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            this.selectedShipping = this.shippingZones.find(z => z.id === target.value);
            this.renderSummary(); 
        });
    });
  }

  bindEvents() {
    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('#trigger-checkout')) { 
        e.preventDefault(); 
        await this.handleCheckoutGate();
      }
      if (target.closest('#close-checkout')) { 
        e.preventDefault(); 
        this.modal?.classList.remove('active'); 
      }
      
      if (target.closest('#apply-promo-btn')) {
        e.preventDefault();
        const codeInput = document.getElementById('promo-code-input') as HTMLInputElement;
        if (!codeInput) return;
        const code = codeInput.value.toUpperCase().trim();
        if (!code) return;
        target.innerText = '...';
        
        const { data, error } = await supabase.from('coupons').select('*').eq('code', code).eq('is_active', true).single();
        if (data && !error) {
          this.appliedDiscount = data.value;
          this.renderSummary();
          target.innerText = 'Applied';
          target.style.background = '#1e8e3e';
          codeInput.disabled = true;
          showToast(`Promo Code Applied: ${this.appliedDiscount}% OFF`, 'success');
        } else {
          showToast('Invalid promo code.', 'error');
          target.innerText = 'Apply';
        }
      }
    });

    document.addEventListener('submit', async (e) => {
      const target = e.target as HTMLFormElement;
      if (target.id === 'checkout-form') {
        e.preventDefault();
        await this.processSimulatedPayment();
      }
    });
  }

  async handleCheckoutGate() {
    if (this.cart.items.length === 0) return showToast("Your cart is empty.", "error");

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      document.getElementById('cart-modal')?.classList.remove('active');
      document.getElementById('cart-sidebar')?.classList.remove('active');
      document.body.style.overflow = 'auto'; 
      showToast("Please log in to proceed to checkout.", "info");
      window.location.href = '/login'; 
      return;
    }
    this.open();
  }

  async processSimulatedPayment() {
    if (this.cart.items.length === 0) return showToast("Your cart is empty.", "error");

    const form = document.getElementById('checkout-form') as HTMLFormElement;
    if (!form) return;

    // --- SECURITY CHECK & EMAIL CAPTURE ---
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user || !session.user.email) {
      showToast("Session expired. Please log in again.", "error");
      window.location.href = '/login';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    // VISUAL VERIFICATION: If you don't see this text, your browser is using a cached file!
    submitBtn.innerText = 'Verifying User & Processing...';
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-processing');

    const nameInput = document.getElementById('c-name') as HTMLInputElement;
    const name = nameInput ? nameInput.value : session.user.user_metadata?.full_name || 'Premium Member';
    const userEmail = session.user.email; // Guaranteed to capture the email!
    
    const subtotal = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = this.selectedShipping ? Number(this.selectedShipping.rate) : 0;
    const totalAmount = subtotal - Math.floor(subtotal * (this.appliedDiscount / 100)) + shippingCost;

    await new Promise(resolve => setTimeout(resolve, 1500));

    const { error } = await supabase.from('orders').insert({
      id: this.orderId,
      user_id: session.user.id,
      customer_name: name,
      customer_email: userEmail, // Saves directly to database
      total_amount: totalAmount,
      status: 'Paid'
    });

    if (error) {
      console.error(error);
      submitBtn.innerText = 'Confirm & Pay';
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-processing');
      showToast('Error saving order: ' + error.message, 'error');
      return;
    }

    this.cart.items = [];
    if (typeof (this.cart as any).saveCart === 'function') (this.cart as any).saveCart();
    if (typeof (this.cart as any).render === 'function') (this.cart as any).render();
    localStorage.removeItem('vito_cart_v2'); 
    document.dispatchEvent(new Event('cart-updated')); 
    
    this.showSuccessAnimation();
  }

  showSuccessAnimation() {
    const formContainer = document.getElementById('checkout-form');
    const shortRef = this.orderId.substring(0, 8).toUpperCase();
    
    const successHTML = `
      <div id="order-success-screen" class="success-screen" style="text-align: center; padding: 2rem 0;">
        <div class="success-icon" style="margin: 0 auto 1.5rem auto; width: 60px; height: 60px; background: #000; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 30px; height: 30px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 style="font-family: 'Italiana', serif; font-size: 2.5rem; margin-bottom: 1rem;">Order Placed</h2>
        <p style="color: #666; margin-bottom: 2rem;">Thank you for your purchase.</p>
        <div style="background: #fafafa; padding: 1.5rem; border: 1px solid #eee; width: 100%; margin-bottom: 2rem;">
          <p style="font-size: 0.8rem; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 0.5rem;">Reference Number</p>
          <p style="font-size: 1.5rem; font-weight: bold; font-family: monospace; margin: 0;">${shortRef}</p>
        </div>
        <button id="btn-continue-shopping" class="btn" style="width: 100%; background: #000; color: #fff; padding: 1rem; cursor: pointer; text-transform: uppercase; font-weight: 600; border: none; letter-spacing: 1px;">Return to Shop</button>
      </div>
    `;

    if (formContainer) {
      formContainer.style.display = 'none';
      formContainer.insertAdjacentHTML('afterend', successHTML);

      gsap.fromTo('.success-icon svg', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' });
      gsap.fromTo('.success-screen h2, .success-screen p, .success-screen div, .success-screen button', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 });

      document.getElementById('btn-continue-shopping')?.addEventListener('click', () => {
        document.body.style.overflow = 'auto';
        this.modal?.classList.remove('active');
        setTimeout(() => {
          this.resetModalState();
          window.location.href = '/shop'; 
        }, 300); 
      });
    }
  }

  resetModalState() {
    const formContainer = document.getElementById('checkout-form');
    const successScreen = document.getElementById('order-success-screen');
    const submitBtn = document.querySelector('#checkout-form button[type="submit"]') as HTMLButtonElement;
    if (formContainer) formContainer.style.display = 'block'; 
    if (successScreen) successScreen.remove();
    if (submitBtn) {
      submitBtn.innerText = 'Confirm & Pay';
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-processing');
    }
    const form = document.getElementById('checkout-form') as HTMLFormElement;
    if (form) form.reset();
  }
}