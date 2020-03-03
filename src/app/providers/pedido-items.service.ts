import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoItemsService {

  private URLPedidoItemsService = '//localhost:8080/librospedidos';

  constructor(private http: HttpClient,
              private auth: AuthService,
              private chttp: CustomHttpClientService,
              private config: ConfigService) {

                this.URLPedidoItemsService = `${config.baseUrl}/librospedidos`;
  }

  getPedidosPendientes() {
    const url = `${ this.URLPedidoItemsService }/search/findByPendienteTrueOrderByLibro`;
    console.log(url);
    return this.chttp.get(url)
          .pipe(
            map((pedidos: any) => pedidos._embedded.pedidoItems)
          );
  }

}
