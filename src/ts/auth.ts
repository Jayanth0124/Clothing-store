import { supabase } from '../lib/supabase';

export const initAuth = () => {
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  const signupForm = document.getElementById('signup-form') as HTMLFormElement;

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      const btn = loginForm.querySelector('button');
      
      if(btn) btn.innerText = 'Authenticating...';

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert(error.message);
        if(btn) btn.innerText = 'Sign In';
      } else {
        if (data.user?.email === 'admin@vito.com') {
          window.location.href = '/admin'; // FIX: Clean path
        } else {
          window.location.href = '/'; 
        }
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      const btn = signupForm.querySelector('button');
      
      if(btn) btn.innerText = 'Creating Account...';

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        alert(error.message);
        if(btn) btn.innerText = 'Create Account';
      } else {
        alert('Welcome to Vito Ginglies! Your account has been created.');
        window.location.href = '/login'; // FIX: Clean path
      }
    });
  }
};