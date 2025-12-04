import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormuleBuilderAdd } from './formule-builder-add';

describe('FormuleBuilderAdd', () => {
  let component: FormuleBuilderAdd;
  let fixture: ComponentFixture<FormuleBuilderAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormuleBuilderAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormuleBuilderAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
