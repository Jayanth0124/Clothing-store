// Sleek, animated side-notification
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const existing = document.getElementById('vg-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'vg-toast';
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '40px';
  toast.style.right = '40px';
  toast.style.background = type === 'error' ? '#d93025' : '#000';
  toast.style.color = '#fff';
  toast.style.padding = '1rem 2rem';
  toast.style.fontFamily = "'Manrope', sans-serif";
  toast.style.fontSize = '0.9rem';
  toast.style.fontWeight = '600';
  toast.style.letterSpacing = '0.5px';
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(50px)';
  toast.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

  document.body.appendChild(toast);

  // Animate In
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // Animate Out & Remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
};

// Premium Confirmation Modal Overlay
export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:10000; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.3s; backdrop-filter:blur(3px);`;
    
    const box = document.createElement('div');
    box.style.cssText = `background:#fff; padding:3rem; max-width:450px; width:90%; text-align:center; font-family:'Manrope', sans-serif; transform:translateY(20px); transition:transform 0.3s;`;
    
    const text = document.createElement('p');
    text.innerText = message;
    text.style.cssText = `margin-bottom:2.5rem; font-size:1.1rem; color:#000; line-height:1.5;`;

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `display:flex; gap:1rem; justify-content:center;`;

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'CANCEL';
    cancelBtn.style.cssText = `padding:0.8rem 2rem; border:1px solid #ddd; background:none; cursor:pointer; font-weight:600; letter-spacing:1px;`;

    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = 'CONFIRM';
    confirmBtn.style.cssText = `padding:0.8rem 2rem; border:none; background:#000; color:#fff; cursor:pointer; font-weight:600; letter-spacing:1px;`;

    const close = (result: boolean) => {
      overlay.style.opacity = '0';
      box.style.transform = 'translateY(20px)';
      setTimeout(() => { overlay.remove(); resolve(result); }, 300);
    };

    cancelBtn.onclick = () => close(false);
    confirmBtn.onclick = () => close(true);

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(confirmBtn);
    box.appendChild(text);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      box.style.transform = 'translateY(0)';
    });
  });
};

// Premium Input Prompt Modal
export const showPrompt = (title: string, placeholder: string = ''): Promise<string | null> => {
    return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:10000; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.3s; backdrop-filter:blur(3px);`;
    
    const box = document.createElement('div');
    box.style.cssText = `background:#fff; padding:3rem; max-width:450px; width:90%; font-family:'Manrope', sans-serif; transform:translateY(20px); transition:transform 0.3s;`;
    
    const text = document.createElement('h3');
    text.innerText = title;
    text.style.cssText = `margin-bottom:1.5rem; font-size:1.2rem; color:#000; font-family:'Italiana', serif; text-transform:uppercase;`;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.style.cssText = `width:100%; padding:1rem; margin-bottom:2.5rem; border:1px solid #ddd; outline:none; font-family:inherit; background:#fafafa; font-size:1rem;`;

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `display:flex; gap:1rem; justify-content:flex-end;`;

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'CANCEL';
    cancelBtn.style.cssText = `padding:0.8rem 2rem; border:1px solid #ddd; background:none; cursor:pointer; font-weight:600; letter-spacing:1px; font-size:0.8rem;`;

    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = 'SUBMIT';
    confirmBtn.style.cssText = `padding:0.8rem 2rem; border:none; background:#000; color:#fff; cursor:pointer; font-weight:600; letter-spacing:1px; font-size:0.8rem;`;

    const close = (result: string | null) => {
      overlay.style.opacity = '0';
      box.style.transform = 'translateY(20px)';
      setTimeout(() => { overlay.remove(); resolve(result); }, 300);
    };

    cancelBtn.onclick = () => close(null);
    confirmBtn.onclick = () => {
      if (!input.value.trim()) { input.style.borderColor = '#d93025'; return; }
      close(input.value);
    };

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(confirmBtn);
    box.appendChild(text);
    box.appendChild(input);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      box.style.transform = 'translateY(0)';
      input.focus();
    });
  });
};