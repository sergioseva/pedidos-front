import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class DistribuidoraService {
  private URLDistribuidorasService = '/api/distribuidoras';
  constructor(private http: HttpClient,
    private auth: AuthService,
    private chttp: CustomHttpClientService,
    private config: ConfigService) {

      this.URLDistribuidorasService = `${config.baseUrl}/distribuidoras`;
}

getDistribuidoras() {
  const url = `${ this.URLDistribuidorasService }`;

  return this.chttp.get(url)
        .pipe(
          map((pedidos: any) => pedidos._embedded.distribuidoras)
        );
}

}
