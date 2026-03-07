import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})

export class PedidoDistribuidoraService {
  private URLPedidoItemsService = '/api/pedidodistribuidora';
  private URLSearchService = '/api/pedidosdistribuidora';
  constructor(private http: HttpClient,
    private auth: AuthService,
    private chttp: CustomHttpClientService,
    private config: ConfigService) {

      this.URLPedidoItemsService = `${config.baseUrl}/pedidodistribuidora`;
      this.URLSearchService = `${config.baseUrl}/pedidosdistribuidora`;
}

confirmarPedido(pedido){
  return this.chttp.post( this.URLPedidoItemsService  , pedido);
}

buscarPedidosDistribuidora(termino: string, desde: string, hasta: string) {
  const url = `${this.URLSearchService}/search/findByAny?parametro=${termino}&fechaDesde=${desde}&fechaHasta=${hasta}`;
  return this.chttp.get(url);
}

}
