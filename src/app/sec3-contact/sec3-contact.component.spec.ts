import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sec3ContactComponent } from './sec3-contact.component';

describe('Sec3ContactComponent', () => {
  let component: Sec3ContactComponent;
  let fixture: ComponentFixture<Sec3ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sec3ContactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sec3ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
