import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-about-two',
  templateUrl: './about-two.component.html',
  styleUrl: './about-two.component.css'
})
export class AboutTwoComponent implements OnInit, AfterViewInit, OnDestroy {
  private featureItems: NodeListOf<Element> | null = null;
  private descriptionContents: NodeListOf<Element> | null = null;
  private defaultContent: Element | null = null;
  private eventListeners: { element: Element, type: string, listener: EventListener }[] = [];

  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
    // Set up hover functionality after view is initialized
    setTimeout(() => {
      this.setupHoverEffects();
    }, 100);
  }

  ngOnDestroy(): void {
    // Clean up event listeners when component is destroyed
    this.removeEventListeners();
  }

  private setupHoverEffects(): void {
    // Get all feature items and description contents
    this.featureItems = document.querySelectorAll('.feature-item');
    this.descriptionContents = document.querySelectorAll('.description-content');
    this.defaultContent = document.querySelector('.default-content');

    if (!this.featureItems || !this.descriptionContents || !this.defaultContent) {
      return;
    }

    this.featureItems.forEach(item => {
      // Add mouseenter event listener
      const enterListener = this.handleMouseEnter.bind(this, item);
      item.addEventListener('mouseenter', enterListener);
      this.eventListeners.push({ element: item, type: 'mouseenter', listener: enterListener });

      // Add mouseleave event listener
      const leaveListener = this.handleMouseLeave.bind(this, item);
      item.addEventListener('mouseleave', leaveListener);
      this.eventListeners.push({ element: item, type: 'mouseleave', listener: leaveListener });

      // Add click event for mobile devices
      const clickListener = this.handleClick.bind(this, item);
      item.addEventListener('click', clickListener);
      this.eventListeners.push({ element: item, type: 'click', listener: clickListener });
    });
  }

  private handleMouseEnter(item: Element): void {
    if (!this.featureItems || !this.descriptionContents) return;

    // Remove active class from all feature items
    this.featureItems.forEach(fi => fi.classList.remove('active'));

    // Add active class to current feature item
    // item.classList.add('active');

    // Hide all description contents
    this.descriptionContents.forEach(content => {
      content.classList.remove('active');
    });

    // Show the corresponding description content
    const featureType = item.getAttribute('data-feature');
    const targetContent = document.querySelector(`.${featureType}-content`);
    if (targetContent) {
      targetContent.classList.add('active');
    }
  }

  private handleMouseLeave(item: Element): void {
    if (!this.descriptionContents || !this.defaultContent) return;

    // Remove active class from current feature item
    item.classList.remove('active');

    // Hide all description contents
    this.descriptionContents.forEach(content => {
      content.classList.remove('active');
    });

    // Show default content
    this.defaultContent.classList.add('active');
  }

  private handleClick(item: Element, event: Event): void {
    // For mobile devices, toggle the active state
    if (window.innerWidth <= 768) {
      if (item.classList.contains('active')) {
        this.handleMouseLeave(item);
      } else {
        this.handleMouseEnter(item);
      }
    }
  }

  private removeEventListeners(): void {
    // Clean up all event listeners
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    this.eventListeners = [];
  }
}
