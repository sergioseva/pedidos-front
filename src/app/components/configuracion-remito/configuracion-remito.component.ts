import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfiguracionRemitoModel } from '../../models/configuracion-remito.model';
import { ConfiguracionRemitoService } from '../../providers/configuracion-remito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configuracion-remito',
  templateUrl: './configuracion-remito.component.html',
  styleUrls: ['./configuracion-remito.component.css']
})
export class ConfiguracionRemitoComponent implements OnInit {
  configuracion: ConfiguracionRemitoModel;
  forma: FormGroup;

  constructor(private configuracionRemitoService: ConfiguracionRemitoService) {
    this.configuracion = new ConfiguracionRemitoModel();
    this.buildForm();
  }

  ngOnInit() {
    this.configuracionRemitoService.getConfiguracion().subscribe(
      (config: ConfiguracionRemitoModel) => {
        this.configuracion = config;
        this.forma.patchValue(config);
      },
      err => {
        console.log('No hay configuracion de remito guardada');
      }
    );
  }

  private buildForm() {
    this.forma = new FormGroup({
      'remitente': new FormControl(this.configuracion.remitente, Validators.required)
    });
  }

  onSubmit() {
    const config = new ConfiguracionRemitoModel();
    config.remitente = this.forma.value.remitente;

    this.configuracionRemitoService.updateConfiguracion(config).subscribe(
      resp => {
        Swal.fire({
          title: 'Configuracion Remito',
          text: 'Se guardo correctamente',
          type: 'success'
        });
      },
      err => {
        Swal.fire({
          title: 'Configuracion Remito',
          text: 'Error al guardar la configuracion',
          type: 'error'
        });
      }
    );
  }
}
