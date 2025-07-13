import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../auth.service';
import { AdminService, PendingOrder, CompletedOrder } from '../admin.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stats = {
    totalUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  };

  topProducts: { name: string; salesCount: number; price?: number }[] = [];
  pendingOrders: PendingOrder[] = [];
  completedOrders: CompletedOrder[] = [];

  showToast = false;
  toastMessage = '';
  isLoading = true;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAdmin()) {
      this.showToast = true;
      this.toastMessage = 'Access denied: Admins only';
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);
      return;
    }

    this.loadDashboardData();
    this.subscribeToOrderUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToOrderUpdates() {
    this.adminService.pendingOrders$
      .pipe(takeUntil(this.destroy$))
      .subscribe((orders) => {
        this.pendingOrders = orders;
        console.log('Updated pending orders:', orders);
      });

    this.adminService.completedOrders$
      .pipe(takeUntil(this.destroy$))
      .subscribe((orders) => {
        this.completedOrders = orders;
        console.log('Updated completed orders:', orders);
      });
  }

  private loadDashboardData() {
    this.isLoading = true;

    this.adminService
      .getDashboardSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats = {
            totalUsers: data.totalUsers,
            totalPurchases: data.totalPurchases,
            totalRevenue: data.totalRevenue,
            pendingOrders: data.pendingOrders || 0,
            completedOrders: data.completedOrders || 0,
          };

          this.topProducts = data.topProducts || [];
          this.pendingOrders = data.pendingOrders || [];
          this.completedOrders = data.completedOrders || [];

          console.log('Dashboard data loaded:', data);

          setTimeout(() => {
            this.initCharts();
          }, 100);

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.showToast = true;
          this.toastMessage = 'Error loading dashboard data';
          this.isLoading = false;
          setTimeout(() => (this.showToast = false), 3000);
        },
      });
  }

  private initCharts() {
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: {
              family: "'Outfit', sans-serif",
              size: 14,
            },
            color: '#503217',
          },
        },
      },
      scales: {
        y: {
          ticks: {
            color: '#503217',
            font: {
              family: "'Outfit', sans-serif",
              size: 12,
            },
          },
          grid: {
            color: 'rgba(80, 50, 23, 0.1)',
          },
        },
        x: {
          ticks: {
            color: '#503217',
            font: {
              family: "'Outfit', sans-serif",
              size: 12,
            },
          },
          grid: {
            color: 'rgba(80, 50, 23, 0.1)',
          },
        },
      },
    };

    this.adminService
      .getDailySales()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          setTimeout(() => {
            const canvas = document.getElementById(
              'dailySalesChart'
            ) as HTMLCanvasElement;
            if (canvas) {
              const labels = data.map((d) =>
                new Date(d.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                })
              );
              const totals = data.map((d) => d.total);

              new Chart(canvas, {
                type: 'line',
                data: {
                  labels,
                  datasets: [
                    {
                      label: 'Daily Sales',
                      data: totals,
                      borderColor: '#503217',
                      backgroundColor: 'rgba(80, 50, 23, 0.2)',
                      pointBackgroundColor: '#D4A017',
                      pointBorderColor: '#503217',
                      pointHoverBackgroundColor: '#8B5E3C',
                      fill: true,
                    },
                  ],
                },
                options: chartOptions,
              });
            }
          }, 100);
        },
        error: (error) => {
          console.error('Error loading daily sales chart:', error);
        },
      });

    this.adminService
      .getMonthlySales()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          setTimeout(() => {
            const canvas = document.getElementById(
              'monthlySalesChart'
            ) as HTMLCanvasElement;
            if (canvas) {
              const labels = data.map((d) => d.month);
              const totals = data.map((d) => d.total);

              new Chart(canvas, {
                type: 'bar',
                data: {
                  labels,
                  datasets: [
                    {
                      label: 'Monthly Sales',
                      data: totals,
                      backgroundColor: '#8B5E3C',
                      hoverBackgroundColor: '#D4A017',
                    },
                  ],
                },
                options: chartOptions,
              });
            }
          }, 200);
        },
        error: (error) => {
          console.error('Error loading monthly sales chart:', error);
        },
      });

    this.adminService
      .getYearlySales()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          setTimeout(() => {
            const canvas = document.getElementById(
              'yearlySalesChart'
            ) as HTMLCanvasElement;
            if (canvas) {
              const labels = data.map((d) => d.year.toString());
              const totals = data.map((d) => d.total);

              new Chart(canvas, {
                type: 'line',
                data: {
                  labels,
                  datasets: [
                    {
                      label: 'Yearly Sales',
                      data: totals,
                      borderColor: '#503217',
                      backgroundColor: 'rgba(80, 50, 23, 0.2)',
                      pointBackgroundColor: '#D4A017',
                      pointBorderColor: '#503217',
                      pointHoverBackgroundColor: '#8B5E3C',
                      fill: true,
                    },
                  ],
                },
                options: chartOptions,
              });
            }
          }, 300);
        },
        error: (error) => {
          console.error('Error loading yearly sales chart:', error);
        },
      });
  }

  approveOrder(orderId: string) {
    this.adminService
      .approveOrder(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showToast = true;
          this.toastMessage = `Order ${orderId} approved successfully`;

          this.stats.pendingOrders--;
          this.stats.completedOrders++;

          console.log('Order approved:', response);
          setTimeout(() => (this.showToast = false), 3000);
        },
        error: (error) => {
          console.error('Error approving order:', error);
          this.showToast = true;
          this.toastMessage = `Error approving order ${orderId}`;
          setTimeout(() => (this.showToast = false), 3000);
        },
      });
  }

  rejectOrder(orderId: string) {
    this.adminService
      .rejectOrder(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showToast = true;
          this.toastMessage = `Order ${orderId} rejected successfully`;

          this.stats.pendingOrders--;

          setTimeout(() => (this.showToast = false), 3000);
        },
        error: (error) => {
          console.error('Error rejecting order:', error);
          this.showToast = true;
          this.toastMessage = `Error rejecting order ${orderId}`;
          setTimeout(() => (this.showToast = false), 3000);
        },
      });
  }

  refreshData() {
    this.adminService.refreshData();
    this.loadDashboardData();
  }

  getUserName(order: any): string {
    if (order.user && order.user.username) {
      return order.user.username;
    }
    return order.userName || 'Unknown';
  }

  getOrderItems(order: PendingOrder): string {
    if (order.products && order.products.length > 0) {
      return order.products.map((p) => p.name).join(', ');
    }
    return 'No items';
  }
}
