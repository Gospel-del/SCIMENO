import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegleCalculsEdit } from './regle-calculs-edit';

describe('RegleCalculsEdit', () => {
  let component: RegleCalculsEdit;
  let fixture: ComponentFixture<RegleCalculsEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegleCalculsEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegleCalculsEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
