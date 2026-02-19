import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { BehaviorSubject } from 'rxjs';
import { RemitoModel } from '../models/remito.model';
import { RemitoItemModel } from '../models/remito-item.model';
import { ConfigService } from './config.service';
import { DistribuidoraModel } from '../models/distribuidora.model';

@Injectable({
  providedIn: 'root'
})
export class RemitosService {

  private URLRemitosService = '/api/remitos';
  private remitosSource = new BehaviorSubject(new RemitoModel());
  currentRemito = this.remitosSource.asObservable();

  constructor(private http: HttpClient,
              private auth: AuthService,
              private chttp: CustomHttpClientService,
              private config: ConfigService) {
    this.URLRemitosService = `${config.baseUrl}/remitos`;
  }

  buscarRemitos(termino: string, desde: string, hasta: string) {
    const url = `${this.URLRemitosService}/search/findByAny?parametro=${termino}&fechaDesde=${desde}&fechaHasta=${hasta}`;
    return this.chttp.get(url);
  }

  getRemito(id: number) {
    const url = `${this.URLRemitosService}/${id}`;
    return this.chttp.get(url);
  }

  changeRemito(remito: RemitoModel) {
    this.remitosSource.next(remito);
  }

  addRemitoItem(remitoItem: RemitoItemModel) {
    if (this.remitosSource.getValue().finalizado) {
      return;
    }
    const items: RemitoItemModel[] = this.remitosSource.getValue().items;
    const found: RemitoItemModel = items.find(e => e.ri_isbn === remitoItem.ri_isbn && !!remitoItem.ri_isbn);
    if (found) {
      found.ri_cantidad++;
    } else {
      this.remitosSource.getValue().addItem(remitoItem);
    }
    this.remitosSource.getValue().calcularTotal();
    this.remitosSource.next(this.remitosSource.getValue());
  }

  removeRemitoItem(remitoItem: RemitoItemModel) {
    if (this.remitosSource.getValue().finalizado) {
      return;
    }
    this.remitosSource.getValue().removeItem(remitoItem);
    this.remitosSource.next(this.remitosSource.getValue());
  }

  finalizarRemito() {
    this.remitosSource.getValue().finalizado = true;
    this.remitosSource.next(this.remitosSource.getValue());
  }

  generarNuevoRemito() {
    this.remitosSource.next(new RemitoModel());
  }

  asignarDatos(distribuidora: DistribuidoraModel, observaciones: string) {
    this.remitosSource.getValue().re_distribuidora_ed = distribuidora;
    this.remitosSource.getValue().re_observaciones = observaciones;
    this.remitosSource.getValue().re_fecha = new Date();
    this.remitosSource.next(this.remitosSource.getValue());
  }

  grabarRemito() {
    return this.chttp.post(this.URLRemitosService, this.remitosSource.getValue());
  }

  deleteRemito(id: number) {
    return this.chttp.delete(`${this.URLRemitosService}/${id}`);
  }

}
