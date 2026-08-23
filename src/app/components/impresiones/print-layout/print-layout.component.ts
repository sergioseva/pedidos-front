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
  /** El pie ("esta nota es requisito para retirar") solo corresponde a la nota de pedido. */
  isPedido = false;
  titulo = 'NOTA DE PEDIDO';

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
    // El encabezado se decide por la ruta del outlet de impresion. Sin el caso del recibo,
    // caia en el default y se imprimia un recibo de pago titulado "NOTA DE PEDIDO".
    const url = this.router.url;
    if (url.indexOf('printestadocuenta') !== -1) {
      this.titulo = 'ESTADO DE CUENTA';
    } else if (url.indexOf('printrecibo') !== -1) {
      this.titulo = 'RECIBO DE PAGO';
    } else if (url.indexOf('printremito') !== -1) {
      this.titulo = 'REMITO';
    } else {
      this.titulo = 'NOTA DE PEDIDO';
      this.isPedido = true;
    }
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
