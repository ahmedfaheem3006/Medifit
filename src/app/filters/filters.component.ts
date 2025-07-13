import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ApiuserService } from '../apiuser.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css',
})
export class FiltersComponent implements OnInit {
  headingText: string = 'Explore Our Medical Products Collection';
  numberofproduct: string = '0';
  productshowing: string = '0';
  Price: string = '';
  rating: string = '';
  isArrowReversed = false;
  showFormCheck = true;
  isArrowReversed3 = false;
  showFormCheck3 = true;
  isFilterVisible: boolean = false;
  isMobileView: boolean = false;
  dropdownActive = false;
  selectedOption = 'Select an option'; // Default option
  dropdownOptions = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 },
  ];
  selectedProduct: string = '';
  selectedProduct2: string = '';
  selectedProduct4: string = '';
  selectedStarsHtml: string = '';
  clickCount: number = 0;
  products: (string | null)[] = [
    this.selectedProduct,
    this.selectedProduct2,
    this.selectedProduct4,
  ];
  lastIndexToRemove: number = this.products.length - 1;
  addproducts: any[] = [];
  allproduct: any[] = [];
  pagedProducts: any[] = [];
  currentPage: number = 1;
  productsPerPage: number = 9;
  filteredProducts: any[] = [];
  isLoading: boolean = true;
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
      } else {
        this.selectedStarsHtml += `<i class="fa-regular fa-star"></i>`; // Empty star for ratings below
      }
    }
  }

  generateStarIconsproduct(rating: number, totalStars: number): string {
    if (typeof rating === 'string') {
      rating = parseInt(rating, 10);
    }

    let starsHtml = '';
    for (let i = 1; i <= totalStars; i++) {
      if (i <= rating) {
        starsHtml += `<i class="fa-solid fa-star star"></i>`;
      } else {
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
        this.rating = '';
        this.selectedProduct4 = '';
        this.filterProducts();
      } else if (this.selectedProduct2) {
        this.products.splice(this.lastIndexToRemove, 1);
        this.Price = '';
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

  constructor(
    private ApiuserService: ApiuserService,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.updateHeadingText();

    window.scrollTo(0, 0);

    this.showFormCheck = true;
    this.showFormCheck3 = true;

    document.addEventListener('click', this.closeDropdown.bind(this));

    this.fetchProducts();

    // this.route.queryParams.subscribe((params) => {
    //   const category = params['category'];
    //   if (category) {
    //     setTimeout(() => {
    //       this.selectedProduct = category;
    //       this.filterProducts();
    //       console.log(
    //         'تم تطبيق الفلتر:',
    //         category,
    //         'المنتجات المتبقية:',
    //         this.filteredProducts.length
    //       );
    //     }, 500);
    //   }
    // });
  }

  fetchProducts(): void {
    this.isLoading = true;
    this.ApiuserService.getAllproducts().subscribe(
      (data) => {
        console.log('Fetched products:', data);
        this.allproduct = data; // Ensure it's an array
        this.filteredProducts = this.allproduct;
        this.numberofproduct = this.allproduct.length.toString();
        this.setPagedProducts();
        this.updateProductShowing();
        this.isLoading = false;
        this.route.queryParams.subscribe((params) => {
          const category = params['category'];
          if (category) {
            this.selectedProduct = category;
            this.filterProducts();
          }
        });
      },
      (error) => {
        console.error('Error fetching data', error);
        this.isLoading = false; // انتهاء التحميل حتى في حالة الخطأ
        this.noProductsFound = true;
      }
    );
  }

  setPagedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    this.pagedProducts = this.filteredProducts.slice(startIndex, endIndex);
    this.updateProductShowing();
  }

  formatPrice(price: number | string): string {
    if (price === null || price === undefined) return '0';

    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Format with commas for thousands
    return numPrice.toLocaleString('en-US');
  }

  changePage(page: number): void {
    this.currentPage = page;
    window.scrollTo(0, 0);
    this.setPagedProducts();
  }

  updateProductShowing(): void {
    const startIndex = (this.currentPage - 1) * this.productsPerPage + 1;
    const endIndex = Math.min(
      startIndex + this.productsPerPage - 1,
      this.filteredProducts.length
    );
    this.productshowing = `${endIndex}`;
    this.numberofproduct = `${this.filteredProducts.length}`;
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo(0, 0);
      this.setPagedProducts();
    }
  }

  goToNextPage(): void {
    const totalPages = Math.ceil(
      this.filteredProducts.length / this.productsPerPage
    );
    if (this.currentPage < totalPages) {
      this.currentPage++;
      window.scrollTo(0, 0);
      this.setPagedProducts();
    }
  }

  getTotalPages(): number[] {
    const totalPages = Math.ceil(
      this.filteredProducts.length / this.productsPerPage
    );
    return Array(totalPages)
      .fill(0)
      .map((_, i) => i + 1); // Generates [1, 2, 3, ..., totalPages]
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
      this.renderer.setStyle(
        this.el.nativeElement.ownerDocument.body,
        'backgroundColor',
        '#CBCDC2'
      ); // Change background color
    } else {
      this.renderer.setStyle(
        this.el.nativeElement.ownerDocument.body,
        'backgroundColor',
        '#fff'
      ); // Reset to original color
    }
  }

  clearAll() {
    window.location.reload();
  }

  toggleArrow(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.showFormCheck = !this.showFormCheck;
    this.isArrowReversed = !this.isArrowReversed;

    const arrowIcon = document.getElementById('arrowIcon');
    if (arrowIcon) {
      if (this.isArrowReversed) {
        arrowIcon.classList.add('rotate');
      } else {
        arrowIcon.classList.remove('rotate');
      }
    }

    console.log('Price filter visibility:', this.showFormCheck);
  }

  toggleArrow3(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.showFormCheck3 = !this.showFormCheck3;
    this.isArrowReversed3 = !this.isArrowReversed3;

    const arrowIcon3 = document.getElementById('arrowIcon3');
    if (arrowIcon3) {
      if (this.isArrowReversed3) {
        arrowIcon3.classList.add('rotate');
      } else {
        arrowIcon3.classList.remove('rotate');
      }
    }

    // console.log('Rating filter visibility:', this.showFormCheck3);
  }

  updateHeadingText(): void {
    if (window.innerWidth <= 768) {
      this.headingText = 'Medical Products';
    } else {
      this.headingText = 'Explore Our Medical Products Collection';
    }
  }

  // Add to your component class
  parseInt(value: string | number): number {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value as number;
  }

  getVisiblePages(): any[] {
    const totalPages = Math.ceil(
      this.filteredProducts.length / this.productsPerPage
    );

    // Maximum number of page buttons to show
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If we have few pages, show all
      return Array(totalPages)
        .fill(0)
        .map((_, i) => ({ type: 'page', value: i + 1 }));
    }

    let visiblePages = [];

    // Always show first page
    visiblePages.push({ type: 'page', value: 1 });

    // Calculate range around current page
    const rangeStart = Math.max(2, this.currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, this.currentPage + 1);

    // Add ellipsis if needed before range
    if (rangeStart > 2) {
      visiblePages.push({ type: 'ellipsis', value: '...' });
    }

    // Add pages in the middle range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      visiblePages.push({ type: 'page', value: i });
    }

    // Add ellipsis if needed after range
    if (rangeEnd < totalPages - 1) {
      visiblePages.push({ type: 'ellipsis', value: '...' });
    }

    // Always show last page
    visiblePages.push({ type: 'page', value: totalPages });

    return visiblePages;
  }

  // Add these methods to your component

  getTotalPagesCount(): number {
    return Math.ceil(this.filteredProducts.length / this.productsPerPage);
  }

  getMiddlePages(): number[] {
    const totalPages = this.getTotalPagesCount();
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If we have few pages, return all except first and last if they're shown separately
      return Array.from({ length: totalPages - 2 }, (_, i) => i + 2);
    }

    // Calculate range around current page
    const rangeStart = Math.max(2, this.currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, this.currentPage + 1);

    // Return pages in the middle range
    return Array.from(
      { length: rangeEnd - rangeStart + 1 },
      (_, i) => i + rangeStart
    );
  }

  shouldShowFirstPage(): boolean {
    return this.getTotalPagesCount() > 0;
  }

  shouldShowLastPage(): boolean {
    const totalPages = this.getTotalPagesCount();
    return totalPages > 1;
  }

  shouldShowFirstEllipsis(): boolean {
    const middlePages = this.getMiddlePages();
    return middlePages.length > 0 && middlePages[0] > 2;
  }

  shouldShowLastEllipsis(): boolean {
    const middlePages = this.getMiddlePages();
    const totalPages = this.getTotalPagesCount();
    return (
      middlePages.length > 0 &&
      middlePages[middlePages.length - 1] < totalPages - 1
    );
  }

  // Agregar este método al componente FiltersComponent

  removeTag(tagType: string): void {
    switch (tagType) {
      case 'product':
        this.selectedProduct = '';
        break;
      case 'price':
        this.selectedProduct2 = '';
        this.Price = '';
        break;
      case 'rating':
        this.selectedProduct4 = '';
        this.rating = '';
        break;
    }
    this.filterProducts();
  }

  // Combined filter logic
  filterProducts() {
    // Start with all products
    let filteredProducts = [...this.allproduct];

    if (this.selectedProduct === 'All') {
      filteredProducts = [...this.allproduct];
      // console.log('تم اختيار "الكل"، عدد المنتجات:', filteredProducts.length);
    }

    // Apply product type filter
    if (this.selectedProduct && this.selectedProduct !== 'All') {
      console.log('تطبيق فلتر النوع:', this.selectedProduct);
      filteredProducts = filteredProducts.filter(
        (product) => product.type === this.selectedProduct
      );
      // console.log('بعد فلتر النوع، المنتجات المتبقية:', filteredProducts.length);
    }

    // Apply price filter
    if (this.selectedProduct2) {
      // If a price range is selected
      const priceLimits = this.getPriceLimits(this.selectedProduct2);
      filteredProducts = filteredProducts.filter((product) => {
        // Use price_after_sale if available, otherwise use price
        const effectivePrice = product.price_after_sale || product.price;
        return (
          effectivePrice > priceLimits.min && effectivePrice < priceLimits.max
        );
      });
    }

    if (this.selectedProduct4) {
      // If a rating is selected
      const ratingLimit = parseInt(this.selectedProduct4); // Convert to number
      filteredProducts = filteredProducts.filter(
        (product) => product.rating == ratingLimit // Assuming product.rating exists
      );
    }

    switch (this.selectedOption) {
      case 'price':
        filteredProducts = filteredProducts.sort((a, b) => {
          // Use price_after_sale if available, otherwise use price
          const priceA = a.price_after_sale || a.price;
          const priceB = b.price_after_sale || b.price;
          return priceA - priceB; // Sort by effective price, low to high
        });
        break;
      case 'rating':
        filteredProducts = filteredProducts.sort((a, b) => b.rating - a.rating); // Sort by rating, high to low
        break;
      default:
        break;
    }

    if (filteredProducts.length === 0) {
      this.noProductsFound = true; // Set flag if no products
    } else {
      this.noProductsFound = false; // Reset flag if products found
    }

    // Update filteredProducts and UI
    this.filteredProducts = filteredProducts;
    // console.log('Filtered products:', this.filteredProducts);
    this.productshowing = String(this.filteredProducts.length);

    // Reset pagination after filtering
    this.currentPage = 1;
    this.setPagedProducts();
  }

  isOnSale(product: any): boolean {
    return (
      product.sale_percentage > 0 &&
      product.price_after_sale !== undefined &&
      product.price_after_sale < product.price
    );
  }

  getPriceLimits(product2: string): { min: number; max: number } {
    switch (product2) {
      case 'Under 100 EGP':
        return { min: 0, max: 100 };
      case '100 EGP to 500 EGP':
        return { min: 100, max: 500 };
      case '500 EGP to 3000 EGP':
        return { min: 500, max: 3000 };
      case '3000 EGP to 6000 EGP':
        return { min: 3000, max: 6000 };
      case 'Over 6000 EGP':
        return { min: 6000, max: 1000000 };
      default:
        return { min: 0, max: 1000000 };
    }
  }
}
