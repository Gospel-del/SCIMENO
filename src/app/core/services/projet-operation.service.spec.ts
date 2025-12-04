import { TestBed } from '@angular/core/testing';

import { ProjetOperationService } from './projet-operation.service';

describe('ProjetOperationService', () => {
  let service: ProjetOperationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjetOperationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
