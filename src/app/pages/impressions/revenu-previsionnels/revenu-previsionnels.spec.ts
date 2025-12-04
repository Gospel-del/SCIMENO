import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenuPrevisionnels } from './revenu-previsionnels';

describe('RevenuPrevisionnels', () => {
  let component: RevenuPrevisionnels;
  let fixture: ComponentFixture<RevenuPrevisionnels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenuPrevisionnels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenuPrevisionnels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
