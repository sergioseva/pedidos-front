import { Component, OnInit } from '@angular/core';
import { DistribuidoraModel } from '../../models/distribuidora.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DistribuidoraService } from '../../providers/distribuidora.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-distribuidora',
  templateUrl: './distribuidora.component.html',
  styleUrls: ['./distribuidora.component.css']
})
export class DistribuidoraComponent implements OnInit {
  distribuidora: DistribuidoraModel;
  forma: FormGroup;
  guardando = false;
  id: any;
  headerText = 'Nueva Distribuidora';

  constructor(private router: Router,
              private route: ActivatedRoute,
              private distribuidoraService: DistribuidoraService) {
    this.distribuidora = new DistribuidoraModel();
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
          this.distribuidoraService.getDistribuidora(this.id)
            .subscribe((distribuidora: any) => {
              this.distribuidora = distribuidora;
              this.headerText = distribuidora.descripcion;
              this.forma.patchValue(distribuidora);
            });
        }
      });
  }

  private buildForm() {
    this.forma = new FormGroup({
      'descripcion': new FormControl(this.distribuidora.descripcion, Validators.required),
      'nroCuenta': new FormControl(this.distribuidora.nroCuenta)
    });
  }

  /**
   * Un envio a la vez. El boton solo se deshabilitaba por formulario invalido, nunca mientras la
   * peticion viajaba, asi que dos clics -- o Enter y despues el boton -- creaban dos registros.
   * En local no se notaba porque la respuesta vuelve al instante; sobre la red esa ventana dura
   * cientos de milisegundos y encima sin ningun indicador de que algo estaba pasando.
   */
  onSubmit() {
    if (this.guardando) {
      return;
    }
    this.guardando = true;
    this.distribuidora = this.forma.value;
    let peticion: Observable<any>;

    if (this.id !== 'nuevo') {
      peticion = this.distribuidoraService.updateDistribuidora(this.id, this.distribuidora);
    } else {
      peticion = this.distribuidoraService.insertDistribuidora(this.distribuidora);
    }

    peticion.subscribe(resp => {
      this.guardando = false;
      Swal.fire({
        title: 'Distribuidora',
        text: 'Se procesó correctamente',
        icon: 'success'
      });
      this.router.navigate(['/distribuidoras']);
    },
    err => {
        this.guardando = false;
      Swal.fire({
        title: 'Distribuidora',
        text: 'Error al procesar la operacion',
        icon: 'error'
      });
    });
  }
}
