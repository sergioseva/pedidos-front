import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

import { VentasService } from '../../providers/ventas.service';

/**
 * Sales reporting for the owner. Deliberately tables, not charts: the per-day table answers
 * "how did last week go", prints, and adds no dependency.
 */
@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentasComponent implements OnInit {

  ventas: any[] = [];
  porDia: any[] = [];
  resumen: any = null;

  fromDate: string;
  toDate: string;
  termino = '';

  /** Which preset is applied, so the pill can show as selected. Cleared on a manual date edit. */
  filtroActivo: string = null;

  loading = false;
  error = false;
  errMessage = '';
  searchPerformed = false;

  sortColumn: string = null;
  sortDirection: 'asc' | 'desc' | null = null;

  modalRef: BsModalRef;
  ventaSeleccionada: any = null;

  constructor(private vs: VentasService,
              private modalService: BsModalService,
              private datePipe: DatePipe,
              private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.dateFilter('mes');
  }

  /**
   * Preset ranges. "Hoy" and "Ayer" are single days on purpose: on a till report, clicking Ayer
   * to read yesterday's takings must not silently fold today's sales into the number. (Consulta
   * de pedidos treats Ayer as "since yesterday", which reads fine for open orders but would make
   * a revenue figure wrong.) The rest are rolling windows ending today.
   *
   * The backend already covers the whole of fechaHasta (it ends the range at 23:59:59.999), so
   * there is no need for the +1 day the pedidos screen uses to reach today's rows.
   */
  dateFilter(preset: 'hoy' | 'ayer' | 'semana' | 'mes' | 'anio'): void {
    const hoy = new Date();
    let desde = new Date();
    let hasta = new Date();

    switch (preset) {
      case 'hoy':
        desde = hoy;
        hasta = hoy;
        break;
      case 'ayer':
        desde = this.restarDias(hoy, 1);
        hasta = this.restarDias(hoy, 1);
        break;
      case 'semana':
        desde = this.restarDias(hoy, 7);
        break;
      case 'mes':
        desde = this.restarDias(hoy, 30);
        break;
      case 'anio':
        desde = this.restarDias(hoy, 365);
        break;
    }

    this.filtroActivo = preset;
    this.fromDate = this.datePipe.transform(desde, 'yyyy-MM-dd');
    this.toDate = this.datePipe.transform(hasta, 'yyyy-MM-dd');
    this.buscar();
  }

  private restarDias(fecha: Date, dias: number): Date {
    const d = new Date(fecha);
    d.setDate(d.getDate() - dias);
    return d;
  }

  /** A hand-picked range is no longer any of the presets, so drop the highlight. */
  onFechaChange(): void {
    this.filtroActivo = null;
  }

  buscar(): void {
    this.loading = true;
    this.error = false;
    this.cdr.markForCheck();

    this.vs.resumen(this.fromDate, this.toDate).subscribe(
      (r: any) => { this.resumen = r; this.cdr.markForCheck(); },
      (err: any) => this.fallo(err));

    this.vs.ventasPorDia(this.fromDate, this.toDate).subscribe(
      (r: any) => { this.porDia = r ?? []; this.cdr.markForCheck(); },
      (err: any) => this.fallo(err));

    this.vs.buscarVentas(this.termino, this.fromDate, this.toDate).subscribe(
      (r: any) => {
        this.ventas = r ?? [];
        this.loading = false;
        this.searchPerformed = true;
        this.cdr.markForCheck();
      },
      (err: any) => this.fallo(err));
  }

  private fallo(err: any): void {
    this.loading = false;
    this.error = true;
    this.errMessage = err?.error?.message ?? 'Error al obtener las ventas';
    this.cdr.markForCheck();
  }

  descargando = false;

  /** Downloads the current filtered view as an .xlsx. The bytes are fetched with the JWT header
   *  and saved via a temporary object URL, since an anchor link could not carry the token. */
  descargar(): void {
    if (this.descargando) {
      return;
    }
    this.descargando = true;
    this.cdr.markForCheck();

    this.vs.descargarReporte(this.termino, this.fromDate, this.toDate).subscribe(
      (blob: Blob) => {
        const nombre = `ventas_${this.fromDate}_a_${this.toDate}.xlsx`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargando = false;
        this.cdr.markForCheck();
      },
      (err: any) => {
        this.descargando = false;
        this.error = true;
        this.errMessage = 'No se pudo generar el reporte';
        this.cdr.markForCheck();
      });
  }

  verDetalle(venta: any, template: TemplateRef<any>): void {
    this.ventaSeleccionada = venta;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  /**
   * Deleting a sale is destructive and affects the totals, so it always confirms first. Only admins
   * reach this screen (AdminGuard) and the backend re-checks the role, so the button is safe to show.
   */
  eliminar(venta: any): void {
    Swal.fire({
      title: 'Eliminar venta',
      html: `Se eliminara la venta <b>#${venta.id}</b> por <b>$${(venta.total ?? 0).toLocaleString('es-AR')}</b>.<br>Esta accion no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }
      this.vs.eliminarVenta(venta.id).subscribe(
        () => {
          Swal.fire({ title: 'Eliminada', text: `Venta #${venta.id} eliminada`, icon: 'success' });
          // Reload so the list, per-day table and summary totals all reflect the removal.
          this.buscar();
        },
        (err: any) => {
          Swal.fire({
            title: 'No se pudo eliminar',
            text: err?.error?.message ?? 'Error al eliminar la venta',
            icon: 'error'
          });
        });
    });
  }

  /**
   * Books actually sold, not lines on the ticket. One title bought in twos is 2 units on 1 line,
   * and showing the line count under a "Libros" heading read as "1 book sold". "Unidades" here
   * means the same thing it means in the summary and the per-day table: a sum of cantidad.
   */
  unidades(venta: any): number {
    return (venta?.items ?? []).reduce((total: number, i: any) => total + (i.cantidad ?? 0), 0);
  }

  toggleSort(column: string): void {
    if (this.sortColumn !== column) {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    } else if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
    } else if (this.sortDirection === 'desc') {
      this.sortColumn = null;
      this.sortDirection = null;
    } else {
      this.sortDirection = 'asc';
    }
    this.aplicarOrden();
  }

  private aplicarOrden(): void {
    if (!this.sortColumn || !this.sortDirection) {
      return;
    }
    const col = this.sortColumn;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    this.ventas = [...this.ventas].sort((a, b) => {
      const va = this.getNestedValue(a, col);
      const vb = this.getNestedValue(b, col);
      if (va == null) { return 1; }
      if (vb == null) { return -1; }
      return va > vb ? dir : va < vb ? -dir : 0;
    });
    this.cdr.markForCheck();
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc ? acc[key] : null, obj);
  }
}
