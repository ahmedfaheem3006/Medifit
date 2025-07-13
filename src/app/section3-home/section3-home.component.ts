import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiuserService } from '../apiuser.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-section3-home',
  templateUrl: './section3-home.component.html',
  styleUrl: './section3-home.component.css'
})
export class Section3HomeComponent implements OnInit{
  newsletterForm: FormGroup;
  isSubmitting: boolean = false;
  subscriptionResult: { success: boolean; message: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiUserService: ApiuserService
  ) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.newsletterForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const email = this.newsletterForm.get('email')?.value;

    this.apiUserService.subscribeToNewsletter(email).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.subscriptionResult = {
          success: true,
          message: response.alreadySubscribed
            ? 'You are already subscribed to our newsletter!'
            : 'Thank you for subscribing! You have received a 15% discount on your next purchase.'
        };

        // Reset form after successful submission
        this.newsletterForm.reset();

        // If user is logged in and newly subscribed, check and apply discount
        if (this.apiUserService.isLoggedIn() && !response.alreadySubscribed) {
          this.checkAndApplyDiscount();
        }

        // Hide message after 5 seconds
        setTimeout(() => {
          this.subscriptionResult = null;
        }, 5000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.subscriptionResult = {
          success: false,
          message: 'Error subscribing to newsletter. Please try again.'
        };

        // Hide error message after 5 seconds
        setTimeout(() => {
          this.subscriptionResult = null;
        }, 5000);
      }
    });
  }

  onclick() {
    this.router.navigate(['/filters']);
  }

  private checkAndApplyDiscount(): void {
    this.apiUserService.checkDiscountEligibility().subscribe({
      next: (response) => {
        if (response.eligible) {
          // User is eligible, apply discount
          this.apiUserService.applyNewsletterDiscount().subscribe({
            next: () => {
              // Refresh the cart to show the discount
              this.apiUserService.getCart().subscribe();
            },
            error: (error) => console.error('Error applying discount:', error)
          });
        }
      },
      error: (error) => console.error('Error checking discount eligibility:', error)
    });
  }
}
