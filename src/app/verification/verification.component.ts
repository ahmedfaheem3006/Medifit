// verification-code.component.ts
import { Component } from '@angular/core';
import { ApiuserService } from '../apiuser.service';
import { Router } from '@angular/router';

declare var bootstrap: any;
@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent {
  verificationCode: string[] = new Array(6).fill('');
  toastMessage: string = '';

  constructor(private ApiuserService: ApiuserService, private router: Router) {}

  moveFocus(event: any, index: number) {
    const input = event.target;
    if (input.value.length === 1 && index < 5) {
      const nextInput = document.querySelectorAll('.code-input')[index + 1];
      (nextInput as HTMLInputElement).focus();
    }
    if (input.value.length === 0 && index > 0) {
      const prevInput = document.querySelectorAll('.code-input')[index - 1];
      (prevInput as HTMLInputElement).focus();
    }
  }

  onSubmit4() {
    const code = this.verificationCode.join('');
    const email = localStorage.getItem('email');

    if (!email) {
      console.error('Email not found in localStorage');
      this.showToastMessage('Email not found.');
      return;
    }

    if (code.length < 6) {
      console.error('Verification code is incomplete:', code);
      this.showToastMessage('Please enter the complete verification code.');
      return;
    }

    console.log('Verification code to be verified:', code);
    console.log('Retrieved email from localStorage:', email);

    this.ApiuserService.verifyCode({ email, code }).subscribe(
      response => {
        console.log('Code verified successfully:', response);
        this.router.navigate(['/new-password']);
      },
      error => {
        console.error('Error verifying code:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : 'Error verifying code.';
        this.showToastMessage(errorMessage);
      }
    );
  }

  resendCode() {
    const email = localStorage.getItem('email');

    if (!email) {
      console.error('Email not found in localStorage');
      this.showToastMessage('Email not found.');
      return;
    }

    this.ApiuserService.requestPasswordReset(email).subscribe(
      response => {
        console.log('Verification code resent:', response);
        this.showToastMessage('Verification code resent to ' + email);
      },
      error => {
        console.error('Error resending verification code:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : 'Error resending code.';
        this.showToastMessage(errorMessage);
      }
    );
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
    this.router.navigate(['/forgot-password']);
  }
}
