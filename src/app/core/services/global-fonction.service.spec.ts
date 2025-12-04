import { TestBed } from '@angular/core/testing';

import { GlobalFonctionService } from './global-fonction.service';

describe('GlobalFonctionService', () => {
  let service: GlobalFonctionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalFonctionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
