import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingaddressComponent } from './shippingaddress.component';

describe('ShippingaddressComponent', () => {
  let component: ShippingaddressComponent;
  let fixture: ComponentFixture<ShippingaddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShippingaddressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShippingaddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
