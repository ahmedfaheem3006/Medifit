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
    if (
      !this.apiService.isLoggedIn() ||
      localStorage.getItem('role') !== 'admin'
    ) {
      this.showToastMessage('You need admin privileges to access this page');
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // قائمة أنواع الملفات المسموحة
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      // التحقق من نوع الملف
      if (!allowedTypes.includes(file.type)) {
        this.showToastMessage(
          'Please select a valid image file (JPEG, PNG, GIF, or WEBP)'
        );
        event.target.value = ''; // مسح الاختيار
        this.image = null;
        return;
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.showToastMessage('File size should not exceed 5MB');
        event.target.value = '';
        this.image = null;
        return;
      }

      // التحقق من امتداد الملف
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExtension = allowedExtensions.some((ext) =>
        fileName.endsWith(ext)
      );

      if (!hasValidExtension) {
        this.showToastMessage(
          'Invalid file extension. Allowed: jpg, jpeg, png, gif, webp'
        );
        event.target.value = '';
        this.image = null;
        return;
      }

      this.image = file;
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });
    }
  }

  calculatePriceAfterSale(): void {
    if (this.price && this.salePercentage) {
      const originalPrice = parseFloat(this.price);
      const discountPercentage = parseFloat(this.salePercentage);
      if (!isNaN(originalPrice) && !isNaN(discountPercentage)) {
        const calculatedPrice =
          originalPrice - (originalPrice * discountPercentage) / 100;
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
      // التحقق من وجود صورة عند إضافة منتج جديد
      if (!this.ProductId && !this.image) {
        this.showToastMessage('Please select an image');
        return;
      }

      const formData = new FormData();
      formData.append('type', this.productType);
      formData.append('rating', this.ratingType);
      formData.append('name', this.Productname);
      formData.append('price', this.price);
      formData.append('key_benefits', this.keyBenefits);
      formData.append('description', this.description);

      // إضافة الصورة - التحقق من نوع الصورة
      if (this.image instanceof File) {
        formData.append('image', this.image);
      } else if (this.ProductId && !this.image) {
        // في حالة التحديث بدون تغيير الصورة، لا نرسل صورة
      }

      // إضافة حقول الخصم
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
            this.resetForm();
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          },
          (error) => {
            console.error('Update error:', error);
            this.showToastMessage(
              error.error?.error ||
                error.error?.message ||
                'Error updating product'
            );
          }
        );
      } else {
        this.apiService.addProduct(formData).subscribe(
          (response) => {
            this.showToastMessage('Product added successfully!');
            this.resetForm();
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          },
          (error) => {
            console.error('Add error:', error);
            this.showToastMessage(
              error.error?.error ||
                error.error?.message ||
                'Error adding product'
            );
          }
        );
      }
    } else {
      this.showToastMessage('Please fill all required fields');
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
            this.ratingType = product.rating.toString();
            this.Productname = product.name;
            this.price = product.price.toString();
            this.image = product.image; // حفظ رابط الصورة الحالية
            this.description = product.description;
            this.keyBenefits = product.key_benefits;
            this.salePercentage = product.sale_percentage
              ? product.sale_percentage.toString()
              : '';
            this.priceAfterSale = product.price_after_sale
              ? product.price_after_sale.toString()
              : '';

            // تحديث عنوان الفورم
            const formTitle = document.getElementById('formTitle');
            if (formTitle) {
              formTitle.textContent = 'Edit Product';
            }

            this.showToastMessage('Product loaded successfully for editing!');
          } else {
            this.showToastMessage(`No product found with ID: ${ProductId}`);
          }
        },
        (error) => {
          console.error('Error fetching products:', error);
          this.showToastMessage('Error fetching products');
        }
      );
    } else {
      this.showToastMessage('No ID provided.');
    }
  }

  deleteproduct(): void {
    const productId = prompt(
      'Please enter the Product ID of the product to delete:'
    );
    if (productId) {
      if (confirm('Are you sure you want to delete this product?')) {
        this.apiService.deleteproduct(productId).subscribe(
          (response) => {
            this.showToastMessage('Product deleted successfully!');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          },
          (error) => {
            console.error('Delete error:', error);
            this.showToastMessage(
              error.error?.error ||
                error.error?.message ||
                'Error deleting product'
            );
          }
        );
      }
    }
  }

  deleteAllproducts(): void {
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
            console.error('Delete all error:', error);
            this.showToastMessage(
              error.error?.error ||
                error.error?.message ||
                'Error deleting products'
            );
          }
        );
      }
    }
  }

  resetForm(): void {
    this.ProductId = '';
    this.productType = 'Medical devices';
    this.ratingType = '5';
    this.Productname = '';
    this.price = '';
    this.image = '';
    this.keyBenefits = '';
    this.description = '';
    this.salePercentage = '';
    this.priceAfterSale = '';

    // مسح input الملف
    const fileInput = document.getElementById('Image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // إعادة تعيين عنوان الفورم
    const formTitle = document.getElementById('formTitle');
    if (formTitle) {
      formTitle.textContent = 'Add New Product';
    }
  }

  showToast(): void {
    const toastEl = document.getElementById('toast-warning');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000,
      });
      toast.show();
    }
  }

  closeToast(): void {
    const toastEl = document.getElementById('toast-warning');
    if (toastEl) {
      const toast = bootstrap.Toast.getInstance(toastEl);
      if (toast) {
        toast.hide();
      }
    }
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast();
  }
}
