import { Injectable } from '@angular/core';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { ConfiguracionRemitoModel } from '../models/configuracion-remito.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionRemitoService {
  private url: string;

  constructor(private chttp: CustomHttpClientService,
              private config: ConfigService) {
    this.url = `${config.baseUrl}/configuracion-remito`;
  }

  getConfiguracion(): Observable<ConfiguracionRemitoModel> {
    return this.chttp.get(this.url) as Observable<ConfiguracionRemitoModel>;
  }

  updateConfiguracion(configuracion: ConfiguracionRemitoModel): Observable<ConfiguracionRemitoModel> {
    return this.chttp.put(this.url, configuracion) as Observable<ConfiguracionRemitoModel>;
  }
}
