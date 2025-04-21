import { TestBed } from '@angular/core/testing';

import { ApiuserService } from './apiuser.service';

describe('ApiuserService', () => {
  let service: ApiuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiuserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
