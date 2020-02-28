import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PedidoComponent } from '../components/pedido/pedido.component';

@Injectable({
  providedIn: 'root'
})
export class PrintPedidoService {
  isPrinting = false;
  constructor(private router: Router) { }

  imprimirPedido(pedidoId: number){
    this.isPrinting = true;
    this.router.navigate(['/',
    { outlets: {
      'print': ['print', 'printpedido', pedidoId]
    }}]);
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate([{ outlets: { print: null }}]);
    });
  }

}
