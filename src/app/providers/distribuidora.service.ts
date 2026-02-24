import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ConfigService } from './config.service';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DistribuidoraModel } from '../models/distribuidora.model';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';

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

getDistribuidoras(): Observable<DistribuidoraModel[]> {
  const url = `${ this.URLDistribuidorasService }`;

  return this.chttp.get(url)
        .pipe(
          map((distribuidoras: DistribuidoraModel[]) => distribuidoras)
        );
}

getDistribuidora(id: number) {
  const url = `${ this.URLDistribuidorasService }/${id}`;
  return this.chttp.get(url);
}

buscarDistribuidoras(termino: string): Observable<DistribuidoraModel[]> {
  const url = `${ this.URLDistribuidorasService }/search/findByAny?parametro=${termino}`;
  return this.chttp.get(url)
        .pipe(
          map((distribuidoras: DistribuidoraModel[]) => distribuidoras)
        );
}

insertDistribuidora(distribuidora: DistribuidoraModel) {
  return this.chttp.post(this.URLDistribuidorasService, distribuidora);
}

updateDistribuidora(id: number, distribuidora: DistribuidoraModel) {
  return this.chttp.put(`${ this.URLDistribuidorasService }/${id}`, distribuidora);
}

deleteDistribuidora(id: number) {
  return this.chttp.delete(`${ this.URLDistribuidorasService }/${id}`)
        .pipe(
          catchError(this.handleError)
        );
}

private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    console.error('An error occurred:', error.error.message);
  } else {
    console.error(
      `Backend returned code ${error.status}, ` +
      `body was: ${error.error}`);
  }
  return throwError(
    'Something bad happened; please try again later.');
}

}
