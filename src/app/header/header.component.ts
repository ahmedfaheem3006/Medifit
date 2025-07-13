import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiuserService } from '../apiuser.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  isLoggedIn = false;
  username = '';
  userRole = '';
  cartItemCount = 0;
  private cartSubscription: Subscription | undefined;

  constructor(private router: Router, private apiUserService: ApiuserService) {}

  ngOnInit(): void {
    this.checkLoginStatus();

    // Subscribe to cart count updates
    this.cartSubscription = this.apiUserService.cartCount$.subscribe(
      (count) => {
        this.cartItemCount = count;
      }
    );

    // Load initial cart count if user is logged in
    if (this.isLoggedIn) {
      this.loadCartCount();
    }

    window.addEventListener('storage', () => {
      this.checkLoginStatus();
    });

    window.addEventListener('user-logged-in', () => {
      this.checkLoginStatus();
      this.loadCartCount();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    this.userRole = localStorage.getItem('role') || '';

    console.log('Current role:', this.userRole);

    if (token && storedUsername) {
      this.isLoggedIn = true;
      this.username = storedUsername;
      // Load cart count when user logs in
      this.loadCartCount();
    } else {
      this.isLoggedIn = false;
      this.username = '';
      this.userRole = '';
      this.cartItemCount = 0;
    }
  }

  loadCartCount(): void {
    if (this.isLoggedIn) {
      this.apiUserService.fetchCartCount().subscribe(
        (count) => {
          this.cartItemCount = count;
        },
        (error) => {
          console.error('Error loading cart count:', error);
          this.cartItemCount = 0;
        }
      );
    }
  }

  // في ملف header.component.ts
  navigateToFilter(category: string): void {
    
    this.router.navigate(['/filters'], {
      queryParams: { category: category },
      queryParamsHandling: 'merge',
    });

    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }

  navigateToAdmin(): void {
    console.log('Current role:', this.userRole);

    if (
      this.userRole &&
      (this.userRole.toLowerCase() === 'admin' ||
        this.userRole.toLowerCase() === 'supervisor')
    ) {
      this.router.navigate(['/admin']);
      this.isMobileMenuOpen = false;
    } else {
      console.error('User role is not admin or supervisor:', this.userRole);
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

  navigateToCart(): void {
    if (this.isLoggedIn) {
      if (this.userRole.toLowerCase() === 'user') {
        // Use programmatic navigation to ensure it works
        this.router.navigate(['/Card']);
      } else {
        alert('Admin and Supervisor accounts cannot access the shopping cart');
      }
    } else {
      // If not logged in, redirect to login
      alert('Please log in to view your cart');
      this.router.navigate(['/login']);
    }
    this.isMobileMenuOpen = false;
  }

  home(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    this.isLoggedIn = false;
    this.username = '';
    this.userRole = '';
    this.cartItemCount = 0;

    this.router.navigate(['/home']);
    this.isMobileMenuOpen = false;
    localStorage.clear();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const dropdownElement = (event.target as HTMLElement).closest('.dropdown');
    const mobileMenuToggle = (event.target as HTMLElement).closest(
      '.mobile-menu-toggle'
    );

    if (!dropdownElement) {
      this.isDropdownOpen = false;
    }

    if (
      !mobileMenuToggle &&
      !this.isElementInMobileMenu(event.target as HTMLElement)
    ) {
      this.isMobileMenuOpen = false;
    }
  }

  private isElementInMobileMenu(element: HTMLElement): boolean {
    return !!element.closest('.nav');
  }
}
