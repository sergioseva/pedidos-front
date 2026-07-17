import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

//clase para agregarle headers a cualquier requerimiento
export class CustomHttpClientService {

  constructor(private http: HttpClient,
    private auth: AuthService) { }


  get(url: string) {
    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }

  // Binary download (e.g. an .xlsx report). The JWT rides in a header, so a plain <a href> link
  // could not authenticate -- the bytes must be fetched here and saved by the caller.
  getBlob(url: string) {
    return this.http.get(url, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  post(url: string, data) {
    return this.http.post(url, data, {
      headers: this.getHeaders()
    });
  }

  put(url: string, data) {
    return this.http.put(url, data, {
      headers: this.getHeaders()
    });
  }

  delete(url: string) {
    return this.http.delete(url, {
      headers: this.getHeaders()
    });
    }



  getHeaders(): HttpHeaders {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${this.auth.leerToken()}`);
    return headers;
  }
}
