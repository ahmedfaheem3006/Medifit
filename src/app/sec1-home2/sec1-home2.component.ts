import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sec1-home2',
  templateUrl: './sec1-home2.component.html',
  styleUrl: './sec1-home2.component.css'
})
export class Sec1Home2Component {
  constructor( private router: Router) {}

  onclick() {
    this.router.navigate(['/filters']);
  }

}
