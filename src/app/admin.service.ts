import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface TopProduct {
  name: string;
  salesCount: number;
  image?: string;
  price?: number;
}

export interface PendingOrder {
  orderId: string;
  userName: string;
  products: any[];
  totalPrice: number;
  orderDate: Date;
}

export interface CompletedOrder {
  orderId: string;
  user: { username: string; email: string };
  totalPrice: number;
  completedDate: Date;
  products: any[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'https://backed-medifit-production.up.railway.app/admin';
  
  private pendingOrdersSubject = new BehaviorSubject<PendingOrder[]>([]);
  private completedOrdersSubject = new BehaviorSubject<CompletedOrder[]>([]);
  
  pendingOrders$ = this.pendingOrdersSubject.asObservable();
  completedOrders$ = this.completedOrdersSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    
    if (!token || token === 'undefined' || token === 'null' || token === '[object Object]') {
      console.error('No valid token found for admin');
      throw new Error('Authentication required');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  }

  getAdminStats(): Observable<any> {
    return forkJoin({
      users: this.http.get<{ count: number }>(
        `${this.apiUrl}/users/count`, 
        { headers: this.getAuthHeaders() }
      ),
      googleUsers: this.http.get<{ count: number }>(
        `${this.apiUrl}/google-users/count`,
        { headers: this.getAuthHeaders() }
      ),
      orders: this.http.get<{ count: number; totalRevenue: number }>(
        `${this.apiUrl}/orders/stats`,
        { headers: this.getAuthHeaders() }
      ),
      completedStats: this.getCompletedOrdersStats(),
    }).pipe(
      map(({ users, googleUsers, orders, completedStats }) => ({
        totalUsers: users.count + googleUsers.count,
        totalPurchases: orders.count + (completedStats.completedCount || 0),
        totalRevenue: orders.totalRevenue + (completedStats.completedRevenue || 0),
        pendingOrders: orders.count,
        completedOrders: completedStats.completedCount || 0,
      })),
      catchError((error) => {
        console.error('Error loading admin stats:', error);
        // Return default values on error
        return of({
          totalUsers: 0,
          totalPurchases: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0
        });
      })
    );
  }

  getTopProducts(): Observable<TopProduct[]> {
    return this.http
      .get<TopProduct[]>(
        `${this.apiUrl}/products/top`, 
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map(products => {
          if (!Array.isArray(products)) {
            console.error('Invalid products response:', products);
            return [];
          }
          return products.map(product => ({
            ...product,
            // تحديث URL الصور لـ ngrok
            image: product.image ? 
              product.image.replace('http://localhost:5500', 'https://hot-adder-steadily.ngrok-free.app') : 
              '/assets/images/no-image.png'
          }));
        }),
        catchError((error) => {
          console.error('Error loading top products:', error);
          return of([]);
        })
      );
  }

  getPendingOrders(): Observable<PendingOrder[]> {
    return this.http
      .get<PendingOrder[]>(
        `${this.apiUrl}/orders/pending`, 
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map(orders => {
          if (!Array.isArray(orders)) {
            console.error('Invalid pending orders response:', orders);
            return [];
          }
          return orders;
        }),
        tap(orders => this.pendingOrdersSubject.next(orders)),
        catchError((error) => {
          console.error('Error loading pending orders:', error);
          this.pendingOrdersSubject.next([]);
          return of([]);
        })
      );
  }

  getCompletedOrders(): Observable<CompletedOrder[]> {
    return this.http.get<CompletedOrder[]>(
      `${this.apiUrl}/orders/completed`, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(orders => {
        if (!Array.isArray(orders)) {
          console.error('Invalid completed orders response:', orders);
          return [];
        }
        return orders;
      }),
      tap(orders => this.completedOrdersSubject.next(orders)),
      catchError(error => {
        console.error('Error loading completed orders:', error);
        this.completedOrdersSubject.next([]);
        return of([]);
      })
    );
  }

  getCompletedOrdersStats(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/orders/completed/stats`, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error loading completed orders stats:', error);
        return of({ completedCount: 0, completedRevenue: 0 });
      })
    );
  }

  getDailySales(): Observable<{ date: string; total: number }[]> {
    return this.http
      .get<{ date: string; total: number }[]>(
        `${this.apiUrl}/orders/daily`, 
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map(sales => {
          if (!Array.isArray(sales)) {
            console.error('Invalid daily sales response:', sales);
            return [];
          }
          return sales;
        }),
        catchError((error) => {
          console.error('Error loading daily sales:', error);
          return of([]);
        })
      );
  }

  getMonthlySales(): Observable<{ month: string; total: number }[]> {
    return this.http
      .get<{ month: string; total: number }[]>(
        `${this.apiUrl}/orders/monthly`,
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map(sales => {
          if (!Array.isArray(sales)) {
            console.error('Invalid monthly sales response:', sales);
            return [];
          }
          return sales;
        }),
        catchError((error) => {
          console.error('Error loading monthly sales:', error);
          return of([]);
        })
      );
  }

  getYearlySales(): Observable<{ year: number; total: number }[]> {
    return this.http
      .get<{ year: number; total: number }[]>(
        `${this.apiUrl}/orders/yearly`, 
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map(sales => {
          if (!Array.isArray(sales)) {
            console.error('Invalid yearly sales response:', sales);
            return [];
          }
          return sales;
        }),
        catchError((error) => {
          console.error('Error loading yearly sales:', error);
          return of([]);
        })
      );
  }

  approveOrder(orderId: string): Observable<any> {
    return this.http
      .patch(
        `${this.apiUrl}/orders/approve/${orderId}`,
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        tap((response: any) => {
          console.log('Approve order response:', response);
          
          // Update pending orders
          const currentPending = this.pendingOrdersSubject.value;
          const updatedPending = currentPending.filter(order => order.orderId !== orderId);
          this.pendingOrdersSubject.next(updatedPending);

          // Add to completed orders if response includes it
          if (response.completedOrder) {
            const currentCompleted = this.completedOrdersSubject.value;
            const newCompletedOrder: CompletedOrder = {
              orderId: response.completedOrder.orderId,
              user: response.completedOrder.user,
              totalPrice: response.completedOrder.totalPrice,
              completedDate: new Date(response.completedOrder.completedDate),
              products: response.completedOrder.products || []
            };
            this.completedOrdersSubject.next([newCompletedOrder, ...currentCompleted]);
          }
        }),
        catchError((error) => {
          console.error('Error approving order:', error);
          throw error;
        })
      );
  }

  rejectOrder(orderId: string): Observable<any> {
    return this.http
      .patch(
        `${this.apiUrl}/orders/reject/${orderId}`,
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        tap(() => {
          // Remove from pending orders
          const currentPending = this.pendingOrdersSubject.value;
          const updatedPending = currentPending.filter(order => order.orderId !== orderId);
          this.pendingOrdersSubject.next(updatedPending);
        }),
        catchError((error) => {
          console.error('Error rejecting order:', error);
          throw error;
        })
      );
  }

  getDashboardSummary(): Observable<any> {
    return forkJoin({
      stats: this.getAdminStats(),
      topProducts: this.getTopProducts(),
      pendingOrders: this.getPendingOrders(),
      completedOrders: this.getCompletedOrders(),
    }).pipe(
      map(({ stats, topProducts, pendingOrders, completedOrders }) => ({
        ...stats,
        topProducts: topProducts.slice(0, 5),
        pendingOrders: pendingOrders,
        completedOrders: completedOrders.slice(0, 5),
      })),
      catchError((error) => {
        console.error('Error loading dashboard summary:', error);
        // Return default dashboard data on error
        return of({
          totalUsers: 0,
          totalPurchases: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          topProducts: [],
          pendingOrdersList: [],
          completedOrdersList: []
        });
      })
    );
  }

  refreshData(): void {
    this.getPendingOrders().subscribe({
      next: (orders) => console.log('Pending orders refreshed:', orders.length),
      error: (error) => console.error('Error refreshing pending orders:', error)
    });
    
    this.getCompletedOrders().subscribe({
      next: (orders) => console.log('Completed orders refreshed:', orders.length),
      error: (error) => console.error('Error refreshing completed orders:', error)
    });
  }

  // Helper method للتحقق من صحة البيانات
  private validateResponse<T>(response: any, defaultValue: T): T {
    if (!response) {
      console.warn('Empty response received');
      return defaultValue;
    }
    return response;
  }

  // Method للتحقق من صلاحيات الأدمن
  checkAdminAccess(): Observable<boolean> {
    return this.http.get<any>(
      `${this.apiUrl}/users/count`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(() => true),
      catchError((error) => {
        if (error.status === 403 || error.status === 401) {
          console.error('Admin access denied');
          return of(false);
        }
        return of(false);
      })
    );
  }
}