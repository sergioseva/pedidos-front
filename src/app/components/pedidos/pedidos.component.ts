import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PedidosService } from 'src/app/providers/pedidos.service';

import { DatePipe } from '@angular/common';
import { PedidoModel } from '../../models/pedido.model';
import { PrintPedidoService } from 'src/app/providers/print-pedido.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PedidosComponent implements OnInit {

  pedidos: any[];
  fromDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  toDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  loading: boolean = false;
  error: boolean = false;
  errMessage: string;
  searchPerformed: boolean = false;

  constructor(public printService: PrintPedidoService, private ps: PedidosService, private datePipe: DatePipe, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
      this.dateFilter(0);
      this.buscarTermino('');
  }

  imprimir(pedido: PedidoModel) {
    this.printService.imprimirPedido(pedido.id);
  }


  buscarTermino(termino:string){
    this.loading = true;
    this.pedidos = new Array();
    console.log(this.loading);
    this.ps.buscarPedidos(termino,
                          this.datePipe.transform( this.fromDate, 'yyyy-MM-dd'),
                          this.datePipe.transform( this.toDate, 'yyyy-MM-dd') )
      .subscribe( (data: any) => {
      console.log(data);
      this.pedidos = data;
      this.loading = false;
      this.error = false;
      this.searchPerformed = true;
      this.cdr.markForCheck();
    },
    (err) => {
      this.loading = false;
      this.error = true;
      this.errMessage = (err.error && err.error.message) || 'Error al buscar pedidos';
      this.cdr.markForCheck();
    });
  }

  dateFilter(days:number){
    let past = new Date();
    let today = new Date();
    past.setDate(past.getDate()-days);
    today.setDate(today.getDate() + 1);
    this.fromDate = this.datePipe.transform(past, 'yyyy-MM-dd');
    this.toDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    this.buscarTermino('');
  }
}
