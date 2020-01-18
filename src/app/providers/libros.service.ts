import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { LibroModel } from '../models/libro.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LibrosService {


  private  URLLibrosService = '//localhost:8080/catalogos';
  private  URLOpenLibraryPre = 'https://openlibrary.org/api/books?bibkeys=ISBN:';
  private  URLOpenLibraryPost = '&jscmd=data';
  
  constructor(private http: HttpClient,
              private auth: AuthService,
              private chttp: CustomHttpClientService) { }

  buscarLibros(termino: string ) {
    const url = `${ this.URLLibrosService }/search/findByAny?parametro=${termino}`;
    return this.chttp.get(url);
  }

  buscarImagen(libro: LibroModel ) {
    const url = `${ this.URLOpenLibraryPre }${libro.isbn}${this.URLOpenLibraryPost}`;
    return this.http.get(url)
           .pipe(
             map((libro: any) => libro)
           );
  }



}
