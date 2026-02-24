import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RemitoComponent } from './remito.component';
import { RemitosService } from '../../providers/remitos.service';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import { LibrosService } from '../../providers/libros.service';
import { PrintRemitoService } from '../../providers/print-remito.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { RemitoModel } from '../../models/remito.model';
import { mockBsModalService, createRemitoItem } from '../../testing/test-helpers';

describe('RemitoComponent', () => {
  let component: RemitoComponent;
  let fixture: ComponentFixture<RemitoComponent>;
  let remitosService: any;
  let librosService: any;

  beforeEach(async(() => {
    remitosService = {
      currentRemito: of(new RemitoModel()),
      generarNuevoRemito: jasmine.createSpy('generarNuevoRemito'),
      removeRemitoItem: jasmine.createSpy('removeRemitoItem'),
      addRemitoItem: jasmine.createSpy('addRemitoItem'),
      asignarDatos: jasmine.createSpy('asignarDatos'),
      grabarRemito: jasmine.createSpy('grabarRemito').and.returnValue(of({ re_remito_k: 1 })),
      finalizarRemito: jasmine.createSpy('finalizarRemito')
    };

    librosService = {
      buscarLibros: jasmine.createSpy('buscarLibros').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      declarations: [RemitoComponent],
      imports: [FormsModule, ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: RemitosService, useValue: remitosService },
        { provide: DistribuidoraService, useValue: { getDistribuidoras: jasmine.createSpy().and.returnValue(of([])) } },
        { provide: LibrosService, useValue: librosService },
        { provide: PrintRemitoService, useValue: { imprimirRemito: jasmine.createSpy(), isPrinting: false } },
        { provide: BsModalService, useValue: mockBsModalService() }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require distribuidora in form', () => {
    expect(component.forma.controls.distribuidora.valid).toBe(false);
  });

  describe('borrarItem', () => {
    it('should call remitosService.removeRemitoItem', () => {
      const item = createRemitoItem();
      component.borrarItem(item);
      expect(remitosService.removeRemitoItem).toHaveBeenCalledWith(item);
    });
  });

  describe('buscarLibros', () => {
    it('should call librosService and set results', () => {
      const books = [{ id: 1, descripcion: 'Book' }];
      librosService.buscarLibros.and.returnValue(of(books));

      component.buscarLibros('test');

      expect(component.libros).toEqual(books as any);
      expect(component.loading).toBe(false);
    });
  });

  describe('agregarAlRemito', () => {
    it('should map book to RemitoItemModel and add', () => {
      const libro: any = { descripcion: 'Book', autor: 'Author', editorial: 'Ed', precio: 100, isbn: '123' };

      component.agregarAlRemito(libro);

      expect(remitosService.addRemitoItem).toHaveBeenCalled();
    });
  });

  describe('onReiniciar', () => {
    it('should reset form and generate new remito', () => {
      component.onReiniciar();
      expect(remitosService.generarNuevoRemito).toHaveBeenCalled();
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
    });

    it('should sort libros ascending', () => {
      component.libros = [
        { descripcion: 'Zebra' } as any,
        { descripcion: 'Alpha' } as any
      ];
      component.sortColumn = 'descripcion';
      component.sortDirection = 'asc';
      component.applyFiltersAndSort();
      expect(component.filteredLibros[0].descripcion).toBe('Alpha');
    });
  });
});
