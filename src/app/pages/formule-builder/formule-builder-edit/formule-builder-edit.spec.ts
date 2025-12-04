import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormuleBuilderEdit } from './formule-builder-edit';

describe('FormuleBuilderEdit', () => {
  let component: FormuleBuilderEdit;
  let fixture: ComponentFixture<FormuleBuilderEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormuleBuilderEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormuleBuilderEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
