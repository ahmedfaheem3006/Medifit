import { Component } from '@angular/core';
import { ApiuserService } from '../apiuser.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

declare var bootstrap: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword: boolean = false;
  email: string = '';
  password: string = '';
  toastMessage: string = '';

  constructor(private ApiuserService: ApiuserService, private router: Router) {}

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

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  onSubmit2() {
    const userData = {
      email: this.email.trim(),
      password: this.password.trim(),
    };

    this.ApiuserService.loginUser(userData).subscribe({
      next: (response) => {
        console.log('Login response:', response);

        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('userRole', response.user?.role || '');

        // تحقق من تخزين الـ token بشكل صحيح
        const storedToken = localStorage.getItem('authToken');
        console.log('Stored token:', storedToken);

        // التحقق من وجود منتج معلق بعد تسجيل الدخول
        this.handleLoginSuccess(response);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.showToastMessage('Login failed. Please try again.');
      }
    });
  }

  handleLoginSuccess(response: any): void {
    // تحقق من الدور، إذا كان المستخدم admin أو supervisor توجه إلى لوحة التحكم
    if (response.user?.role === 'admin' || response.user?.role === 'supervisor') {
      // توجه إلى Dashboard للـ Admin
      this.router.navigate(['/dashboard']);
      return;
    }

    // للمستخدمين العاديين، تحقق من وجود منتجات معلقة
    this.handlePendingCartItems().then(() => {
      // بعد معالجة العناصر المعلقة، افحص وجود طلب شراء معلق
      return this.handlePendingPurchase();
    }).then(() => {
      // إذا لم يكن هناك معالجة، انتقل إلى الصفحة الرئيسية
      this.router.navigate(['/home']);
    }).catch(error => {
      console.error('Error handling pending items:', error);
      this.router.navigate(['/home']);
    });
  }

  async handlePendingCartItems(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pendingCartProduct = localStorage.getItem('pendingCartProduct');

      if (pendingCartProduct) {
        try {
          const pendingData = JSON.parse(pendingCartProduct);

          // حذف البيانات المعلقة بعد استرجاعها
          localStorage.removeItem('pendingCartProduct');

          // استخدم API السلة الجديدة لإضافة المنتج إلى سلة المستخدم
          this.ApiuserService.addToCart(pendingData.productId, pendingData.quantity).subscribe({
            next: (response) => {
              this.showToastMessage('Product added to your cart successfully');

              // توجيه المستخدم إلى سلة التسوق
              this.router.navigate(['/Card']);
              resolve();
            },
            error: (error) => {
              console.error('Error adding product to cart:', error);
              reject(error);
            }
          });
        } catch (error) {
          console.error('Error parsing pending cart item:', error);
          localStorage.removeItem('pendingCartProduct');
          reject(error);
        }
      } else {
        // إذا لم تكن هناك بيانات معلقة، استمر
        resolve();
      }
    });
  }

  async handlePendingPurchase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pendingPurchase = localStorage.getItem('pendingPurchase');

      if (pendingPurchase) {
        try {
          const pendingData = JSON.parse(pendingPurchase);

          // حذف البيانات المعلقة بعد استرجاعها
          localStorage.removeItem('pendingPurchase');

          // استرداد تفاصيل المنتجات
          this.ApiuserService.getAllproducts().subscribe({
            next: (products) => {
              const product = products.find((p: any) => p._id === pendingData.productId);
              if (product) {
                // إضافة المنتج للسلة أولاً (اختياري)
                this.ApiuserService.addToCart(pendingData.productId, pendingData.quantity).subscribe({
                  next: () => {
                    // توجيه المستخدم إلى صفحة الدفع مباشرة
                    this.router.navigate(['paymentmethod'], {
                      state: {
                        product: product,
                        quantity: pendingData.quantity
                      }
                    });
                    resolve();
                  },
                  error: (error) => {
                    console.error('Error adding pending purchase to cart:', error);
                    // في حالة الخطأ، نوجه المستخدم إلى صفحة الدفع مباشرة بدون إضافة للسلة
                    this.router.navigate(['paymentmethod'], {
                      state: {
                        product: product,
                        quantity: pendingData.quantity
                      }
                    });
                    resolve();
                  }
                });
              } else {
                console.error('Product not found');
                resolve();
              }
            },
            error: (error) => {
              console.error('Error fetching product:', error);
              reject(error);
            }
          });
        } catch (error) {
          console.error('Error parsing pending purchase:', error);
          localStorage.removeItem('pendingPurchase');
          reject(error);
        }
      } else {
        // إذا لم تكن هناك بيانات معلقة، استمر
        resolve();
      }
    });
  }

  home(): void {
    this.router.navigate(['/home']);
  }

  onclick() {
    this.router.navigate(['/forgot-password']);
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast();

    setTimeout(() => {
      this.closeToast();
    }, 3500);
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