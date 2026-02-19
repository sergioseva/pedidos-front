import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { ConfiguracionModel } from '../models/configuracion.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private url: string;

  constructor(private http: HttpClient,
              private chttp: CustomHttpClientService,
              private config: ConfigService) {
    this.url = `${config.baseUrl}/configuracion`;
  }

  getConfiguracion(): Observable<ConfiguracionModel> {
    return this.http.get(this.url) as Observable<ConfiguracionModel>;
  }

  updateConfiguracion(config: ConfiguracionModel): Observable<ConfiguracionModel> {
    return this.chttp.put(this.url, config) as Observable<ConfiguracionModel>;
  }

  uploadLogo(file: File): Observable<ConfiguracionModel> {
    const formData = new FormData();
    formData.append('file', file);
    return this.chttp.post(`${this.url}/logo`, formData) as Observable<ConfiguracionModel>;
  }

  deleteLogo(): Observable<any> {
    return this.chttp.delete(`${this.url}/logo`);
  }

  getLogoUrl(): string {
    return `${this.url}/logo`;
  }
}
