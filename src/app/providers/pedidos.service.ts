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
    const url = `${ this.URLPedidosService }`;

    return this.chttp.get(url)
          .pipe(
            map((pedidos: any) => pedidos._embedded.pedidoes)
          );
  }

  buscarPedidos(termino: string, desde: string, hasta: string ) {
    const url = `${ this.URLPedidosService }/search/findByAny?parametro=${termino}&fechaDesde=${desde}&fechaHasta=${hasta}`;
    console.log('fecha desde:' + desde);
    return this.chttp.get(url);
          // .pipe(
          //   map((pedidos: any) => pedidos._embedded.pedidoes)
          // );
  }


}
