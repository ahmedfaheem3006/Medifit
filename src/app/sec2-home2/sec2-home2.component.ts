import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sec2-home2',
  templateUrl: './sec2-home2.component.html',
  styleUrl: './sec2-home2.component.css'
})
export class Sec2Home2Component {
  constructor(private router: Router) {}

  onclick() {
    this.router.navigate(['/filters']);
  }
}
