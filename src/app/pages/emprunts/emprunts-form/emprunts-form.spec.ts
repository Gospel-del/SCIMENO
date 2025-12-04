import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpruntsForm } from './emprunts-form';

describe('EmpruntsForm', () => {
  let component: EmpruntsForm;
  let fixture: ComponentFixture<EmpruntsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpruntsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpruntsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
