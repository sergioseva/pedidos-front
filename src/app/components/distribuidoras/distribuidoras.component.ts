import { Component, OnInit } from '@angular/core';
import { DistribuidoraService } from 'src/app/providers/distribuidora.service';
import { DistribuidoraModel } from 'src/app/models/distribuidora.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-distribuidoras',
  templateUrl: './distribuidoras.component.html',
  styleUrls: ['./distribuidoras.component.css']
})
export class DistribuidorasComponent implements OnInit {
  distribuidoras: DistribuidoraModel[];
  currentIndex: number;

  constructor(private distribuidoraService: DistribuidoraService) { }

  ngOnInit() {
    this.cargarDistribuidoras();
  }

  cargarDistribuidoras() {
    this.distribuidoraService.getDistribuidoras().subscribe(
      (distribuidoras: DistribuidoraModel[]) => {
        this.distribuidoras = distribuidoras;
      }
    );
  }

  buscarDistribuidora(termino: string) {
    if (!termino || termino.trim() === '') {
      this.cargarDistribuidoras();
      return;
    }
    this.distribuidoraService.buscarDistribuidoras(termino).subscribe(
      (distribuidoras: DistribuidoraModel[]) => {
        this.distribuidoras = distribuidoras;
      }
    );
  }

  borrarDistribuidora(distribuidora: DistribuidoraModel, i: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar a ${distribuidora.descripcion}`,
      type: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then(resp => {
      if (resp.value) {
        this.distribuidoraService.deleteDistribuidora(distribuidora.id).subscribe(
          () => { this.distribuidoras.splice(i, 1); },
          err => {
            Swal.fire({
              title: 'Distribuidora',
              text: 'Error al procesar la operacion',
              type: 'error'
            });
          }
        );
      }
    });
  }
}
