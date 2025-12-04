import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegleCalculsForm } from './regle-calculs-form';

describe('RegleCalculsForm', () => {
  let component: RegleCalculsForm;
  let fixture: ComponentFixture<RegleCalculsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegleCalculsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegleCalculsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
