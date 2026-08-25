import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RemitoComponent } from './remito.component';
import { ActivatedRoute } from '@angular/router';
import { RemitosService } from '../../providers/remitos.service';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import { ComercioService } from '../../providers/comercio.service';
import { LibrosService } from '../../providers/libros.service';
import { PrintRemitoService } from '../../providers/print-remito.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { RemitoModel, TIPO_CONSIGNACION, TIPO_DEVOLUCION } from '../../models/remito.model';
import { mockBsModalService, createRemitoItem } from '../../testing/test-helpers';

describe('RemitoComponent', () => {
  let component: RemitoComponent;
  let fixture: ComponentFixture<RemitoComponent>;
  let remitosService: any;
  let librosService: any;
  let distribuidoraService: any;
  let comercioService: any;

  /** El tipo llega por `data` de la ruta; cada suite arma el componente con el que necesita. */
  function configurar(tipo: string) {
    // Reconfigurar rearma el componente, asi que los spies traen las llamadas del armado anterior.
    distribuidoraService.getDistribuidoras.calls.reset();
    comercioService.getComercios.calls.reset();
    remitosService.generarNuevoRemito.calls.reset();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [RemitoComponent],
      imports: [FormsModule, ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: RemitosService, useValue: remitosService },
        { provide: DistribuidoraService, useValue: distribuidoraService },
        { provide: ComercioService, useValue: comercioService },
        { provide: LibrosService, useValue: librosService },
        { provide: PrintRemitoService, useValue: { imprimirRemito: jasmine.createSpy(), isPrinting: false } },
        { provide: BsModalService, useValue: mockBsModalService() },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { tipo } } } }
      ]
    });
    fixture = TestBed.createComponent(RemitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(waitForAsync(() => {
    remitosService = {
      currentRemito: of(new RemitoModel()),
      generarNuevoRemito: jasmine.createSpy('generarNuevoRemito'),
      restaurarBorrador: jasmine.createSpy('restaurarBorrador').and.returnValue(of(0)),
      removeRemitoItem: jasmine.createSpy('removeRemitoItem'),
      addRemitoItem: jasmine.createSpy('addRemitoItem'),
      asignarDatos: jasmine.createSpy('asignarDatos'),
      grabarRemito: jasmine.createSpy('grabarRemito').and.returnValue(of({ re_remito_k: 1 })),
      finalizarRemito: jasmine.createSpy('finalizarRemito')
    };

    librosService = {
      buscarLibros: jasmine.createSpy('buscarLibros').and.returnValue(of([]))
    };

    distribuidoraService = {
      getDistribuidoras: jasmine.createSpy('getDistribuidoras')
        .and.returnValue(of([{ id: 1, descripcion: 'Dist A' }]))
    };

    comercioService = {
      getComercios: jasmine.createSpy('getComercios')
        .and.returnValue(of([{ id: 1, descripcion: 'Hotel Costa Azul' }]))
    };
  }));

  beforeEach(() => {
    configurar(TIPO_DEVOLUCION);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require destinatario in form', () => {
    expect(component.forma.controls.destinatario.valid).toBe(false);
  });

  describe('tipo DEVOLUCION', () => {
    it('should load distribuidoras as destinatarios', () => {
      expect(distribuidoraService.getDistribuidoras).toHaveBeenCalled();
      expect(comercioService.getComercios).not.toHaveBeenCalled();
      expect(component.destinatarios.length).toBe(1);
      expect(component.esConsignacion).toBe(false);
    });

    /** Arranca del borrador de SU tipo, para no arrastrar el de la otra pantalla. */
    it('should start from its own tipo draft', () => {
      expect(remitosService.restaurarBorrador).toHaveBeenCalledWith(TIPO_DEVOLUCION);
    });
  });

  describe('tipo CONSIGNACION', () => {
    beforeEach(() => {
      configurar(TIPO_CONSIGNACION);
    });

    it('should load comercios as destinatarios', () => {
      expect(comercioService.getComercios).toHaveBeenCalled();
      expect(distribuidoraService.getDistribuidoras).not.toHaveBeenCalled();
      expect(component.destinatarios[0].descripcion).toBe('Hotel Costa Azul');
      expect(component.esConsignacion).toBe(true);
    });

    it('should start from its own tipo draft', () => {
      expect(remitosService.restaurarBorrador).toHaveBeenCalledWith(TIPO_CONSIGNACION);
    });

    it('should label the destinatario as the destination business', () => {
      expect(component.labelDestinatario).toContain('negocio destino');
      expect(component.tituloSeccion).toContain('Consignacion');
    });
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
      librosService.buscarLibros.and.returnValue(of({ content: books, page: { totalElements: 1, totalPages: 1 } }));

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

  describe('borrador recuperado', () => {
    it('should start from whatever was left unfinished', () => {
      expect(remitosService.restaurarBorrador).toHaveBeenCalledWith(TIPO_DEVOLUCION);
      expect(component.itemsRecuperados).toBe(0);
    });

    /** Restaurar en silencio haria dudar de si los items son viejos: hay que avisarlo. */
    it('should report how many items came back', () => {
      remitosService.restaurarBorrador.and.returnValue(of(7));

      configurar(TIPO_DEVOLUCION);

      expect(component.itemsRecuperados).toBe(7);
    });
  });

  describe('onReiniciar', () => {
    it('should reset form and generate new remito of the same tipo', () => {
      component.onReiniciar();
      expect(remitosService.generarNuevoRemito).toHaveBeenCalledWith(TIPO_DEVOLUCION);
      expect(component.destinatarioSeleccionado).toBeNull();
    });
  });

  describe('filtering and sorting', () => {
    it('should pass all libros through applyFiltersAndSort (filtering is server-side)', () => {
      component.libros = [
        { descripcion: 'Angular Book', autor: 'Author A' } as any,
        { descripcion: 'React Book', autor: 'Author B' } as any
      ];
      component.applyFiltersAndSort();
      expect(component.filteredLibros.length).toBe(2);
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
