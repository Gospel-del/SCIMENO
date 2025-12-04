import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormuleBuilderForm } from './formule-builder-form';

describe('FormuleBuilderForm', () => {
  let component: FormuleBuilderForm;
  let fixture: ComponentFixture<FormuleBuilderForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormuleBuilderForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormuleBuilderForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
