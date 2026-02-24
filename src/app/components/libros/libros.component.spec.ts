import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LibrosComponent } from './libros.component';
import { LibrosService } from '../../providers/libros.service';
import { PedidosService } from '../../providers/pedidos.service';
import { PrintPedidoService } from '../../providers/print-pedido.service';
import { of } from 'rxjs';
import { PedidoModel } from '../../models/pedido.model';

describe('LibrosComponent', () => {
  let component: LibrosComponent;
  let fixture: ComponentFixture<LibrosComponent>;
  let librosService: any;
  let pedidosService: any;

  beforeEach(async(() => {
    librosService = {
      buscarLibros: jasmine.createSpy('buscarLibros').and.returnValue(of([])),
      insertLibro: jasmine.createSpy('insertLibro').and.returnValue(of({})),
      updateLibro: jasmine.createSpy('updateLibro').and.returnValue(of({})),
      deleteLibro: jasmine.createSpy('deleteLibro').and.returnValue(of({}))
    };

    pedidosService = {
      currentPedido: of(new PedidoModel()),
      addPedidoItem: jasmine.createSpy('addPedidoItem')
    };

    TestBed.configureTestingModule({
      declarations: [LibrosComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: LibrosService, useValue: librosService },
        { provide: PedidosService, useValue: pedidosService },
        { provide: PrintPedidoService, useValue: { isPrinting: false } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('buscarLibros', () => {
    it('should call librosService.buscarLibros and set results', () => {
      const books = [{ id: 1, descripcion: 'Book' }];
      librosService.buscarLibros.and.returnValue(of(books));

      component.buscarLibros('test');

      expect(librosService.buscarLibros).toHaveBeenCalledWith('test');
      expect(component.libros).toEqual(books as any);
      expect(component.loading).toBe(false);
      expect(component.searchPerformed).toBe(true);
    });
  });

  describe('onCustom (add to order)', () => {
    it('should map book data to PedidoItemModel and add it', () => {
      const event = {
        action: 'agregarPedido',
        data: { codigoLuongo: '123', descripcion: 'Book', autor: 'Author', editorial: 'Ed', precio: 100, isbn: '123' }
      };

      component.onCustom(event);

      expect(pedidosService.addPedidoItem).toHaveBeenCalled();
      const addedItem = pedidosService.addPedidoItem.calls.mostRecent().args[0];
      expect(addedItem.libro).toBe('Book');
      expect(addedItem.precio).toBe(100);
      expect(addedItem.cantidad).toBe(1);
    });
  });

  describe('CRUD confirm handlers', () => {
    it('onCreateConfirm should call insertLibro', () => {
      const event = { newData: { descripcion: 'New' }, confirm: { resolve: jasmine.createSpy(), reject: jasmine.createSpy() } };
      librosService.insertLibro.and.returnValue(of(event.newData));

      component.onCreateConfirm(event);

      expect(librosService.insertLibro).toHaveBeenCalledWith(event.newData);
    });

    it('onEditConfirm should call updateLibro', () => {
      const event = { newData: { id: 1 }, confirm: { resolve: jasmine.createSpy(), reject: jasmine.createSpy() } };
      librosService.updateLibro.and.returnValue(of({}));

      component.onEditConfirm(event);

      expect(librosService.updateLibro).toHaveBeenCalledWith(event.newData);
    });

    it('onDeleteConfirm should call deleteLibro', () => {
      const event = { data: { id: 1 }, confirm: { resolve: jasmine.createSpy(), reject: jasmine.createSpy() } };
      librosService.deleteLibro.and.returnValue(of({}));

      component.onDeleteConfirm(event);

      expect(librosService.deleteLibro).toHaveBeenCalledWith(event.data);
    });
  });
});
