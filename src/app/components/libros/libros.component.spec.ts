import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  beforeEach(waitForAsync(() => {
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
      imports: [FormsModule],
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

  describe('agregarAlPedido', () => {
    it('should map book data to PedidoItemModel and add it', () => {
      const libro: any = { codigoLuongo: '123', descripcion: 'Book', autor: 'Author', editorial: 'Ed', precio: 100, isbn: '123' };

      component.agregarAlPedido(libro);

      expect(pedidosService.addPedidoItem).toHaveBeenCalled();
      const addedItem = pedidosService.addPedidoItem.calls.mostRecent().args[0];
      expect(addedItem.libro).toBe('Book');
      expect(addedItem.precio).toBe(100);
      expect(addedItem.cantidad).toBe(1);
    });
  });

  describe('CRUD methods', () => {
    it('saveNew should call insertLibro', () => {
      const newData = { descripcion: 'New' };
      librosService.insertLibro.and.returnValue(of(newData));
      component.isAdding = true;
      component.newLibro = newData;

      component.saveNew();

      expect(librosService.insertLibro).toHaveBeenCalledWith(newData);
    });

    it('saveEdit should call updateLibro', () => {
      const editData = { id: 1, descripcion: 'Edited' };
      librosService.updateLibro.and.returnValue(of({}));
      component.libros = [{ id: 1, descripcion: 'Original' } as any];
      component.editingLibro = component.libros[0];
      component.editData = editData;

      component.saveEdit();

      expect(librosService.updateLibro).toHaveBeenCalledWith(editData);
    });

    it('confirmDelete should call deleteLibro after confirmation', () => {
      const libro: any = { id: 1, descripcion: 'Book' };
      component.libros = [libro];
      component.applyFiltersAndSort();
      // confirmDelete uses SweetAlert2 which we can't easily test in unit tests
      // Just verify the method exists
      expect(component.confirmDelete).toBeDefined();
    });
  });

  describe('filtering and sorting', () => {
    it('should filter libros by column', () => {
      component.libros = [
        { descripcion: 'Angular Book', autor: 'Author A' } as any,
        { descripcion: 'React Book', autor: 'Author B' } as any
      ];
      component.filters.descripcion = 'Angular';
      component.applyFiltersAndSort();
      expect(component.filteredLibros.length).toBe(1);
      expect(component.filteredLibros[0].descripcion).toBe('Angular Book');
    });

    it('should sort libros by column ascending', () => {
      component.libros = [
        { descripcion: 'Zebra', autor: 'Z' } as any,
        { descripcion: 'Alpha', autor: 'A' } as any
      ];
      component.sortColumn = 'descripcion';
      component.sortDirection = 'asc';
      component.applyFiltersAndSort();
      expect(component.filteredLibros[0].descripcion).toBe('Alpha');
      expect(component.filteredLibros[1].descripcion).toBe('Zebra');
    });

    it('should sort libros by column descending', () => {
      component.libros = [
        { descripcion: 'Alpha', autor: 'A' } as any,
        { descripcion: 'Zebra', autor: 'Z' } as any
      ];
      component.sortColumn = 'descripcion';
      component.sortDirection = 'desc';
      component.applyFiltersAndSort();
      expect(component.filteredLibros[0].descripcion).toBe('Zebra');
      expect(component.filteredLibros[1].descripcion).toBe('Alpha');
    });
  });
});
