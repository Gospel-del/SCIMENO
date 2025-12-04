import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturesAdd } from './natures-add';

describe('NaturesAdd', () => {
  let component: NaturesAdd;
  let fixture: ComponentFixture<NaturesAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaturesAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NaturesAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
