import { supabase } from '../../lib/supabase';

export const checkAdminAuth = async (): Promise<any> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // FIX: Clean React Router path. No .html!
    window.location.href = '/login'; 
    return null;
  }

  // Check role/email
  if (session.user.email !== 'admin@vito.com') {
    alert("Unauthorized access. Admin privileges required.");
    window.location.href = '/';
    return null;
  }

  return session.user;
};