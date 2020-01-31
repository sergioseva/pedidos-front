import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { LibroModel } from '../models/libro.model';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class LibrosService {


  private  URLLibrosService = '//localhost:8080/catalogos';
  private  URLOpenLibraryPre = 'https://openlibrary.org/api/books?bibkeys=ISBN:';
  private  URLOpenLibraryPost = '&jscmd=data';
  
  constructor(private http: HttpClient,
              private auth: AuthService,
              private chttp: CustomHttpClientService,
              private config: ConfigService) {

                this.URLLibrosService = `${config.baseUrl}/catalogos`;
  }

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

  insertLibro(libro: LibroModel) {
    return this.chttp.post( this.URLLibrosService  , libro);
  }

  updateLibro( libro: LibroModel) {
    return this.chttp.put(`${ this.URLLibrosService }/${libro.id}`  , libro);
  }

  deleteLibro(libro: LibroModel) {
    return this.chttp.delete( `${ this.URLLibrosService }/${libro.id}` )
          .pipe(
            catchError(this.handleError)
          );
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
