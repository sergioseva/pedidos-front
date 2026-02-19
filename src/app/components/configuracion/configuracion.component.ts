import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfiguracionModel } from '../../models/configuracion.model';
import { ConfiguracionService } from '../../providers/configuracion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  configuracion: ConfiguracionModel;
  forma: FormGroup;
  logoUrl: string;
  logoPreview: string;

  constructor(private configuracionService: ConfiguracionService) {
    this.configuracion = new ConfiguracionModel();
    this.buildForm();
  }

  ngOnInit() {
    this.configuracionService.getConfiguracion().subscribe(
      (config: ConfiguracionModel) => {
        this.configuracion = config;
        this.forma.patchValue({ nombre: config.nombre, direccion: config.direccion, telefono: config.telefono });
        if (config.hasLogo) {
          this.logoPreview = this.configuracionService.getLogoUrl() + '?t=' + Date.now();
        }
      },
      err => {
        console.log('No hay configuracion guardada');
      }
    );
  }

  private buildForm() {
    this.forma = new FormGroup({
      'nombre': new FormControl(this.configuracion.nombre, Validators.required),
      'direccion': new FormControl(this.configuracion.direccion),
      'telefono': new FormControl(this.configuracion.telefono)
    });
  }

  onSubmit() {
    const config = new ConfiguracionModel();
    config.nombre = this.forma.value.nombre;
    config.direccion = this.forma.value.direccion;
    config.telefono = this.forma.value.telefono;

    this.configuracionService.updateConfiguracion(config).subscribe(
      resp => {
        Swal.fire({
          title: 'Configuracion',
          text: 'Se guardo correctamente',
          type: 'success'
        });
      },
      err => {
        Swal.fire({
          title: 'Configuracion',
          text: 'Error al guardar la configuracion',
          type: 'error'
        });
      }
    );
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) { return; }

    this.configuracionService.uploadLogo(file).subscribe(
      (resp: ConfiguracionModel) => {
        this.configuracion.hasLogo = true;
        this.logoPreview = this.configuracionService.getLogoUrl() + '?t=' + Date.now();
        Swal.fire({
          title: 'Logo',
          text: 'Logo subido correctamente',
          type: 'success'
        });
      },
      err => {
        Swal.fire({
          title: 'Logo',
          text: 'Error al subir el logo',
          type: 'error'
        });
      }
    );
  }

  deleteLogo() {
    this.configuracionService.deleteLogo().subscribe(
      resp => {
        this.configuracion.hasLogo = false;
        this.logoPreview = null;
        Swal.fire({
          title: 'Logo',
          text: 'Logo eliminado correctamente',
          type: 'success'
        });
      },
      err => {
        Swal.fire({
          title: 'Logo',
          text: 'Error al eliminar el logo',
          type: 'error'
        });
      }
    );
  }
}
