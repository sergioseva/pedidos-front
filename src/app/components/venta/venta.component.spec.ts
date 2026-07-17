import { waitForAsync, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/es-AR';
import { of, throwError } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
// The real module, so the ng-select in the template has a value accessor and the component
// renders exactly as it does in the app.
import { NgSelectModule } from '@ng-select/ng-select';

// The template formats money as es-AR; app.module.ts registers this at bootstrap.
registerLocaleData(localeAr);

import { VentaComponent } from './venta.component';
import { VentasService } from '../../providers/ventas.service';
import { ClientesServiceService } from '../../providers/clientes-service.service';

const LIBRO = {
  isbn: '9789871051014',
  descripcion: 'Pan y manteca',
  autor: 'Cocinero',
  editorial: 'Sudamericana',
  precio: 6477.27
};

describe('VentaComponent', () => {
  let component: VentaComponent;
  let fixture: ComponentFixture<VentaComponent>;
  let ventasService: any;
  let clientesService: any;
  let modalService: any;

  beforeEach(waitForAsync(() => {
    ventasService = {
      buscarPorIsbn: jasmine.createSpy('buscarPorIsbn').and.returnValue(of(LIBRO)),
      crearVenta: jasmine.createSpy('crearVenta').and.returnValue(of({ id: 1, total: 100 }))
    };
    clientesService = {
      getClientesPorCualquier: jasmine.createSpy('getClientesPorCualquier').and.returnValue(of([])),
      insertCliente: jasmine.createSpy('insertCliente').and.returnValue(
        of({ id: 7, nombre: 'Nuevo', telefonoMovil: '3446123456' }))
    };
    modalService = {
      show: jasmine.createSpy('show').and.returnValue({ hide: jasmine.createSpy('hide') })
    };

    TestBed.configureTestingModule({
      declarations: [VentaComponent],
      imports: [FormsModule, NgSelectModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: VentasService, useValue: ventasService },
        { provide: ClientesServiceService, useValue: clientesService },
        { provide: BsModalService, useValue: modalService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onScan', () => {
    it('adds a line with the catalog data when the ISBN is found', () => {
      component.isbnScan = '9789871051014';
      component.onScan();

      expect(ventasService.buscarPorIsbn).toHaveBeenCalledWith('9789871051014');
      expect(component.venta.items.length).toBe(1);
      expect(component.venta.items[0].libro).toBe('Pan y manteca');
      expect(component.venta.items[0].precio).toBe(6477.27);
      expect(component.venta.items[0].cantidad).toBe(1);
      expect(component.venta.total).toBe(6477.27);
    });

    it('clears the input after a successful scan so the next one lands', () => {
      component.isbnScan = '9789871051014';
      component.onScan();
      expect(component.isbnScan).toBe('');
    });

    // Scanning a stack of the same title is the common case; a second line would be noise.
    it('increments the quantity on a repeat scan instead of adding a line', () => {
      component.isbnScan = '9789871051014';
      component.onScan();
      component.isbnScan = '9789871051014';
      component.onScan();

      expect(component.venta.items.length).toBe(1);
      expect(component.venta.items[0].cantidad).toBe(2);
      expect(component.venta.total).toBe(6477.27 * 2);
      // The repeat must not cost a round trip.
      expect(ventasService.buscarPorIsbn).toHaveBeenCalledTimes(1);
    });

    it('strips separators a reader may inject', () => {
      component.isbnScan = '978-987-1051014 ';
      component.onScan();
      expect(ventasService.buscarPorIsbn).toHaveBeenCalledWith('9789871051014');
    });

    it('ignores an empty scan', () => {
      component.isbnScan = '   ';
      component.onScan();
      expect(ventasService.buscarPorIsbn).not.toHaveBeenCalled();
      expect(component.venta.items.length).toBe(0);
    });

    // A reader emitting a trailing CR can fire Enter twice; without the guard the book lands twice.
    it('swallows a double Enter while a lookup is in flight', () => {
      component.buscando = true;
      component.isbnScan = '9789871051014';
      component.onScan();
      expect(ventasService.buscarPorIsbn).not.toHaveBeenCalled();
    });

    describe('when the ISBN is not in the catalog', () => {
      beforeEach(() => {
        ventasService.buscarPorIsbn.and.returnValue(throwError(() => ({ status: 404 })));
      });

      // The catalog is rebuilt on every import, so a book on the shelf can legitimately be missing.
      it('opens manual entry prefilled with the scanned ISBN rather than blocking the sale', () => {
        component.isbnScan = '9780000000000';
        component.onScan();

        expect(modalService.show).toHaveBeenCalled();
        expect(component.manualIsbn).toBe('9780000000000');
        expect(component.error).toBeFalse();
      });

      it('still clears the input', () => {
        component.isbnScan = '9780000000000';
        component.onScan();
        expect(component.isbnScan).toBe('');
      });
    });

    // Losing focus mid-stack is the worst failure: later scans type into nothing and vanish.
    it('reports a non-404 error but still clears the input', () => {
      ventasService.buscarPorIsbn.and.returnValue(throwError(() => ({ status: 500 })));
      component.isbnScan = '9789871051014';
      component.onScan();

      expect(component.error).toBeTrue();
      expect(component.isbnScan).toBe('');
      expect(component.buscando).toBeFalse();
    });
  });

  describe('manual entry', () => {
    it('adds the typed line', () => {
      component.abrirManual('9780000000000');
      component.manualLibro = 'Libro suelto';
      component.manualPrecio = 500;
      component.manualCantidad = 2;
      component.confirmarManual();

      expect(component.venta.items.length).toBe(1);
      expect(component.venta.items[0].libro).toBe('Libro suelto');
      expect(component.venta.items[0].isbn).toBe('9780000000000');
      expect(component.venta.total).toBe(1000);
    });

    it('refuses to add without a title or price', () => {
      component.abrirManual('9780000000000');
      component.manualLibro = '';
      component.manualPrecio = null;
      component.confirmarManual();
      expect(component.venta.items.length).toBe(0);
    });
  });

  describe('the ticket', () => {
    beforeEach(() => {
      component.isbnScan = '9789871051014';
      component.onScan();
    });

    it('recalculates the total when a quantity is edited', () => {
      component.venta.items[0].cantidad = 3;
      component.recalcular();
      expect(component.venta.total).toBe(6477.27 * 3);
    });

    it('recalculates the total when a price is discounted', () => {
      component.venta.items[0].precio = 1000;
      component.recalcular();
      expect(component.venta.total).toBe(1000);
    });

    it('removes a line', () => {
      component.removeItem(component.venta.items[0]);
      expect(component.venta.items.length).toBe(0);
      expect(component.venta.total).toBe(0);
    });
  });

  describe('finalizar', () => {
    it('does nothing with an empty ticket', () => {
      component.finalizar();
      expect(ventasService.crearVenta).not.toHaveBeenCalled();
    });
  });

  // The customer is at the counter: sending the operator to the Clientes screen would lose the
  // half-scanned ticket, so the panel adds one inline exactly as the pedido screen does.
  describe('quick-add cliente', () => {
    it('opens a blank panel', () => {
      component.toggleNuevoCliente();
      expect(component.showNuevoCliente).toBeTrue();
      expect(component.nuevoCliente.nombre).toBeUndefined();
    });

    it('saves the cliente, selects it and closes the panel', () => {
      component.toggleNuevoCliente();
      component.nuevoCliente.nombre = 'Nuevo';
      component.nuevoCliente.telefonoMovil = '3446123456';
      component.guardarNuevoCliente();

      expect(clientesService.insertCliente).toHaveBeenCalled();
      expect(component.clienteSeleccionado.id).toBe(7);
      // The label is what ng-select renders.
      expect(component.clienteSeleccionado.label).toBe('Nuevo - 3446123456');
      expect(component.clientes.length).toBe(1);
      expect(component.showNuevoCliente).toBeFalse();
    });

    it('does not save without a nombre or telefono', () => {
      component.toggleNuevoCliente();
      component.nuevoCliente.nombre = 'Solo nombre';
      component.guardarNuevoCliente();
      expect(clientesService.insertCliente).not.toHaveBeenCalled();
    });

    it('keeps the panel open and the ticket intact when the save fails', () => {
      clientesService.insertCliente.and.returnValue(throwError(() => ({ status: 500 })));
      component.isbnScan = '9789871051014';
      component.onScan();

      component.toggleNuevoCliente();
      component.nuevoCliente.nombre = 'Nuevo';
      component.nuevoCliente.telefonoMovil = '3446123456';
      component.guardarNuevoCliente();

      expect(component.showNuevoCliente).toBeTrue();
      expect(component.guardandoCliente).toBeFalse();
      expect(component.venta.items.length).toBe(1);
    });

    // Everything on this screen must end with the scanner holding the keyboard.
    it('returns focus to the scan field after saving', fakeAsync(() => {
      const focusSpy = spyOn(component.isbnInput.nativeElement, 'focus');
      component.toggleNuevoCliente();
      component.nuevoCliente.nombre = 'Nuevo';
      component.nuevoCliente.telefonoMovil = '3446123456';
      component.guardarNuevoCliente();
      // Swal leaves its own timers behind; flush them all rather than tick a guessed amount.
      flush();
      expect(focusSpy).toHaveBeenCalled();
    }));
  });
});
