import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import { UsuarioModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { ConfiguracionService } from '../../providers/configuracion.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  usuario: UsuarioModel = new UsuarioModel();
  recordarme = false;
  return: string = '';
  nombre: string = 'Libros Mario';
  hasLogo: boolean = false;
  logoUrl: string;

  constructor( private auth: AuthService,
               private router: Router,
               private route: ActivatedRoute,
               private configuracionService: ConfiguracionService ) { }

  ngOnInit() {
    // Obtengo los parametros por su tengo que hacer redirect
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '/home');

    if ( localStorage.getItem('email') ) {
      this.usuario.email = localStorage.getItem('email');
      this.recordarme = true;
    }

    this.configuracionService.getConfiguracion().subscribe(
      config => {
        if (config.nombre) {
          this.nombre = config.nombre;
        }
        if (config.hasLogo) {
          this.hasLogo = true;
          this.logoUrl = this.configuracionService.getLogoUrl();
        }
      }
    );
  }


  login( form: NgForm ) {

    if (  form.invalid ) { return; }

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();


    this.auth.login( this.usuario )
      .subscribe( resp => {

        console.log(resp);
        Swal.close();

        if ( this.recordarme ) {
          localStorage.setItem('email', this.usuario.email);
        }


        this.router.navigateByUrl(this.return);

      }, (err) => {

        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'Error al autenticar',
          text: err.error.message
        });
      });

  }

}
