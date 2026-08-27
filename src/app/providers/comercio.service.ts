import { Injectable } from '@angular/core';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ComercioModel } from '../models/comercio.model';

@Injectable({
  providedIn: 'root'
})
export class ComercioService {
  private URLComerciosService = '/api/comercios';

  constructor(private chttp: CustomHttpClientService,
              private config: ConfigService) {
    this.URLComerciosService = `${config.baseUrl}/comercios`;
  }

  getComercios(): Observable<ComercioModel[]> {
    return this.chttp.get(this.URLComerciosService)
      .pipe(map((comercios: ComercioModel[]) => comercios));
  }

  /**
   * Cada comercio con cuantos ejemplares tiene en consignacion. Se calcula en el momento y no se
   * cachea: es una sola consulta agregada de un par de milisegundos, y una cache habria que
   * invalidarla en cada movimiento, con el riesgo de mostrar un numero equivocado en silencio.
   */
  getResumenConsignacion(): Observable<ComercioModel[]> {
    return this.chttp.get(`${this.URLComerciosService}/consignacion`)
      .pipe(map((comercios: ComercioModel[]) => comercios));
  }

  getComercio(id: number) {
    return this.chttp.get(`${this.URLComerciosService}/${id}`);
  }

  buscarComercios(termino: string): Observable<ComercioModel[]> {
    const url = `${this.URLComerciosService}/search/findByAny?parametro=${termino}`;
    return this.chttp.get(url)
      .pipe(map((comercios: ComercioModel[]) => comercios));
  }

  insertComercio(comercio: ComercioModel) {
    return this.chttp.post(this.URLComerciosService, comercio);
  }

  updateComercio(id: number, comercio: ComercioModel) {
    return this.chttp.put(`${this.URLComerciosService}/${id}`, comercio);
  }

  deleteComercio(id: number) {
    return this.chttp.delete(`${this.URLComerciosService}/${id}`);
  }
}
