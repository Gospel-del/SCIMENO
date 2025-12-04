import { TestBed } from '@angular/core/testing';

import { RegleCalculService } from './regle-calcul-service';

describe('RegleCalculService', () => {
  let service: RegleCalculService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegleCalculService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
