import { TestBed } from '@angular/core/testing';

import { SousNaturesService } from './sous-natures.service';

describe('SousNaturesService', () => {
  let service: SousNaturesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SousNaturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
