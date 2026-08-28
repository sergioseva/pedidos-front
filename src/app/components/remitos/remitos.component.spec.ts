import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RemitosComponent } from './remitos.component';
import { RemitosService } from '../../providers/remitos.service';
import { PrintRemitoService } from '../../providers/print-remito.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { ComercioService } from '../../providers/comercio.service';
import { mockBsModalService } from '../../testing/test-helpers';
import { TIPO_CONSIGNACION, TIPO_DEVOLUCION, TIPO_RETIRO,
         TIPO_VENTA_CONSIGNACION } from '../../models/remito.model';
import { of, throwError } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/es-AR';

registerLocaleData(localeAr);

describe('RemitosComponent', () => {
  let component: RemitosComponent;
  let fixture: ComponentFixture<RemitosComponent>;
  let remitosService: any;
  let printService: any;

  beforeEach(waitForAsync(() => {
    remitosService = {
      buscarRemitos: jasmine.createSpy('buscarRemitos').and.returnValue(of([]))
    };
    printService = {
      imprimirRemito: jasmine.createSpy('imprimirRemito'),
      imprimirRecibo: jasmine.createSpy('imprimirRecibo'),
      isPrinting: false
    };
    remitosService.pagarRemito = jasmine.createSpy('pagarRemito')
      .and.returnValue(of({ rc_recibo_k: 9, rc_monto: 2400, rc_medio_pago: 'Efectivo' }));

    configurar(TIPO_DEVOLUCION);
  }));

  /** El tipo llega por `data` de la ruta, igual que en la pantalla de carga. */
  function configurar(tipo: string) {
    // Reconfigurar rearma el componente, asi que los spies traen las llamadas del armado anterior.
    remitosService.buscarRemitos.calls.reset();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [RemitosComponent],
      imports: [FormsModule, NgSelectModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: RemitosService, useValue: remitosService },
        { provide: PrintRemitoService, useValue: printService },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { tipo } } } },
        { provide: BsModalService, useValue: mockBsModalService() },
        { provide: ComercioService, useValue: {
            getComercios: jasmine.createSpy('getComercios').and.returnValue(
              of([{ id: 1, descripcion: 'Hotel Costa Azul' }, { id: 2, descripcion: 'El Gauchito' }]))
          } },
        DatePipe
      ]
    });
    fixture = TestBed.createComponent(RemitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /** Lo mas reciente primero: en una lista de comprobantes es lo que se busca casi siempre. */
  describe('orden por defecto', () => {
    it('sorts by fecha descending out of the box', () => {
      expect(component.sortColumn).toBe('re_fecha');
      expect(component.sortDirection).toBe('desc');
    });

    it('puts the newest remito first', () => {
      component.remitos = [
        { re_remito_k: 1, re_fecha: '2025-01-10', items: [] },
        { re_remito_k: 2, re_fecha: '2025-06-30', items: [] },
        { re_remito_k: 3, re_fecha: '2025-03-15', items: [] }
      ];

      component.applySort();

      expect(component.filteredRemitos.map(r => r.re_remito_k)).toEqual([2, 3, 1]);
    });
  });

  it('should search on init restricted to its tipo', () => {
    expect(remitosService.buscarRemitos).toHaveBeenCalledWith(
      '', jasmine.any(String), jasmine.any(String), TIPO_DEVOLUCION);
  });

  describe('tipo CONSIGNACION', () => {
    beforeEach(() => {
      configurar(TIPO_CONSIGNACION);
    });

    /** La cuenta de un comercio son sus tres movimientos, no solo las entregas. */
    it('should ask for the three comercio movements', () => {
      expect(remitosService.buscarRemitos).toHaveBeenCalledWith(
        '', jasmine.any(String), jasmine.any(String),
        `${TIPO_CONSIGNACION},${TIPO_RETIRO},${TIPO_VENTA_CONSIGNACION}`);
    });

    it('should narrow the server query when a tipo is picked', () => {
      remitosService.buscarRemitos.calls.reset();
      component.tipoFiltro = TIPO_RETIRO;

      component.onTipoFiltroChange();

      expect(remitosService.buscarRemitos).toHaveBeenCalledWith(
        '', jasmine.any(String), jasmine.any(String), TIPO_RETIRO);
    });

    it('should go back to all movements when the tipo is cleared', () => {
      component.tipoFiltro = TIPO_RETIRO;
      component.onTipoFiltroChange();
      remitosService.buscarRemitos.calls.reset();

      component.tipoFiltro = '';
      component.onTipoFiltroChange();

      expect(remitosService.buscarRemitos).toHaveBeenCalledWith(
        '', jasmine.any(String), jasmine.any(String),
        `${TIPO_CONSIGNACION},${TIPO_RETIRO},${TIPO_VENTA_CONSIGNACION}`);
    });

    it('should keep the search term when a filter changes', () => {
      component.buscarTermino('rayuela');
      remitosService.buscarRemitos.calls.reset();

      component.onTipoFiltroChange();

      expect(remitosService.buscarRemitos).toHaveBeenCalledWith(
        'rayuela', jasmine.any(String), jasmine.any(String), jasmine.any(String));
    });

    it('should load the comercios for the filter', () => {
      expect(component.comercios.length).toBe(2);
    });

    it('should filter by comercio without going back to the server', () => {
      component.remitos = [
        { re_tipo: TIPO_CONSIGNACION, re_comercio_cm: { id: 1 }, items: [] },
        { re_tipo: TIPO_CONSIGNACION, re_comercio_cm: { id: 2 }, items: [] }
      ];
      remitosService.buscarRemitos.calls.reset();
      component.comercioFiltro = { id: 2 } as any;

      component.applySort();

      expect(component.filteredRemitos.length).toBe(1);
      expect(component.filteredRemitos[0].re_comercio_cm.id).toBe(2);
      expect(remitosService.buscarRemitos).not.toHaveBeenCalled();
    });

    /** Los dos filtros se combinan: negocio 1 y ademas impago. */
    it('should combine the comercio filter with solo impagos', () => {
      component.remitos = [
        { re_tipo: TIPO_VENTA_CONSIGNACION, re_comercio_cm: { id: 1 }, recibo: null, items: [] },
        { re_tipo: TIPO_VENTA_CONSIGNACION, re_comercio_cm: { id: 1 }, recibo: { rc_recibo_k: 1 }, items: [] },
        { re_tipo: TIPO_VENTA_CONSIGNACION, re_comercio_cm: { id: 2 }, recibo: null, items: [] }
      ];
      component.comercioFiltro = { id: 1 } as any;
      component.soloImpagos = true;

      component.applySort();

      expect(component.filteredRemitos.length).toBe(1);
    });

    it('should label each document by its tipo', () => {
      expect(component.etiquetaTipo({ re_tipo: TIPO_RETIRO })).toBe('Retiro');
      expect(component.etiquetaTipo({ re_tipo: TIPO_VENTA_CONSIGNACION })).toBe('Venta');
      expect(component.etiquetaTipo({ re_tipo: TIPO_CONSIGNACION })).toBe('Entrega');
      expect(component.etiquetaTipo({ re_tipo: TIPO_DEVOLUCION })).toBe('Devolucion');
    });

    it('should read the destinatario off the comercio', () => {
      const remito = { re_comercio_cm: { descripcion: 'Hotel Costa Azul' }, re_distribuidora_ed: null };
      expect(component.destinatario(remito)).toBe('Hotel Costa Azul');
      expect(component.labelDestinatario).toBe('Negocio');
      expect(component.columnaDestinatario).toBe('re_comercio_cm.descripcion');
    });
  });

  describe('fecha y hora', () => {
    beforeEach(() => {
      configurar(TIPO_CONSIGNACION);
    });

    /**
     * La fecha viaja como instante UTC y se mostraba con zona '+0300' en vez de '-0300', asi que
     * salia 6 horas adelantada: un remito de las 21:30 aparecia como del dia siguiente. Con solo
     * la fecha a la vista casi no se notaba; al mostrar la hora salta enseguida.
     */
    it('should render the instant in Argentina time, not six hours ahead', () => {
      // 2026-08-23T00:30:00Z son las 21:30 del 22 en Argentina.
      component.remitos = [{ re_remito_k: 1, re_fecha: '2026-08-23T00:30:00.000+00:00',
                             re_comercio_cm: { descripcion: 'X' }, items: [] }];
      component.applySort();
      fixture.detectChanges();

      const celdas = fixture.nativeElement.querySelectorAll('tbody td');
      const textos = Array.from(celdas).map((c: any) => c.textContent.trim());
      expect(textos).toContain('22/08/2026 21:30');
    });

    it('should show the time on devoluciones too', () => {
      configurar(TIPO_DEVOLUCION);
      component.remitos = [{ re_remito_k: 1, re_fecha: '2026-08-23T00:30:00.000+00:00',
                             re_distribuidora_ed: { descripcion: 'D' }, items: [] }];
      component.applySort();
      fixture.detectChanges();

      const textos = Array.from(fixture.nativeElement.querySelectorAll('tbody td'))
        .map((c: any) => c.textContent.trim());
      expect(textos).toContain('22/08/2026 21:30');
    });
  });

  describe('cobro diferido', () => {
    const venta = (recibo: any = null) => ({
      re_remito_k: 5, re_tipo: TIPO_VENTA_CONSIGNACION, re_comision: 20, recibo,
      re_comercio_cm: { descripcion: 'Hotel Costa Azul' },
      items: [{ ri_cantidad: 3, ri_precio: 1000 }]
    });

    beforeEach(() => {
      configurar(TIPO_CONSIGNACION);
    });

    it('should treat a venta without recibo as unpaid', () => {
      expect(component.estaImpago(venta())).toBe(true);
      expect(component.estaImpago(venta({ rc_recibo_k: 1 }))).toBe(false);
    });

    /** Entregas y retiros no son cobrables, asi que nunca cuentan como impagos. */
    it('should never mark a retiro or an entrega as unpaid', () => {
      expect(component.estaImpago({ re_tipo: TIPO_RETIRO, recibo: null })).toBe(false);
      expect(component.estaImpago({ re_tipo: TIPO_CONSIGNACION, recibo: null })).toBe(false);
    });

    it('should compute the neto with the frozen comision', () => {
      expect(component.netoAPagar(venta())).toBe(2400);
    });

    /** En una venta lo que se cobra es el neto, no el precio de tapa. */
    it('should show both amounts on a sale with comision', () => {
      const v = venta();

      expect(component.tieneComision(v)).toBe(true);
      expect(component.total(v)).toBe('$ 3.000');
      expect(component.netoFormateado(v)).toBe('$ 2.400');
    });

    /** Sin comision los dos numeros son el mismo: repetirlo seria ruido. */
    it('should show a single amount when there is no comision', () => {
      expect(component.tieneComision({ ...venta(), re_comision: null })).toBe(false);
    });

    /** Una entrega o un retiro no se cobran: no tienen neto que mostrar. */
    it('should not show a neto on entregas or retiros', () => {
      expect(component.tieneComision({ re_tipo: TIPO_CONSIGNACION, re_comision: 20, items: [] })).toBe(false);
      expect(component.tieneComision({ re_tipo: TIPO_RETIRO, re_comision: 20, items: [] })).toBe(false);
    });

    it('should filter down to unpaid ventas', () => {
      component.remitos = [venta(), venta({ rc_recibo_k: 1 }), { re_tipo: TIPO_RETIRO, items: [] }];
      component.soloImpagos = true;

      component.applySort();

      expect(component.filteredRemitos.length).toBe(1);
      expect(component.filteredRemitos[0].recibo).toBeNull();
    });

    it('should show everything when the filter is off', () => {
      component.remitos = [venta(), venta({ rc_recibo_k: 1 }), { re_tipo: TIPO_RETIRO, items: [] }];
      component.soloImpagos = false;

      component.applySort();

      expect(component.filteredRemitos.length).toBe(3);
    });

    it('should post the payment and mark the row paid in place', () => {
      const impago = venta();
      component.remitos = [impago];
      component.applySort();
      component.abrirCobro(impago, {} as any);

      component.medioPago = 'Transferencia';
      component.confirmarCobro();

      expect(remitosService.pagarRemito).toHaveBeenCalledWith(5, 'Transferencia');
      expect(impago.recibo).toEqual(jasmine.objectContaining({ rc_recibo_k: 9 }));
      expect(component.estaImpago(impago)).toBe(false);
      expect(component.cobrando).toBe(false);
    });

    it('should keep the row unpaid when the server rejects', () => {
      const impago = venta();
      remitosService.pagarRemito.and.returnValue(throwError(() => ({ error: { message: 'ya tiene recibo' } })));
      component.abrirCobro(impago, {} as any);

      component.confirmarCobro();

      expect(impago.recibo).toBeNull();
      expect(component.cobrando).toBe(false);
    });

    it('should reprint an existing recibo', () => {
      component.imprimirRecibo(5);
      expect(printService.imprimirRecibo).toHaveBeenCalledWith(5);
    });
  });

  describe('destinatario', () => {
    it('should read the distribuidora on a devolucion', () => {
      const remito = { re_distribuidora_ed: { descripcion: 'Dist A' }, re_comercio_cm: null };
      expect(component.destinatario(remito)).toBe('Dist A');
    });

    it('should return empty when the remito has none', () => {
      expect(component.destinatario({})).toBe('');
    });
  });

  describe('total', () => {
    it('should sum cantidad * precio over the items', () => {
      const remito = { items: [
        { ri_cantidad: 2, ri_precio: 1000 },
        { ri_cantidad: 3, ri_precio: 500 }
      ]};
      expect(component.total(remito)).toBe('$ 3.500');
    });

    it('should treat a missing precio as zero', () => {
      expect(component.total({ items: [{ ri_cantidad: 2 }] })).toBe('$ 0');
    });
  });

  describe('buscarTermino', () => {
    it('should set results and update state', () => {
      const mockRemitos = [{ re_remito_k: 1 }];
      remitosService.buscarRemitos.and.returnValue(of(mockRemitos));

      component.buscarTermino('test');

      expect(component.remitos).toEqual(mockRemitos as any);
      expect(component.loading).toBe(false);
    });

    it('should handle error', () => {
      remitosService.buscarRemitos.and.returnValue(throwError(() => ({ error: { message: 'fail' } })));

      component.buscarTermino('test');

      expect(component.error).toBe(true);
    });
  });

  describe('imprimir', () => {
    it('should call printService', () => {
      component.imprimir({ re_remito_k: 5 } as any);
      expect(printService.imprimirRemito).toHaveBeenCalledWith(5);
    });
  });
});
