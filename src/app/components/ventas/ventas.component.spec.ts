import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/es-AR';
import { of, throwError } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';

import Swal from 'sweetalert2';

import { VentasComponent } from './ventas.component';
import { VentasService } from '../../providers/ventas.service';

registerLocaleData(localeAr);

const RESUMEN = { cantidadVentas: 2, unidades: 5, total: 1000, ticketPromedio: 500 };
const POR_DIA = [{ fecha: '2026-07-16', cantidadVentas: 2, unidades: 5, total: 1000 }];

describe('VentasComponent', () => {
  let component: VentasComponent;
  let fixture: ComponentFixture<VentasComponent>;
  let ventasService: any;

  beforeEach(waitForAsync(() => {
    ventasService = {
      resumen: jasmine.createSpy('resumen').and.returnValue(of(RESUMEN)),
      ventasPorDia: jasmine.createSpy('ventasPorDia').and.returnValue(of(POR_DIA)),
      buscarVentas: jasmine.createSpy('buscarVentas').and.returnValue(of([])),
      eliminarVenta: jasmine.createSpy('eliminarVenta').and.returnValue(of({})),
      descargarReporte: jasmine.createSpy('descargarReporte').and.returnValue(
        of(new Blob(['x'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })))
    };

    TestBed.configureTestingModule({
      declarations: [VentasComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: VentasService, useValue: ventasService },
        { provide: BsModalService, useValue: { show: jasmine.createSpy('show') } },
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('unidades', () => {
    /**
     * The reported confusion: one title bought in twos is ONE line but TWO books. Reporting the
     * line count under a "Libros" heading read as "1 book sold".
     */
    it('counts books, not lines, when one title is bought several times', () => {
      const venta = { items: [{ cantidad: 2, precio: 100 }] };
      expect(component.unidades(venta)).toBe(2);
    });

    it('sums the quantities across lines', () => {
      const venta = { items: [{ cantidad: 2 }, { cantidad: 1 }, { cantidad: 3 }] };
      expect(component.unidades(venta)).toBe(6);
    });

    /** Must agree with the summary and per-day figures, which sum cantidad server-side. */
    it('agrees with the per-day and summary totals for the same sales', () => {
      const ventas = [
        { items: [{ cantidad: 2 }, { cantidad: 1 }] },
        { items: [{ cantidad: 2 }] }
      ];
      const totalDeLaGrilla = ventas.reduce((t, v) => t + component.unidades(v), 0);
      expect(totalDeLaGrilla).toBe(RESUMEN.unidades);
      expect(totalDeLaGrilla).toBe(POR_DIA[0].unidades);
    });

    it('handles a sale with no items', () => {
      expect(component.unidades({ items: [] })).toBe(0);
      expect(component.unidades({})).toBe(0);
      expect(component.unidades(null)).toBe(0);
    });
  });

  describe('descargar', () => {
    it('requests the report for the current filter and saves it', () => {
      component.fromDate = '2026-07-01';
      component.toDate = '2026-07-17';
      component.termino = 'sara';
      const clickSpy = jasmine.createSpy('click');
      spyOn(document, 'createElement').and.returnValue({ click: clickSpy, href: '', download: '' } as any);
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:fake');
      const revoke = spyOn(window.URL, 'revokeObjectURL');

      component.descargar();

      expect(ventasService.descargarReporte).toHaveBeenCalledWith('sara', '2026-07-01', '2026-07-17');
      expect(clickSpy).toHaveBeenCalled();
      expect(revoke).toHaveBeenCalledWith('blob:fake');
      expect(component.descargando).toBeFalse();
    });

    it('shows an error and clears the flag when the download fails', () => {
      ventasService.descargarReporte.and.returnValue(throwError(() => ({ status: 500 })));
      component.descargar();
      expect(component.error).toBeTrue();
      expect(component.descargando).toBeFalse();
    });

    it('ignores a second click while one download is in flight', () => {
      component.descargando = true;
      component.descargar();
      expect(ventasService.descargarReporte).not.toHaveBeenCalled();
    });
  });

  describe('eliminar', () => {
    it('deletes after confirmation and reloads so the totals update', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
      ventasService.buscarVentas.calls.reset();

      component.eliminar({ id: 5, total: 100 });
      await Promise.resolve();   // confirm resolves
      await Promise.resolve();   // delete subscribe runs

      expect(ventasService.eliminarVenta).toHaveBeenCalledWith(5);
      expect(ventasService.buscarVentas).toHaveBeenCalled();
    });

    it('does nothing when the confirmation is cancelled', async () => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));
      component.eliminar({ id: 5, total: 100 });
      await Promise.resolve();
      expect(ventasService.eliminarVenta).not.toHaveBeenCalled();
    });
  });

  describe('buscar', () => {
    it('loads the summary, the per-day report and the list', () => {
      expect(ventasService.resumen).toHaveBeenCalled();
      expect(ventasService.ventasPorDia).toHaveBeenCalled();
      expect(ventasService.buscarVentas).toHaveBeenCalled();
      expect(component.resumen).toEqual(RESUMEN);
      expect(component.porDia).toEqual(POR_DIA);
    });

    it('reports an error without leaving the spinner up', () => {
      ventasService.buscarVentas.and.returnValue(throwError(() => ({ error: { message: 'boom' } })));
      component.buscar();
      expect(component.error).toBeTrue();
      expect(component.errMessage).toBe('boom');
      expect(component.loading).toBeFalse();
    });
  });

  describe('dateFilter presets', () => {
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const hoy = () => iso(new Date());
    const hace = (dias: number) => {
      const d = new Date();
      d.setDate(d.getDate() - dias);
      return iso(d);
    };

    it('defaults to the last month on load', () => {
      expect(component.filtroActivo).toBe('mes');
      expect(component.fromDate).toBe(hace(30));
      expect(component.toDate).toBe(hoy());
    });

    /** Today means today: both ends of the range are the same day. */
    it('Hoy asks for today only', () => {
      component.dateFilter('hoy');
      expect(component.fromDate).toBe(hoy());
      expect(component.toDate).toBe(hoy());
    });

    /**
     * The point of the preset: reading yesterday's takings must not fold today's sales in.
     * (Consulta de pedidos' Ayer spans yesterday..tomorrow, which would inflate a revenue figure.)
     */
    it('Ayer asks for yesterday only, not yesterday through today', () => {
      component.dateFilter('ayer');
      expect(component.fromDate).toBe(hace(1));
      expect(component.toDate).toBe(hace(1));
      expect(component.toDate).not.toBe(hoy());
    });

    it('Ultima Semana is a rolling window ending today', () => {
      component.dateFilter('semana');
      expect(component.fromDate).toBe(hace(7));
      expect(component.toDate).toBe(hoy());
    });

    it('Ultimo Año is a rolling window ending today', () => {
      component.dateFilter('anio');
      expect(component.fromDate).toBe(hace(365));
      expect(component.toDate).toBe(hoy());
    });

    it('searches on every preset and marks it active', () => {
      ventasService.buscarVentas.calls.reset();
      component.dateFilter('semana');
      expect(ventasService.buscarVentas).toHaveBeenCalled();
      expect(component.filtroActivo).toBe('semana');
    });

    it('drops the active pill when the dates are edited by hand', () => {
      component.dateFilter('hoy');
      expect(component.filtroActivo).toBe('hoy');
      component.onFechaChange();
      expect(component.filtroActivo).toBeNull();
    });
  });

  describe('toggleSort', () => {
    beforeEach(() => {
      component.ventas = [{ total: 10 }, { total: 30 }, { total: 20 }];
    });

    it('cycles asc, desc, then off', () => {
      component.toggleSort('total');
      expect(component.ventas.map((v: any) => v.total)).toEqual([10, 20, 30]);

      component.toggleSort('total');
      expect(component.ventas.map((v: any) => v.total)).toEqual([30, 20, 10]);

      component.toggleSort('total');
      expect(component.sortColumn).toBeNull();
    });
  });
});
