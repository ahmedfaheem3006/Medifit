import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sec3-home2',
  templateUrl: './sec3-home2.component.html',
  styleUrl: './sec3-home2.component.css',
})
export class Sec3Home2Component {
  constructor(private router: Router) {}

  onclick() {
    this.router.navigate(['/filters']);
  }
}
