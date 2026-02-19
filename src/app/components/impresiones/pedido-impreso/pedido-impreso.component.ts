import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PedidoModel } from '../../../models/pedido.model';
import { PedidosService } from '../../../providers/pedidos.service';
import { PrintPedidoService } from '../../../providers/print-pedido.service';
import { ConfiguracionService } from '../../../providers/configuracion.service';

@Component({
  selector: 'app-pedido-impreso',
  templateUrl: './pedido-impreso.component.html',
  styleUrls: ['./pedido-impreso.component.css']
})
export class PedidoImpresoComponent implements OnInit {
  pedidoId: number;
  pedido: PedidoModel;

  private pedidoLoaded = false;
  private configLoaded = false;

  constructor(route: ActivatedRoute,
              private pedidoService: PedidosService,
              private printService: PrintPedidoService,
              private configuracionService: ConfiguracionService) {
    this.pedidoId = route.snapshot.params['pedidoId'];
    this.pedidoService.getPedidoProjection(this.pedidoId).subscribe(
      (pedido: PedidoModel) => {
        this.pedido = pedido;
        this.pedidoLoaded = true;
        this.checkDataReady();
      });
    this.configuracionService.getConfiguracion().subscribe(
      () => {
        this.configLoaded = true;
        this.checkDataReady();
      },
      () => {
        this.configLoaded = true;
        this.checkDataReady();
      });
  }

  ngOnInit() {
  }

  private checkDataReady() {
    if (this.pedidoLoaded && this.configLoaded) {
      this.printService.onDataReady();
    }
  }
}
