import { TestBed } from '@angular/core/testing';

import { ProjetsServices } from './projets.services';

describe('ProjetsServices', () => {
  let service: ProjetsServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjetsServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
