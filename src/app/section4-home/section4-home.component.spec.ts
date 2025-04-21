import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section4HomeComponent } from './section4-home.component';

describe('Section4HomeComponent', () => {
  let component: Section4HomeComponent;
  let fixture: ComponentFixture<Section4HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Section4HomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Section4HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
