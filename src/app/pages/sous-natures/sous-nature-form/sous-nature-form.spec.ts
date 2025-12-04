import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousNatureForm } from './sous-nature-form';

describe('SousNatureForm', () => {
  let component: SousNatureForm;
  let fixture: ComponentFixture<SousNatureForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SousNatureForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SousNatureForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
