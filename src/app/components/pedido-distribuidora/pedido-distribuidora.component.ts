import { Component, OnInit } from '@angular/core';
import { PedidoItemsService } from '../../providers/pedido-items.service';
import { PedidoItemModel } from '../../models/pedido.item';
import { DistribuidoraModel } from '../../models/distribuidora.model';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import { PedidoDistribuidoraService } from '../../providers/pedido-distribuidora.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedido-distribuidora',
  templateUrl: './pedido-distribuidora.component.html',
  styleUrls: ['./pedido-distribuidora.component.css']
})
export class PedidoDistribuidoraComponent implements OnInit {

  distribuidoras: any[];
  distrSeleccionada = new DistribuidoraModel(1, 'Casassa');
  pedidoItems: PedidoItemModel[];
  distribuidoraSeleccionada: DistribuidoraModel[];
  loading:boolean = true;
  error:boolean=false;
  errMessage:string;

  constructor(private pedidoItemsService: PedidoItemsService,
              private distribuidoraService: DistribuidoraService,
              private pedidoDistriBuidoraServive: PedidoDistribuidoraService
    ) {
    this.loading = true;
    this.getPedidosPendientes();
    this.distribuidoraService.getDistribuidoras().subscribe(
      (items) => {
        console.log(items);
        this.distribuidoras = items;
        this.distribuidoras.forEach(c => c.label = c.descripcion);
        this.loading=false; } );
  }

  ngOnInit() {

  }

  getPedidosPendientes(){
    this.pedidoItemsService.getPedidosPendientes().subscribe(
      (items: any[]) => {
        this.pedidoItems = items;
        this.distribuidoraSeleccionada = new Array(items.length);
      }
    );
  }

  confirmarPedido(pedidoItem,i){
      const pd = {
          distribuidora: {id: this.distribuidoraSeleccionada[i].id,
                           descripcion: this.distribuidoraSeleccionada[i].descripcion },
          items:  [pedidoItem]
      };
      Swal.fire({
        title: 'Espere',
        text: 'Confirmando el pedido',
        type: 'info',
        allowOutsideClick: false
      });
      Swal.showLoading();

      this.pedidoDistriBuidoraServive.confirmarPedido(pd).subscribe(
        resp => {
          Swal.close();
          this.getPedidosPendientes(); },
        err => {Swal.fire({
                  title: 'Confirmar Pedido',
                  text: `Error al procesar la operacion` ,
                  type: 'error'
                });}
      );
  }

  onChange(event, i){

    this.distribuidoraSeleccionada[i] = event;
  }

}
