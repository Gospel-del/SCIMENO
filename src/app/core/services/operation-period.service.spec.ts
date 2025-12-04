import { TestBed } from '@angular/core/testing';

import { OperationPeriodService } from './operation-period.service';

describe('OperationPeriodService', () => {
  let service: OperationPeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperationPeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
