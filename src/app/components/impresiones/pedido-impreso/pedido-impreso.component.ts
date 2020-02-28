import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PedidoModel } from '../../../models/pedido.model';
import { PedidosService } from '../../../providers/pedidos.service';
import { PrintPedidoService } from '../../../providers/print-pedido.service';

@Component({
  selector: 'app-pedido-impreso',
  templateUrl: './pedido-impreso.component.html',
  styleUrls: ['./pedido-impreso.component.css']
})
export class PedidoImpresoComponent implements OnInit {
  pedidoId: number;
  pedido: PedidoModel;

  constructor(route: ActivatedRoute, private pedidoService: PedidosService, private printService:PrintPedidoService) {
     this.pedidoId = route.snapshot.params['pedidoId'];
     this.pedidoService.getPedidoProjection(this.pedidoId).subscribe(
       (pedido: PedidoModel) => { this.pedido = pedido;
                                  this.printService.onDataReady();
      });

  }

  ngOnInit() {
 
  }

}
