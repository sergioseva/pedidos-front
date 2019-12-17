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

  post(url: string, data) {
    return this.http.post(url, data, {
      headers: this.getHeaders()
    });
  }


  getHeaders(): HttpHeaders {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${this.auth.leerToken()}`);
    return headers;
  }
}
