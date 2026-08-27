import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComercioModel } from '../../../models/comercio.model';
import { ConsignacionEstadoCuentaModel } from '../../../models/consignacion-estado-cuenta.model';
import { RemitosService } from '../../../providers/remitos.service';
import { ComercioService } from '../../../providers/comercio.service';
import { PrintRemitoService } from '../../../providers/print-remito.service';
import { ConfiguracionRemitoService } from '../../../providers/configuracion-remito.service';

/**
 * Estado de cuenta de un comercio, para entregarle el detalle de lo que tenemos registrado en
 * su poder: todo lo que tiene, sin recortes por fecha.
 */
@Component({
  selector: 'app-estado-cuenta-impreso',
  templateUrl: './estado-cuenta-impreso.component.html',
  styleUrls: ['./estado-cuenta-impreso.component.css']
})
export class EstadoCuentaImpresoComponent implements OnInit {
  comercioId: number;
  comercio: ComercioModel;
  filas: ConsignacionEstadoCuentaModel[] = [];
  remitente: string;
  fechaEmision = new Date();

  private filasLoaded = false;
  private comercioLoaded = false;
  private configLoaded = false;

  constructor(route: ActivatedRoute,
              private remitosService: RemitosService,
              private comercioService: ComercioService,
              private printService: PrintRemitoService,
              private configuracionRemitoService: ConfiguracionRemitoService) {
    this.comercioId = Number(route.snapshot.params['comercioId']);

    this.remitosService.estadoCuentaConsignacion(this.comercioId).subscribe(
      (filas: ConsignacionEstadoCuentaModel[]) => {
        this.filas = filas || [];
        this.filasLoaded = true;
        this.checkDataReady();
      },
      () => {
        this.filasLoaded = true;
        this.checkDataReady();
      });

    this.comercioService.getComercio(this.comercioId).subscribe(
      (comercio: any) => {
        this.comercio = comercio;
        this.comercioLoaded = true;
        this.checkDataReady();
      },
      () => {
        this.comercioLoaded = true;
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

  get unidades(): number {
    return this.filas.reduce((acc, f) => acc + (f.cantidad || 0), 0);
  }

  get total(): number {
    return this.filas.reduce((acc, f) => acc + (f.subtotal || 0), 0);
  }

  formatPrecio(value: number): string {
    return '$ ' + Intl.NumberFormat('es-AR', {maximumFractionDigits: 0}).format(value || 0);
  }

  private checkDataReady() {
    if (this.filasLoaded && this.comercioLoaded && this.configLoaded) {
      this.printService.onDataReady();
    }
  }
}
