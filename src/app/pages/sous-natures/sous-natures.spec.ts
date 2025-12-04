import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousNatures } from './sous-natures';

describe('SousNatures', () => {
  let component: SousNatures;
  let fixture: ComponentFixture<SousNatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SousNatures]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SousNatures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
