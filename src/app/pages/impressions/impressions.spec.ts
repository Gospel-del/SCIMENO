import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Impressions } from './impressions';

describe('Impressions', () => {
  let component: Impressions;
  let fixture: ComponentFixture<Impressions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Impressions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Impressions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
