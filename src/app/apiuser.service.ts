import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiuserService {
  private baseUrl = 'https://medifitbackend-production.up.railway.app';

  private endpoints = {
    register: '/users/register',
    login: '/users/login',
    checkEmail: '/users/check-email',
    userByEmail: '/users/by-email',
    forgotPassword: '/forgot/request-password-reset',
    verifyCode: '/forgot/verify-code',
    resetPassword: '/forgot/reset-password',
    addProduct: '/products/addProduct',
    editProduct: '/products/editProduct',
    deleteProduct: '/products/deleteProduct',
    deleteAllProducts: '/products/deleteAllProducts',
    getAllProducts: '/products/getAllProducts',
    contactUs: '/contactus/submitContactForm',
    cart: '/cart',
    orders: '/orders',
    newsletter: '/newsletter',
  };

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  // Headers مع إضافة bypass header
  private createHeaders(
    includeAuth: boolean = false,
    isFormData: boolean = false
  ): HttpHeaders {
    let headers = new HttpHeaders({
      'Bypass-Tunnel-Reminder': 'true',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    if (includeAuth) {
      const token = localStorage.getItem('authToken');
      if (token && token !== '[object Object]') {
        headers = headers.set('Authorization', `Bearer ${token}`);
      } else {
        throw new Error('Authentication required');
      }
    }

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  registerUser(userData: any): Observable<any> {
    return this.http
      .post(this.getUrl(this.endpoints.register), userData, {
        headers: this.createHeaders(false, false),
      })
      .pipe(
        catchError((error) => {
          console.error('Register error details:', error);
          return throwError(() => error);
        })
      );
  }

  loginUser(userData: any): Observable<any> {
    return this.http
      .post(this.getUrl(this.endpoints.login), userData, {
        headers: this.createHeaders(false, false),
      })
      .pipe(
        map((response: any) => {
          if (response && typeof response.token === 'string') {
            localStorage.setItem('authToken', response.token);

            if (response.user) {
              localStorage.setItem('username', response.user.username || '');
              localStorage.setItem('email', response.user.email || '');
              localStorage.setItem('role', response.user.role || 'user');
            }

            window.dispatchEvent(new Event('user-logged-in'));
            return response;
          }
          throw new Error('Invalid token received from server');
        }),
        catchError((error) => {
          console.error('Login error details:', error);
          return throwError(() => error);
        })
      );
  }

  checkEmailUnique(email: string): Observable<any> {
    return this.http
      .post<any>(
        this.getUrl(this.endpoints.checkEmail),
        { email },
        {
          headers: this.createHeaders(false, false),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error checking email uniqueness:', error);
          throw error;
        })
      );
  }

  fetchUserByEmail(email: string): Observable<any> {
    const url = `${this.getUrl(
      this.endpoints.userByEmail
    )}?email=${encodeURIComponent(email)}`;
    return this.http.get(url, {
      headers: this.createHeaders(false, false),
    });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(
      this.getUrl(this.endpoints.forgotPassword),
      { email },
      {
        headers: this.createHeaders(false, false),
      }
    );
  }

  verifyCode(data: { email: string; code: string }): Observable<any> {
    return this.http.post(this.getUrl(this.endpoints.verifyCode), data, {
      headers: this.createHeaders(false, false),
    });
  }

  resetPassword(data2: { email: string; password: string }): Observable<any> {
    return this.http.post(this.getUrl(this.endpoints.resetPassword), data2, {
      headers: this.createHeaders(false, false),
    });
  }

  getAllproducts(): Observable<any> {
    return this.http
      .get<any>(this.getUrl(this.endpoints.getAllProducts), {
        headers: this.createHeaders(false, false),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching products:', error);
          return throwError(() => error);
        })
      );
  }

  addProduct(productData: any): Observable<any> {
    let headers = this.createHeaders(true, false);
    let body: any;

    // إذا كانت البيانات FormData (رفع ملف)
    if (productData instanceof FormData) {
      // مع FormData، لا نضع Content-Type لأن المتصفح سيضعه تلقائياً
      headers = headers.delete('Content-Type');
      body = productData;
    }
    // إذا كانت البيانات عادية (مع رابط)
    else {
      body = productData;
    }

    return this.http
      .post(this.getUrl(this.endpoints.addProduct), body, { headers })
      .pipe(
        catchError((error) => {
          if (error.status === 401) {
            console.error('Authentication failed, redirect to login');
          }
          console.error('Add product error:', error);
          return throwError(() => error);
        })
      );
  }

  editproduct(id: string, productData: any): Observable<any> {
    let headers = this.createHeaders(true, false);
    let body: any;

    // إذا كانت البيانات FormData (رفع ملف)
    if (productData instanceof FormData) {
      headers = headers.delete('Content-Type');
      body = productData;
    }
    // إذا كانت البيانات عادية
    else {
      body = productData;
    }

    return this.http
      .patch(`${this.getUrl(this.endpoints.editProduct)}/${id}`, body, {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Edit product error:', error);
          return throwError(() => error);
        })
      );
  }

  deleteproduct(id: string): Observable<any> {
    return this.http.delete(
      `${this.getUrl(this.endpoints.deleteProduct)}/${id}`,
      { headers: this.createHeaders(true, false) }
    );
  }

  deleteAllproducts(password: string): Observable<any> {
    return this.http.delete(this.getUrl(this.endpoints.deleteAllProducts), {
      headers: this.createHeaders(true, false),
      body: { password },
    });
  }

  submitContactForm(contactData: any): Observable<any> {
    return this.http
      .post(this.getUrl(this.endpoints.contactUs), contactData, {
        headers: this.createHeaders(false, false),
      })
      .pipe(
        catchError((error) => {
          console.error('Error submitting contact form:', error);
          throw error;
        })
      );
  }

  subscribeToNewsletter(email: string): Observable<any> {
    return this.http
      .post(
        `${this.getUrl(this.endpoints.newsletter)}/subscribe`,
        { email },
        {
          headers: this.createHeaders(false, false),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error subscribing to newsletter:', error);
          return throwError(() => error);
        })
      );
  }

  checkDiscountEligibility(): Observable<any> {
    return this.http
      .get(`${this.getUrl(this.endpoints.newsletter)}/check-eligibility`, {
        headers: this.createHeaders(true, false),
      })
      .pipe(
        catchError((error) => {
          console.error('Error checking discount eligibility:', error);
          return throwError(() => error);
        })
      );
  }

  applyNewsletterDiscount(): Observable<any> {
    return this.http
      .post(
        `${this.getUrl(this.endpoints.newsletter)}/apply-discount`,
        {},
        { headers: this.createHeaders(true, false) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error applying newsletter discount:', error);
          return throwError(() => error);
        })
      );
  }

  getCart(): Observable<any> {
    return this.http
      .get(this.getUrl(this.endpoints.cart), {
        headers: this.createHeaders(true, false),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching cart:', error);
          return throwError(() => error);
        })
      );
  }

  addToCart(productId: string, quantity: number): Observable<any> {
    return this.http
      .post(
        `${this.getUrl(this.endpoints.cart)}/add`,
        { productId, quantity },
        { headers: this.createHeaders(true, false) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error adding to cart:', error);
          return throwError(() => error);
        })
      );
  }

  updateCartItem(productId: string, quantity: number): Observable<any> {
    return this.http
      .patch(
        `${this.getUrl(this.endpoints.cart)}/update`,
        { productId, quantity },
        { headers: this.createHeaders(true, false) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error updating cart item:', error);
          return throwError(() => error);
        })
      );
  }

  removeFromCart(productId: string): Observable<any> {
    return this.http
      .delete(`${this.getUrl(this.endpoints.cart)}/remove/${productId}`, {
        headers: this.createHeaders(true, false),
      })
      .pipe(
        catchError((error) => {
          console.error('Error removing from cart:', error);
          return throwError(() => error);
        })
      );
  }

  clearCart(): Observable<any> {
    return this.http
      .delete(`${this.getUrl(this.endpoints.cart)}/clear`, {
        headers: this.createHeaders(true, false),
      })
      .pipe(
        catchError((error) => {
          console.error('Error clearing cart:', error);
          return throwError(() => error);
        })
      );
  }

  createOrder(paymentMethod: string, shippingInfo: any): Observable<any> {
    return this.http
      .post(
        `${this.getUrl(this.endpoints.orders)}/create`,
        { paymentMethod, shippingInfo },
        { headers: this.createHeaders(true, false) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error creating order:', error);
          return throwError(() => error);
        })
      );
  }

  getUserOrders(): Observable<any> {
    return this.http
      .get(this.getUrl(this.endpoints.orders), {
        headers: this.createHeaders(true, false),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching orders:', error);
          return throwError(() => error);
        })
      );
  }

  getOrderById(orderId: string): Observable<any> {
    return this.http
      .get(`${this.getUrl(this.endpoints.orders)}/${orderId}`, {
        headers: this.createHeaders(true, false),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching order:', error);
          return throwError(() => error);
        })
      );
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http
      .patch(
        `${this.getUrl(this.endpoints.orders)}/cancel/${orderId}`,
        {},
        { headers: this.createHeaders(true, false) }
      )
      .pipe(
        catchError((error) => {
          console.error('Error cancelling order:', error);
          return throwError(() => error);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  fetchCartCount(): Observable<number> {
    if (!this.isLoggedIn()) {
      this.updateCartCount(0);
      return of(0);
    }

    return this.getCart().pipe(
      map((cart) => {
        const count = cart?.items?.length || 0;
        this.updateCartCount(count);
        return count;
      }),
      catchError((error) => {
        console.error('Error fetching cart count:', error);
        this.updateCartCount(0);
        return of(0);
      })
    );
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
