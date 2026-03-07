import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ConsultaPedidosDistribuidoraComponent } from './consulta-pedidos-distribuidora.component';
import { PedidoDistribuidoraService } from '../../providers/pedido-distribuidora.service';
import { PedidosService } from '../../providers/pedidos.service';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { of, throwError } from 'rxjs';

describe('ConsultaPedidosDistribuidoraComponent', () => {
  let component: ConsultaPedidosDistribuidoraComponent;
  let fixture: ComponentFixture<ConsultaPedidosDistribuidoraComponent>;
  let pedidoDistribuidoraService: any;
  let pedidosService: any;
  let distribuidoraService: any;
  let modalService: any;

  beforeEach(waitForAsync(() => {
    pedidoDistribuidoraService = {
      buscarPedidosDistribuidora: jasmine.createSpy('buscarPedidosDistribuidora').and.returnValue(of([]))
    };
    pedidosService = {
      getPedidoProjection: jasmine.createSpy('getPedidoProjection').and.returnValue(of({ id: 1, cliente: { nombre: 'Test' }, pedidoItems: [] }))
    };
    distribuidoraService = {
      getDistribuidoras: jasmine.createSpy('getDistribuidoras').and.returnValue(of([{ id: 1, descripcion: 'Dist 1' }]))
    };
    modalService = {
      show: jasmine.createSpy('show').and.returnValue({ hide: jasmine.createSpy('hide') })
    };

    TestBed.configureTestingModule({
      declarations: [ConsultaPedidosDistribuidoraComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PedidoDistribuidoraService, useValue: pedidoDistribuidoraService },
        { provide: PedidosService, useValue: pedidosService },
        { provide: DistribuidoraService, useValue: distribuidoraService },
        { provide: BsModalService, useValue: modalService },
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

  describe('filters', () => {
    const mockData = [
      { id: 1, distribuidora: { id: 1, descripcion: 'Dist A' }, realizado: true },
      { id: 2, distribuidora: { id: 2, descripcion: 'Dist B' }, realizado: false },
      { id: 3, distribuidora: { id: 1, descripcion: 'Dist A' }, realizado: false }
    ];

    beforeEach(() => {
      component.pedidos = mockData as any;
    });

    it('should filter by distribuidora', () => {
      component.filterDistribuidora = 1;
      component.applyFiltersAndSort();
      expect(component.filteredPedidos.length).toBe(2);
    });

    it('should filter by confirmado si', () => {
      component.filterConfirmado = 'si';
      component.applyFiltersAndSort();
      expect(component.filteredPedidos.length).toBe(1);
    });

    it('should filter by confirmado no', () => {
      component.filterConfirmado = 'no';
      component.applyFiltersAndSort();
      expect(component.filteredPedidos.length).toBe(2);
    });

    it('should combine filters', () => {
      component.filterDistribuidora = 1;
      component.filterConfirmado = 'no';
      component.applyFiltersAndSort();
      expect(component.filteredPedidos.length).toBe(1);
    });
  });

  describe('verPedido', () => {
    it('should open modal and load pedido', () => {
      const template = {} as any;
      component.verPedido(42, template);

      expect(modalService.show).toHaveBeenCalledWith(template, { class: 'modal-lg' });
      expect(pedidosService.getPedidoProjection).toHaveBeenCalledWith(42);
      expect(component.pedidoDetalle).toBeTruthy();
      expect(component.loadingPedido).toBe(false);
    });
  });

  describe('closeModal', () => {
    it('should hide modal if ref exists', () => {
      const mockRef = { hide: jasmine.createSpy('hide') };
      component.modalRef = mockRef as any;

      component.closeModal();

      expect(mockRef.hide).toHaveBeenCalled();
    });
  });
});
