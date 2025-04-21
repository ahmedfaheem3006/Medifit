// header.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  isLoggedIn = false;
  username = '';
  cartItemCount = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check if user is logged in when component initializes
    this.checkLoginStatus();

    // Listen for storage events (in case user logs in/out in another tab)
    window.addEventListener('storage', () => {
      this.checkLoginStatus();
    });

    // Listen for custom login events from other components
    window.addEventListener('user-logged-in', () => {
      this.checkLoginStatus();
    });
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');

    if (token && storedUsername) {
      this.isLoggedIn = true;
      this.username = storedUsername;
    } else {
      this.isLoggedIn = false;
      this.username = '';
    }
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isDropdownOpen = false;
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
    this.isMobileMenuOpen = false;
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    // Clear all authentication data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');

    // Update component state
    this.isLoggedIn = false;
    this.username = '';
    this.cartItemCount = 0;

    // Navigate to home page
    this.router.navigate(['/home']);
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const dropdownElement = (event.target as HTMLElement).closest('.dropdown');
    const mobileMenuToggle = (event.target as HTMLElement).closest('.mobile-menu-toggle');

    if (!dropdownElement) {
      this.isDropdownOpen = false;
    }

    if (!mobileMenuToggle && !this.isElementInMobileMenu(event.target as HTMLElement)) {
      this.isMobileMenuOpen = false;
    }
  }

  private isElementInMobileMenu(element: HTMLElement): boolean {
    return !!element.closest('.nav');
  }

  updateCartCount(count: number): void {
    this.cartItemCount = count;
  }
}
