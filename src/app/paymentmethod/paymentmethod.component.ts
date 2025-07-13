import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiuserService } from '../apiuser.service';

@Component({
  selector: 'app-paymentmethod',
  templateUrl: './paymentmethod.component.html',
  styleUrls: ['./paymentmethod.component.css'],
})
export class PaymentmethodComponent implements OnInit {
  creditCardForm: FormGroup;
  paypalForm: FormGroup;
  selectedPaymentMethod: string = 'creditCard';
  cartItems: any[] = [];
  subtotal: number = 0;
  total: number = 0;
  shippingInfo: any;
  toastMessage: string = '';
  isProcessing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiUserService: ApiuserService
  ) {
    // Initialize the credit card form with validators
    this.creditCardForm = this.fb.group({
      cardName: ['', [Validators.required]],
      cardNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{16}$')],
      ],
      expiryDate: [
        '',
        [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])/[0-9]{2}$')],
      ],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
    });

    // Initialize the PayPal form with validators
    this.paypalForm = this.fb.group({
      paypalEmail: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.apiUserService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Retrieve the passed data from navigation
    if (history.state.cartItems) {
      this.cartItems = history.state.cartItems;
      this.subtotal = history.state.subtotal || this.getSubtotal();
      this.total = history.state.total || this.getTotal();
      this.shippingInfo = history.state.shippingInfo;
    } else {
      // If no cart data in state, fetch from API and redirect to shipping
      this.router.navigate(['/shippingaddress']);
      return;
    }

    // If shipping info is missing, go back to shipping
    if (!this.shippingInfo) {
      this.router.navigate(['/shippingaddress']);
      return;
    }

    // Format card number with spaces as user types
    this.creditCardForm.get('cardNumber')?.valueChanges.subscribe((value) => {
      if (!value) return;

      // Remove non-digits
      value = value.replace(/\D/g, '');

      // Add spaces every 4 digits
      if (value.length > 0) {
        value = value.match(/.{1,4}/g)?.join(' ') || value;
      }

      // Update the field value without triggering another valueChanges event
      if (value !== this.creditCardForm.get('cardNumber')?.value) {
        this.creditCardForm
          .get('cardNumber')
          ?.setValue(value, { emitEvent: false });
      }
    });

    // Format expiry date as user types
    this.creditCardForm.get('expiryDate')?.valueChanges.subscribe((value) => {
      if (!value) return;

      // Remove non-digits
      value = value.replace(/\D/g, '');

      // Format as MM/YY
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }

      // Update the field value without triggering another valueChanges event
      if (value !== this.creditCardForm.get('expiryDate')?.value) {
        this.creditCardForm
          .get('expiryDate')
          ?.setValue(value, { emitEvent: false });
      }
    });
  }

  togglePaymentMethod(method: string): void {
    this.selectedPaymentMethod =
      this.selectedPaymentMethod === method ? '' : method;
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  isSelectedMethodValid(): boolean {
    switch (this.selectedPaymentMethod) {
      case 'creditCard':
        return this.creditCardForm.valid;
      case 'paypal':
        return this.paypalForm.valid;
      case 'applePay':
      case 'googlePay':
        return true; // These methods don't have forms to validate
      default:
        return false;
    }
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      const price = item.product.price_after_sale || item.product.price;
      return total + price * item.quantity;
    }, 0);
  }

  getDiscount(): number {
    return this.cartItems.reduce((total, item) => {
      if (item.product.sale_percentage) {
        const discount =
          ((item.product.price * item.product.sale_percentage) / 100) *
          item.quantity;
        return total + discount;
      }
      return total;
    }, 0);
  }

  getTotal(): number {
    return this.getSubtotal() + 50; // Adding delivery fee
  }

  completePayment(): void {
    if (!this.isSelectedMethodValid() || this.isProcessing) return;

    this.isProcessing = true;

    // Map the payment method to a valid format for the backend
    let paymentMethod = '';
    switch (this.selectedPaymentMethod) {
      case 'creditCard':
        paymentMethod = 'Credit Card';
        break;
      case 'paypal':
        paymentMethod = 'PayPal';
        break;
      case 'applePay':
        paymentMethod = 'Apple Pay';
        break;
      case 'googlePay':
        paymentMethod = 'Google Pay';
        break;
    }

    const shippingInfo = {
      fullName: this.shippingInfo.fullName,
      email: this.shippingInfo.email,
      phone: this.shippingInfo.phone,
      address: this.shippingInfo.address,
      city: this.shippingInfo.city,
      state: this.shippingInfo.state,
      zipCode: this.shippingInfo.zipCode,
      country: this.shippingInfo.country,
      notes: this.shippingInfo.notes || '',
    };

    // console.log('Shipping info:', shippingInfo);
    // console.log('Payment method:', paymentMethod);

    // Create order in the database
    this.apiUserService.createOrder(paymentMethod, shippingInfo).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.showToastMessage(
          `Order #${response.order.orderId} has been successfully placed. Thank you for your order!`
        );

        // Update cart count in header to 0 since cart is now empty
        this.apiUserService.updateCartCount(0);

        // Navigate to home page after a delay
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 3000);
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error creating order:', error);
        this.showToastMessage(
          'There was an error processing your payment. Please try again.'
        );
      },
    });
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    const toastEl = document.getElementById('success-toast');
    if (toastEl) {
      toastEl.classList.add('show');
    }

    // Auto hide after 5 seconds
    setTimeout(() => {
      this.closeToast();
    }, 5000);
  }

  closeToast(): void {
    const toastEl = document.getElementById('success-toast');
    if (toastEl) {
      toastEl.classList.remove('show');
    }
  }

  goBack(): void {
    this.router.navigate(['/shippingaddress'], {
      state: {
        cartItems: this.cartItems,
        subtotal: this.subtotal,
        total: this.total,
      },
    });
  }
}
