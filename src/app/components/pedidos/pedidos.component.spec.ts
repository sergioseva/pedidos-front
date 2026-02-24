import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PedidosComponent } from './pedidos.component';
import { PedidosService } from '../../providers/pedidos.service';
import { PrintPedidoService } from '../../providers/print-pedido.service';
import { PedidoLibrosPipe } from '../../pipes/pedido-libros.pipe';
import { of, throwError } from 'rxjs';

describe('PedidosComponent', () => {
  let component: PedidosComponent;
  let fixture: ComponentFixture<PedidosComponent>;
  let pedidosService: any;
  let printService: any;

  beforeEach(waitForAsync(() => {
    pedidosService = {
      buscarPedidos: jasmine.createSpy('buscarPedidos').and.returnValue(of([]))
    };
    printService = {
      imprimirPedido: jasmine.createSpy('imprimirPedido'),
      isPrinting: false
    };

    TestBed.configureTestingModule({
      declarations: [PedidosComponent, PedidoLibrosPipe],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PedidosService, useValue: pedidosService },
        { provide: PrintPedidoService, useValue: printService },
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search on init', () => {
    expect(pedidosService.buscarPedidos).toHaveBeenCalled();
  });

  describe('buscarTermino', () => {
    it('should set loading and call service', () => {
      const mockPedidos = [{ id: 1 }, { id: 2 }];
      pedidosService.buscarPedidos.and.returnValue(of(mockPedidos));

      component.buscarTermino('test');

      expect(component.pedidos).toEqual(mockPedidos as any);
      expect(component.loading).toBe(false);
      expect(component.searchPerformed).toBe(true);
    });

    it('should handle error', () => {
      pedidosService.buscarPedidos.and.returnValue(throwError({ error: { message: 'fail' } }));

      component.buscarTermino('test');

      expect(component.loading).toBe(false);
      expect(component.error).toBe(true);
    });
  });

  describe('imprimir', () => {
    it('should call printService.imprimirPedido', () => {
      component.imprimir({ id: 5 } as any);
      expect(printService.imprimirPedido).toHaveBeenCalledWith(5);
    });
  });

  describe('dateFilter', () => {
    it('should set date range and trigger search', () => {
      pedidosService.buscarPedidos.calls.reset();

      component.dateFilter(7);

      expect(component.fromDate).toBeTruthy();
      expect(component.toDate).toBeTruthy();
      expect(pedidosService.buscarPedidos).toHaveBeenCalled();
    });
  });
});
