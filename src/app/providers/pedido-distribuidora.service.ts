import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})

export class PedidoDistribuidoraService {
  private URLPedidoItemsService = '//localhost:8080/pedidodistribuidora';
  constructor(private http: HttpClient,
    private auth: AuthService,
    private chttp: CustomHttpClientService,
    private config: ConfigService) {

      this.URLPedidoItemsService = `${config.baseUrl}/pedidodistribuidora`;
}

confirmarPedido(pedido){
  return this.chttp.post( this.URLPedidoItemsService  , pedido);
}

}
