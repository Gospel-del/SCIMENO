import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousNatureEdit } from './sous-nature-edit';

describe('SousNatureEdit', () => {
  let component: SousNatureEdit;
  let fixture: ComponentFixture<SousNatureEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SousNatureEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SousNatureEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
