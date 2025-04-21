// forgot-password.component.ts
import { Component } from '@angular/core';
import { ApiuserService } from '../apiuser.service';
import { Router } from '@angular/router';

declare var bootstrap: any;
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  toastMessage: string = '';

  constructor(private ApiuserService: ApiuserService, private router: Router) {}

  onSubmit3() {
    if (!this.email || !this.validateEmail(this.email)) {
      this.showToastMessage('Please enter a valid email address');
      return;
    }

    const email = this.email;
    localStorage.setItem('email', email);

    this.ApiuserService.requestPasswordReset(this.email).subscribe(
      response => {
        console.log('Reset link sent:', response);
        this.router.navigate(['/verification']);
      },
      error => {
        console.error('Error sending reset link:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : 'User not found.';
        this.showToastMessage(errorMessage);
      }
    );
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  showToast() {
    const toastEl = document.getElementById('toast-warning');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  closeToast() {
    const toastEl = document.getElementById('toast-warning');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.hide();
    }
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast();

    setTimeout(() => {
      this.closeToast();
    }, 3000);
  }

  onclick() {
    this.router.navigate(['/login']);
  }
}
