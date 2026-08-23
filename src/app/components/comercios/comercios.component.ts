import { Component, OnInit } from '@angular/core';
import { ComercioService } from 'src/app/providers/comercio.service';
import { ComercioModel } from 'src/app/models/comercio.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comercios',
  templateUrl: './comercios.component.html',
  styleUrls: ['./comercios.component.css']
})
export class ComerciosComponent implements OnInit {
  comercios: ComercioModel[];

  constructor(private comercioService: ComercioService) { }

  ngOnInit() {
    this.cargarComercios();
  }

  cargarComercios() {
    this.comercioService.getComercios().subscribe(
      (comercios: ComercioModel[]) => {
        this.comercios = comercios;
      }
    );
  }

  buscarComercio(termino: string) {
    if (!termino || termino.trim() === '') {
      this.cargarComercios();
      return;
    }
    this.comercioService.buscarComercios(termino).subscribe(
      (comercios: ComercioModel[]) => {
        this.comercios = comercios;
      }
    );
  }

  borrarComercio(comercio: ComercioModel, i: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar a ${comercio.descripcion}`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then(resp => {
      if (resp.value) {
        this.comercioService.deleteComercio(comercio.id).subscribe(
          () => { this.comercios.splice(i, 1); },
          () => {
            Swal.fire({
              title: 'Negocio',
              // Un negocio con remitos no se puede borrar: la FK lo impide, y esta bien que asi sea.
              text: 'Error al procesar la operacion. Verifique que el negocio no tenga remitos asociados.',
              icon: 'error'
            });
          }
        );
      }
    });
  }
}
