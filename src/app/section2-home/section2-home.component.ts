import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-section2-home',
  templateUrl: './section2-home.component.html',
  styleUrl: './section2-home.component.css'
})
export class Section2HomeComponent {
    constructor( private router: Router) {}

    onclick() {
      this.router.navigate(['/filters']);
    }

}
