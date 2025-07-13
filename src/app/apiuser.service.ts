import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, of } from 'rxjs';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiuserService {
  private registerUrl = 'http://localhost:5500/users/register';
  private loginUrl = 'http://localhost:5500/users/login';
  private checkEmailUrl = 'http://localhost:5500/users/check-email';
  private forgotpassUrl = 'http://localhost:5500/forgot/request-password-reset';
  private verifycodeUrl = 'http://localhost:5500/forgot/verify-code';
  private newpasswordUrl = 'http://localhost:5500/forgot/reset-password';
  private addproduct = 'https://dummyjson.com/products';
  private addproduct2 = 'http://localhost:5500/products/addProduct';
  private editProduct = 'http://localhost:5500/products/editProduct';
  private deleteProduct = 'http://localhost:5500/products/deleteProduct';
  private deleteAllProducts =
    'http://localhost:5500/products/deleteAllProducts';
  private getAllProducts = 'http://localhost:5500/products/getAllProducts';
  private submitContactUrl =
    'http://localhost:5500/contactus/submitContactForm';
  private cartUrl = 'http://localhost:5500/cart';
  private ordersUrl = 'http://localhost:5500/orders';
  private newsletterUrl = 'http://localhost:5500/newsletter';

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  registerUser(userData: any): Observable<any> {
    return this.http.post(this.registerUrl, userData);
  }

  loginUser(userData: any): Observable<any> {
    return this.http.post(this.loginUrl, userData).pipe(
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
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  checkEmailUnique(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(this.checkEmailUrl, { email }, { headers }).pipe(
      catchError((error) => {
        console.error('Error checking email uniqueness:', error);
        throw error;
      })
    );
  }

  fetchUserByEmail(email: string): Observable<any> {
    const url = `http://localhost:5500/users/by-email?email=${encodeURIComponent(
      email
    )}`;
    return this.http.get(url);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(this.forgotpassUrl, { email });
  }

  verifyCode(data: { email: string; code: string }): Observable<any> {
    return this.http.post(this.verifycodeUrl, data);
  }

  resetPassword(data2: { email: string; password: string }): Observable<any> {
    return this.http.post(this.newpasswordUrl, data2);
  }

  getProduct(): Observable<any> {
    return this.http.get<any>(this.addproduct);
  }

  getAllproducts(): Observable<any> {
    return this.http.get<any>(this.getAllProducts);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  addProduct(newProduct: FormData): Observable<any> {
    try {
      return this.http
        .post(this.addproduct2, newProduct, {
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
    return this.http.patch(`${this.editProduct}/${id}`, product, {
      headers: this.getAuthHeaders(true),
    });
  }

  deleteproduct(id: string): Observable<any> {
    return this.http.delete(`${this.deleteProduct}/${id}`, {
      headers: this.getAuthHeaders(true),
    });
  }

  deleteAllproducts(password: string): Observable<any> {
    return this.http.delete(`${this.deleteAllProducts}`, {
      headers: this.getAuthHeaders(true),
      body: { password },
    });
  }

  submitContactForm(contactData: any): Observable<any> {
    return this.http.post(this.submitContactUrl, contactData).pipe(
      catchError((error) => {
        console.error('Error submitting contact form:', error);
        throw error;
      })
    );
  }

  // Subscribe to newsletter
subscribeToNewsletter(email: string): Observable<any> {
  return this.http.post(`${this.newsletterUrl}/subscribe`, { email }).pipe(
    catchError(error => {
      console.error('Error subscribing to newsletter:', error);
      return throwError(() => error);
    })
  );
}

// Check if user is eligible for discount
checkDiscountEligibility(): Observable<any> {
  return this.http.get(`${this.newsletterUrl}/check-eligibility`, {
    headers: this.getAuthHeaders()
  }).pipe(
    catchError(error => {
      console.error('Error checking discount eligibility:', error);
      return throwError(() => error);
    })
  );
}

// Apply newsletter discount
applyNewsletterDiscount(): Observable<any> {
  return this.http.post(`${this.newsletterUrl}/apply-discount`, {}, {
    headers: this.getAuthHeaders()
  }).pipe(
    catchError(error => {
      console.error('Error applying newsletter discount:', error);
      return throwError(() => error);
    })
  );
}

  // Get user's cart
  getCart(): Observable<any> {
    return this.http
      .get(this.cartUrl, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching cart:', error);
          return throwError(() => error);
        })
      );
  }

  // Add item to cart
  addToCart(productId: string, quantity: number): Observable<any> {
    return this.http
      .post(
        `${this.cartUrl}/add`,
        { productId, quantity },
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error adding to cart:', error);
          return throwError(() => error);
        })
      );
  }

  // Update cart item quantity
  updateCartItem(productId: string, quantity: number): Observable<any> {
    return this.http
      .patch(
        `${this.cartUrl}/update`,
        { productId, quantity },
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error updating cart item:', error);
          return throwError(() => error);
        })
      );
  }

  // Remove item from cart
  removeFromCart(productId: string): Observable<any> {
    return this.http
      .delete(`${this.cartUrl}/remove/${productId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error removing from cart:', error);
          return throwError(() => error);
        })
      );
  }

  // Clear entire cart
  clearCart(): Observable<any> {
    return this.http
      .delete(`${this.cartUrl}/clear`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error clearing cart:', error);
          return throwError(() => error);
        })
      );
  }

  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  createOrder(paymentMethod: string, shippingInfo: any): Observable<any> {
    console.log('Creating order with:', { paymentMethod, shippingInfo });

    return this.http
      .post(
        `${this.ordersUrl}/create`,
        {
          paymentMethod,
          shippingInfo,
        },
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error creating order:', error);
          return throwError(() => error);
        })
      );
  }

  // Get all orders for the logged-in user
  getUserOrders(): Observable<any> {
    return this.http
      .get(this.ordersUrl, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching orders:', error);
          return throwError(() => error);
        })
      );
  }

  // Get order by ID
  getOrderById(orderId: string): Observable<any> {
    return this.http
      .get(`${this.ordersUrl}/${orderId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching order:', error);
          return throwError(() => error);
        })
      );
  }

  // Cancel an order
  cancelOrder(orderId: string): Observable<any> {
    return this.http
      .patch(
        `${this.ordersUrl}/cancel/${orderId}`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error cancelling order:', error);
          return throwError(() => error);
        })
      );
  }

  // Method to fetch the current cart count from the API
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

  private getAuthHeaders(isFormData: boolean = false): HttpHeaders {
    const token = localStorage.getItem('authToken');

    // تحقق أن الـ token ليس [object Object]
    if (!token || token === '[object Object]') {
      console.error('Invalid token found:', token);
      throw new Error('Invalid authentication token');
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    // console.log('Request headers:', headers);
    return headers;
  }
}
