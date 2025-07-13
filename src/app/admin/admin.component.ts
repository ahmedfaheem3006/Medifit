import { Component, OnInit } from '@angular/core';
import { ApiuserService } from '../apiuser.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  toastMessage: string = '';
  ProductId: string = '';
  productType: string = 'Medical devices';
  ratingType: string = '5';
  Productname: string = '';
  price: string = '';
  image: any = '';
  keyBenefits: string = '';
  description: string = '';
  salePercentage: string = '';
  priceAfterSale: string = '';

  constructor(private apiService: ApiuserService, private router: Router) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    if (!this.apiService.isLoggedIn() || localStorage.getItem('role') !== 'admin') {
      this.showToastMessage('You need admin privileges to access this page');
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.image = file;
  }

  // Función para calcular el precio después del descuento
  calculatePriceAfterSale(): void {
    if (this.price && this.salePercentage) {
      const originalPrice = parseFloat(this.price);
      const discountPercentage = parseFloat(this.salePercentage);
      if (!isNaN(originalPrice) && !isNaN(discountPercentage)) {
        const calculatedPrice = originalPrice - (originalPrice * discountPercentage / 100);
        this.priceAfterSale = calculatedPrice.toFixed(2);
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (!this.apiService.isLoggedIn()) {
      this.showToastMessage('Please login first!');
      return;
    }

    if (form.valid) {
      const formData = new FormData();
      formData.append('type', this.productType);
      formData.append('rating', this.ratingType);
      formData.append('name', this.Productname);
      formData.append('price', this.price);
      formData.append('key_benefits', this.keyBenefits);
      formData.append('description', this.description);
      formData.append('image', this.image);

      // Agregar los nuevos campos al FormData
      if (this.salePercentage) {
        formData.append('sale_percentage', this.salePercentage);
      }
      if (this.priceAfterSale) {
        formData.append('price_after_sale', this.priceAfterSale);
      }

      if (this.ProductId) {
        this.apiService.editproduct(this.ProductId, formData).subscribe(
          (response) => {
            this.showToastMessage('Product updated successfully!');
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          },
          (error) => {
            this.showToastMessage(`Error: ${error.message}`);
          }
        );
      } else {
        this.apiService.addProduct(formData).subscribe(
          (response) => {
            this.showToastMessage('Product added successfully!!');
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          },
          (error) => {
            this.showToastMessage(`Error: ${error.message}`);
          }
        );
      }
    }
  }

  oneditproduct(): void {
    const ProductId = prompt('Please enter the Product ID:');
    if (ProductId) {
      this.apiService.getAllproducts().subscribe(
        (productData: any[]) => {
          const product = productData.find((p) => p._id === ProductId);
          if (product) {
            this.ProductId = product._id;
            this.productType = product.type;
            this.ratingType = product.rating;
            this.Productname = product.name;
            this.price = product.price;
            this.image = product.image;
            this.description = product.description;
            this.keyBenefits = product.key_benefits;

            // Cargar los nuevos campos
            this.salePercentage = product.sale_percentage || '';
            this.priceAfterSale = product.price_after_sale || '';

            this.showToastMessage('Product loaded successfully for editing!');
          } else {
            this.showToastMessage(`No product found with ID: ${ProductId}`);
          }
        },
        (error) => {
          this.showToastMessage(`Error fetching products: ${error.message}`);
        }
      );
    } else {
      this.showToastMessage('No ID provided.');
    }
  }

  deleteproduct() {
    const promptMsg = prompt(
      'Please enter the Product ID of the product to delete:'
    );
    if (promptMsg) {
      this.apiService.deleteproduct(promptMsg).subscribe(
        (response) => {
          this.showToastMessage('Product deleted successfully!');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        (error) => {
          this.showToastMessage(`Error: ${error.message}`);
        }
      );
    }
  }

  deleteAllproducts() {
    const confirmDelete = confirm(
      'Are you sure you want to delete all products? This action cannot be undone.'
    );
    if (confirmDelete) {
      const password = prompt('Please enter your password to confirm:');
      if (password) {
        this.apiService.deleteAllproducts(password).subscribe(
          (response) => {
            this.showToastMessage('All products deleted successfully!');
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          },
          (error) => {
            this.showToastMessage(`Error: ${error.message}`);
          }
        );
      }
    }
  }

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

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast();
    setTimeout(() => {
      this.closeToast();
    }, 3000);
  }
}
