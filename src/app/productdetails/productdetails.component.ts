import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiuserService } from '../apiuser.service';

@Component({
  selector: 'app-productdetails',
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css']
})
export class ProductdetailsComponent implements OnInit {
  product: any;
  quantity: number = 1;
  keyBenefitsArray: string[] = [];
  isLoggedIn: boolean = false;
  userRole: string = '';

  constructor(private router: Router, private apiUserService: ApiuserService) {}

  ngOnInit(): void {
    // التحقق من حالة تسجيل الدخول
    this.isLoggedIn = this.apiUserService.isLoggedIn();
    this.userRole = localStorage.getItem('role') || '';

    // Access the product data passed from the filters component
    this.product = history.state.product;

    if (!this.product) {
      // Fallback if no product data is passed
      this.router.navigate(['/filters']);
      return;
    }

    // Split key_benefits by commas to create an array
    if (this.product.key_benefits) {
      this.keyBenefitsArray = this.product.key_benefits
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
  }

  generateStarIconsproduct(rating: number, totalStars: number): string {
    if (typeof rating === 'string') {
      rating = parseInt(rating, 10);
    }

    let starsHtml = '';
    for (let i = 1; i <= totalStars; i++) {
      if (i <= rating) {
        starsHtml += `<i class="fa-solid fa-star star"></i>`;
      } else {
        starsHtml += `<i class="fa-regular fa-star star"></i>`;
      }
    }
    return starsHtml;
  }

  ngAfterViewInit() {
    // Add index to stars for staggered animation
    setTimeout(() => {
      const stars = document.querySelectorAll('.product-rating .star');
      stars.forEach((star, index) => {
        (star as HTMLElement).style.setProperty('--star-index', index.toString());
      });

      // Add index to benefit items for staggered animation
      const benefits = document.querySelectorAll('.benefits-list li');
      benefits.forEach((item, index) => {
        (item as HTMLElement).style.setProperty('--item-index', index.toString());
      });
    }, 0);
  }

  parseInt(value: string | number): number {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value as number;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addcart(): void {
  // التحقق من تسجيل دخول المستخدم
  if (!this.isLoggedIn) {
    // إذا لم يكن مسجل دخول، قم بتوجيهه إلى صفحة تسجيل الدخول
    // وحفظ معلومات المنتج والكمية في المتصفح (localStorage) لاستعادتها بعد تسجيل الدخول
    localStorage.setItem('pendingCartProduct', JSON.stringify({
      productId: this.product._id,
      quantity: this.quantity
    }));

    // توجيه المستخدم إلى صفحة تسجيل الدخول مع رسالة إضافية
    alert('يرجى تسجيل الدخول أولاً لإضافة المنتج إلى السلة');
    this.router.navigate(['/login']);
    return;
  }

  // التحقق من دور المستخدم، يجب أن يكون "user"
  if (this.userRole.toLowerCase() !== 'user') {
    alert('فقط الحسابات العادية يمكنها إضافة منتجات إلى السلة');
    return;
  }

  // إضافة المنتج إلى السلة عبر الـ API
  this.apiUserService.addToCart(this.product._id, this.quantity).subscribe({
    next: (response) => {
      // alert('تمت إضافة المنتج إلى السلة بنجاح');

      this.apiUserService.updateCartCount(response.items.length);

      this.router.navigate(['/Card']);
    },
    error: (error) => {
      console.error('Error adding product to cart:', error);
      alert('حدث خطأ أثناء إضافة المنتج إلى السلة');
    }
  });
}

  buynow(): void {
    // التحقق من تسجيل دخول المستخدم
    if (!this.isLoggedIn) {
      // إذا لم يكن مسجل دخول، قم بتوجيهه إلى صفحة تسجيل الدخول
      localStorage.setItem('pendingPurchase', JSON.stringify({
        productId: this.product._id,
        quantity: this.quantity
      }));

      // توجيه المستخدم إلى صفحة تسجيل الدخول مع رسالة إضافية
      alert('يرجى تسجيل الدخول أولاً لإكمال عملية الشراء');
      this.router.navigate(['/login']);
      return;
    }

    // التحقق من دور المستخدم، يجب أن يكون "user"
    if (this.userRole.toLowerCase() !== 'user') {
      alert('فقط الحسابات العادية يمكنها شراء المنتجات');
      return;
    }

    // Direct checkout functionality
    this.router.navigate(['paymentmethod'], {
      state: {
        product: this.product,
        quantity: this.quantity
      }
    });
  }
}
