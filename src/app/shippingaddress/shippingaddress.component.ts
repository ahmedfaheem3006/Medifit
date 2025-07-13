import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiuserService } from '../apiuser.service';

@Component({
  selector: 'app-shippingaddress',
  templateUrl: './shippingaddress.component.html',
  styleUrls: ['./shippingaddress.component.css']
})
export class ShippingaddressComponent implements OnInit {
  shippingForm: FormGroup;
  cartItems: any[] = [];
  subtotal: number = 0;
  total: number = 0;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiUserService: ApiuserService
  ) {
    this.shippingForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.apiUserService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get cart data from state or API
    if (history.state.cartItems) {
      this.cartItems = history.state.cartItems;
      this.subtotal = history.state.subtotal || this.getSubtotal();
      this.total = history.state.total || this.getTotal();
    } else {
      // If no cart data in state, fetch from API
      this.loadCartFromApi();
    }

    // Pre-fill form with user data if available
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');

    if (email) {
      this.shippingForm.patchValue({ email });
    }

    if (username) {
      this.shippingForm.patchValue({ fullName: username });
    }
  }

  loadCartFromApi() {
    this.apiUserService.getCart().subscribe({
      next: (response) => {
        if (response && response.items && response.items.length > 0) {
          this.cartItems = response.items;
          this.subtotal = this.getSubtotal();
          this.total = this.getTotal();
        } else {
          // If cart is empty, redirect to cart page
          this.router.navigate(['/Card']);
        }
      },
      error: (error) => {
        console.error('Error fetching cart:', error);
        this.router.navigate(['/Card']);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.shippingForm.get(fieldName);
    return this.submitted && field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      const price = item.product.price_after_sale || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }

  getTotal(): number {
    return this.getSubtotal() + 50; // Adding shipping fee
  }

  onSubmit() {
    this.submitted = true;

    if (this.shippingForm.invalid) {
      // Scroll to the first error
      const firstInvalidElement = document.querySelector('.ng-invalid');
      if (firstInvalidElement) {
        firstInvalidElement.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Proceed to payment page with all necessary data
    this.router.navigate(['/Paymentmethod'], {
      state: {
        cartItems: this.cartItems,
        subtotal: this.subtotal,
        total: this.total,
        shippingInfo: this.shippingForm.value
      }
    });
  }

  goBack() {
    this.router.navigate(['/card']);
  }
}
