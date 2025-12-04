import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetsForm } from './projets-form';

describe('ProjetsForm', () => {
  let component: ProjetsForm;
  let fixture: ComponentFixture<ProjetsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
