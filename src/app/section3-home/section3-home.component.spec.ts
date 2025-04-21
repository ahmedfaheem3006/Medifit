import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section3HomeComponent } from './section3-home.component';

describe('Section3HomeComponent', () => {
  let component: Section3HomeComponent;
  let fixture: ComponentFixture<Section3HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Section3HomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Section3HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
