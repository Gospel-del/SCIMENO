import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopusElts } from './popus-elts';

describe('PopusElts', () => {
  let component: PopusElts;
  let fixture: ComponentFixture<PopusElts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopusElts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopusElts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
