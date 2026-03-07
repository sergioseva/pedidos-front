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
  groupedItems: any[] = [];

  private pedidoLoaded = false;
  private configLoaded = false;

  constructor(route: ActivatedRoute,
              private pedidoService: PedidosService,
              private printService: PrintPedidoService,
              private configuracionService: ConfiguracionService) {
    this.pedidoId = route.snapshot.params['pedidoId'];
    this.pedidoService.getPedidoProjection(this.pedidoId).subscribe(
      (pedido: any) => {
        this.pedido = pedido;
        this.groupedItems = this.groupItems(pedido.pedidoItems || []);
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

  private groupItems(items: any[]): any[] {
    const groups = new Map<string, any>();
    for (const pi of items) {
      const key = `${pi.libro}||${pi.autor}||${pi.editorial}||${pi.precio}`;
      if (groups.has(key)) {
        groups.get(key).cantidad += pi.cantidad;
      } else {
        groups.set(key, { ...pi, cantidad: pi.cantidad });
      }
    }
    return Array.from(groups.values());
  }

  private checkDataReady() {
    if (this.pedidoLoaded && this.configLoaded) {
      this.printService.onDataReady();
    }
  }
}
