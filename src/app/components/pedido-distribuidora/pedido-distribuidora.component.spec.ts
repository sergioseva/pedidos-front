import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoDistribuidoraComponent } from './pedido-distribuidora.component';

describe('PedidoDistribuidoraComponent', () => {
  let component: PedidoDistribuidoraComponent;
  let fixture: ComponentFixture<PedidoDistribuidoraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoDistribuidoraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoDistribuidoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
