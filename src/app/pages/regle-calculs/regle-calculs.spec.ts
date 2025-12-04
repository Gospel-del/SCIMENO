import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegleCalculs } from './regle-calculs';

describe('RegleCalculs', () => {
  let component: RegleCalculs;
  let fixture: ComponentFixture<RegleCalculs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegleCalculs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegleCalculs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
