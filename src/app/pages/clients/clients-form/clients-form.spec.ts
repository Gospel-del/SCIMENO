import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsForm } from './clients-form';

describe('ClientsForm', () => {
  let component: ClientsForm;
  let fixture: ComponentFixture<ClientsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
