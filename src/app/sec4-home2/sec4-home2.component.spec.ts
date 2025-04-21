import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sec4Home2Component } from './sec4-home2.component';

describe('Sec4Home2Component', () => {
  let component: Sec4Home2Component;
  let fixture: ComponentFixture<Sec4Home2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sec4Home2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sec4Home2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
