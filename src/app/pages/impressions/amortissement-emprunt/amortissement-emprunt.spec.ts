import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmortissementEmprunt } from './amortissement-emprunt';

describe('AmortissementEmprunt', () => {
  let component: AmortissementEmprunt;
  let fixture: ComponentFixture<AmortissementEmprunt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmortissementEmprunt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmortissementEmprunt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
