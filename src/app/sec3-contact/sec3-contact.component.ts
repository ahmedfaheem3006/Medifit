import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sec3-contact',
  templateUrl: './sec3-contact.component.html',
  styleUrl: './sec3-contact.component.css',
})
export class Sec3ContactComponent {
  constructor(private router: Router) {}

  onclick() {
    this.router.navigate(['/home2']);
  }
}
