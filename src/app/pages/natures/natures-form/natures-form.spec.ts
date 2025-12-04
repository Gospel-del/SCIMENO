import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturesForm } from './natures-form';

describe('NaturesForm', () => {
  let component: NaturesForm;
  let fixture: ComponentFixture<NaturesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaturesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NaturesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
