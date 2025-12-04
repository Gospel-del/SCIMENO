import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegleCalculsAdd } from './regle-calculs-add';

describe('RegleCalculsAdd', () => {
  let component: RegleCalculsAdd;
  let fixture: ComponentFixture<RegleCalculsAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegleCalculsAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegleCalculsAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
