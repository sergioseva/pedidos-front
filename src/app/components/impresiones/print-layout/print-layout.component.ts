import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../../../providers/config.service';
import { ConfiguracionService } from '../../../providers/configuracion.service';

@Component({
  selector: 'app-print-layout',
  templateUrl: './print-layout.component.html',
  styleUrls: ['./print-layout.component.css']
})
export class PrintLayoutComponent implements OnInit {

  nombre: string;
  direccion: string;
  telefono: string;
  logoUrl: string;
  showLogo: boolean = false;
  isRemito = false;

  constructor(private config: ConfigService,
              private router: Router,
              private configuracionService: ConfiguracionService) {
    this.nombre = config.nombre;
    this.direccion = config.direccion;
    this.telefono = config.telefono;
    // Set logo URL immediately so the browser starts loading it
    this.logoUrl = this.configuracionService.getLogoUrl();
  }

  ngOnInit() {
    this.isRemito = this.router.url.indexOf('printremito') !== -1;
    this.configuracionService.getConfiguracion().subscribe(
      c => {
        if (c.nombre) { this.nombre = c.nombre; }
        if (c.direccion) { this.direccion = c.direccion; }
        if (c.telefono) { this.telefono = c.telefono; }
        this.showLogo = c.hasLogo;
      }
    );
  }

  onLogoError() {
    this.showLogo = false;
  }

}
