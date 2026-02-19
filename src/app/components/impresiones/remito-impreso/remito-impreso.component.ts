import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RemitoModel } from '../../../models/remito.model';
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

  private checkDataReady() {
    if (this.remitoLoaded && this.configLoaded) {
      this.printService.onDataReady();
    }
  }
}
