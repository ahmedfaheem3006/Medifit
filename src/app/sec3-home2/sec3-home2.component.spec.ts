import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sec3Home2Component } from './sec3-home2.component';

describe('Sec3Home2Component', () => {
  let component: Sec3Home2Component;
  let fixture: ComponentFixture<Sec3Home2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sec3Home2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sec3Home2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
