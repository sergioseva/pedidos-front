import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../providers/usuarios.service';
import { UsuarioModel } from '../../models/usuario.model';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  forma: FormGroup;
  id: any;
  headerText = 'Nuevo Usuario';
  isNew = true;
  originalUsername = '';
  originalEmail = '';
  roles = [
    { codigo: 'ROLE_USER', role: 'Usuario' },
    { codigo: 'ROLE_ADMIN', role: 'Admin' }
  ];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private usuariosService: UsuariosService) {
    this.buildForm();
    this.retrieveData();
  }

  ngOnInit() {
  }

  private retrieveData(): void {
    this.route.params
      .subscribe(parametros => {
        this.id = parametros['id'];
        if (this.id !== 'nuevo') {
          this.isNew = false;
          this.headerText = 'Editar Usuario';
          // Remove password required validator for edit mode
          this.forma.controls['password'].clearValidators();
          this.forma.controls['password'].updateValueAndValidity();
          this.forma.controls['password2'].clearValidators();
          this.forma.controls['password2'].updateValueAndValidity();

          this.usuariosService.getUsuario(this.id)
            .subscribe((usuario: any) => {
              this.headerText = usuario.name;
              this.originalUsername = usuario.username;
              this.originalEmail = usuario.email;
              this.forma.patchValue({
                name: usuario.name,
                username: usuario.username,
                email: usuario.email,
                role: usuario.role
              });
            });
        }
      });
  }

  private buildForm() {
    this.forma = new FormGroup({
      'email': new FormControl('', [
        Validators.required,
        Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')
      ], this.existeEmail.bind(this)),
      'name': new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      'username': new FormControl('', Validators.required, this.existeUsuario.bind(this)),
      'password': new FormControl('', Validators.required),
      'password2': new FormControl(),
      'role': new FormControl('', Validators.required),
    });

    this.forma.controls['password2'].setValidators([
      Validators.required,
      this.noIgual.bind(this.forma)
    ]);
  }

  noIgual(control: FormControl): { [s: string]: boolean } {
    const forma: any = this;
    if (control.value !== forma.controls['password'].value) {
      return { noiguales: true };
    }
    return null;
  }

  existeUsuario(control: FormControl): Promise<any> | Observable<any> {
    if (!this.isNew && control.value === this.originalUsername) {
      return Promise.resolve(null);
    }
    return this.validarExistencia(control, UsuariosService.prototype.validarUser.bind(this.usuariosService));
  }

  existeEmail(control: FormControl): Promise<any> | Observable<any> {
    if (!this.isNew && control.value === this.originalEmail) {
      return Promise.resolve(null);
    }
    return this.validarExistencia(control, UsuariosService.prototype.validarEmail.bind(this.usuariosService));
  }

  validarExistencia(control: FormControl, validationFunction: (s: string) => Observable<any>): Promise<any> | Observable<any> {
    const promesa = new Promise(
      (resolve, reject) => {
        validationFunction(control.value).subscribe(resp => {
          if (!resp['available']) {
            resolve({ existe: true });
          } else {
            resolve(null);
          }
        });
      }
    );
    return promesa;
  }

  onSubmit() {
    if (this.forma.invalid) { return; }

    Swal.fire({
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...'
    });
    Swal.showLoading();

    if (this.isNew) {
      const usuario = new UsuarioModel(this.forma.value);
      this.usuariosService.registrarUser(usuario).subscribe(
        resp => {
          Swal.close();
          Swal.fire({
            title: 'Usuario',
            text: 'Se procesó correctamente',
            icon: 'success'
          });
          this.router.navigate(['/usuarios']);
        },
        err => {
          Swal.fire({
            title: 'Usuario',
            text: err.error.message || 'Error al procesar la operacion',
            icon: 'error'
          });
        }
      );
    } else {
      const data: any = {
        name: this.forma.value.name,
        username: this.forma.value.username,
        email: this.forma.value.email,
        role: this.forma.value.role
      };
      if (this.forma.value.password) {
        data.password = this.forma.value.password;
      }
      this.usuariosService.updateUsuario(this.id, data).subscribe(
        resp => {
          Swal.close();
          Swal.fire({
            title: 'Usuario',
            text: 'Se procesó correctamente',
            icon: 'success'
          });
          this.router.navigate(['/usuarios']);
        },
        err => {
          Swal.fire({
            title: 'Usuario',
            text: err.error.message || 'Error al procesar la operacion',
            icon: 'error'
          });
        }
      );
    }
  }
}
