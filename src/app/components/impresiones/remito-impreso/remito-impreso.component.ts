import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RemitoModel, TIPO_RETIRO, TIPO_VENTA_CONSIGNACION, esDeComercio } from '../../../models/remito.model';
import { RemitosService } from '../../../providers/remitos.service';
import { PrintRemitoService } from '../../../providers/print-remito.service';
import { ConfiguracionRemitoService } from '../../../providers/configuracion-remito.service';

@Component({
  selector: 'app-remito-impreso',
  templateUrl: './remito-impreso.component.html',
  styleUrls: ['./remito-impreso.component.css']
})
export class RemitoImpresoComponent implements OnInit {
  remitoId: number;
  remito: RemitoModel;
  remitente: string;

  private remitoLoaded = false;
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
      });
    this.configuracionRemitoService.getConfiguracion().subscribe(
      config => {
        this.remitente = config.remitente;
        this.configLoaded = true;
        this.checkDataReady();
      },
      err => {
        this.remitente = '';
        this.configLoaded = true;
        this.checkDataReady();
      });
  }

  ngOnInit() {
  }

  /** El remito llega como JSON plano, sin los getters de RemitoModel. */
  get esConsignacion(): boolean {
    return !!this.remito && esDeComercio(this.remito.re_tipo);
  }

  get esRetiro(): boolean {
    return !!this.remito && this.remito.re_tipo === TIPO_RETIRO;
  }

  get esVenta(): boolean {
    return !!this.remito && this.remito.re_tipo === TIPO_VENTA_CONSIGNACION;
  }

  /** Encabezado del papel: los tres remitos de comercio dicen cosas distintas. */
  get titulo(): string {
    if (this.esRetiro) {
      return 'REMITO DE RETIRO';
    }
    if (this.esVenta) {
      return 'REMITO DE VENTA EN CONSIGNACION';
    }
    return this.esConsignacion ? 'REMITO DE CONSIGNACION' : 'DEVOLUCION';
  }

  get leyenda(): string {
    if (this.esRetiro) {
      return 'Ejemplares que se retiran del negocio y vuelven a la libreria.';
    }
    if (this.esVenta) {
      return 'Ejemplares vendidos por el negocio, que pasan a facturarse.';
    }
    return '';
  }

  get comision(): number {
    return this.remito && this.remito.re_comision ? this.remito.re_comision : 0;
  }

  get netoAPagar(): number {
    return this.total * (100 - this.comision) / 100;
  }

  get destinatario(): string {
    if (!this.remito) {
      return '';
    }
    const dest = this.esConsignacion ? this.remito.re_comercio_cm : this.remito.re_distribuidora_ed;
    return dest ? dest.descripcion : '';
  }

  get total(): number {
    return (this.remito && this.remito.items || [])
      .reduce((acc, i) => acc + i.ri_cantidad * (i.ri_precio || 0), 0);
  }

  get totalUnidades(): number {
    return (this.remito && this.remito.items || [])
      .reduce((acc, i) => acc + (i.ri_cantidad || 0), 0);
  }

  formatPrecio(value: number): string {
    return '$ ' + Intl.NumberFormat('es-AR', {maximumFractionDigits: 0}).format(value || 0);
  }

  private checkDataReady() {
    if (this.remitoLoaded && this.configLoaded) {
      this.printService.onDataReady();
    }
  }
}
