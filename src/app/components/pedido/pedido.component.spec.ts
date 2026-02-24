import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PedidoComponent } from './pedido.component';
import { PedidosService } from '../../providers/pedidos.service';
import { ClientesServiceService } from '../../providers/clientes-service.service';
import { PrintPedidoService } from '../../providers/print-pedido.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { PedidoModel } from '../../models/pedido.model';
import { createPedidoItem, mockBsModalService } from '../../testing/test-helpers';

describe('PedidoComponent', () => {
  let component: PedidoComponent;
  let fixture: ComponentFixture<PedidoComponent>;
  let pedidosService: any;
  let clientesService: any;
  let printService: any;

  beforeEach(async(() => {
    const mockPedido = new PedidoModel();
    pedidosService = {
      currentPedido: of(mockPedido),
      generarNuevoPedido: jasmine.createSpy('generarNuevoPedido'),
      removePedidoItem: jasmine.createSpy('removePedidoItem'),
      addPedidoItem: jasmine.createSpy('addPedidoItem'),
      asignarDatos: jasmine.createSpy('asignarDatos'),
      grabarPedido: jasmine.createSpy('grabarPedido').and.returnValue(of({ id: 1 })),
      finalizarPedido: jasmine.createSpy('finalizarPedido')
    };

    clientesService = {
      getClientesPorCualquier: jasmine.createSpy('getClientesPorCualquier').and.returnValue(of([])),
      insertCliente: jasmine.createSpy('insertCliente').and.returnValue(of({}))
    };

    printService = {
      imprimirPedido: jasmine.createSpy('imprimirPedido'),
      isPrinting: false
    };

    TestBed.configureTestingModule({
      declarations: [PedidoComponent],
      imports: [ReactiveFormsModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PedidosService, useValue: pedidosService },
        { provide: ClientesServiceService, useValue: clientesService },
        { provide: PrintPedidoService, useValue: printService },
        { provide: BsModalService, useValue: mockBsModalService() }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build form with required cliente and numeric senia', () => {
    expect(component.forma).toBeTruthy();
    expect(component.forma.controls.cliente).toBeTruthy();
    expect(component.forma.controls.senia).toBeTruthy();
    expect(component.forma.controls.observaciones).toBeTruthy();
  });

  it('should mark form invalid when cliente is empty', () => {
    component.forma.controls.cliente.setValue('');
    expect(component.forma.controls.cliente.valid).toBe(false);
  });

  it('should reject non-numeric senia', () => {
    component.forma.controls.senia.setValue('abc');
    expect(component.forma.controls.senia.valid).toBe(false);
  });

  it('should accept numeric senia', () => {
    component.forma.controls.senia.setValue('100');
    expect(component.forma.controls.senia.valid).toBe(true);
  });

  describe('borrarItem', () => {
    it('should call pedidosService.removePedidoItem', () => {
      const item = createPedidoItem();
      component.borrarItem(item, 0);

      expect(pedidosService.removePedidoItem).toHaveBeenCalledWith(item);
    });
  });

  describe('generarNuevoPedido', () => {
    it('should call pedidosService.generarNuevoPedido', () => {
      component.generarNuevoPedido();
      expect(pedidosService.generarNuevoPedido).toHaveBeenCalled();
    });
  });

  describe('seniaExceedsTotal', () => {
    it('should return true when senia exceeds total', () => {
      component.pedido = new PedidoModel();
      component.pedido.total = 100;
      component.forma.controls.senia.setValue(200);

      expect(component.seniaExceedsTotal).toBe(true);
    });

    it('should return false when senia is within total', () => {
      component.pedido = new PedidoModel();
      component.pedido.total = 100;
      component.forma.controls.senia.setValue(50);

      expect(component.seniaExceedsTotal).toBe(false);
    });
  });
});
