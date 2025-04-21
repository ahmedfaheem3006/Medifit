import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sec2Home2Component } from './sec2-home2.component';

describe('Sec2Home2Component', () => {
  let component: Sec2Home2Component;
  let fixture: ComponentFixture<Sec2Home2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sec2Home2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sec2Home2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
