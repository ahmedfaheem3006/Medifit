// new-password.component.ts
import { Component } from '@angular/core';
import { ApiuserService } from '../apiuser.service';
import { Router } from '@angular/router';

declare var bootstrap: any;
@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent {
  showPassword: boolean = false;
  showPassword2: boolean = false;
  password: string = '';
  email: string = '';
  repassword: string = '';
  toastMessage: string = '';

  constructor(private ApiuserService: ApiuserService, private router: Router) {}

  onSubmit3() {
    const email = localStorage.getItem('email');

    if (!email) {
      console.error('Email not found in localStorage');
      this.showToastMessage('Email not found. Please try again.');
      return;
    }

    if (!this.validatePassword(this.password)) {
      this.showToastMessage('Password must be at least 5 characters long and contain uppercase, lowercase, number, and special character.');
      return;
    }

    // Check if password and repassword match
    if (this.password !== this.repassword) {
      this.showToastMessage('Passwords do not match. Please try again.');
      return;
    }

    const password = this.password;

    this.ApiuserService.resetPassword({ email, password }).subscribe(
      response => {
        console.log('Password reset successfully:', response);
        localStorage.removeItem('email');
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Error resetting password:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : 'Error resetting password.';
        this.showToastMessage(errorMessage);
      }
    );
  }

  validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
    return passwordRegex.test(password);
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

  togglePassword() {
    this.showPassword = !this.showPassword;

    if (this.showPassword) {
      setTimeout(() => {
        this.showPassword = false;
      }, 2500);
    }
  }

  togglePassword2() {
    this.showPassword2 = !this.showPassword2;

    if (this.showPassword2) {
      setTimeout(() => {
        this.showPassword2 = false;
      }, 2500);
    }
  }
}
