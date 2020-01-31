import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { ClienteModel } from '../models/cliente.model';
import { throwError } from 'rxjs/internal/observable/throwError';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesServiceService {

  private URLClientesService:string="//localhost:8080/clientes";

  constructor(private http: CustomHttpClientService,
              private config: ConfigService) {

      this.URLClientesService = `${config.baseUrl}/clientes`;
}


  getClientes() {
    let url:string=`${ this.URLClientesService }`

    return this.http.get(url)
          .pipe(
            map((clientes: any) => clientes)
          );
  }

  getCliente(id: number) {
    const url = `${ this.URLClientesService }/${id}`;
    return this.http.get(url);
  }

  getClientesPage(page: number) {
    const url = `${ this.URLClientesService }?page=${page}`

    return this.http.get(url)
          .pipe(
            map((clientes: any) => clientes)
          );
  }

  getClientesPorNombre(nombre: string) {
    const url = `${ this.URLClientesService }/search/findByName?name=${nombre}`;

    return this.http.get(url)
          .pipe(
            map((clientes: any) => clientes)
          );
  }

  getClientesPorCualquier(termino: string): Observable<ClienteModel[]> {
    const url = `${ this.URLClientesService }/search/findByAny?parametro=${termino}`;
    return this.http.get(url)
              .pipe(
                map((clientes: ClienteModel[]) => clientes)
              );
    }

  insertCliente(cliente: ClienteModel) {
    return this.http.post( this.URLClientesService  , cliente);
  }

  updateCliente(id: any , cliente: ClienteModel) {
    return this.http.put( id , cliente);
  }

  deleteCliente(id: any) {
    return this.http.delete( `${ this.URLClientesService }/${id}` )
          .pipe(
            catchError(this.handleError)
          );
  }

  checkPedidos(id: number){
    const url = `${ this.URLClientesService }/checkPedidos/${id}`;
    return this.http.get(url);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

}
