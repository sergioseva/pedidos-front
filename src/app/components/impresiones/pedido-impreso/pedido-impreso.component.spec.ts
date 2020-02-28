import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoImpresoComponent } from './pedido-impreso.component';

describe('PedidoImpresoComponent', () => {
  let component: PedidoImpresoComponent;
  let fixture: ComponentFixture<PedidoImpresoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoImpresoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoImpresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
