import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetsAdd } from './projets-add';

describe('ProjetsAdd', () => {
  let component: ProjetsAdd;
  let fixture: ComponentFixture<ProjetsAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetsAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetsAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
