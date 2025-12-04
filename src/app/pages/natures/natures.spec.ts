import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Natures } from './natures';

describe('Natures', () => {
  let component: Natures;
  let fixture: ComponentFixture<Natures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Natures]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Natures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
