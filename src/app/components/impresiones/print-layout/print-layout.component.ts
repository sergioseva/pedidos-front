import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../../providers/config.service';

@Component({
  selector: 'app-print-layout',
  templateUrl: './print-layout.component.html',
  styleUrls: ['./print-layout.component.css']
})
export class PrintLayoutComponent implements OnInit {

  private nombre:string;
  private direccion: string;
  private telefono:string;

  constructor(private config: ConfigService) {
    this.nombre = `${config.nombre}`;
    this.direccion = `${config.direccion}`;
    this.telefono = `${config.telefono}`;
}

  ngOnInit() {
  }

}
