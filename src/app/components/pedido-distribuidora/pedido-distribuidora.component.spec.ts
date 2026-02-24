import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PedidoDistribuidoraComponent } from './pedido-distribuidora.component';
import { PedidoItemsService } from '../../providers/pedido-items.service';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import { PedidoDistribuidoraService } from '../../providers/pedido-distribuidora.service';
import { of } from 'rxjs';
import { DistribuidoraModel } from '../../models/distribuidora.model';

describe('PedidoDistribuidoraComponent', () => {
  let component: PedidoDistribuidoraComponent;
  let fixture: ComponentFixture<PedidoDistribuidoraComponent>;
  let pedidoItemsService: any;
  let distribuidoraService: any;
  let pedidoDistService: any;

  const mockItems = [
    { id: 1, libro: 'Book A', pendiente: true },
    { id: 2, libro: 'Book B', pendiente: true }
  ];

  const mockDistribuidoras = [
    { id: 1, descripcion: 'Dist A' },
    { id: 2, descripcion: 'Dist B' }
  ];

  beforeEach(async(() => {
    pedidoItemsService = {
      getPedidosPendientes: jasmine.createSpy('getPedidosPendientes').and.returnValue(of(mockItems))
    };
    distribuidoraService = {
      getDistribuidoras: jasmine.createSpy('getDistribuidoras').and.returnValue(of(mockDistribuidoras))
    };
    pedidoDistService = {
      confirmarPedido: jasmine.createSpy('confirmarPedido').and.returnValue(of({}))
    };

    TestBed.configureTestingModule({
      declarations: [PedidoDistribuidoraComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PedidoItemsService, useValue: pedidoItemsService },
        { provide: DistribuidoraService, useValue: distribuidoraService },
        { provide: PedidoDistribuidoraService, useValue: pedidoDistService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoDistribuidoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pending items on init', () => {
    expect(component.pedidoItems.length).toBe(2);
  });

  it('should load distribuidoras on init', () => {
    expect(component.distribuidoras.length).toBe(2);
  });

  describe('toggleSelectAll', () => {
    it('should select all items', () => {
      component.allSelected = true;
      component.toggleSelectAll();

      expect(component.selectedItems.every(v => v)).toBe(true);
    });

    it('should deselect all items', () => {
      component.allSelected = false;
      component.toggleSelectAll();

      expect(component.selectedItems.every(v => !v)).toBe(true);
    });
  });

  describe('toggleItem', () => {
    it('should toggle a specific item', () => {
      component.selectedItems[0] = false;
      component.toggleItem(0);

      expect(component.selectedItems[0]).toBe(true);
    });

    it('should set allSelected when all are selected', () => {
      component.selectedItems = [true, false];
      component.toggleItem(1);

      expect(component.allSelected).toBe(true);
    });
  });

  describe('getSelectedCount', () => {
    it('should return the count of selected items', () => {
      component.selectedItems = [true, false, true];
      expect(component.getSelectedCount()).toBe(2);
    });
  });

  describe('confirmarSeleccionados', () => {
    it('should not call service when no items selected', () => {
      component.selectedItems = [false, false];
      component.bulkDistribuidora = new DistribuidoraModel(1, 'Test');

      component.confirmarSeleccionados();

      expect(pedidoDistService.confirmarPedido).not.toHaveBeenCalled();
    });

    it('should not call service when no distribuidora selected', () => {
      component.selectedItems = [true, false];
      component.bulkDistribuidora = null;

      component.confirmarSeleccionados();

      expect(pedidoDistService.confirmarPedido).not.toHaveBeenCalled();
    });

    it('should call service with selected items and distribuidora', () => {
      component.selectedItems = [true, false];
      component.bulkDistribuidora = new DistribuidoraModel(1, 'Dist A');

      component.confirmarSeleccionados();

      expect(pedidoDistService.confirmarPedido).toHaveBeenCalledWith(jasmine.objectContaining({
        distribuidora: { id: 1, descripcion: 'Dist A' },
        items: [mockItems[0]]
      }));
    });
  });
});
