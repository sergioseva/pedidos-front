import { Component, OnInit } from '@angular/core';
import { PedidosService } from 'src/app/providers/pedidos.service';

import { DatePipe } from '@angular/common';
import { PedidoModel } from '../../models/pedido.model';
import { PrintPedidoService } from 'src/app/providers/print-pedido.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {

  pedidos: any[];
  loading: boolean;
  fromDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  toDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

  constructor(private printService: PrintPedidoService, private ps: PedidosService, private datePipe: DatePipe) { }

  ngOnInit() {
      this.dateFilter(0);
  }

  imprimir(pedido: PedidoModel) {
    this.printService.imprimirPedido(pedido.id);
  }


  buscarTermino(termino:string){
    this.loading = true;
    this.ps.buscarPedidos(termino,
                          this.datePipe.transform( this.fromDate, 'yyyy-MM-dd'),
                          this.datePipe.transform( this.toDate, 'yyyy-MM-dd') )
      .subscribe( (data: any) => {
      console.log(data);
      this.pedidos = data;
      this.loading = false;
    });
  }

  dateFilter(days:number){
    let past = new Date();
    let today = new Date();
    past.setDate(past.getDate()-days);
    today.setDate(today.getDate() + 1);
    console.log(past);
    this.fromDate = this.datePipe.transform(past, 'yyyy-MM-dd');
    this.toDate=this.datePipe.transform(today, 'yyyy-MM-dd');
    console.log(this.fromDate); 
  }
}
