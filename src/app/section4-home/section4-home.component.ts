import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-section4-home',
  templateUrl: './section4-home.component.html',
  styleUrls: ['./section4-home.component.css']
})
export class Section4HomeComponent implements OnInit {

  ngOnInit(): void {
    this.setupTestimonialTabs();
  }

  setupTestimonialTabs(): void {
    const clientTabs = document.querySelectorAll('.client-tab');

    clientTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and testimonials
        document.querySelectorAll('.client-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.testimonial-text').forEach(t => t.classList.remove('active'));

        // Add active class to clicked tab
        tab.classList.add('active');

        // Get the testimonial ID from data attribute
        const testimonialId = tab.getAttribute('data-testimonial');

        // Show the corresponding testimonial
        if (testimonialId) {
          const testimonial = document.getElementById(testimonialId);
          if (testimonial) {
            testimonial.classList.add('active');
          }
        }
      });
    });
  }
}
