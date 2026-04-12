import barba from '@barba/core';
import gsap from 'gsap';
import { initShop } from '../pages/Shop';
import { initAuth } from '../ts/auth'; 
import { initAdmin } from '../ts/admin'; 
import { initProfile } from '../pages/Profile'; // <--- NEW IMPORT

export const initRouter = () => {
  barba.init({
    sync: true,
    transitions: [{
      name: 'fade',
      leave(data: any) { return gsap.to(data.current.container, { opacity: 0, duration: 0.5 }); },
      enter(data: any) { return gsap.from(data.next.container, { opacity: 0, duration: 0.5 }); }
    }],
    views: [
      { namespace: 'shop', afterEnter() { initShop(); } },
      { namespace: 'auth', afterEnter() { initAuth(); } },
      { namespace: 'admin', afterEnter() { initAdmin(); } },
      // NEW VIEW FOR PROFILE
      { namespace: 'profile', afterEnter() { initProfile(); } }
    ]
  });
};