import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.model';

import { map, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';
import { ConfigService } from '../providers/config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = '/api';
  private loggedIn = new BehaviorSubject<boolean>(false); // {1}
  private adminSubject = new BehaviorSubject<boolean>(false);

  get isLoggedIn() {
    return this.loggedIn.asObservable(); // {2}
  }

  get isAdmin$() {
    return this.adminSubject.asObservable();
  }

  userToken: string;

  // Crear nuevo usuario
  // https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=[API_KEY]


  // Login
  // https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=[API_KEY]


  constructor( private http: HttpClient,private config: ConfigService ) {
    this.leerToken();
    this.url = config.baseUrl;
    if (this.estaAutenticado()) {
      this.fetchUserProfile();
    }
  }


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.loggedIn.next(false);
    this.adminSubject.next(false);
  }

  login( usuario: UsuarioModel ) {

    const authData = {
      usernameOrEmail : usuario.username,
      password : usuario.password
    };

    return this.http.post(
      `${ this.url }/auth/login`,
      authData
    ).pipe(
      map( resp => {
        this.guardarToken( resp['accessToken'] );
        this.loggedIn.next(true);
        this.fetchUserProfile();
        return resp;
      })
    );

  }

  nuevoUsuario( usuario: UsuarioModel ) {

    const authData = {
      ...usuario,
      returnSecureToken: true
    };

    return this.http.post(
      `${ this.url }/auth/signup`,
      authData
    ).pipe(
      map( resp => {
        this.guardarToken( resp['idToken'] );
        return resp;
      })
    );

  }


  private guardarToken( idToken: string ) {

    this.userToken = idToken;
    localStorage.setItem('token', idToken);

    let hoy = new Date();
    hoy.setSeconds( 3600 );

    localStorage.setItem('expira', hoy.getTime().toString() );


  }

  leerToken() {

    if ( localStorage.getItem('token') ) {
      this.userToken = localStorage.getItem('token');
    } else {
      this.userToken = '';
    }

    return this.userToken;

  }


  estaAutenticado(): boolean {
    let exp: boolean;
    console.log('esta auntenticado?');
    if ( this.userToken.length < 2 ) {
      this.loggedIn.next(false);
      return false;
      }
    exp = !this.isTokenExpired(this.userToken);
    this.loggedIn.next(exp);
    return exp;
  }


  isTokenExpired(token: string): boolean {
    const date = this.getTokenExpirationDate(token);
    if(date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
  }

  getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  fetchUserProfile() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.userToken}`);
    this.http.get(`${this.url}/user/me`, { headers }).subscribe(
      (user: any) => {
        const roles: any[] = user.roles || user.authorities || [];
        const isAdmin = roles.some(r => {
          const roleName = typeof r === 'string' ? r : (r.roleName || r.name || r.authority || '');
          return roleName === 'ROLE_ADMIN';
        });
        localStorage.setItem('userRole', isAdmin ? 'ROLE_ADMIN' : 'ROLE_USER');
        this.adminSubject.next(isAdmin);
      },
      err => {
        this.adminSubject.next(false);
      }
    );
  }

  isAdmin(): boolean {
    return localStorage.getItem('userRole') === 'ROLE_ADMIN';
  }

}
