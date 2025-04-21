import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sec1ContactComponent } from './sec1-contact.component';

describe('Sec1ContactComponent', () => {
  let component: Sec1ContactComponent;
  let fixture: ComponentFixture<Sec1ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sec1ContactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Sec1ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
