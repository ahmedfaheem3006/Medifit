import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiuserService } from '../apiuser.service';

@Component({
  selector: 'app-userorders',
  templateUrl: './userorders.component.html',
  styleUrls: ['./userorders.component.css']
})
export class UserordersComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  orders: any[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private apiUserService: ApiuserService
  ) {}

  ngOnInit(): void {
    // Get user info from localStorage
    this.userName = localStorage.getItem('username') || 'Guest User';
    this.userEmail = localStorage.getItem('email') || 'guest@example.com';

    // Check if user is logged in
    if (!this.apiUserService.isLoggedIn()) {
      // Redirect to login if not logged in
      this.router.navigate(['/login']);
      return;
    }

    // Check user role
    const userRole = localStorage.getItem('role') || '';
    if (userRole.toLowerCase() !== 'user') {
      alert('Order history is only available for regular user accounts');
      this.router.navigate(['/home']);
      return;
    }

    // Load user orders
    this.loadUserOrders();
  }

  loadUserOrders(): void {
    this.isLoading = true;
    this.apiUserService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders.map((order: any) => ({
          ...order,
          expanded: false // Add expanded property for UI toggle
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  toggleOrderDetails(order: any): void {
    order.expanded = !order.expanded;
  }

  isStatusActive(currentStatus: string, checkStatus: string): boolean {
    const statusOrder = ['Processing', 'Shipped', 'In Transit', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const checkIndex = statusOrder.indexOf(checkStatus);

    return currentIndex >= checkIndex;
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.apiUserService.cancelOrder(orderId).subscribe({
        next: () => {
          alert('Order cancelled successfully');
          this.loadUserOrders(); // Reload orders
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order. ' + (error.error?.error || 'Please try again later.'));
        }
      });
    }
  }

  reorder(order: any): void {
    // TODO: Implement reorder functionality
    alert('Reorder functionality coming soon!');
  }

  goToTracking(order: any): void {
    // TODO: Implement order tracking
    alert('Order tracking functionality coming soon!');
  }

  logout(): void {
    // Clear user data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');

    // Navigate to home page
    this.router.navigate(['/home']);
  }
}
