import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class BatchStatisticsService {
  private url: string;
  private importUrl: string;

  constructor(private http: HttpClient,
              private chttp: CustomHttpClientService,
              private auth: AuthService,
              private config: ConfigService) {
    this.url = `${config.baseUrl}/batchstatistics`;
    this.importUrl = `${config.baseUrl}/catalogos/import`;
  }

  getBatchStatistics(page: number = 0, size: number = 10) {
    return this.chttp.get(`${this.url}?page=${page}&size=${size}&sort=id,desc`);
  }

  importCatalogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.auth.leerToken()}`);
    return this.http.post(this.importUrl, formData, { headers });
  }
}
