import { Component, OnInit } from '@angular/core';
import { ApiuserService } from '../apiuser.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  showPassword: boolean = false;
  username: string = '';
  email: string = '';
  password: string = '';
  toastMessage: string = '';
  initialEmail: string | null = null;

  constructor(
    private ApiuserService: ApiuserService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  googleLogin() {
    this.authService.loginWithGoogle();
  }

  // Add this method to navigate to login page
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.initialEmail = this.email;
  }

  home(): void {
    this.router.navigate(['/home']);
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

  async checkEmailUnique(email: string): Promise<boolean> {
    console.log('Checking uniqueness for email:', email);
    try {
      const response = await firstValueFrom(
        this.ApiuserService.checkEmailUnique(email)
      );
      console.log('Full API response:', response);

      if (response && typeof response.isUnique !== 'undefined') {
        return response.isUnique;
      } else {
        console.error('API response does not contain isUnique field.');
        this.showToastMessage('Invalid response from server.');
        return false;
      }
    } catch (error) {
      console.error('Error checking email uniqueness:', error);
      this.showToastMessage('Error checking email uniqueness.');
      return false;
    }
  }

  async onSubmit() {
    if (this.username.trim() === '' || this.username.length < 3) {
      this.showToastMessage(
        'Please, enter your username with at least 3 characters...'
      );
      return;
    }

    // First, validate the email format
    if (!this.validateEmail(this.email)) {
      this.showToastMessage('Invalid email format');
      return;
    }

    // Then check if the email is already registered
    const isUnique = await this.checkEmailUnique(this.email);
    console.log('Is email unique:', isUnique);
    if (!isUnique) {
      this.showToastMessage(
        'This email is already registered. Please use a different email.'
      );
      return;
    }

    // Validate the password
    if (!this.validatePassword(this.password)) {
      this.showToastMessage(
        'Password must be at least 5 characters long and contain uppercase, lowercase, number, and special character'
      );
      return;
    }

    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.ApiuserService.registerUser(userData).subscribe(
      (response) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error during registration:', error);
        if (error.error && error.error.errors) {
          error.error.errors.forEach((err: { msg: string }) =>
            console.log(err.msg)
          );
        } else {
          console.log('Error message:', error.message);
        }
        this.showToastMessage('Registration failed. Please try again.');
      }
    );
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
    return passwordRegex.test(password);
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
}
