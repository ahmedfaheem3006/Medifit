import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section2HomeComponent } from './section2-home.component';

describe('Section2HomeComponent', () => {
  let component: Section2HomeComponent;
  let fixture: ComponentFixture<Section2HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Section2HomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Section2HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
