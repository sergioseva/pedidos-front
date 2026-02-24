import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/es-AR';
import { PedidoImpresoComponent } from './pedido-impreso.component';
import { PedidosService } from '../../../providers/pedidos.service';
import { PrintPedidoService } from '../../../providers/print-pedido.service';
import { ConfiguracionService } from '../../../providers/configuracion.service';
import { ActivatedRoute } from '@angular/router';
import { mockConfiguracionService } from '../../../testing/test-helpers';
import { of } from 'rxjs';
import { PedidoModel } from '../../../models/pedido.model';
import { ClienteModel } from '../../../models/cliente.model';

registerLocaleData(localeAr);

describe('PedidoImpresoComponent', () => {
  let component: PedidoImpresoComponent;
  let fixture: ComponentFixture<PedidoImpresoComponent>;
  let printService: any;

  beforeEach(async(() => {
    const mockCliente = new ClienteModel();
    mockCliente.nombre = 'Test Client';
    const mockPedido = new PedidoModel();
    mockPedido.id = 1;
    mockPedido.cliente = mockCliente;

    printService = {
      onDataReady: jasmine.createSpy('onDataReady'),
      isPrinting: true
    };

    TestBed.configureTestingModule({
      declarations: [PedidoImpresoComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { pedidoId: 1 } } } },
        { provide: PedidosService, useValue: { getPedidoProjection: jasmine.createSpy().and.returnValue(of(mockPedido)) } },
        { provide: PrintPedidoService, useValue: printService },
        { provide: ConfiguracionService, useValue: mockConfiguracionService() }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoImpresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pedido data', () => {
    expect(component.pedido).toBeTruthy();
    expect(component.pedido.id).toBe(1);
  });

  it('should call onDataReady when both loads complete', () => {
    expect(printService.onDataReady).toHaveBeenCalled();
  });
});
