import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousNatureAdd } from './sous-nature-add';

describe('SousNatureAdd', () => {
  let component: SousNatureAdd;
  let fixture: ComponentFixture<SousNatureAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SousNatureAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SousNatureAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
