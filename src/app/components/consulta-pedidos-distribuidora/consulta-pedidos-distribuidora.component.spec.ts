import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ConsultaPedidosDistribuidoraComponent } from './consulta-pedidos-distribuidora.component';
import { PedidoDistribuidoraService } from '../../providers/pedido-distribuidora.service';
import { of, throwError } from 'rxjs';

describe('ConsultaPedidosDistribuidoraComponent', () => {
  let component: ConsultaPedidosDistribuidoraComponent;
  let fixture: ComponentFixture<ConsultaPedidosDistribuidoraComponent>;
  let pedidoDistribuidoraService: any;

  beforeEach(waitForAsync(() => {
    pedidoDistribuidoraService = {
      buscarPedidosDistribuidora: jasmine.createSpy('buscarPedidosDistribuidora').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      declarations: [ConsultaPedidosDistribuidoraComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PedidoDistribuidoraService, useValue: pedidoDistribuidoraService },
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaPedidosDistribuidoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search on init', () => {
    expect(pedidoDistribuidoraService.buscarPedidosDistribuidora).toHaveBeenCalled();
  });

  describe('buscarTermino', () => {
    it('should set results and update state', () => {
      const mockPedidos = [{ id: 1, distribuidora: { descripcion: 'Test' } }];
      pedidoDistribuidoraService.buscarPedidosDistribuidora.and.returnValue(of(mockPedidos));

      component.buscarTermino('test');

      expect(component.pedidos).toEqual(mockPedidos as any);
      expect(component.loading).toBe(false);
      expect(component.searchPerformed).toBe(true);
    });

    it('should handle error', () => {
      pedidoDistribuidoraService.buscarPedidosDistribuidora.and.returnValue(
        throwError(() => ({ error: { message: 'fail' } }))
      );

      component.buscarTermino('test');

      expect(component.error).toBe(true);
      expect(component.errMessage).toBe('fail');
    });

    it('should use default error message when none provided', () => {
      pedidoDistribuidoraService.buscarPedidosDistribuidora.and.returnValue(
        throwError(() => ({}))
      );

      component.buscarTermino('test');

      expect(component.error).toBe(true);
      expect(component.errMessage).toBe('Error al buscar pedidos a distribuidora');
    });
  });

  describe('dateFilter', () => {
    it('should set dates and trigger search', () => {
      pedidoDistribuidoraService.buscarPedidosDistribuidora.calls.reset();

      component.dateFilter(7);

      expect(pedidoDistribuidoraService.buscarPedidosDistribuidora).toHaveBeenCalled();
      expect(component.fromDate).toBeTruthy();
      expect(component.toDate).toBeTruthy();
    });
  });

  describe('default sort', () => {
    it('should sort by fecha descending by default', () => {
      expect(component.sortColumn).toBe('fecha');
      expect(component.sortDirection).toBe('desc');
    });
  });

  describe('toggleSort', () => {
    it('should set sort column and direction on new column', () => {
      component.toggleSort('distribuidora.descripcion');

      expect(component.sortColumn).toBe('distribuidora.descripcion');
      expect(component.sortDirection).toBe('asc');
    });

    it('should toggle direction on same column', () => {
      component.sortColumn = '';
      component.sortDirection = '';

      component.toggleSort('fecha');
      expect(component.sortDirection).toBe('asc');

      component.toggleSort('fecha');
      expect(component.sortDirection).toBe('desc');
    });

    it('should clear sort on third click', () => {
      component.sortColumn = '';
      component.sortDirection = '';

      component.toggleSort('fecha');
      component.toggleSort('fecha');
      component.toggleSort('fecha');

      expect(component.sortColumn).toBe('');
      expect(component.sortDirection).toBe('');
    });
  });
});
