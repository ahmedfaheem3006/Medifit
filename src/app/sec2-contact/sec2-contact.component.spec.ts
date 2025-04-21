import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sec2ContactComponent } from './sec2-contact.component';

describe('Sec2ContactComponent', () => {
  let component: Sec2ContactComponent;
  let fixture: ComponentFixture<Sec2ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sec2ContactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sec2ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
