import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormuleBuilder } from './formule-builder';

describe('FormuleBuilder', () => {
  let component: FormuleBuilder;
  let fixture: ComponentFixture<FormuleBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormuleBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormuleBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
