import { Component, OnInit } from '@angular/core';
import { ComercioModel } from '../../models/comercio.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ComercioService } from '../../providers/comercio.service';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-comercio',
  templateUrl: './comercio.component.html',
  styleUrls: ['./comercio.component.css']
})
export class ComercioComponent implements OnInit {
  comercio: ComercioModel;
  forma: FormGroup;
  guardando = false;
  id: any;
  headerText = 'Nuevo Negocio';

  constructor(private router: Router,
              private route: ActivatedRoute,
              private comercioService: ComercioService) {
    this.comercio = new ComercioModel();
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
          this.comercioService.getComercio(this.id)
            .subscribe((comercio: any) => {
              this.comercio = comercio;
              this.headerText = comercio.descripcion;
              this.forma.patchValue(comercio);
            });
        }
      });
  }

  private buildForm() {
    this.forma = new FormGroup({
      'descripcion': new FormControl(this.comercio.descripcion, Validators.required),
      'direccion': new FormControl(this.comercio.direccion),
      'contacto': new FormControl(this.comercio.contacto),
      'telefono': new FormControl(this.comercio.telefono),
      'cuit': new FormControl(this.comercio.cuit),
      'comision': new FormControl(this.comercio.comision,
        [Validators.min(0), Validators.max(100)])
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
    this.comercio = this.forma.value;
    let peticion: Observable<any>;

    if (this.id !== 'nuevo') {
      peticion = this.comercioService.updateComercio(this.id, this.comercio);
    } else {
      peticion = this.comercioService.insertComercio(this.comercio);
    }

    peticion.subscribe(() => {
      this.guardando = false;
      Swal.fire({
        title: 'Negocio',
        text: 'Se procesó correctamente',
        icon: 'success'
      });
      this.router.navigate(['/comercios']);
    },
    () => {
        this.guardando = false;
      Swal.fire({
        title: 'Negocio',
        text: 'Error al procesar la operacion',
        icon: 'error'
      });
    });
  }
}
