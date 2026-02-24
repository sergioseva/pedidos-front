import { Component, OnInit } from '@angular/core';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { NgForm, FormGroup, Validators, FormControl } from '@angular/forms';

import Swal from 'sweetalert2';
import { UsuariosService } from '../../providers/usuarios.service';
import { ConfiguracionService } from '../../providers/configuracion.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  formRegistrar:FormGroup;
  usuario: UsuarioModel;
  nombre: string = 'Libros Mario';
  hasLogo: boolean = false;
  logoUrl: string;
  roles =[ {
    codigo:"ROLE_USER",
    role: "Usuario"
  },
  {
    codigo:"ROLE_ADMIN",
    role: "Admin"
  }];


  constructor(private usuariosService: UsuariosService,
              private router: Router,
              private configuracionService: ConfiguracionService) {

      this.formRegistrar = new FormGroup({
        'email': new FormControl('',   [
          Validators.required,
          Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")
        ], this.existeEmail.bind(this)),
        'name': new FormControl('' ,  [
          Validators.required,
          Validators.minLength(3)
        ]),
        'username': new FormControl('', Validators.required, this.existeUsuario.bind(this)  ),
        'password': new FormControl('', Validators.required),
        'password2': new FormControl(),
        'role': new FormControl('', Validators.required),
      });

      this.formRegistrar.controls['password2'].setValidators([
        Validators.required,
        this.noIgual.bind( this.formRegistrar )
      ]);
    }

    noIgual( control: FormControl ): { [s:string]:boolean }  {
      // console.log(this);
      let forma:any = this;
      if( control.value !== forma.controls['password'].value ){
        return {
          noiguales:true
        }
      }
      return null;
    }


  ngOnInit() {
    this.usuario = new UsuarioModel();
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

  existeUsuario( control: FormControl ): Promise<any>|Observable<any> {

    return this.validarExistencia(control,  UsuariosService.prototype.validarUser.bind(this.usuariosService));
  }

  existeEmail( control: FormControl ): Promise<any>|Observable<any> {

    return this.validarExistencia(control, UsuariosService.prototype.validarEmail.bind(this.usuariosService));
  }

  validarExistencia(control: FormControl, validationFunction: (s: string) => Observable<any>): Promise<any>|Observable<any> {
    let promesaUsuario= new Promise (
      ( resolve, reject ) =>{
        validationFunction( control.value ).subscribe( respuser => {
          if (!respuser['available']) {
            resolve( {existe: true});
          } else {
            resolve( null );
          }
        }
        );
      }
    );
    return promesaUsuario;
  }


  onSubmit() {

    this.usuario = new UsuarioModel(this.formRegistrar.value);
    console.log(this.usuario);
    if (this.formRegistrar.invalid) {return;}
    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();


    this.usuariosService.validarEmail( this.usuario.email )
      .subscribe( respemail => {
        if (respemail['available']) {
          this.usuariosService.validarUser( this.usuario.username ).subscribe( respuser => {
            if (respuser['available']) {
              console.log(this.usuario);
              this.usuariosService.registrarUser( this.usuario ).subscribe(
                respagregar => {
                  Swal.close();
                  Swal.fire({
                  icon: 'info',
                  text: 'Usuario agregado!'
                });
                this.router.navigateByUrl('/login');
              },
                err => {
                  console.log(err);
                  Swal.fire({
                  icon: 'error',title: 'Error al agregar usuario', text: err.error.message
                });}
              );
            } else {
              Swal.fire({
                icon: 'error', title: 'Error al agregar usuario',text:'El id del usuario ya existe'
              });
            }
          }, (err) => {


            Swal.fire({
              icon: 'error', title: 'Error al agregar usuario',text: err.error.message
            });
          });

        } else {
          Swal.fire({
            icon: 'error', title: 'Error al agregar usuario',text:'El email del usuario ya existe'
          });
        }
      }, (err) => {

        console.log(err);
        Swal.fire({
          icon: 'error',title: 'Error al agregar usuario',text: err.error.message
        });
      });


  }

}
