import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { BehaviorSubject } from 'rxjs';
import { PedidoModel } from '../models/pedido.model';
import { PedidoItemModel } from '../models/pedido.item';
import { ConfigService } from './config.service';
import { ClienteModel } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {


  private URLPedidosService = '//localhost:8080/pedidos';
  private pedidosSource = new BehaviorSubject(new PedidoModel());
  currentPedido = this.pedidosSource.asObservable();

  constructor(private http: HttpClient,
              private auth: AuthService,
              private chttp: CustomHttpClientService,
              private config: ConfigService) {

                this.URLPedidosService = `${config.baseUrl}/pedidos`;
  }

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

  getPedidoProjection(pedidoId: number){
    const url = `${ this.URLPedidosService }/${pedidoId}?projection=pedidoCliente`;

    return this.chttp.get(url);
  }

  changePedido(pedido: PedidoModel) {
    console.log('calcular pedido');
    console.log(pedido);
    this.pedidosSource.next(pedido);
    pedido.calcularTotal();
  }

  addPedidoItem( pedidoItem: PedidoItemModel) {

      if (this.pedidosSource.getValue().finalizado) {
        return;
      }
      const pItems: PedidoItemModel[]  = this.pedidosSource.getValue().pedidoItems;
      const piFound: PedidoItemModel = pItems.find(e => e.codigoLuongo === pedidoItem.codigoLuongo);
      if (piFound && pedidoItem.codigoLuongo) {
        piFound.cantidad++;
      } else {
        this.pedidosSource.getValue().addPedidoItem(pedidoItem);
      }
      // this.pedidosSource.getValue().pedidoItems = this.pedidosSource.getValue().pedidoItems.filter(
      //                 e => e.constructor.name==='PedidoItemModel'
      //                 );
      // console.log('this.pedidosSource.getValue().pedidoItems');
      // console.log(this.pedidosSource.getValue().pedidoItems);
      this.pedidosSource.getValue().calcularTotal();
      this.pedidosSource.next(this.pedidosSource.getValue());
  }

  removePedidoItem(pedidoItem: PedidoItemModel){
    if (this.pedidosSource.getValue().finalizado) {
      return;
    }
    this.pedidosSource.getValue().removePedidoItem(pedidoItem);
    this.pedidosSource.next(this.pedidosSource.getValue());
  }

  finalizarPedido(){
    this.pedidosSource.getValue().finalizado = true;
    this.pedidosSource.next(this.pedidosSource.getValue());
  }

  generarNuevoPedido(){
    this.pedidosSource.next(new PedidoModel());
  }

  asignarDatos(cliente: ClienteModel, senia: number, observaciones: string) {
    this.pedidosSource.getValue().cliente = cliente;
    this.pedidosSource.getValue().senia = senia;
    this.pedidosSource.getValue().observaciones = observaciones;
    this.pedidosSource.next(this.pedidosSource.getValue());
  }

  grabarPedido() {
    return this.chttp.post(this.URLPedidosService, this.pedidosSource.getValue());
  }


}
