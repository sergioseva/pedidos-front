import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClientesServiceService {

  private URLClientesService:string="//localhost:8080/clientes";

  constructor(private http:HttpClient) { }

  getClientes() {
    let url:string=`${ this.URLClientesService }`

    return this.http.get(url)
          .pipe(
            map((clientes:any)=>clientes)
          );
  }

  getClientesPage(page:number) {
    let url:string=`${ this.URLClientesService }?page=${page}`

    return this.http.get(url)
          .pipe(
            map((clientes:any)=>clientes)
          );
  }

}
