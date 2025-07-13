import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiuserService } from '../apiuser.service';

@Component({
  selector: 'app-sec1-contact',
  templateUrl: './sec1-contact.component.html',
  styleUrls: ['./sec1-contact.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class Sec1ContactComponent implements OnInit {
  contactForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  minDate = new Date().toISOString().split('T')[0];

  constructor(
    private formBuilder: FormBuilder,
    private apiuserService: ApiuserService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.contactForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)]],
      schedule: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.contactForm.invalid) {
      return;
    }

    this.loading = true;

    this.apiuserService.submitContactForm(this.contactForm.value)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = response.message || "Your message has been sent successfully!";
          this.contactForm.reset();
          this.submitted = false;
          // setTimeout(() => {
          //   this.sec1-contact.reset();
          // }, 3500);

        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        }
      });
  }
}
