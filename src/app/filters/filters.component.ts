import { Component, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ApiuserService } from '../apiuser.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent implements OnInit {
  headingText: string = 'Explore Our Exclusive Furniture Collection';
  numberofproduct: string = '0'
  productshowing:string = "0"
  Price : string = ''
  size : string = ''
  rating : string = ''
  isArrowReversed = false;
  showFormCheck = true;
  isArrowReversed2 = false;
  showFormCheck2 = true;
  isArrowReversed3 = false;
  showFormCheck3 = true;
  isFilterVisible: boolean = false;
  isMobileView: boolean = false;
  dropdownActive = false;
  selectedOption = 'Select an option'; // Default option
  dropdownOptions = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 }
  ];
  selectedProduct: string = '';
  selectedProduct2: string = '';
  selectedProduct3: string = '';
  selectedProduct4: string = '';
  selectedStarsHtml: string = '';
  clickCount: number = 0;
  products: (string | null)[] = [
    this.selectedProduct,
    this.selectedProduct2,
    this.selectedProduct3,
    this.selectedProduct4,
  ];
  lastIndexToRemove: number = this.products.length - 1;
  addproducts: any[] = [];
  allproduct: any[] = [];
  pagedProducts: any[] = [];
  currentPage: number = 1;
  productsPerPage: number = 9;
  filteredProducts: any[] = [];
  noProductsFound: boolean = false;


  selectProduct(product: string) {
    this.selectedProduct = product;
    this.filterProducts();
  }

  selectProduct2(product2: string) {
    console.log('Selected product for filtering:', product2);
    this.selectedProduct2 = product2;
    this.filterProducts();
  }

  selectProduct3(product3: string) {
    console.log('Selected size for filtering:', product3);
    this.selectedProduct3 = product3;
    this.filterProducts();
  }

  selectProduct4(product4: number) {

    this.selectedProduct4 = product4.toString(); // Convert to string
    this.generateStarIcons(parseInt(this.selectedProduct4), 5); // Assuming total stars are 5
    this.filterProducts();
}

  generateStarIcons(rating: number, totalStars: number) {
    this.selectedStarsHtml = '';
    for (let i = 1; i <= totalStars; i++) {
      if (i <= rating) {
        this.selectedStarsHtml += `<i class="fa-solid fa-star"></i>`;
       }else {
        this.selectedStarsHtml += `<i class="fa-regular fa-star"></i>`; // Empty star for ratings below
    }
    }
    // return this.selectedStarsHtml;
  }

  generateStarIconsproduct(rating: number, totalStars: number): string {
    let starsHtml = '';
    for (let i = 1; i <= totalStars; i++) {
      if (i <= rating) {
        starsHtml += `<i class="fa-solid fa-star star"></i>`;
      }else {
        starsHtml += `<i class="fa-regular fa-star star"></i>`;
    }
    }
    return starsHtml;
  }


  onMouseOver(event: any) {
    if (event.target.tagName === 'OPTION') {
      event.target.style.background = '#5A7075';
    }
  }

  onMouseOut(event: any) {
    if (event.target.tagName === 'OPTION') {
      event.target.style.background = '';
    }
  }

  toggleTag() {
    if (this.lastIndexToRemove >= 0) {
        if (this.selectedProduct4) {
            this.products.splice(this.lastIndexToRemove, 1);
            this.selectedProduct4 = '';
            this.filterProducts();
        } else if (this.selectedProduct3) {
            this.products.splice(this.lastIndexToRemove, 1);
            this.selectedProduct3 = '';
            this.filterProducts();
        } else if (this.selectedProduct2) {
            this.products.splice(this.lastIndexToRemove, 1);
            this.selectedProduct2 = '';
            this.filterProducts();
        } else if (this.selectedProduct) {
            this.products.splice(this.lastIndexToRemove, 1);
            this.selectedProduct = '';
            this.filterProducts();
        } else {
            this.products.splice(this.lastIndexToRemove, 1);
            this.filterProducts();
        }
    }
}


    movepaymethod(product: any) {
      // Navigate to the product details page and pass the product data
      this.router.navigate(['/productdetails'], { state: { product } });
    }

  toggleDropdown() {
    this.dropdownActive = !this.dropdownActive;
  }

  selectOption(option: any) {
    this.selectedOption = option.label;
    this.dropdownActive = false;
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdown.bind(this));
  }

  closeDropdown() {
    this.dropdownActive = false;
  }


  constructor(private ApiuserService : ApiuserService ,private renderer: Renderer2, private el: ElementRef , private router : Router) { }

  ngOnInit(): void {
    this.checkScreenSize();
    this.updateHeadingText();
    document.addEventListener('click', this.closeDropdown.bind(this));
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.ApiuserService.getAllproducts().subscribe(
      (data) => {
        console.log('Fetched products:', data);
        this.allproduct = data ; // Ensure it's an array
        // console.log(da);

        this.filteredProducts = this.allproduct;
        this.numberofproduct = this.addproducts.length.toString();
        this.setPagedProducts();
        this.updateProductShowing();
      },
      (error) => {
        console.error("Error fetching data", error);
      }
    );
  }

  setPagedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    this.pagedProducts = this.filteredProducts.slice(startIndex, endIndex);
    this.updateProductShowing();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.setPagedProducts();
  }

  updateProductShowing(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage + 1;
    const endIndex = Math.min(startIndex + this.productsPerPage - 1, this.filteredProducts.length);
    this.productshowing = `${endIndex}`;
    this.numberofproduct = `${this.filteredProducts.length}`
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPagedProducts();
    }
  }

  goToNextPage(): void {
    const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.setPagedProducts();
    }
  }

  getTotalPages(): number[] {
    const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
    return Array(totalPages).fill(0).map((_, i) => i + 1); // Generates [1, 2, 3, ..., totalPages]
  }


  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
    this.updateHeadingText();
  }

  checkScreenSize(): void {
    this.isMobileView = window.innerWidth <= 768;

    if (!this.isMobileView) {
      this.isFilterVisible = true;
    }
  }

  toggleFilterDropdown() {
    if (this.isMobileView) {
      this.isFilterVisible = !this.isFilterVisible;
    }
  }


  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset;

    if (scrollPosition > 100) {
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'backgroundColor', '#CBCDC2'); // Change background color
    } else {
      this.renderer.setStyle(this.el.nativeElement.ownerDocument.body, 'backgroundColor', '#fff'); // Reset to original color
    }
  }

  clearAll() {
    window.location.reload();
  }

  toggleArrow() {
    this.isArrowReversed = !this.isArrowReversed;
    this.showFormCheck = !this.showFormCheck;
    const arrowIcon = document.getElementById('arrowIcon');

    if (this.isArrowReversed) {
      arrowIcon?.classList.add('rotate');
    } else {
      arrowIcon?.classList.remove('rotate');
    }
  }

  toggleArrow2() {
    this.isArrowReversed2 = !this.isArrowReversed2;
    this.showFormCheck2 = !this.showFormCheck2;
    const arrowIcon2 = document.getElementById('arrowIcon2');

    if (this.isArrowReversed2) {
      arrowIcon2?.classList.add('rotate');
    } else {
      arrowIcon2?.classList.remove('rotate');
    }
  }

  toggleArrow3() {
    this.isArrowReversed3 = !this.isArrowReversed3;
    this.showFormCheck3 = !this.showFormCheck3;
    const arrowIcon3 = document.getElementById('arrowIcon3');

    if (this.isArrowReversed3) {
      arrowIcon3?.classList.add('rotate');
    } else {
      arrowIcon3?.classList.remove('rotate');
    }
  }

  updateHeadingText(): void {
    if (window.innerWidth <= 768) {
      this.headingText = 'Collections';
    } else {
      this.headingText = 'Explore Our Exclusive Furniture Collection';
    }
  }


  // Combined filter logic
  filterProducts() {
    // Start with all products
    let filteredProducts = this.allproduct;

    if (this.selectedProduct === 'All') {
      filteredProducts = this.allproduct;
    }

    // Apply product type filter
    if (this.selectedProduct && this.selectedProduct !== 'All') {
      filteredProducts = filteredProducts.filter(
        product => product.type === this.selectedProduct
      );
    }

    // Apply price filter
    if (this.selectedProduct2) { // If a price range is selected
      const priceLimits = this.getPriceLimits(this.selectedProduct2);
      filteredProducts = filteredProducts.filter(
        product => product.price > priceLimits.min && product.price < priceLimits.max
      );
    }

    // Apply size filter
    if (this.selectedProduct3) { // If a size is selected
      filteredProducts = filteredProducts.filter(
        product => product.size === this.selectedProduct3
      );
    }

    if (this.selectedProduct4) { // If a rating is selected
      const ratingLimit = parseInt(this.selectedProduct4); // Convert to number
      filteredProducts = filteredProducts.filter(
        product => product.rating == ratingLimit // Assuming product.rating exists
      );
  }

  switch (this.selectedOption) {
    case 'price':
      filteredProducts = filteredProducts.sort((a, b) => a.price - b.price); // Sort by price, low to high
      break;
    case 'size':
      filteredProducts = filteredProducts.sort((a, b) => a.size - b.size); // Sort by size, low to high
      break;
    case 'rating':
      filteredProducts = filteredProducts.sort((a, b) => a.rating - b.rating); // Sort by rating, low to high
      break;
    default:
      break;
  }


  if (filteredProducts.length === 0) {
    this.noProductsFound = true;  // Set flag if no products
  } else {
    this.noProductsFound = false; // Reset flag if products found
  }

    // Update filteredProducts and UI
    this.filteredProducts = filteredProducts;
    console.log('Filtered products:', this.filteredProducts);
    this.productshowing = String(this.filteredProducts.length);

    // Reset pagination after filtering
    this.currentPage = 1;
    this.setPagedProducts();
  }


  getPriceLimits(product2: string): { min: number, max: number } {
    switch (product2) {
      case 'Under 500 EGP':
        return { min: 0, max: 500 };
      case '500 EGP to 1000 EGP':
        return { min: 500, max: 1000 };
      case '1000 EGP to 3000 EGP':
        return { min: 1000, max: 3000 };
      case '3000 EGP to 6000 EGP':
        return { min: 3000, max: 6000 };
      case 'Over 6000 EGP':
        return { min: 6000, max: 1000000 };
      default:
        return { min: 0, max: 1000000 };
    }
  }
}

