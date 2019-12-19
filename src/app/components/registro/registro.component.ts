import { Component, OnInit } from '@angular/core';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { NgForm } from '@angular/forms';

import Swal from 'sweetalert2';
import { UsuariosService } from '../../providers/usuarios.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

  usuario: UsuarioModel;
  roles =[ {
    codigo:"ROLE_USER",
    role: "Usuario"
  },
  {
    codigo:"ROLE_ADMIN",
    role: "Admin"
  }];
  constructor(private usuariosService: UsuariosService,
              private router: Router) { }

  ngOnInit() {
    this.usuario = new UsuarioModel();
  }




  onSubmit(form:NgForm) {
   
    console.log(form);
    if (form.invalid) {return;}
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();


    this.usuariosService.validarEmail( this.usuario )
      .subscribe( respemail => {
        if (respemail['available']) {
          this.usuariosService.validarUser( this.usuario ).subscribe( respuser => {
            if (respuser['available']) {
              console.log(this.usuario);
              this.usuariosService.registrarUser( this.usuario ).subscribe(
                respagregar => {
                  Swal.close();
                  Swal.fire({
                  type: 'info',
                  text: 'Usuario agregado!'
                });
                this.router.navigateByUrl('/login');
              },
                err => {
                  console.log(err);
                  Swal.fire({
                  type: 'error',title: 'Error al agregar usuario', text: err.error.message
                });}
              );
            } else {
              Swal.fire({
                type: 'error',title: 'Error al agregar usuario',text:'El id del usuario ya existe'
              });
            }
          }, (err) => {


            Swal.fire({
              type: 'error',title: 'Error al agregar usuario',text: err.error.message
            });
          });

        } else {
          Swal.fire({
            type: 'error',title: 'Error al agregar usuario',text:'El email del usuario ya existe'
          });
        }
      }, (err) => {

        console.log(err);
        Swal.fire({
          type: 'error',title: 'Error al agregar usuario',text: err.error.message
        });
      });


  }





}
