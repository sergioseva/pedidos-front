import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CustomHttpClientService } from '../services/custom-http-client.service';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private URLUsuariosService:string="/api";

  constructor(private http: HttpClient,
              private auth: AuthService,
              private chttp: CustomHttpClientService,
              private config: ConfigService) {
console.log('en usuarios service');
                this.URLUsuariosService = config.baseUrl;
                console.log(this.URLUsuariosService);
  }

  validarEmail(email: string) {
    const url = `${ this.URLUsuariosService }/user/checkEmailAvailability?email=${email}`;
    return this.http.get(url);
  }

  validarUser(username: string) {
    console.log('validar user1:' + this);
    const url = `${ this.URLUsuariosService }/user/checkUsernameAvailability?username=${username}`;
    return this.http.get(url);
  }

  registrarUser(usuario: UsuarioModel) {
    const url = `${ this.URLUsuariosService }/auth/signup`;
    return this.chttp.post(url, usuario);
  }

  getUsuarios() {
    const url = `${ this.URLUsuariosService }/admin/users`;
    return this.chttp.get(url);
  }

  getUsuario(id: number) {
    const url = `${ this.URLUsuariosService }/admin/users/${id}`;
    return this.chttp.get(url);
  }

  updateUsuario(id: number, usuario: any) {
    const url = `${ this.URLUsuariosService }/admin/users/${id}`;
    return this.chttp.put(url, usuario);
  }

  deleteUsuario(id: number) {
    const url = `${ this.URLUsuariosService }/admin/users/${id}`;
    return this.chttp.delete(url);
  }

}
