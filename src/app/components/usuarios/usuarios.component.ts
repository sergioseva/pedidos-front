import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/providers/usuarios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe(
      (usuarios: any[]) => {
        this.usuarios = usuarios;
      }
    );
  }

  buscarUsuario(termino: string) {
    if (!termino || termino.trim() === '') {
      this.cargarUsuarios();
      return;
    }
    const term = termino.toLowerCase();
    this.usuariosService.getUsuarios().subscribe(
      (usuarios: any[]) => {
        this.usuarios = usuarios.filter(u =>
          u.name.toLowerCase().includes(term) ||
          u.username.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
        );
      }
    );
  }

  borrarUsuario(usuario: any, i: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar al usuario ${usuario.username}`,
      type: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then(resp => {
      if (resp.value) {
        this.usuariosService.deleteUsuario(usuario.id).subscribe(
          () => { this.usuarios.splice(i, 1); },
          err => {
            Swal.fire({
              title: 'Usuario',
              text: 'Error al procesar la operacion',
              type: 'error'
            });
          }
        );
      }
    });
  }

  getRolLabel(role: string): string {
    return role === 'ROLE_ADMIN' ? 'Admin' : 'Usuario';
  }
}
