import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sec1Home2Component } from './sec1-home2.component';

describe('Sec1Home2Component', () => {
  let component: Sec1Home2Component;
  let fixture: ComponentFixture<Sec1Home2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sec1Home2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sec1Home2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
