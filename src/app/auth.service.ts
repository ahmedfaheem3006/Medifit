// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Listen for messages from the OAuth popup window
    window.addEventListener('message', this.handleAuthMessage.bind(this), false);
  }

  loginWithGoogle() {
    // Open Google OAuth in a popup window
    const popup = window.open('http://localhost:5500/auth/google', 'googleAuth', 'width=500,height=600');

    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      console.error('Popup was blocked. Please allow popups for this site.');
      alert('Popup was blocked. Please allow popups for this site to use Google login.');
    }
  }

  // Handle messages from the OAuth popup
  private handleAuthMessage(event: MessageEvent) {
    // Make sure the message is from your backend
    if (event.origin !== 'http://localhost:5500') return;

    if (event.data && event.data.type === 'auth_success') {
      console.log('Received auth success message:', event.data);

      // Store user data in localStorage
      localStorage.setItem('authToken', event.data.token);
      localStorage.setItem('username', event.data.user.username);
      localStorage.setItem('email', event.data.user.email);

      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('user-logged-in'));

      // Navigate to home page
      this.router.navigate(['/home']);
    }
  }

  getUserProfile() {
    return this.http.get('http://localhost:5500/profile', { withCredentials: true });
  }
}
