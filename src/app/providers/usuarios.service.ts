import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { UsuarioModel } from 'src/app/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private URLUsuariosService:string="//localhost:8080/api";

  constructor(private http: HttpClient,
              private auth: AuthService,
              private chttp: CustomHttpClientService) { }

  validarEmail(usuario: UsuarioModel) {
    const url = `${ this.URLUsuariosService }/user/checkEmailAvailability?email=${usuario.email}`;
    return this.http.get(url);
  }

  validarUser(usuario: UsuarioModel) {
    const url = `${ this.URLUsuariosService }/user/checkUsernameAvailability?username=${usuario.username}`;
    return this.http.get(url);
  }

  registrarUser(usuario: UsuarioModel) {
    const url = `${ this.URLUsuariosService }/auth/signup`;
    return this.chttp.post(url, usuario);
  }

}
