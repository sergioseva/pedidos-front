import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RemitoModel } from '../../../models/remito.model';
import { ReciboModel } from '../../../models/recibo.model';
import { RemitosService } from '../../../providers/remitos.service';
import { PrintRemitoService } from '../../../providers/print-remito.service';
import { ConfiguracionRemitoService } from '../../../providers/configuracion-remito.service';

/**
 * Recibo de pago de una liquidacion de consignacion. Se imprime por el remito de venta al que
 * pertenece, que es lo que el operador tiene a mano.
 */
@Component({
  selector: 'app-recibo-impreso',
  templateUrl: './recibo-impreso.component.html',
  styleUrls: ['./recibo-impreso.component.css']
})
export class ReciboImpresoComponent implements OnInit {
  remitoId: number;
  remito: RemitoModel;
  recibo: ReciboModel;
  remitente: string;

  private remitoLoaded = false;
  private reciboLoaded = false;
  private configLoaded = false;

  constructor(route: ActivatedRoute,
              private remitosService: RemitosService,
              private printService: PrintRemitoService,
              private configuracionRemitoService: ConfiguracionRemitoService) {
    this.remitoId = route.snapshot.params['remitoId'];

    this.remitosService.getRemito(this.remitoId).subscribe(
      (remito: RemitoModel) => {
        this.remito = remito;
        this.remitoLoaded = true;
        this.checkDataReady();
      },
      () => {
        this.remitoLoaded = true;
        this.checkDataReady();
      });

    this.remitosService.getRecibo(this.remitoId).subscribe(
      (recibo: ReciboModel) => {
        this.recibo = recibo;
        this.reciboLoaded = true;
        this.checkDataReady();
      },
      () => {
        this.reciboLoaded = true;
        this.checkDataReady();
      });

    this.configuracionRemitoService.getConfiguracion().subscribe(
      config => {
        this.remitente = config.remitente;
        this.configLoaded = true;
        this.checkDataReady();
      },
      () => {
        this.remitente = '';
        this.configLoaded = true;
        this.checkDataReady();
      });
  }

  ngOnInit() {
  }

  get comercio(): string {
    return this.remito && this.remito.re_comercio_cm ? this.remito.re_comercio_cm.descripcion : '';
  }

  get totalTapa(): number {
    return (this.remito && this.remito.items || [])
      .reduce((acc, i) => acc + i.ri_cantidad * (i.ri_precio || 0), 0);
  }

  get comision(): number {
    return this.remito && this.remito.re_comision ? this.remito.re_comision : 0;
  }

  get montoComision(): number {
    return this.totalTapa - this.montoNeto;
  }

  /** El monto que vale es el del recibo: es el que se firmo. */
  get montoNeto(): number {
    if (this.recibo && this.recibo.rc_monto != null) {
      return this.recibo.rc_monto;
    }
    return this.totalTapa * (100 - this.comision) / 100;
  }

  formatPrecio(value: number): string {
    return '$ ' + Intl.NumberFormat('es-AR', {maximumFractionDigits: 0}).format(value || 0);
  }

  private checkDataReady() {
    if (this.remitoLoaded && this.reciboLoaded && this.configLoaded) {
      this.printService.onDataReady();
    }
  }
}
