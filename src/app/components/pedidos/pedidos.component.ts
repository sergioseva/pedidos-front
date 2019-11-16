import { Component, OnInit } from '@angular/core';
import { PedidosService } from 'src/app/providers/pedidos.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {

  pedidos:any[];
  loading:boolean;
  constructor(private ps:PedidosService) { }

  ngOnInit() {
    this.ps.getPedidos().subscribe(
      (cs:any[])=>{
        console.log(cs);
        this.pedidos=cs;
      }
    )
  }

  buscarLibro(libro:string){
    this.loading=true;
    this.ps.getPedidosConLibro(libro).subscribe( (data:any)=> {
      console.log(data);
      this.pedidos=data;
      this.loading=false;
    })
  }

  buscarCliente(cliente:string,libro:string){
    this.loading=true;
    console.log("buscar cliente:"+ libro+ " " + cliente);
    this.ps.getPedidosDeCliente(cliente).subscribe( (data:any)=> {
      console.log(data);
      this.pedidos=data;
      this.loading=false;
    })
  }

}
