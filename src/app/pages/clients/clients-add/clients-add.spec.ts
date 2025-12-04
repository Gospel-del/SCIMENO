import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsAdd } from './clients-add';

describe('ClientsAdd', () => {
  let component: ClientsAdd;
  let fixture: ComponentFixture<ClientsAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
