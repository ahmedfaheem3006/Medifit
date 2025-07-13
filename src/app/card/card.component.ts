import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiuserService } from '../apiuser.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit {
  cartItems: any[] = [];
  isCartEmpty: boolean = true;
  isLoading: boolean = true;
  discountAmount: number = 0;
  hasNewsletterDiscount: boolean = false;

  constructor(private router: Router, private apiUserService: ApiuserService) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.apiUserService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.apiUserService.getCart().subscribe({
      next: (response) => {
        if (response) {
          this.cartItems = response.items || [];
          this.isCartEmpty = this.cartItems.length === 0;
          this.discountAmount = response.discountAmount || 0;
          this.hasNewsletterDiscount =
            response.newsletterDiscountApplied || false;

          // Update the cart count
          this.apiUserService.updateCartCount(this.cartItems.length);
        } else {
          this.cartItems = [];
          this.isCartEmpty = true;
          this.discountAmount = 0;
          this.hasNewsletterDiscount = false;

          // Update the cart count to zero
          this.apiUserService.updateCartCount(0);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.isLoading = false;
        this.isCartEmpty = true;
        this.discountAmount = 0;
        this.hasNewsletterDiscount = false;

        // Update the cart count to zero on error
        this.apiUserService.updateCartCount(0);
      },
    });
  }

  increaseCount(item: any): void {
    const newQuantity = item.quantity + 1;
    this.updateItemQuantity(item.product._id, newQuantity);
  }

  decreaseCount(item: any): void {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      this.updateItemQuantity(item.product._id, newQuantity);
    }
  }

  updateItemQuantity(productId: string, quantity: number): void {
    this.apiUserService.updateCartItem(productId, quantity).subscribe({
      next: (response) => {
        if (response) {
          this.cartItems = response.items || [];
          this.isCartEmpty = this.cartItems.length === 0;
          this.discountAmount = response.discountAmount || 0;
          this.hasNewsletterDiscount =
            response.newsletterDiscountApplied || false;
        }
      },
      error: (error) => {
        console.error('Error updating item quantity:', error);
        alert('حدث خطأ أثناء تحديث الكمية');
      },
    });
  }

  removeProduct(productId: string): void {
    this.apiUserService.removeFromCart(productId).subscribe({
      next: (response) => {
        if (response) {
          this.cartItems = response.items || [];
          this.isCartEmpty = this.cartItems.length === 0;
          this.discountAmount = response.discountAmount || 0;
          this.hasNewsletterDiscount =
            response.newsletterDiscountApplied || false;
        } else {
          this.loadCart(); // Fallback to reload the cart
        }
      },
      error: (error) => {
        console.error('Error removing product:', error);
        alert('حدث خطأ أثناء إزالة المنتج من السلة');
      },
    });
  }

  getSubtotal(): number {
    if (this.isCartEmpty) return 0;

    return this.cartItems.reduce((total, item) => {
      const price = item.product.price_after_sale || item.product.price;
      return total + price * item.quantity;
    }, 0);
  }

  getDiscount(): number {
    return this.discountAmount || 0;
  }

  getTotal(): number {
    if (this.isCartEmpty) return 0;
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const shippingFee = 50;
    return subtotal - discount + shippingFee;
  }

  applyNewsletterDiscount(): void {
    if (!this.apiUserService.isLoggedIn()) {
      alert('Please log in to apply discounts');
      this.router.navigate(['/login']);
      return;
    }

    this.apiUserService.applyNewsletterDiscount().subscribe({
      next: (response) => {
        this.loadCart(); // Reload cart to show the discount
        alert('15% newsletter discount applied to your cart!');
      },
      error: (error) => {
        console.error('Error applying discount:', error);
        if (error.error?.error) {
          alert(error.error.error);
        } else {
          alert('Could not apply discount. Please try again later.');
        }
      },
    });
  }

  checkDiscountEligibility(): void {
    if (!this.apiUserService.isLoggedIn()) {
      return;
    }

    this.apiUserService.checkDiscountEligibility().subscribe({
      next: (response) => {
        if (response.eligible) {
          // Show apply discount button or automatically apply
          // Depending on your UI needs
        }
      },
      error: (error) => {
        console.error('Error checking discount eligibility:', error);
      },
    });
  }

  viewOrders(): void {
    if (!this.apiUserService.isLoggedIn()) {
      alert('Please log in to view your orders');
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/orders']);
  }

  procedtocheck(): void {
    if (this.isCartEmpty) return;

    this.router.navigate(['/shippingaddress'], {
      state: {
        cartItems: this.cartItems,
        subtotal: this.getSubtotal(),
        discountAmount: this.getDiscount(),
        total: this.getTotal(),
        hasNewsletterDiscount: this.hasNewsletterDiscount,
      },
    });
  }
}
