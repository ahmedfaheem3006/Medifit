import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserordersComponent } from './userorders.component';

describe('UserordersComponent', () => {
  let component: UserordersComponent;
  let fixture: ComponentFixture<UserordersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserordersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
