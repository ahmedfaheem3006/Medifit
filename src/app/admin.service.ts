import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject } from 'rxjs';
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
  private apiUrl = 'http://localhost:5500/admin';
  
  private pendingOrdersSubject = new BehaviorSubject<PendingOrder[]>([]);
  private completedOrdersSubject = new BehaviorSubject<CompletedOrder[]>([]);
  
  pendingOrders$ = this.pendingOrdersSubject.asObservable();
  completedOrders$ = this.completedOrdersSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getAdminStats(): Observable<any> {
    return forkJoin({
      users: this.http.get<{ count: number }>(`${this.apiUrl}/users/count`, {
        headers: this.getAuthHeaders(),
      }),
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
        throw error;
      })
    );
  }

  getTopProducts(): Observable<TopProduct[]> {
    return this.http
      .get<TopProduct[]>(`${this.apiUrl}/products/top`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map(products => 
          products.map(product => ({
            ...product,
            image: product.image || '/assets/images/no-image.png'
          }))
        ),
        catchError((error) => {
          console.error('Error loading top products:', error);
          throw error;
        })
      );
  }

  getPendingOrders(): Observable<PendingOrder[]> {
    return this.http
      .get<PendingOrder[]>(`${this.apiUrl}/orders/pending`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap(orders => this.pendingOrdersSubject.next(orders)),
        catchError((error) => {
          console.error('Error loading pending orders:', error);
          throw error;
        })
      );
  }

  getCompletedOrders(): Observable<CompletedOrder[]> {
    return this.http.get<CompletedOrder[]>(`${this.apiUrl}/orders/completed`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(orders => this.completedOrdersSubject.next(orders)),
      catchError(error => {
        console.error('Error loading completed orders:', error);
        throw error;
      })
    );
  }

  getCompletedOrdersStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders/completed/stats`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Error loading completed orders stats:', error);
        return new Observable(observer => {
          observer.next({ completedCount: 0, completedRevenue: 0 });
          observer.complete();
        });
      })
    );
  }

  getDailySales(): Observable<{ date: string; total: number }[]> {
    return this.http
      .get<{ date: string; total: number }[]>(`${this.apiUrl}/orders/daily`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error loading daily sales:', error);
          throw error;
        })
      );
  }

  getMonthlySales(): Observable<{ month: string; total: number }[]> {
    return this.http
      .get<{ month: string; total: number }[]>(
        `${this.apiUrl}/orders/monthly`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Error loading monthly sales:', error);
          throw error;
        })
      );
  }

  getYearlySales(): Observable<{ year: number; total: number }[]> {
    return this.http
      .get<{ year: number; total: number }[]>(`${this.apiUrl}/orders/yearly`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error loading yearly sales:', error);
          throw error;
        })
      );
  }

  approveOrder(orderId: string): Observable<any> {
    return this.http
      .patch(
        `${this.apiUrl}/orders/approve/${orderId}`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        tap((response: any) => {
          console.log('Approve order response:', response);
          const currentPending = this.pendingOrdersSubject.value;
          const updatedPending = currentPending.filter(order => order.orderId !== orderId);
          this.pendingOrdersSubject.next(updatedPending);

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
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        tap(() => {
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
        throw error;
      })
    );
  }

  refreshData(): void {
    this.getPendingOrders().subscribe();
    this.getCompletedOrders().subscribe();
  }
}