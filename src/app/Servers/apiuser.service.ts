import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
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
  private deleteAllProducts = 'http://localhost:5500/products/deleteAllProducts';
  private getAllProducts = 'http://localhost:5500/products/getAllProducts';

  constructor(private http:HttpClient) {}

  registerUser(userData: any): Observable<any> {
    return this.http.post(this.registerUrl, userData);
  }

  loginUser(userData: any): Observable<any> {
    return this.http.post(this.loginUrl, userData);
  }

  checkEmailUnique(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(this.checkEmailUrl, { email }, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error checking email uniqueness:', error);
          throw error;
        })
      );
  }

  fetchUserByEmail(email: string): Observable<any> {
    const url = `http://localhost:5500/users/by-email?email=${encodeURIComponent(email)}`;
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
    return this.http.get<any>(this.addproduct)
  }

  getAllproducts(): Observable<any> {
    return this.http.get<any>(this.getAllProducts)
  }

  addProduct(newProduct: FormData): Observable<any> {
    return this.http.post(this.addproduct2, newProduct, {
      headers: this.getAuthHeaders(true) // Pass true to indicate it's FormData
    });
}

  editproduct(id: string, product: any): Observable<any> {
    return this.http.patch(`${this.editProduct}/${id}`, product, {
      headers: this.getAuthHeaders(true)
    });
  }

  deleteproduct(id: string): Observable<any> {
    return this.http.delete(`${this.deleteProduct}/${id}`, {
      headers: this.getAuthHeaders(true)
    });
  }

  deleteAllproducts(password:string): Observable<any> {
    return this.http.delete(`${this.deleteAllProducts}`, {
      headers: this.getAuthHeaders(true),
      body: { password }
    });
  }

  // Function to get Authorization header
  private getAuthHeaders(isFormData: boolean = false): HttpHeaders {
    const token = localStorage.getItem('authToken');
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Do not set Content-Type for FormData
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
}
}
