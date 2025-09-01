import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiuserService {
  // Base URL واحد فقط
  private baseUrl = 'https://backend-medifit.vercel.app';

  // API Endpoints
  private endpoints = {
    // User endpoints
    register: '/users/register',
    login: '/users/login',
    checkEmail: '/users/check-email',
    userByEmail: '/users/by-email',

    // Password reset endpoints
    forgotPassword: '/forgot/request-password-reset',
    verifyCode: '/forgot/verify-code',
    resetPassword: '/forgot/reset-password',

    // Product endpoints
    addProduct: '/products/addProduct',
    editProduct: '/products/editProduct',
    deleteProduct: '/products/deleteProduct',
    deleteAllProducts: '/products/deleteAllProducts',
    getAllProducts: '/products/getAllProducts',

    // Other endpoints
    contactUs: '/contactus/submitContactForm',
    cart: '/cart',
    orders: '/orders',
    newsletter: '/newsletter',
  };

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Helper method لبناء URL كامل
  private getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  registerUser(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post(this.getUrl(this.endpoints.register), userData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Register error details:', {
            status: error.status,
            message: error.message,
            error: error.error,
          });
          return throwError(() => error);
        })
      );
  }

  loginUser(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post(this.getUrl(this.endpoints.login), userData, { headers })
      .pipe(
        map((response: any) => {
          console.log('Login response:', response); // للتحقق من الاستجابة

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
          console.error('Login error details:', {
            status: error.status,
            message: error.message,
            error: error.error,
          });
          return throwError(() => error);
        })
      );
  }

  checkEmailUnique(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(this.getUrl(this.endpoints.checkEmail), { email }, { headers })
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
    return this.http.get(url);
  }

  // Password Reset
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(this.getUrl(this.endpoints.forgotPassword), {
      email,
    });
  }

  verifyCode(data: { email: string; code: string }): Observable<any> {
    return this.http.post(this.getUrl(this.endpoints.verifyCode), data);
  }

  resetPassword(data2: { email: string; password: string }): Observable<any> {
    return this.http.post(this.getUrl(this.endpoints.resetPassword), data2);
  }

  // Products
  getAllproducts(): Observable<any> {
    return this.http.get<any>(this.getUrl(this.endpoints.getAllProducts)).pipe(
      catchError((error) => {
        console.error('Error fetching products:', error);
        return throwError(() => error);
      })
    );
  }

  addProduct(newProduct: FormData): Observable<any> {
    try {
      return this.http
        .post(this.getUrl(this.endpoints.addProduct), newProduct, {
          headers: this.getAuthHeaders(true),
        })
        .pipe(
          catchError((error) => {
            if (error.status === 401) {
              console.error('Authentication failed, redirect to login');
            }
            throw error;
          })
        );
    } catch (error) {
      return throwError(() => error);
    }
  }

  editproduct(id: string, product: any): Observable<any> {
    return this.http.patch(
      `${this.getUrl(this.endpoints.editProduct)}/${id}`,
      product,
      { headers: this.getAuthHeaders(true) }
    );
  }

  deleteproduct(id: string): Observable<any> {
    return this.http.delete(
      `${this.getUrl(this.endpoints.deleteProduct)}/${id}`,
      { headers: this.getAuthHeaders(true) }
    );
  }

  deleteAllproducts(password: string): Observable<any> {
    return this.http.delete(this.getUrl(this.endpoints.deleteAllProducts), {
      headers: this.getAuthHeaders(true),
      body: { password },
    });
  }

  // Contact Form
  submitContactForm(contactData: any): Observable<any> {
    return this.http
      .post(this.getUrl(this.endpoints.contactUs), contactData)
      .pipe(
        catchError((error) => {
          console.error('Error submitting contact form:', error);
          throw error;
        })
      );
  }

  // Newsletter
  subscribeToNewsletter(email: string): Observable<any> {
    return this.http
      .post(`${this.getUrl(this.endpoints.newsletter)}/subscribe`, { email })
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
        headers: this.getAuthHeaders(),
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
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        catchError((error) => {
          console.error('Error applying newsletter discount:', error);
          return throwError(() => error);
        })
      );
  }

  // Cart Management
  getCart(): Observable<any> {
    return this.http
      .get(this.getUrl(this.endpoints.cart), {
        headers: this.getAuthHeaders(),
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
        { headers: this.getAuthHeaders() }
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
        { headers: this.getAuthHeaders() }
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
        headers: this.getAuthHeaders(),
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
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error clearing cart:', error);
          return throwError(() => error);
        })
      );
  }

  // Orders Management
  createOrder(paymentMethod: string, shippingInfo: any): Observable<any> {
    console.log('Creating order with:', { paymentMethod, shippingInfo });

    return this.http
      .post(
        `${this.getUrl(this.endpoints.orders)}/create`,
        { paymentMethod, shippingInfo },
        { headers: this.getAuthHeaders() }
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
        headers: this.getAuthHeaders(),
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
        headers: this.getAuthHeaders(),
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
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        catchError((error) => {
          console.error('Error cancelling order:', error);
          return throwError(() => error);
        })
      );
  }

  // Helper Methods
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

  // Headers Management
  private getAuthHeaders(isFormData: boolean = false): HttpHeaders {
    const token = localStorage.getItem('authToken');

    if (!token || token === '[object Object]') {
      console.error('Invalid token found:', token);
      throw new Error('Invalid authentication token');
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  // إذا أردت تغيير الـ baseUrl بسهولة (للتطوير مثلاً)
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  // للحصول على الـ baseUrl الحالي
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
