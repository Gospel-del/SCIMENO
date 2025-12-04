import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturesEdit } from './natures-edit';

describe('NaturesEdit', () => {
  let component: NaturesEdit;
  let fixture: ComponentFixture<NaturesEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaturesEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NaturesEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
