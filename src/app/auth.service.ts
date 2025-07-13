// auth.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userRoleSubject = new BehaviorSubject<string | null>(localStorage.getItem('role'));
  public userRole$ = this.userRoleSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Listen for messages from the OAuth popup window
    window.addEventListener('message', this.handleAuthMessage.bind(this), false);
    
    // Initialize user role from localStorage on service start
    const savedRole = localStorage.getItem('role');
    if (savedRole) {
      this.userRoleSubject.next(savedRole);
    }
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

      // Validate the token
      if (!event.data.token) {
        console.error('Invalid token received from server');
        return;
      }

      // Store user data in localStorage
      localStorage.setItem('authToken', event.data.token);
      
      if (event.data.user) {
        localStorage.setItem('username', event.data.user.username || '');
        localStorage.setItem('email', event.data.user.email || '');
        
        // Make sure role is saved and set to 'user' if not provided
        const userRole = event.data.user.role || 'user';
        localStorage.setItem('role', userRole);
        
        // Update the role subject
        this.userRoleSubject.next(userRole);
      }

      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('user-logged-in'));

      // Navigate to home page
      this.router.navigate(['/home']);
    }
  }

  getUserRole(): string {
    return localStorage.getItem('role') || 'user';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  isUser(): boolean {
    const role = this.getUserRole();
    return role === 'user';
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'admin';
  }

  isSupervisor(): boolean {
    const role = this.getUserRole();
    return role === 'supervisor';
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    this.userRoleSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUserProfile(): Observable<any> {
    return this.http.get('http://localhost:5500/profile', { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return throwError(() => error);
      })
    );
  }

  // Fixed method to get auth headers that returns HttpHeaders
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  refreshToken(): Observable<any> {
    return this.http.post('http://localhost:5500/auth/refresh-token', {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      catchError(error => {
        console.error('Error refreshing token:', error);
        // If token refresh fails, log the user out
        this.logout();
        return throwError(() => error);
      })
    );
  }
}