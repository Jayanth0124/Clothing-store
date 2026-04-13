import { supabase } from '../../lib/supabase';
import { showToast } from '../../lib/ui';

export class SettingsPage {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'page-container';
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h1>Store Settings</h1>
      </div>

      <div class="panel" style="max-width: 800px; margin: 0 auto; margin-bottom: 4rem;">
        <form id="settings-form" class="admin-form">
          
          <h3 style="font-family: 'Italiana', serif; font-size: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">General Settings</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem;">
            <div class="input-group">
              <label>Store Name</label>
              <input type="text" id="set-name" required>
            </div>
            <div class="input-group">
              <label>Primary Store Email</label>
              <input type="email" id="set-email" required>
            </div>
          </div>

          <h3 style="font-family: 'Italiana', serif; font-size: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Contact & Footer Information</h3>
          <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
            <div class="input-group">
              <label>Physical Address / Location</label>
              <input type="text" id="set-address" placeholder="e.g., 123 Heritage Lane, NY 10012">
            </div>
            <div class="input-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
              <div>
                <label>Phone Number</label>
                <input type="text" id="set-phone" placeholder="e.g., +1 (555) 123-4567">
              </div>
              <div>
                <label>Working Hours</label>
                <input type="text" id="set-hours" placeholder="e.g., Mon - Fri, 9am - 6pm EST">
              </div>
            </div>
          </div>

          <h3 style="font-family: 'Italiana', serif; font-size: 1.5rem; margin-top: 3rem; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Contact Page Specifics</h3>
          
          <div class="input-group" style="margin-bottom: 1.5rem;">
            <label style="color: #d4af37;">Form Delivery Email (FormSubmit Target)</label>
            <input type="email" id="set-form-email" placeholder="Where should customer messages be sent?">
            <span style="font-size: 0.75rem; color: #888; display: block; margin-top: 4px;">Important: The first time you use a new email, FormSubmit will send an activation link to it.</span>
          </div>

          <div class="input-group">
            <label>Contact Page Intro Message</label>
            <textarea id="set-contact-text" rows="3" placeholder="Enter the welcoming text for your contact page..."></textarea>
          </div>

          <div style="margin-top: 3rem; text-align: right;">
            <button type="submit" class="btn btn-primary" id="btn-save-settings" style="padding: 1rem 3rem;">Save Changes</button>
          </div>
        </form>
      </div>
    `;

    setTimeout(() => {
      this.loadSettings();
      this.bindEvents();
    }, 0);

    return this.container;
  }

  async loadSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    
    if (data && !error) {
      (document.getElementById('set-name') as HTMLInputElement).value = data.store_name || '';
      (document.getElementById('set-email') as HTMLInputElement).value = data.store_email || '';
      (document.getElementById('set-address') as HTMLInputElement).value = data.footer_address || '';
      (document.getElementById('set-phone') as HTMLInputElement).value = data.footer_phone || '';
      (document.getElementById('set-hours') as HTMLInputElement).value = data.footer_hours || '';
      (document.getElementById('set-contact-text') as HTMLTextAreaElement).value = data.contact_text || '';
      // LOAD NEW EMAIL
      (document.getElementById('set-form-email') as HTMLInputElement).value = data.formsubmit_email || '';
    } else {
      showToast('Could not load settings from database.', 'error');
    }
  }

  bindEvents() {
    const form = document.getElementById('settings-form') as HTMLFormElement;
    const submitBtn = document.getElementById('btn-save-settings') as HTMLButtonElement;

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const originalText = submitBtn.innerText;
      submitBtn.innerText = 'Saving...';
      submitBtn.disabled = true;

      const payload = {
        store_name: (document.getElementById('set-name') as HTMLInputElement).value,
        store_email: (document.getElementById('set-email') as HTMLInputElement).value,
        footer_address: (document.getElementById('set-address') as HTMLInputElement).value,
        footer_phone: (document.getElementById('set-phone') as HTMLInputElement).value,
        footer_hours: (document.getElementById('set-hours') as HTMLInputElement).value,
        contact_text: (document.getElementById('set-contact-text') as HTMLTextAreaElement).value,
        // SAVE NEW EMAIL
        formsubmit_email: (document.getElementById('set-form-email') as HTMLInputElement).value,
      };

      const { error } = await supabase.from('site_settings').update(payload).eq('id', 1);

      submitBtn.innerText = originalText;
      submitBtn.disabled = false;

      if (error) {
        showToast('Failed to save settings: ' + error.message, 'error');
      } else {
        showToast('Settings successfully updated!', 'success');
      }
    });
  }
}