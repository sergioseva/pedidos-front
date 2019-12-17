import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private URLPedidosService:string="//localhost:8080/pedidos";

  constructor(private http: HttpClient,
              private auth: AuthService,
              private chttp: CustomHttpClientService) { }

  getPedidos() {
    let url:string=`${ this.URLPedidosService }`;

    return this.chttp.get(url)
          .pipe(
            map((pedidos: any) => pedidos._embedded.pedidoes)
          );
  }

  getPedidosConLibro(libro:String){
    let url:string=`${ this.URLPedidosService }/search/findPedidosConLibro?libro=${libro}`;
    return this.chttp.get(url)
    .pipe(
      map((pedidos: any) => pedidos._embedded.pedidoes)
    );

  }

  getPedidosDeCliente(cliente:String){
    let url: string = `${ this.URLPedidosService }/search/findByClienteNombreContainsAllIgnoreCase?cliente=${cliente}`;
    return this.chttp.get(url)
    .pipe(
      map((pedidos: any ) => pedidos._embedded.pedidoes)
    );
  }

  getPedidosDeClienteYLibro(cliente:String,libro:string){
    let url:string=`${ this.URLPedidosService }/search/findByClienteAndLibro?cliente=${cliente}&libro=${libro}`;
    return this.chttp.get(url)
    .pipe(
      map((pedidos: any) => pedidos._embedded.pedidoes)
    );
    }
}
